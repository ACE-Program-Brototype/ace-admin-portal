import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { Admin } from '../models/Admin.js';
import { ContactSubmission } from '../models/ContactSubmission.js';
import { logger } from '../utils/logger.js';

const dummySubmissions = [
  {
    name: 'Vivek Sharma',
    email: 'vivek.sharma@example.com',
    phone: '9847012345',
    isBrototypeStudent: 'yes',
    batchNumber: 'BCE-32',
    domain: 'MERN',
    counsellorName: 'Rahul Nair',
    message: 'Interested in advanced microservices architecture and cloud deployment workshops.',
    sheetSyncStatus: 'synced',
    sheetSyncError: null,
    sheetSyncAttempts: 1,
    daysAgo: 0,
    hoursAgo: 2
  },
  {
    name: 'Ananya Pillai',
    email: 'ananya.pillai@example.com',
    phone: '9847023456',
    isBrototypeStudent: 'yes',
    batchNumber: 'BCE-35',
    domain: 'Python Django',
    counsellorName: 'Anjali Menon',
    message: 'Looking for guidance on REST API design, Celery task queues, and Docker containerization.',
    sheetSyncStatus: 'synced',
    sheetSyncError: null,
    sheetSyncAttempts: 1,
    daysAgo: 0,
    hoursAgo: 5
  },
  {
    name: 'Mohammed Farhan',
    email: 'farhan.m@example.com',
    phone: '9847034567',
    isBrototypeStudent: 'yes',
    batchNumber: 'BCE-41',
    domain: 'Flutter',
    counsellorName: 'Siddharth V',
    message: 'Would love to collaborate on open-source cross-platform mobile apps using Flutter and Bloc.',
    sheetSyncStatus: 'pending',
    sheetSyncError: null,
    sheetSyncAttempts: 0,
    daysAgo: 0,
    hoursAgo: 8
  },
  {
    name: 'Sneha Nair',
    email: 'sneha.nair@example.com',
    phone: '9847045678',
    isBrototypeStudent: 'yes',
    batchNumber: 'BCE-28',
    domain: 'Machine Learning',
    counsellorName: 'Fathima Zahra',
    message: 'Seeking mentorship in computer vision, LLM fine-tuning, and PyTorch production pipelines.',
    sheetSyncStatus: 'synced',
    sheetSyncError: null,
    sheetSyncAttempts: 1,
    daysAgo: 1,
    hoursAgo: 3
  },
  {
    name: 'Karthik Rajan',
    email: 'karthik.rajan@example.com',
    phone: '9847056789',
    isBrototypeStudent: 'no',
    batchNumber: '',
    domain: '',
    counsellorName: '',
    message: 'Hi ACE team, I graduated with a B.Tech in CS. What is the roadmap to join the offline cohort?',
    sheetSyncStatus: 'synced',
    sheetSyncError: null,
    sheetSyncAttempts: 1,
    daysAgo: 1,
    hoursAgo: 10
  },
  {
    name: 'Rohit Kurup',
    email: 'rohit.kurup@example.com',
    phone: '9847067890',
    isBrototypeStudent: 'yes',
    batchNumber: 'BCE-45',
    domain: 'Golang',
    counsellorName: 'Arun Kumar',
    message: 'Excited about backend high-throughput concurrency systems in Go and gRPC services.',
    sheetSyncStatus: 'synced',
    sheetSyncError: null,
    sheetSyncAttempts: 1,
    daysAgo: 2,
    hoursAgo: 4
  },
  {
    name: 'Pooja Varma',
    email: 'pooja.varma@example.com',
    phone: '9847078901',
    isBrototypeStudent: 'yes',
    batchNumber: 'BCE-38',
    domain: 'Cyber Security',
    counsellorName: 'Rahul Nair',
    message: 'Looking forward to web penetration testing sessions and SOC fundamentals.',
    sheetSyncStatus: 'failed',
    sheetSyncError: 'Google Apps Script timeout after 15000ms',
    sheetSyncAttempts: 3,
    daysAgo: 2,
    hoursAgo: 14
  },
  {
    name: 'Ashwin Kumar',
    email: 'ashwin.k@example.com',
    phone: '9847089012',
    isBrototypeStudent: 'yes',
    batchNumber: 'BCE-50',
    domain: 'Java Spring Boot',
    counsellorName: 'Anjali Menon',
    message: 'Want to master Spring Security, OAuth2, and event-driven architecture with Apache Kafka.',
    sheetSyncStatus: 'synced',
    sheetSyncError: null,
    sheetSyncAttempts: 1,
    daysAgo: 3,
    hoursAgo: 6
  },
  {
    name: 'Meera Menon',
    email: 'meera.menon@example.com',
    phone: '9847090123',
    isBrototypeStudent: 'yes',
    batchNumber: 'BCE-32',
    domain: 'MERN',
    counsellorName: 'Siddharth V',
    message: 'Looking for peer review on my fullstack e-commerce project built with React 19 & Next.js.',
    sheetSyncStatus: 'synced',
    sheetSyncError: null,
    sheetSyncAttempts: 1,
    daysAgo: 3,
    hoursAgo: 18
  },
  {
    name: 'Devadathan S',
    email: 'devadathan.s@example.com',
    phone: '9847101234',
    isBrototypeStudent: 'no',
    batchNumber: '',
    domain: '',
    counsellorName: '',
    message: 'Can working professionals attend the weekend masterclasses? Please share the syllabus.',
    sheetSyncStatus: 'synced',
    sheetSyncError: null,
    sheetSyncAttempts: 1,
    daysAgo: 4,
    hoursAgo: 2
  },
  {
    name: 'Fathima Shaji',
    email: 'fathima.shaji@example.com',
    phone: '9847112345',
    isBrototypeStudent: 'yes',
    batchNumber: 'BCE-48',
    domain: 'Devops',
    counsellorName: 'Fathima Zahra',
    message: 'Eager to learn Terraform, Kubernetes cluster orchestration, and automated CI/CD pipelines.',
    sheetSyncStatus: 'pending',
    sheetSyncError: null,
    sheetSyncAttempts: 0,
    daysAgo: 4,
    hoursAgo: 11
  },
  {
    name: 'Harikrishnan M',
    email: 'hari.krishnan@example.com',
    phone: '9847123456',
    isBrototypeStudent: 'yes',
    batchNumber: 'BCE-29',
    domain: 'Datascience',
    counsellorName: 'Rahul Nair',
    message: 'Interested in exploratory data analysis, Pandas, SQL data modeling, and PowerBI dashboards.',
    sheetSyncStatus: 'synced',
    sheetSyncError: null,
    sheetSyncAttempts: 1,
    daysAgo: 5,
    hoursAgo: 7
  },
  {
    name: 'Shilpa Suresh',
    email: 'shilpa.suresh@example.com',
    phone: '9847134567',
    isBrototypeStudent: 'yes',
    batchNumber: 'BCE-44',
    domain: 'Dot Net',
    counsellorName: 'Arun Kumar',
    message: 'Building enterprise backend APIs with .NET 8, C#, Entity Framework Core, and SQL Server.',
    sheetSyncStatus: 'synced',
    sheetSyncError: null,
    sheetSyncAttempts: 1,
    daysAgo: 6,
    hoursAgo: 3
  },
  {
    name: 'Vishnu Prasad',
    email: 'vishnu.prasad@example.com',
    phone: '9847145678',
    isBrototypeStudent: 'yes',
    batchNumber: 'BCE-33',
    domain: 'MEAN',
    counsellorName: 'Anjali Menon',
    message: 'Migrating legacy AngularJS projects to Angular 18 with standalone components and RxJS.',
    sheetSyncStatus: 'synced',
    sheetSyncError: null,
    sheetSyncAttempts: 1,
    daysAgo: 7,
    hoursAgo: 9
  },
  {
    name: 'Nimisha Roy',
    email: 'nimisha.roy@example.com',
    phone: '9847156789',
    isBrototypeStudent: 'no',
    batchNumber: '',
    domain: '',
    counsellorName: '',
    message: 'Do you offer online mock interview sessions for final-year MCA students?',
    sheetSyncStatus: 'synced',
    sheetSyncError: null,
    sheetSyncAttempts: 1,
    daysAgo: 8,
    hoursAgo: 4
  },
  {
    name: 'Adithya V',
    email: 'adithya.v@example.com',
    phone: '9847167890',
    isBrototypeStudent: 'yes',
    batchNumber: 'BCE-52',
    domain: 'Android Kotlin',
    counsellorName: 'Siddharth V',
    message: 'Specializing in Jetpack Compose, Coroutines, StateFlow, and Clean Architecture for Android.',
    sheetSyncStatus: 'synced',
    sheetSyncError: null,
    sheetSyncAttempts: 1,
    daysAgo: 9,
    hoursAgo: 1
  },
  {
    name: 'Riya Sen',
    email: 'riya.sen@example.com',
    phone: '9847178901',
    isBrototypeStudent: 'yes',
    batchNumber: 'BCE-55',
    domain: 'Swift IOS',
    counsellorName: 'Rahul Nair',
    message: 'Working on native iOS applications with SwiftUI, CoreData, and Combine framework.',
    sheetSyncStatus: 'failed',
    sheetSyncError: 'HTTP 502 Bad Gateway: Upstream Web App timed out',
    sheetSyncAttempts: 2,
    daysAgo: 10,
    hoursAgo: 8
  },
  {
    name: 'Anandhu G',
    email: 'anandhu.g@example.com',
    phone: '9847189012',
    isBrototypeStudent: 'yes',
    batchNumber: 'BCE-36',
    domain: 'MERN',
    counsellorName: 'Fathima Zahra',
    message: 'Looking for peer pair-programming partners for advanced React hooks and Redux Toolkit.',
    sheetSyncStatus: 'synced',
    sheetSyncError: null,
    sheetSyncAttempts: 1,
    daysAgo: 11,
    hoursAgo: 5
  },
  {
    name: 'Gautham Krishna',
    email: 'gautham.k@example.com',
    phone: '9847190123',
    isBrototypeStudent: 'yes',
    batchNumber: 'BCE-40',
    domain: 'Python Django',
    counsellorName: 'Arun Kumar',
    message: 'Interested in algorithmic problem solving and backend database query optimization in PostgreSQL.',
    sheetSyncStatus: 'synced',
    sheetSyncError: null,
    sheetSyncAttempts: 1,
    daysAgo: 12,
    hoursAgo: 6
  },
  {
    name: 'Deepa Nambiar',
    email: 'deepa.nambiar@example.com',
    phone: '9847201234',
    isBrototypeStudent: 'no',
    batchNumber: '',
    domain: '',
    counsellorName: '',
    message: 'Seeking details on the scholarship program for women in tech.',
    sheetSyncStatus: 'synced',
    sheetSyncError: null,
    sheetSyncAttempts: 1,
    daysAgo: 13,
    hoursAgo: 12
  },
  {
    name: 'Jithin Lal',
    email: 'jithin.lal@example.com',
    phone: '9847212345',
    isBrototypeStudent: 'yes',
    batchNumber: 'BCE-39',
    domain: 'Software Testing',
    counsellorName: 'Rahul Nair',
    message: 'Automated test suite creation with Cypress, Playwright, and Selenium WebDriver.',
    sheetSyncStatus: 'synced',
    sheetSyncError: null,
    sheetSyncAttempts: 1,
    daysAgo: 14,
    hoursAgo: 7
  },
  {
    name: 'Akhila Mohan',
    email: 'akhila.mohan@example.com',
    phone: '9847223456',
    isBrototypeStudent: 'yes',
    batchNumber: 'BCE-47',
    domain: 'Game Development',
    counsellorName: 'Anjali Menon',
    message: 'Creating 3D indie mechanics using Unity and C# gameplay scripting.',
    sheetSyncStatus: 'pending',
    sheetSyncError: null,
    sheetSyncAttempts: 0,
    daysAgo: 15,
    hoursAgo: 3
  },
  {
    name: 'Pranav Rajesh',
    email: 'pranav.rajesh@example.com',
    phone: '9847234567',
    isBrototypeStudent: 'yes',
    batchNumber: 'BCE-31',
    domain: 'MERN',
    counsellorName: 'Siddharth V',
    message: 'Focusing on WebSockets, real-time collaboration tools, and Node.js stream processing.',
    sheetSyncStatus: 'synced',
    sheetSyncError: null,
    sheetSyncAttempts: 1,
    daysAgo: 16,
    hoursAgo: 10
  },
  {
    name: 'Sandra Alex',
    email: 'sandra.alex@example.com',
    phone: '9847245678',
    isBrototypeStudent: 'yes',
    batchNumber: 'BCE-43',
    domain: 'Flutter',
    counsellorName: 'Fathima Zahra',
    message: 'Developing modular offline-first mobile apps using Hive and Riverpod state management.',
    sheetSyncStatus: 'synced',
    sheetSyncError: null,
    sheetSyncAttempts: 1,
    daysAgo: 17,
    hoursAgo: 4
  },
  {
    name: 'Basil Eldho',
    email: 'basil.eldho@example.com',
    phone: '9847256789',
    isBrototypeStudent: 'no',
    batchNumber: '',
    domain: '',
    counsellorName: '',
    message: 'I am a career switcher with 3 years in mechanical engineering. Can I attend the intro webinar?',
    sheetSyncStatus: 'synced',
    sheetSyncError: null,
    sheetSyncAttempts: 1,
    daysAgo: 18,
    hoursAgo: 2
  },
  {
    name: 'Gayathri S',
    email: 'gayathri.s@example.com',
    phone: '9847267890',
    isBrototypeStudent: 'yes',
    batchNumber: 'BCE-58',
    domain: 'Golang',
    counsellorName: 'Arun Kumar',
    message: 'Building scalable distributed microservices with Go standard library and Fiber.',
    sheetSyncStatus: 'synced',
    sheetSyncError: null,
    sheetSyncAttempts: 1,
    daysAgo: 19,
    hoursAgo: 9
  },
  {
    name: 'Amal George',
    email: 'amal.george@example.com',
    phone: '9847278901',
    isBrototypeStudent: 'yes',
    batchNumber: 'BCE-34',
    domain: 'Java Spring Boot',
    counsellorName: 'Rahul Nair',
    message: 'Preparing for backend technical interviews: system design, concurrency, and JPA tuning.',
    sheetSyncStatus: 'synced',
    sheetSyncError: null,
    sheetSyncAttempts: 1,
    daysAgo: 21,
    hoursAgo: 8
  },
  {
    name: 'Swathi Krishnan',
    email: 'swathi.k@example.com',
    phone: '9847289012',
    isBrototypeStudent: 'yes',
    batchNumber: 'BCE-42',
    domain: 'Machine Learning',
    counsellorName: 'Anjali Menon',
    message: 'Interested in NLP transformers, LangChain agent workflows, and vector databases.',
    sheetSyncStatus: 'synced',
    sheetSyncError: null,
    sheetSyncAttempts: 1,
    daysAgo: 23,
    hoursAgo: 1
  },
  {
    name: 'Joel Thomas',
    email: 'joel.thomas@example.com',
    phone: '9847290123',
    isBrototypeStudent: 'no',
    batchNumber: '',
    domain: '',
    counsellorName: '',
    message: 'What are the upcoming batch dates for Kochi campus? Please share contact info of admissions.',
    sheetSyncStatus: 'synced',
    sheetSyncError: null,
    sheetSyncAttempts: 1,
    daysAgo: 25,
    hoursAgo: 6
  },
  {
    name: 'Keerthana R',
    email: 'keerthana.r@example.com',
    phone: '9847301234',
    isBrototypeStudent: 'yes',
    batchNumber: 'BCE-46',
    domain: 'Cyber Security',
    counsellorName: 'Siddharth V',
    message: 'Practicing on HackTheBox and TryHackMe, want to participate in upcoming ACE CTF competition.',
    sheetSyncStatus: 'synced',
    sheetSyncError: null,
    sheetSyncAttempts: 1,
    daysAgo: 27,
    hoursAgo: 11
  },
  {
    name: 'Nikhil Das',
    email: 'nikhil.das@example.com',
    phone: '9847312345',
    isBrototypeStudent: 'yes',
    batchNumber: 'BCE-37',
    domain: 'MERN',
    counsellorName: 'Fathima Zahra',
    message: 'Building an enterprise CRM dashboard using React, TailwindCSS, and Node.js microservices.',
    sheetSyncStatus: 'synced',
    sheetSyncError: null,
    sheetSyncAttempts: 1,
    daysAgo: 28,
    hoursAgo: 4
  },
  {
    name: 'Reshma Biju',
    email: 'reshma.biju@example.com',
    phone: '9847323456',
    isBrototypeStudent: 'no',
    batchNumber: '',
    domain: '',
    counsellorName: '',
    message: 'Inquiring about corporate training and placement assistance for self-taught programmers.',
    sheetSyncStatus: 'synced',
    sheetSyncError: null,
    sheetSyncAttempts: 1,
    daysAgo: 29,
    hoursAgo: 7
  }
];

