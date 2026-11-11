import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import app from '../app.js';
import { connectDB } from '../config/db.js';
import { Admin } from '../models/Admin.js';
import { ContactSubmission } from '../models/ContactSubmission.js';
import { seedAdmin } from './seedAdmin.js';

let passed = 0;
let failed = 0;

function assert(condition, testName) {
  if (condition) {
    console.log(`  PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  FAIL: ${testName}`);
    failed++;
  }
}

async function runTotalApplicationTest() {
  console.log('\n========================================');
  console.log(' STARTING TOTAL APPLICATION TEST SUITE');
  console.log('========================================\n');

  await connectDB();
  await seedAdmin();

  // Clean up any test records from prior runs
  await ContactSubmission.deleteMany({
    $or: [
      { email: { $in: ['testalice@example.com', 'testbob@example.com'] } },
      { phone: { $in: ['9988776655', '9988776644'] } }
    ]
  });

  const PORT = 5095;
  const server = app.listen(PORT);
  const baseUrl = `http://localhost:${PORT}`;

  let nonStudentId;
  let studentId;

  try {
    // -------------------------------------------------------------------------
    console.log('--- 1. Root & Health Check Endpoints ---');
    // -------------------------------------------------------------------------
    const rootRes = await fetch(`${baseUrl}/`);
    const rootData = await rootRes.json();
    assert(rootRes.status === 200 && rootData.message.includes('Ace Community'), 'GET / returns 200 & welcome message');

    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = await healthRes.json();
    assert(healthRes.status === 200 && healthData.status === 'ok', 'GET /api/health returns 200 & status ok');

    // -------------------------------------------------------------------------
    console.log('\n--- 2. Public Contact Form Submission & Validation ---');
    // -------------------------------------------------------------------------
    // Missing fields
    const emptyRes = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    const emptyData = await emptyRes.json();
    assert(emptyRes.status === 400 && !emptyData.success, 'POST /api/contact with empty body returns 400');

    // Invalid email
    const badEmailRes = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'invalid-email',
        phone: '9876543210',
        isBrototypeStudent: 'no'
      })
    });
    assert(badEmailRes.status === 400, 'POST /api/contact with invalid email returns 400');

    // Invalid non-numeric phone
    const badPhoneRes = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        phone: 'abcdefghij',
        isBrototypeStudent: 'no'
      })
    });
    assert(badPhoneRes.status === 400, 'POST /api/contact with alphabetic phone returns 400');

    // Brototype student missing batch/counsellor
    const missingBatchRes = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Brototype Student',
        email: 'brototype@example.com',
        phone: '9876543210',
        isBrototypeStudent: 'yes'
      })
    });
    assert(missingBatchRes.status === 400, 'POST /api/contact for student without batch/counsellor returns 400');

    // Valid Non-Brototype submission
    const validNonStudentRes = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Alice Wonder',
        email: 'testalice@example.com',
        phone: '9988776655',
        isBrototypeStudent: 'no',
        message: 'Excited about the program.'
      })
    });
    const validNonStudentData = await validNonStudentRes.json();
    assert(validNonStudentRes.status === 201 && validNonStudentData.success && validNonStudentData.data.id, 'POST /api/contact non-student valid submission returns 201');
    nonStudentId = validNonStudentData.data.id;

    // Valid Brototype student submission
    const validStudentRes = await fetch(`${baseUrl}/api/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Bob Student',
        email: 'testbob@example.com',
        phone: '9988776644',
        isBrototypeStudent: 'yes',
        batchNumber: 'BCE-321',
        domain: 'MERN',
        message: 'Inquiry from existing student.'
      })
    });
    const validStudentData = await validStudentRes.json();
    assert(validStudentRes.status === 201 && validStudentData.success && validStudentData.data.id, 'POST /api/contact student valid submission returns 201');
    studentId = validStudentData.data.id;

    // -------------------------------------------------------------------------
    console.log('\n--- 3. Admin Authentication & JWT ---');
    // -------------------------------------------------------------------------
    // Missing login credentials
    const badLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert(badLoginRes.status === 400, 'POST /api/auth/login with empty body returns 400');

    // Invalid credentials
    const wrongPassRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@ace.com',
        password: 'IncorrectPassword'
      })
    });
    assert(wrongPassRes.status === 401, 'POST /api/auth/login with wrong password returns 401');

    // Valid login
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@ace.com',
        password: 'Admin@12345'
      })
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200 && Boolean(loginData.token), 'POST /api/auth/login with valid credentials returns 200 & JWT');
    const adminToken = loginData.token;

    // Protected /api/auth/me with Bearer token
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const meData = await meRes.json();
    assert(meRes.status === 200 && meData.data.email === 'admin@ace.com', 'GET /api/auth/me with Bearer token returns 200 & admin email');

    // Protected /api/auth/me without token
    const meNoTokenRes = await fetch(`${baseUrl}/api/auth/me`);
    assert(meNoTokenRes.status === 401, 'GET /api/auth/me without token returns 401');

    // -------------------------------------------------------------------------
    console.log('\n--- 4. Protected Form Submissions Listing & Details ---');
    // -------------------------------------------------------------------------
    // Unauthorized list request
    const unauthListRes = await fetch(`${baseUrl}/api/contact`);
    assert(unauthListRes.status === 401, 'GET /api/contact without token returns 401 Unauthorized');

    // Authorized list request
    const authListRes = await fetch(`${baseUrl}/api/contact`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const authListData = await authListRes.json();
    assert(
      authListRes.status === 200 &&
      authListData.success &&
      Array.isArray(authListData.data) &&
      authListData.total >= 2,
      'GET /api/contact with Bearer token returns 200 and all submissions'
    );

    // Single submission detail by ID
    const singleRes = await fetch(`${baseUrl}/api/contact/${studentId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const singleData = await singleRes.json();
    assert(
      singleRes.status === 200 &&
      singleData.data._id === studentId &&
      singleData.data.batchNumber === 'BCE-321',
      'GET /api/contact/:id returns 200 and correct document details'
    );

    // Search query parameter
    const searchRes = await fetch(`${baseUrl}/api/contact?search=Alice`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const searchData = await searchRes.json();
    assert(
      searchRes.status === 200 &&
      searchData.data.some(s => s.email === 'testalice@example.com'),
      'GET /api/contact?search=Alice returns matching submission'
    );

    // Filter by isBrototypeStudent
    const filterRes = await fetch(`${baseUrl}/api/contact?isBrototypeStudent=yes`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const filterData = await filterRes.json();
    assert(
      filterRes.status === 200 &&
      filterData.data.every(s => s.isBrototypeStudent === 'yes'),
      'GET /api/contact?isBrototypeStudent=yes filters exclusively'
    );

    // Invalid ObjectId format
    const badIdRes = await fetch(`${baseUrl}/api/contact/invalid-mongo-id`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(badIdRes.status === 400, 'GET /api/contact/invalid-id returns 400 Bad Request');

    // Non-existent ObjectId
    const fakeObjectId = new mongoose.Types.ObjectId();
    const notFoundRes = await fetch(`${baseUrl}/api/contact/${fakeObjectId}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(notFoundRes.status === 404, 'GET /api/contact/:nonExistentId returns 404 Not Found');

    // -------------------------------------------------------------------------
    console.log('\n--- 5. Admin Management (Super Admin & RBAC) ---');
    // -------------------------------------------------------------------------
    // Clean up any test admin left over
    await Admin.deleteOne({ email: 'test.created.admin@ace.com' });

    // Super admin lists admins (must exclude super admin)
    const getAdminsRes = await fetch(`${baseUrl}/api/admins`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const getAdminsData = await getAdminsRes.json();
    assert(getAdminsRes.status === 200 && Array.isArray(getAdminsData.data), 'GET /api/admins as superadmin returns 200 and admin list');
    assert(!getAdminsData.data.some(a => a.email === 'admin@ace.com'), 'GET /api/admins excludes super admin from listing');

    // Super admin creates new admin with phone, name, email, password, and internal organization role
    const createAdminRes = await fetch(`${baseUrl}/api/admins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Created Admin User',
        email: 'test.created.admin@ace.com',
        password: 'Admin@12345',
        phone: '9847111222',
        role: 'Community Lead'
      })
    });
    const createAdminData = await createAdminRes.json();
    assert(
      createAdminRes.status === 201 &&
      createAdminData.data?.email === 'test.created.admin@ace.com' &&
      createAdminData.data?.role === 'Community Lead',
      'POST /api/admins creates new admin with phone and internal organizational role'
    );

    // Duplicate email fails with 409
    const dupAdminRes = await fetch(`${baseUrl}/api/admins`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Duplicate Admin User',
        email: 'test.created.admin@ace.com',
        password: 'Admin@12345',
        phone: '9847111222',
        role: 'Community Lead'
      })
    });
    assert(dupAdminRes.status === 409, 'POST /api/admins with duplicate email returns 409 Conflict');

    // Log in as the newly created regular admin to test RBAC
    const regLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test.created.admin@ace.com', password: 'Admin@12345' })
    });
    const regLoginData = await regLoginRes.json();
    const regularToken = regLoginData.token;

    // Regular admin attempting to access /api/admins should receive 403 Forbidden
    const forbiddenRes = await fetch(`${baseUrl}/api/admins`, {
      headers: { Authorization: `Bearer ${regularToken}` }
    });
    assert(forbiddenRes.status === 403, 'GET /api/admins with regular admin token returns 403 Forbidden');

    // Superadmin attempting to block self should be rejected (400 Bad Request)
    const selfAdmin = await Admin.findOne({ email: 'admin@ace.com' });
    const blockSelfRes = await fetch(`${baseUrl}/api/admins/${selfAdmin._id}/toggle-block`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ isBlocked: true })
    });
    assert(blockSelfRes.status === 400, 'PATCH /api/admins/:id/toggle-block attempting to block own account returns 400');

    // Superadmin gets admin by ID (View Admin Details)
    const getSingleRes = await fetch(`${baseUrl}/api/admins/${createAdminData.data.id}`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const getSingleData = await getSingleRes.json();
    assert(
      getSingleRes.status === 200 && getSingleData.data?.email === 'test.created.admin@ace.com',
      'GET /api/admins/:id returns admin details for viewing'
    );

    // Superadmin updates admin details and password
    const updateAdminRes = await fetch(`${baseUrl}/api/admins/${createAdminData.data.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        name: 'Updated Admin User',
        phone: '9847999888',
        role: 'Senior Operations Lead',
        password: 'NewAdmin@12345'
      })
    });
    const updateAdminData = await updateAdminRes.json();
    assert(
      updateAdminRes.status === 200 &&
      updateAdminData.data?.name === 'Updated Admin User' &&
      updateAdminData.data?.role === 'Senior Operations Lead',
      'PUT /api/admins/:id updates admin details and password successfully'
    );

    // Superadmin blocks the test admin
    const blockAdminRes = await fetch(`${baseUrl}/api/admins/${createAdminData.data.id}/toggle-block`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ isBlocked: true })
    });
    const blockAdminData = await blockAdminRes.json();
    assert(
      blockAdminRes.status === 200 && blockAdminData.data?.isBlocked === true,
      'PATCH /api/admins/:id/toggle-block blocks admin account'
    );

    // Attempting login with blocked admin returns 403 Forbidden
    const blockedLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test.created.admin@ace.com', password: 'NewAdmin@12345' })
    });
    assert(blockedLoginRes.status === 403, 'POST /api/auth/login for blocked admin returns 403 Forbidden');

    // Superadmin unblocks the test admin
    const unblockAdminRes = await fetch(`${baseUrl}/api/admins/${createAdminData.data.id}/toggle-block`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ isBlocked: false })
    });
    const unblockAdminData = await unblockAdminRes.json();
    assert(
      unblockAdminRes.status === 200 && unblockAdminData.data?.isBlocked === false,
      'PATCH /api/admins/:id/toggle-block unblocks admin account'
    );

    // Superadmin attempting to delete self should be rejected (400 Bad Request)
    const deleteSelfRes = await fetch(`${baseUrl}/api/admins/${selfAdmin._id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    assert(deleteSelfRes.status === 400, 'DELETE /api/admins/:id attempting to delete own account returns 400');

    // Superadmin deletes the test admin permanently
    const deleteAdminRes = await fetch(`${baseUrl}/api/admins/${createAdminData.data.id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const deleteAdminData = await deleteAdminRes.json();
    assert(deleteAdminRes.status === 200, 'DELETE /api/admins/:id deletes admin permanently');

    const checkDeleted = await Admin.findById(createAdminData.data.id);
    assert(!checkDeleted, 'Deleted admin is confirmed removed from database');

    // -------------------------------------------------------------------------
    console.log('\n--- 6. 404 Route Handler ---');
    // -------------------------------------------------------------------------
    const missingRouteRes = await fetch(`${baseUrl}/api/completely-unknown-route`);
    assert(missingRouteRes.status === 404, 'GET /api/completely-unknown-route returns 404');

    console.log('\n========================================');
    console.log(` TOTAL TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log('========================================\n');

    if (failed > 0) {
      throw new Error(`${failed} tests failed!`);
    }
  } finally {
    if (nonStudentId) await ContactSubmission.deleteOne({ _id: nonStudentId });
    if (studentId) await ContactSubmission.deleteOne({ _id: studentId });
    server.close();
  }
}

runTotalApplicationTest()
  .then(() => {
    console.log('Total application test completed successfully with 0 errors.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Test suite failed:', err);
    process.exit(1);
  });
