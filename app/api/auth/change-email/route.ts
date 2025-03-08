import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await dbConnect();
    
    // Get current user from token
    const currentUser = await getCurrentUser(req);
    
    if (!currentUser) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const { newEmail, password } = body;
    
    // Basic validation
    if (!newEmail || !password) {
      return NextResponse.json(
        { success: false, message: 'All fields are required' },
        { status: 400 }
      );
    }
    
    // Get user with password
    const user = await User.findById(currentUser.id);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Verify password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, message: 'Password is incorrect' },
        { status: 401 }
      );
    }
    
    // Check if email is already in use
    const existingUser = await User.findOne({ email: newEmail, _id: { $ne: user._id } });
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'Email is already in use' },
        { status: 400 }
      );
    }
    
    // Update email
    user.email = newEmail;
    await user.save();
    
    return NextResponse.json({
      success: true,
      message: 'Email updated successfully',
    });
  } catch (error: any) {
    console.error('Error changing email:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 