import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getCurrentUser } from '@/lib/auth';

// Cache duration in seconds (5 minutes)
const CACHE_DURATION = 300;

// GET the current user's profile
export async function GET(req: NextRequest) {
  try {
    console.log("GET /api/auth/profile - Fetching user profile");
    
    // Connect to database
    await dbConnect();
    
    // Get current user from token
    const currentUser = await getCurrentUser(req);
    
    if (!currentUser) {
      console.log("User not authenticated");
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    console.log("Current user from token:", currentUser);
    
    // Find user in database (to get latest data)
    const user = await User.findById(currentUser.id).select('-password');
    
    if (!user) {
      console.log("User not found in database:", currentUser.id);
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    console.log("User found:", {
      id: user._id,
      email: user.email,
      securityPreferences: user.securityPreferences
    });
    
    // Create response with data
    const response = NextResponse.json({
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
        },
        securityPreferences: user.securityPreferences || {
          twoFactorEnabled: false,
          loginNotifications: true,
          alwaysRequire2FA: false
        }
      },
    });

    // Add caching headers
    response.headers.set('Cache-Control', `public, s-maxage=${CACHE_DURATION}, stale-while-revalidate=60`);
    response.headers.set('ETag', `"${user._id}-${user.updatedAt.getTime()}"`);

    return response;
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
    console.log("PUT /api/auth/profile - Updating user profile");
    
    // Connect to database
    await dbConnect();
    
    // Get current user from token
    const currentUser = await getCurrentUser(req);
    
    if (!currentUser) {
      console.log("User not authenticated");
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    const { name, email, bio, notificationPreferences, securityPreferences } = body;
    
    console.log("Update request:", {
      userId: currentUser.id,
      name: name || '(unchanged)',
      email: email || '(unchanged)',
      bio: bio !== undefined ? (bio || '(empty)') : '(unchanged)',
      securityPreferences: securityPreferences || '(unchanged)',
    });
    
    // Basic validation (only if name/email provided)
    if (name === '' || email === '') {
      console.log("Invalid input: name or email is empty");
      return NextResponse.json(
        { success: false, message: 'Name and email cannot be empty' },
        { status: 400 }
      );
    }
    
    // Check if email is already in use by another user (only if changing email)
    if (email && email !== currentUser.email) {
      const existingUser = await User.findOne({ email, _id: { $ne: currentUser.id } });
      if (existingUser) {
        console.log("Email already in use:", email);
        return NextResponse.json(
          { success: false, message: 'Email already in use' },
          { status: 400 }
        );
      }
    }
    
    // Prepare update object
    const updateData: any = {};
    
    // Only add properties that are actually provided (to support partial updates)
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (bio !== undefined) updateData.bio = bio;
    
    // Add notification preferences if provided
    if (notificationPreferences) {
      updateData.notificationPreferences = notificationPreferences;
    }
    
    // Add security preferences if provided
    if (securityPreferences) {
      console.log("Updating security preferences:", securityPreferences);
      updateData.securityPreferences = securityPreferences;
    }
    
    console.log("Update data for MongoDB:", updateData);
    
    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      currentUser.id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!updatedUser) {
      console.log("User not found for update:", currentUser.id);
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }
    
    console.log("User updated successfully:", {
      id: updatedUser._id,
      securityPreferences: updatedUser.securityPreferences
    });
    
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
        },
        securityPreferences: updatedUser.securityPreferences || {
          twoFactorEnabled: false,
          loginNotifications: true,
          alwaysRequire2FA: false
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