import mongoose from 'mongoose';

// Interface for email entries in the registry
interface IEmailEntry {
  email: string;
  isPrimary: boolean;
  isVerified: boolean;
  addedAt: Date;
  lastUsedAt?: Date;
  source: 'signup' | 'change' | 'import' | 'admin';
}

// Interface for subscription summaries in the registry
interface ISubscriptionSummary {
  subscriptionId: mongoose.Types.ObjectId;
  name: string;
  provider: string;
  price: string;
  billingCycle: string;
  addedAt: Date;
  lastUpdatedAt: Date;
  status: 'active' | 'cancelled' | 'paused';
}

export interface IUserRegistry extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  currentEmail: string;
  emailHistory: IEmailEntry[];
  subscriptions: ISubscriptionSummary[];
  totalMonthlySpend: number;
  accountCreatedAt: Date;
  lastActive: Date;
  lastUpdated: Date;
  metadata: Record<string, any>;
}

const EmailEntrySchema = new mongoose.Schema<IEmailEntry>({
  email: {
    type: String,
    required: true,
  },
  isPrimary: {
    type: Boolean,
    default: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
  lastUsedAt: {
    type: Date,
  },
  source: {
    type: String,
    enum: ['signup', 'change', 'import', 'admin'],
    default: 'change',
  },
});

const SubscriptionSummarySchema = new mongoose.Schema<ISubscriptionSummary>({
  subscriptionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription',
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  provider: {
    type: String,
    default: '',
  },
  price: {
    type: String,
    required: true,
  },
  billingCycle: {
    type: String,
    required: true,
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
  lastUpdatedAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'paused'],
    default: 'active',
  },
});

const UserRegistrySchema = new mongoose.Schema<IUserRegistry>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
    },
    currentEmail: {
      type: String,
      required: true,
    },
    emailHistory: [EmailEntrySchema],
    subscriptions: [SubscriptionSummarySchema],
    totalMonthlySpend: {
      type: Number,
      default: 0,
    },
    accountCreatedAt: {
      type: Date,
      required: true,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: Map,
      of: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

// Indexes for faster queries
UserRegistrySchema.index({ currentEmail: 1 });
UserRegistrySchema.index({ 'emailHistory.email': 1 });
UserRegistrySchema.index({ 'subscriptions.subscriptionId': 1 });

// Updating lastUpdated timestamp before save
UserRegistrySchema.pre('save', function(next) {
  this.lastUpdated = new Date();
  next();
});

// Check if model already exists to prevent overwrite during hot reloads
export default mongoose.models.UserRegistry || mongoose.model<IUserRegistry>('UserRegistry', UserRegistrySchema); 