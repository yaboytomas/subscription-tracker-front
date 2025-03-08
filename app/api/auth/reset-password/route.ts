import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { sendPasswordChangedEmail } from '@/lib/email-service';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    // Parse request body
    const { token, email, password } = await req.json();

    // Validate input
    if (!token || !email || !password) {
      return NextResponse.json(
        { error: 'Token, email, and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Find user by email and valid reset token that hasn't expired
    const user = await User.findOne({
      email,
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    // If no valid token found
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid or expired password reset token' },
        { status: 400 }
      );
    }

    // Set the new password (it will be hashed by the pre-save hook)
    user.password = password;
    
    // Clear the reset token fields
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    
    await user.save();
    
    // Send password changed confirmation email
    const emailResult = await sendPasswordChangedEmail(
      { email: user.email, name: user.name }
    );

    if (!emailResult.success) {
      console.error('Failed to send password changed confirmation email:', emailResult.error);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Your password has been reset successfully. You can now login with your new password.'
    });
  } catch (error) {
    console.error('Error in password reset:', error);
    return NextResponse.json(
      { error: 'An error occurred while resetting your password' },
      { status: 500 }
    );
  }
} 