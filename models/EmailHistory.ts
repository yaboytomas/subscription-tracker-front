import mongoose from 'mongoose';

export interface IEmailHistory extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  previousEmail: string;
  newEmail: string;
  changedAt: Date;
  reason?: string;
  ipAddress?: string;
  userAgent?: string;
}

const EmailHistorySchema = new mongoose.Schema<IEmailHistory>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // For faster lookups by user
    },
    previousEmail: {
      type: String,
      required: true,
    },
    newEmail: {
      type: String,
      required: true,
    },
    changedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    reason: {
      type: String,
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
  },
  { timestamps: true }
);

// Index for faster lookups by email
EmailHistorySchema.index({ previousEmail: 1 });
EmailHistorySchema.index({ newEmail: 1 });

// Check if model already exists to prevent overwrite during hot reloads
export default mongoose.models.EmailHistory || mongoose.model<IEmailHistory>('EmailHistory', EmailHistorySchema); 