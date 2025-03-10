import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { createToken, setTokenCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await dbConnect();
    
    // Parse request body
    const body = await req.json();
    const { email, password } = body;
    
    // Basic validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Please provide email and password' },
        { status: 400 }
      );
    }
    
    // Find user and include password for verification in a single query
    const user = await User.findOne({ email }).select('+password');
    
    // Check if user exists and verify password in one step
    if (!user || !(await user.comparePassword(password))) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    // Generate token and set cookie in parallel
    const [token] = await Promise.all([
      createToken(user),
      setTokenCookie(createToken(user))
    ]);
    
    // Return user data
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 