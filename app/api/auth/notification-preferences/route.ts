import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';

// Cache duration in seconds (5 minutes)
const CACHE_DURATION = 300;

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
    
    // Create response with data
    const response = NextResponse.json({
      success: true,
      notificationPreferences: user.notificationPreferences || {
        paymentReminders: true,
        reminderFrequency: '3days',
        monthlyReports: true
      }
    });

    // Add caching headers
    response.headers.set('Cache-Control', `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=60`);
    response.headers.set('ETag', `"${user._id}-${user.updatedAt.getTime()}"`);

    return response;
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
    const { paymentReminders, reminderFrequency, monthlyReports } = await req.json();
    
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
          reminderFrequency,
          monthlyReports: monthlyReports !== undefined ? monthlyReports : true
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