import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Interface for notification preferences
export interface INotificationPreferences {
  paymentReminders: boolean; // Whether to send payment reminders
  reminderFrequency: 'daily' | 'weekly' | '3days'; // When to send reminders
  monthlyReports: boolean; // Whether to send monthly spending reports
}

export interface IUser extends mongoose.Document {
  name: string;
  email: string;
  password: string;
  bio?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  notificationPreferences?: INotificationPreferences;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new mongoose.Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      maxlength: [50, 'Name cannot be more than 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default in queries
    },
    bio: {
      type: String,
      maxlength: [500, 'Bio cannot be more than 500 characters'],
    },
    resetPasswordToken: {
      type: String,
      select: false, // Don't return this field by default
    },
    resetPasswordExpires: {
      type: Date,
      select: false, // Don't return this field by default
    },
    notificationPreferences: {
      paymentReminders: {
        type: Boolean,
        default: true,
      },
      reminderFrequency: {
        type: String,
        enum: ['daily', 'weekly', '3days'],
        default: '3days',
      },
      monthlyReports: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre('save', async function (next) {
  // Only hash the password if it's modified
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    console.log(`Hashing password for user: ${this.email}`);
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    console.log('Password hashed successfully');
    next();
  } catch (error) {
    console.error('Error hashing password:', error);
    next(error);
  }
});

// Method to compare password
UserSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
  try {
    if (!this.password) {
      console.error('Password field is missing from user document');
      return false;
    }
    
    const isMatch = await bcrypt.compare(password, this.password);
    return isMatch;
  } catch (error) {
    console.error('Error comparing passwords:', error);
    return false;
  }
};

// Check if model already exists to prevent overwrite during hot reloads
export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema); 