import mongoose from 'mongoose';

export interface IDeletedSubscription extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  originalId: mongoose.Types.ObjectId;
  name: string;
  price: string;
  category: string;
  billingCycle: string;
  startDate: string;
  description: string;
  nextPayment?: string;
  deletedAt: Date;
  deletedBy: 'user' | 'admin' | 'system';
  deletionMethod: 'individual' | 'bulk'; // track if deleted individually or as part of "delete all"
  deletionReason?: string;
}

const DeletedSubscriptionSchema = new mongoose.Schema<IDeletedSubscription>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true, // For faster lookups by user
    },
    originalId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
    billingCycle: {
      type: String,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: '',
    },
    nextPayment: {
      type: String,
    },
    deletedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    deletedBy: {
      type: String,
      enum: ['user', 'admin', 'system'],
      default: 'user',
      required: true,
    },
    deletionMethod: {
      type: String,
      enum: ['individual', 'bulk'],
      required: true,
    },
    deletionReason: {
      type: String,
    },
  },
  { timestamps: true }
);

// Compound indexes for faster queries
DeletedSubscriptionSchema.index({ userId: 1, deletedAt: -1 });
DeletedSubscriptionSchema.index({ name: 1, userId: 1 });

// Check if model already exists to prevent overwrite during hot reloads
export default mongoose.models.DeletedSubscription || mongoose.model<IDeletedSubscription>('DeletedSubscription', DeletedSubscriptionSchema); 