export const seedDatabase = async ({ clean = false } = {}) => {
  try {
    await connectDB();
    logger.info('[Database Seed] Starting database initialization & seeding process...');

    // 1. Seed Super Admin User
    const adminEmail = (process.env.ADMIN_EMAIL || 'admin@ace.com').toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
    const adminName = process.env.ADMIN_NAME || 'ACE Super Administrator';
    const adminPhone = process.env.ADMIN_PHONE || '9847000001';

    let superAdmin = await Admin.findOne({ email: adminEmail });
    if (!superAdmin) {
      superAdmin = await Admin.create({
        email: adminEmail,
        password: adminPassword,
        name: adminName,
        phone: adminPhone,
        role: 'Super Administrator',
        isSuperAdmin: true
      });
      logger.success(`[Database Seed] Created Super Admin: ${superAdmin.email} (ID: ${superAdmin._id})`);
    } else {
      let modified = false;
      if (!superAdmin.isSuperAdmin) {
        superAdmin.isSuperAdmin = true;
        modified = true;
      }
      if (superAdmin.role !== 'Super Administrator') {
        superAdmin.role = 'Super Administrator';
        modified = true;
      }
      if (!superAdmin.phone) {
        superAdmin.phone = adminPhone;
        modified = true;
      }
      if (modified) {
        await superAdmin.save();
        logger.info(`[Database Seed] Updated ${superAdmin.email} to superadmin with phone.`);
      } else {
        logger.info(`[Database Seed] Super Admin verified: ${superAdmin.email} (ID: ${superAdmin._id})`);
      }
    }

    // Additional Organizational Admins for listing, filtering, and management demo
    const sampleAdmins = [
      {
        email: 'manager@ace.com',
        name: 'Community Manager',
        phone: '9847000002',
        role: 'Community Manager',
        isSuperAdmin: false
      },
      {
        email: 'rahul.ops@ace.com',
        name: 'Rahul Nair',
        phone: '9847000003',
        role: 'Operations Lead',
        isSuperAdmin: false
      },
      {
        email: 'anjali.admissions@ace.com',
        name: 'Anjali Menon',
        phone: '9847000004',
        role: 'Admissions Officer',
        isSuperAdmin: false
      }
    ];

    for (const sample of sampleAdmins) {
      let existing = await Admin.findOne({ email: sample.email });
      if (!existing) {
        await Admin.create({
          email: sample.email,
          password: 'Admin@12345',
          name: sample.name,
          phone: sample.phone,
          role: sample.role,
          isSuperAdmin: false
        });
        logger.success(`[Database Seed] Created Admin: ${sample.email} (${sample.role})`);
      } else {
        existing.phone = sample.phone;
        existing.role = sample.role;
        existing.isSuperAdmin = false;
        await existing.save();
      }
    }

    // 2. Handle Contact Submissions
    if (clean) {
      logger.warn('[Database Seed] "--clean" flag detected: Removing existing contact submissions...');
      await ContactSubmission.deleteMany({});
      logger.info('[Database Seed] Existing submissions cleared.');
    }

    const currentCount = await ContactSubmission.countDocuments();
    logger.info(`[Database Seed] Current contact submission count in DB: ${currentCount}`);

    let insertedCount = 0;
    let skippedCount = 0;

    const now = new Date();

    for (const item of dummySubmissions) {
      const existing = await ContactSubmission.findOne({
        $or: [{ email: item.email }, { phone: item.phone }]
      });

      if (existing) {
        skippedCount++;
        continue;
      }

      // Compute createdAt timestamp based on daysAgo and hoursAgo
      const createdAt = new Date(now.getTime() - (item.daysAgo * 24 * 60 * 60 * 1000 + item.hoursAgo * 60 * 60 * 1000));
      const sheetSyncedAt = item.sheetSyncStatus === 'synced'
        ? new Date(createdAt.getTime() + 15 * 1000) // synced 15 seconds after submission
        : null;

      await ContactSubmission.create({
        name: item.name,
        email: item.email,
        phone: item.phone,
        isBrototypeStudent: item.isBrototypeStudent,
        batchNumber: item.batchNumber,
        domain: item.domain,
        counsellorName: item.counsellorName,
        message: item.message,
        sheetSyncStatus: item.sheetSyncStatus,
        sheetSyncError: item.sheetSyncError,
        sheetSyncedAt: sheetSyncedAt,
        sheetSyncAttempts: item.sheetSyncAttempts,
        createdAt: createdAt,
        updatedAt: createdAt
      });

      insertedCount++;
    }

    const totalSubmissions = await ContactSubmission.countDocuments();
    const brototypeCount = await ContactSubmission.countDocuments({ isBrototypeStudent: 'yes' });
    const generalCount = await ContactSubmission.countDocuments({ isBrototypeStudent: 'no' });
    const syncedCount = await ContactSubmission.countDocuments({ sheetSyncStatus: 'synced' });
    const pendingCount = await ContactSubmission.countDocuments({ sheetSyncStatus: 'pending' });
    const failedCount = await ContactSubmission.countDocuments({ sheetSyncStatus: 'failed' });
    const totalAdmins = await Admin.countDocuments();

    logger.success('\n======================================================');
    logger.success(' DATABASE INITIALIZATION & SEEDING COMPLETE');
    logger.success('======================================================');
    logger.info(`Database Name:          "${mongoose.connection.name}"`);
    logger.info(`Total Admins:           ${totalAdmins}`);
    logger.info(`Submissions Inserted:   ${insertedCount}`);
    logger.info(`Submissions Skipped:    ${skippedCount}`);
    logger.info(`Total Submissions:      ${totalSubmissions}`);
    logger.info(`  - Brototype Students: ${brototypeCount}`);
    logger.info(`  - General Enquiries:  ${generalCount}`);
    logger.info(`  - Synced to Sheets:   ${syncedCount}`);
    logger.info(`  - Pending Sync:       ${pendingCount}`);
    logger.info(`  - Sync Failed:        ${failedCount}`);
    logger.success('======================================================\n');

    return {
      success: true,
      admins: totalAdmins,
      submissions: {
        total: totalSubmissions,
        brototype: brototypeCount,
        general: generalCount,
        synced: syncedCount,
        pending: pendingCount,
        failed: failedCount
      }
    };
  } catch (error) {
    logger.error(`[Database Seed Error] Failed to seed database: ${error.message}`);
    throw error;
  }
};

// Direct CLI execution
if (process.argv[1] && process.argv[1].endsWith('seedDatabase.js')) {
  const clean = process.argv.includes('--clean') || process.argv.includes('--reset');
  seedDatabase({ clean })
    .then(() => {
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}