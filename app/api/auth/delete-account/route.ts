import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Subscription from '@/models/Subscription';
import DeletedUser from '@/models/DeletedUser';
import { verifyToken } from '@/lib/auth';

export async function DELETE(req: NextRequest) {
  try {
    await dbConnect();

    // Get token from cookie
    const token = cookies().get('token')?.value;

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Verify token and get user ID
    const decodedToken = verifyToken(token);
    
    if (!decodedToken) {
      // Clean up any invalid cookies
      cookies().delete('token');
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
        { status: 401 }
      );
    }

    const userId = decodedToken.id;

    console.log(`Processing account deletion for user ID: ${userId}`);

    // First, find the user to ensure they exist
    const user = await User.findById(userId);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Get all user's subscriptions to calculate stats
    const subscriptions = await Subscription.find({ userId });
    const subscriptionCount = subscriptions.length;

    // Calculate total spending from all subscriptions
    let totalSpent = 0;
    subscriptions.forEach(subscription => {
      const price = parseFloat(subscription.price || '0');
      if (!isNaN(price)) {
        switch (subscription.billingCycle) {
          case 'weekly': 
            totalSpent += price * 4.33; // Average weeks per month
            break;
          case 'biweekly':
            totalSpent += price * 2.17; // Average bi-weeks per month
            break;
          case 'monthly':
            totalSpent += price;
            break;
          case 'quarterly':
            totalSpent += price / 3;
            break;
          case 'yearly':
            totalSpent += price / 12;
            break;
          default:
            totalSpent += price;
        }
      }
    });
    
    // Round to 2 decimal places
    totalSpent = Math.round(totalSpent * 100) / 100;

    // Create a record in the DeletedUser collection
    const deletedUser = new DeletedUser({
      originalId: user._id,
      name: user.name,
      email: user.email,
      bio: user.bio,
      createdAt: user.createdAt,
      deletedAt: new Date(),
      subscriptionCount,
      totalSpent,
      reason: 'User-initiated account deletion',
      deletedBy: 'user',
    });

    await deletedUser.save();
    console.log(`Created deleted user record: ${deletedUser._id}`);

    // Delete all subscriptions associated with this user
    const deleteSubscriptionsResult = await Subscription.deleteMany({ userId });
    console.log(`Deleted ${deleteSubscriptionsResult.deletedCount} subscriptions for user ID: ${userId}`);

    // Delete the user from the active users collection
    await User.findByIdAndDelete(userId);
    console.log(`User account deleted: ${userId}`);

    // Clear ALL authentication cookies
    cookies().delete('token');
    
    // Set additional headers to clear any client-side cookies
    const response = NextResponse.json({
      success: true,
      message: 'Account successfully deleted'
    });
    
    // Explicitly set cookie-clearing headers for additional security
    response.headers.set('Set-Cookie', 'token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; Secure; SameSite=Strict');
    response.headers.set('Clear-Site-Data', '"cookies", "storage"');
    
    return response;
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete account' },
      { status: 500 }
    );
  }
} 