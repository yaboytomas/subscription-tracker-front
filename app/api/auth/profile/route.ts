import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';

// GET the current user's profile
export async function GET(req: NextRequest) {
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
    
    // Find user in database (to get latest data)
    const user = await User.findById(currentUser.id).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio || '',
        notificationPreferences: user.notificationPreferences || {
          paymentReminders: true,
          reminderFrequency: '3days',
          monthlyReports: true
        }
      },
    });
  } catch (error: any) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT to update the current user's profile
export async function PUT(req: NextRequest) {
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
    const { name, email, bio, notificationPreferences } = body;
    
    // Basic validation
    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: 'Name and email are required' },
        { status: 400 }
      );
    }
    
    // Check if email is already in use by another user
    if (email !== currentUser.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: currentUser.id } });
      if (existingUser) {
        return NextResponse.json(
          { success: false, message: 'Email already in use' },
          { status: 400 }
        );
      }
    }
    
    // Prepare update object
    const updateData: any = { name, email, bio };
    
    // Add notification preferences if provided
    if (notificationPreferences) {
      updateData.notificationPreferences = notificationPreferences;
    }
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      currentUser.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        bio: updatedUser.bio || '',
        notificationPreferences: updatedUser.notificationPreferences || {
          paymentReminders: true,
          reminderFrequency: '3days',
          monthlyReports: true
        }
      },
    });
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 