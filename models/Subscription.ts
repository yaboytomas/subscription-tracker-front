import mongoose from 'mongoose';

export interface ISubscription extends mongoose.Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  price: string;
  category: string;
  billingCycle: string;
  startDate: string;
  description: string;
  nextPayment: string;
}

const SubscriptionSchema = new mongoose.Schema<ISubscription>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      maxlength: [100, 'Name cannot be more than 100 characters'],
    },
    price: {
      type: String,
      required: [true, 'Please provide a price'],
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
    },
    billingCycle: {
      type: String,
      required: [true, 'Please provide a billing cycle'],
      enum: ['Monthly', 'Quarterly', 'Yearly', 'Weekly', 'Biweekly', 'Daily'],
    },
    startDate: {
      type: String,
      required: [true, 'Please provide a start date'],
    },
    description: {
      type: String,
      default: '',
    },
    nextPayment: {
      type: String,
      required: [true, 'Please provide a next payment date'],
    },
  },
  { timestamps: true }
);

// Check if model already exists to prevent overwrite during hot reloads
export default mongoose.models.Subscription || mongoose.model<ISubscription>('Subscription', SubscriptionSchema); 