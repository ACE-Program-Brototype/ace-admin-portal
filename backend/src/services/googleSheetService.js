import { ContactSubmission } from '../models/ContactSubmission.js';
import { logger } from '../utils/logger.js';

const GOOGLE_SHEET_URL =
  process.env.GOOGLE_SHEET_WEB_APP_URL ||
  process.env.VITE_CONTACT_FORM_WEB_APP_URL ||
  'https://script.google.com/macros/s/AKfycbwfjxd4pWxUQubQ-jNjz_8Vh6DjPzSPVRkj-d_eNEtiPvTqCj43xDy7uxfiNIZo8RI/exec';

/**
 * Sends contact submission data to Google Sheets in the background.
 * Updates the MongoDB document with the sync status and timestamp.
 *
 * @param {Object} submission - Mongoose ContactSubmission document
 */
export const syncToGoogleSheets = async (submission) => {
  const startTime = Date.now();
  const submissionId = submission._id;

  logger.info(
    `[GoogleSheets] Starting background sync for submission ID: ${submissionId} (${submission.email})`
  );

  try {
    // Construct FormData matching the Google Apps Script Web App schema
    const formData = new FormData();
    formData.append('name', submission.name);
    formData.append('email', submission.email);
    formData.append('phone', submission.phone);
    formData.append('isBrototypeStudent', submission.isBrototypeStudent);

    if (submission.isBrototypeStudent === 'yes') {
      if (submission.batchNumber) {
        formData.append('batchNumber', submission.batchNumber);
      }
      if (submission.domain) {
        formData.append('domain', submission.domain);
      }
    }

    if (submission.message) {
      formData.append('message', submission.message);
    }

    logger.debug(`[GoogleSheets] Sending POST to: ${GOOGLE_SHEET_URL}`);

    const response = await fetch(GOOGLE_SHEET_URL, {
      method: 'POST',
      body: formData,
      redirect: 'follow'
    });

    const responseText = await response.text();
    const duration = Date.now() - startTime;

    if (!response.ok) {
      throw new Error(
        `HTTP ${response.status} ${response.statusText} - ${responseText.slice(0, 200)}`
      );
    }

    logger.success(
      `[GoogleSheets] Sync successful for submission ID: ${submissionId} in ${duration}ms. Result: ${responseText}`
    );

    // Update MongoDB document
    await ContactSubmission.findByIdAndUpdate(submissionId, {
      sheetSyncStatus: 'synced',
      sheetSyncedAt: new Date(),
      $inc: { sheetSyncAttempts: 1 },
      sheetSyncError: null
    });

    return { success: true, response: responseText };
  } catch (error) {
    const duration = Date.now() - startTime;
    logger.error(
      `[GoogleSheets] Sync failed for submission ID: ${submissionId} after ${duration}ms. Error: ${error.message}`
    );

    // Update MongoDB document with failure information
    try {
      await ContactSubmission.findByIdAndUpdate(submissionId, {
        sheetSyncStatus: 'failed',
        sheetSyncError: error.message,
        $inc: { sheetSyncAttempts: 1 }
      });
    } catch (dbError) {
      logger.error(
        `[MongoDB Error] Failed to update sync status for ${submissionId}: ${dbError.message}`
      );
    }

    return { success: false, error: error.message };
  }
};
