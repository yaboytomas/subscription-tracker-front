import mongoose from 'mongoose';

export interface IDeletedUser extends mongoose.Document {
  originalId: mongoose.Types.ObjectId;
  name: string;
  email: string;
  bio?: string;
  createdAt: Date;       // When the original account was created
  deletedAt: Date;       // When the account was deleted
  subscriptionCount: number; // How many subscriptions they had
  totalSpent: number;    // Calculated total amount they were spending
  reason?: string;       // Optional reason for deletion
  deletedBy: 'user' | 'admin' | 'system'; // Who initiated the deletion
}

const DeletedUserSchema = new mongoose.Schema<IDeletedUser>(
  {
    originalId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true, // Index for faster lookups
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      index: true, // Index for faster lookups
    },
    bio: {
      type: String,
    },
    createdAt: {
      type: Date,
      required: true,
    },
    deletedAt: {
      type: Date,
      default: Date.now,
      required: true,
    },
    subscriptionCount: {
      type: Number,
      default: 0,
    },
    totalSpent: {
      type: Number,
      default: 0,
    },
    reason: {
      type: String,
    },
    deletedBy: {
      type: String,
      enum: ['user', 'admin', 'system'],
      default: 'user',
      required: true,
    },
  },
  { timestamps: false } // We manage our own timestamps
);

// Add compound index on email and deletedAt for finding deleted users efficiently
DeletedUserSchema.index({ email: 1, deletedAt: -1 });

// Check if model already exists to prevent overwrite during hot reloads
export default mongoose.models.DeletedUser || mongoose.model<IDeletedUser>('DeletedUser', DeletedUserSchema); 