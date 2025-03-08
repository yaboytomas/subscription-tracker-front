import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
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

    // If no user found, still return success to prevent email enumeration attacks
    if (!user) {
      console.log(`Password reset requested for non-existent email: ${email}`);
      return NextResponse.json({ 
        success: true, 
        message: 'If a user with that email exists, we have sent them a password reset link'
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
    }

    // Return success even if email fails to avoid revealing too much information
    return NextResponse.json({ 
      success: true, 
      message: 'If a user with that email exists, we have sent them a password reset link'
    });
  } catch (error) {
    console.error('Error in password reset request:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
} 