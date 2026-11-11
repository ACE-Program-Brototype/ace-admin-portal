import mongoose from 'mongoose';

export const ENQUIRY_STATUSES = [
  'ENQUIRED',
  'CONNECTED',
  'PREPARATION',
  'SCHEDULED',
  'REJECTED',
  'SELECTED',
  'ONBOARDED'
];

export const VALID_STATUS_TRANSITIONS = {
  ENQUIRED: ['CONNECTED'],
  CONNECTED: ['PREPARATION', 'SCHEDULED', 'REJECTED'],
  PREPARATION: ['SCHEDULED', 'REJECTED'],
  SCHEDULED: ['SELECTED', 'REJECTED'],
  SELECTED: ['ONBOARDED'],
  REJECTED: ['CONNECTED'], // Allow reconsideration back to CONNECTED
  ONBOARDED: []
};

const statusHistorySchema = new mongoose.Schema(
  {
    status: {
      type: String,
      required: true,
      enum: ENQUIRY_STATUSES
    },
    previousStatus: {
      type: String,
      default: null
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      default: null
    },
    changedByName: {
      type: String,
      default: 'Admin'
    },
    changedByEmail: {
      type: String,
      default: ''
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    feedback: {
      type: String,
      default: '',
      trim: true
    },
    notes: {
      type: String,
      default: '',
      trim: true
    },
    scheduledAt: {
      type: Date,
      default: null
    },
    meetLink: {
      type: String,
      default: '',
      trim: true
    }
  },
  { _id: true }
);

const contactSubmissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [
        /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
        'Please provide a valid email address'
      ]
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^\d+$/, 'Phone number must contain numbers only']
    },
    isBrototypeStudent: {
      type: String,
      required: [true, 'isBrototypeStudent is required'],
      enum: {
        values: ['yes', 'no'],
        message: 'isBrototypeStudent must be either "yes" or "no"'
      },
      lowercase: true,
      trim: true
    },
    batchNumber: {
      type: String,
      trim: true,
      default: ''
    },
    domain: {
      type: String,
      trim: true,
      default: ''
    },
    counsellorName: {
      type: String,
      trim: true,
      default: ''
    },
    message: {
      type: String,
      trim: true,
      default: '',
      maxlength: [2000, 'Message cannot exceed 2000 characters']
    },
    // Lifecycle Status Management
    status: {
      type: String,
      enum: ENQUIRY_STATUSES,
      default: 'ENQUIRED'
    },
    scheduledAt: {
      type: Date,
      default: null
    },
    meetLink: {
      type: String,
      default: '',
      trim: true
    },
    feedback: {
      type: String,
      default: '',
      trim: true
    },
    statusHistory: {
      type: [statusHistorySchema],
      default: () => [
        {
          status: 'ENQUIRED',
          previousStatus: null,
          changedByName: 'System (Form Submission)',
          changedAt: new Date(),
          notes: 'Initial contact enquiry'
        }
      ]
    },
    sheetSyncStatus: {
      type: String,
      enum: ['pending', 'synced', 'failed'],
      default: 'pending'
    },
    sheetSyncError: {
      type: String,
      default: null
    },
    sheetSyncedAt: {
      type: Date,
      default: null
    },
    sheetSyncAttempts: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

contactSubmissionSchema.index({ status: 1 });
contactSubmissionSchema.index({ scheduledAt: 1 });
contactSubmissionSchema.index({ createdAt: -1 });

export const ContactSubmission = mongoose.model(
  'ContactSubmission',
  contactSubmissionSchema
);
