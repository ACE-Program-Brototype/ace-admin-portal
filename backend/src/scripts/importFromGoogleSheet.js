import dotenv from 'dotenv';
dotenv.config();

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from '../config/db.js';
import { ContactSubmission } from '../models/ContactSubmission.js';
import { logger } from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GOOGLE_SHEET_CSV_URL =
  process.env.GOOGLE_SHEET_CSV_URL ||
  'https://docs.google.com/spreadsheets/d/1dWZ2KGRJfwgMZeGGF6fNXVbOr4ZfRTcZVEgS7NKWOMg/export?format=csv';

/**
 * Standard RFC 4180 CSV parser that handles multiline quotes and commas inside fields.
 */
function parseCSV(text) {
  const rows = [];
  let row = [];
  let inQuotes = false;
  let currentField = '';

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (inQuotes) {
      if (char === '"' && nextChar === '"') {
        currentField += '"';
        i++; // skip escaped quote
      } else if (char === '"') {
        inQuotes = false;
      } else {
        currentField += char;
      }
    } else {
      if (char === '"') {
        inQuotes = true;
      } else if (char === ',') {
        row.push(currentField);
        currentField = '';
      } else if (char === '\r') {
        if (nextChar === '\n') i++;
        row.push(currentField);
        rows.push(row);
        row = [];
        currentField = '';
      } else if (char === '\n') {
        row.push(currentField);
        rows.push(row);
        row = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
  }

  if (currentField || row.length > 0) {
    row.push(currentField);
    rows.push(row);
  }

  return rows;
}

/**
 * Parses Google Sheet timestamp (DD/MM/YYYY HH:mm:ss) into a JavaScript Date.
 */
function parseTimestamp(ts) {
  if (!ts || !ts.trim()) return new Date();
  const parts = ts.trim().split(' ');
  const dateParts = parts[0].split('/').map(Number);
  const timeParts = (parts[1] || '00:00:00').split(':').map(Number);
  if (dateParts.length < 3 || isNaN(dateParts[0])) return new Date();
  return new Date(dateParts[2], dateParts[1] - 1, dateParts[0], timeParts[0] || 0, timeParts[1] || 0, timeParts[2] || 0);
}

export const importFromGoogleSheet = async () => {
  await connectDB();

  logger.info(`[Import] Fetching CSV data from Google Sheet...`);
  let csvText = '';

  try {
    const response = await fetch(GOOGLE_SHEET_CSV_URL);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status} ${response.statusText}`);
    }
    csvText = await response.text();
    logger.success(`[Import] Successfully fetched CSV from Google Sheet directly.`);
  } catch (fetchError) {
    logger.warn(`[Import] Direct fetch failed: ${fetchError.message}. Checking local fallback cache...`);
    const fallbackPath = path.join(__dirname, 'sheet_data.csv');
    if (fs.existsSync(fallbackPath)) {
      csvText = fs.readFileSync(fallbackPath, 'utf8');
      logger.info(`[Import] Using cached fallback CSV file.`);
    } else {
      throw new Error(`Failed to fetch Google Sheet and no local fallback available: ${fetchError.message}`);
    }
  }

  const rawRows = parseCSV(csvText);
  if (rawRows.length <= 1) {
    logger.warn(`[Import] No data rows found in Google Sheet.`);
    return { inserted: 0, skipped: 0, total: 0 };
  }

  // Header is row 0: Timestamp, name, email, phone, isBrototypeStudent, batchNumber, counsellorName, message
  const rows = rawRows.slice(1);
  logger.info(`[Import] Found ${rows.length} rows to process.`);

  let insertedCount = 0;
  let skippedCount = 0;

  for (let index = 0; index < rows.length; index++) {
    const row = rows[index];
    const rawTimestamp = row[0] || '';
    const name = (row[1] || '').trim();
    const email = (row[2] || '').trim().toLowerCase();
    const rawPhone = (row[3] || '').trim();
    let isBrototypeStudent = (row[4] || '').trim().toLowerCase();
    let batchNumber = (row[5] || '').trim();
    const counsellorName = (row[6] || '').trim();
    const message = (row[7] || '').trim();

    if (!name || !email) {
      logger.warn(`[Import] Skipping row ${index + 2}: missing name or email.`);
      skippedCount++;
      continue;
    }

    // Clean phone number (strip non-digits)
    const phone = rawPhone.replace(/\D/g, '');
    if (!phone) {
      logger.warn(`[Import] Skipping row ${index + 2} (${email}): invalid phone number "${rawPhone}".`);
      skippedCount++;
      continue;
    }

    // Handle student status & batch extraction
    if (isBrototypeStudent !== 'yes' && isBrototypeStudent !== 'no') {
      const batchMatch = message.match(/Batch:\s*([A-Za-z0-9\-]+)/i);
      if (batchMatch || batchNumber) {
        isBrototypeStudent = 'yes';
        if (!batchNumber && batchMatch) {
          batchNumber = batchMatch[1].trim();
        }
      } else {
        isBrototypeStudent = 'no';
      }
    }

    const createdAt = parseTimestamp(rawTimestamp);

    // Check if duplicate already exists (same email and message)
    const existing = await ContactSubmission.findOne({
      email,
      message,
      phone
    });

    if (existing) {
      logger.debug(`[Import] Row ${index + 2} (${email}) already exists in MongoDB (ID: ${existing._id}). Skipping.`);
      skippedCount++;
      continue;
    }

    const submission = new ContactSubmission({
      name,
      email,
      phone,
      isBrototypeStudent,
      batchNumber,
      counsellorName,
      message,
      sheetSyncStatus: 'synced',
      sheetSyncedAt: createdAt,
      sheetSyncAttempts: 1,
      createdAt,
      updatedAt: createdAt
    });

    await submission.save();
    insertedCount++;
    logger.info(`[Import] Inserted row ${index + 2}: ${name} (${email}) -> ID: ${submission._id}`);
  }

  logger.success(`\n[Import Complete] Total rows: ${rows.length} | Inserted: ${insertedCount} | Skipped/Existing: ${skippedCount}`);
  return { inserted: insertedCount, skipped: skippedCount, total: rows.length };
};

// Run if called directly
if (process.argv[1] && process.argv[1].endsWith('importFromGoogleSheet.js')) {
  importFromGoogleSheet()
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      logger.error(`[Import Fatal Error] ${err.message}`, err.stack);
      process.exit(1);
    });
}

