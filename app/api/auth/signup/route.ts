import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { createToken, setTokenCookie } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email-service';

export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await dbConnect();
    
    // Parse request body
    const body = await req.json();
    const { name, email, password, confirmPassword } = body;
    
    // Basic validation
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide all required fields' },
        { status: 400 }
      );
    }
    
    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'Passwords do not match' },
        { status: 400 }
      );
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email already in use' },
        { status: 400 }
      );
    }
    
    // Create user
    const user = await User.create({
      name,
      email,
      password,
    });
    
    // Generate token
    const token = createToken(user);
    
    // Create response
    const response = NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
    
    // Set token cookie directly on the response
    response.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      sameSite: 'strict',
    });
    
    // Send welcome email (don't await to avoid delaying response)
    sendWelcomeEmail({ email, name }).catch(error => {
      console.error('Error sending welcome email:', error);
    });
    
    // Return user data (excluding password)
    return response;
  } catch (error: any) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 