import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import DeletedUser from '@/models/DeletedUser';
import { sendPasswordResetEmail } from '@/lib/email-service';

// Generates a random token
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Parse request body
    const { email } = await req.json();

    // Validate input
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await User.findOne({ email });

    // Check if email belongs to a deleted account
    const deletedUser = await DeletedUser.findOne({ email });
    
    // If the email belongs to a deleted account, inform the user but maintain security
    if (deletedUser && !user) {
      console.log(`Password reset requested for deleted account: ${email}`);
      return NextResponse.json({
        success: false,
        accountDeleted: true,
        message: 'This account has been deleted. If you wish to use this email again, please sign up for a new account.'
      });
    }

    // If no user found (and not deleted), return an appropriate message
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      return NextResponse.json({ 
        success: false,
        notFound: true,
        message: 'No account found with this email address. Please check your email or create a new account.'
      });
    }

    // Generate a reset token
    const resetToken = generateToken();
    
    // Set token and expiry in user document (expires in 1 hour)
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    
    await user.save();
    
    // Send the password reset email
    const emailResult = await sendPasswordResetEmail(
      { email: user.email, name: user.name },
      resetToken
    );

    if (!emailResult.success) {
      console.error('Failed to send password reset email:', emailResult.error);
      return NextResponse.json({ 
        success: false, 
        emailFailed: true,
        message: 'Failed to send the password reset email. Please try again later.'
      });
    }

    // Return success
    return NextResponse.json({ 
      success: true, 
      message: 'A password reset link has been sent to your email address.'
    });
  } catch (error) {
    console.error('Error in password reset request:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
} 