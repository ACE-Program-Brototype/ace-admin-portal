import mongoose from 'mongoose';

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

export const ContactSubmission = mongoose.model(
  'ContactSubmission',
  contactSubmissionSchema
);
