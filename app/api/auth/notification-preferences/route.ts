import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';

// GET the current user's notification preferences
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
    
    // Find user in database
    const user = await User.findById(currentUser.id).select('notificationPreferences');
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    // Return the notification preferences or default values
    return NextResponse.json({
      success: true,
      notificationPreferences: user.notificationPreferences || {
        paymentReminders: true,
        reminderFrequency: '3days'
      }
    });
  } catch (error: any) {
    console.error('Error fetching notification preferences:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT to update notification preferences
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
    const { paymentReminders, reminderFrequency } = await req.json();
    
    // Basic validation
    if (paymentReminders === undefined || !reminderFrequency) {
      return NextResponse.json(
        { success: false, message: 'Payment reminders setting and reminder frequency are required' },
        { status: 400 }
      );
    }
    
    // Validate reminder frequency
    if (!['daily', 'weekly', '3days'].includes(reminderFrequency)) {
      return NextResponse.json(
        { success: false, message: 'Invalid reminder frequency. Must be one of: daily, weekly, 3days' },
        { status: 400 }
      );
    }
    
    // Update user notification preferences
    const updatedUser = await User.findByIdAndUpdate(
      currentUser.id,
      { 
        notificationPreferences: {
          paymentReminders,
          reminderFrequency
        }
      },
      { new: true, runValidators: true }
    ).select('notificationPreferences');
    
    if (!updatedUser) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      notificationPreferences: updatedUser.notificationPreferences
    });
  } catch (error: any) {
    console.error('Error updating notification preferences:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 