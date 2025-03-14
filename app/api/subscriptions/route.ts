import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Subscription from '@/models/Subscription';
import { getCurrentUser } from '@/lib/auth';
import { updateRegistrySubscriptions } from '@/lib/registry-utils';

// Cache duration in seconds (1 minute for subscriptions since they change more frequently)
const CACHE_DURATION = 60;

// GET all subscriptions for the authenticated user
export async function GET(req: NextRequest) {
  try {
    // Connect to database
    await dbConnect();
    
    console.log('GET /api/subscriptions - Fetching current user');
    // Get current user from token
    const user = await getCurrentUser(req);
    
    if (!user) {
      console.log('GET /api/subscriptions - User not authenticated');
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    console.log(`GET /api/subscriptions - User authenticated: ${user.id} (${user.email})`);
    
    // Find all subscriptions for this user
    console.log(`GET /api/subscriptions - Fetching subscriptions for user: ${user.id}`);
    const subscriptions = await Subscription.find({ userId: user.id });
    
    console.log(`GET /api/subscriptions - Found ${subscriptions.length} subscriptions`);
    if (subscriptions.length > 0) {
      console.log(`GET /api/subscriptions - First subscription userId: ${subscriptions[0].userId}`);
    }
    
    // Create response with data
    const response = NextResponse.json({
      success: true,
      subscriptions,
    });

    // Disable caching to ensure fresh data on each request
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    response.headers.set('Surrogate-Control', 'no-store');

    // Create a unique ETag based on the user's ID and the latest subscription update
    const latestUpdate = subscriptions.length > 0 
      ? Math.max(...subscriptions.map(sub => sub.updatedAt.getTime()))
      : Date.now();
    response.headers.set('ETag', `"${user.id}-${latestUpdate}"`);

    return response;
  } catch (error: any) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Create a new subscription for the authenticated user
export async function POST(req: NextRequest) {
  try {
    // Connect to database
    await dbConnect();
    
    // Get current user from token
    const user = await getCurrentUser(req);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Parse request body
    const body = await req.json();
    
    // Calculate nextPayment date based on startDate and billingCycle
    const startDate = new Date(body.startDate);
    let nextPayment = new Date(startDate);
    
    // Check if start date is in the future
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to beginning of day
    
    // If start date is in the future, use it as the next payment date
    if (startDate > today) {
      nextPayment = startDate;
    } else {
      // If start date is today or in the past, calculate next payment based on billing cycle
      switch (body.billingCycle) {
        case 'Weekly':
          nextPayment.setDate(startDate.getDate() + 7);
          break;
        case 'Biweekly':
          nextPayment.setDate(startDate.getDate() + 14);
          break;
        case 'Monthly':
          nextPayment.setMonth(startDate.getMonth() + 1);
          break;
        case 'Quarterly':
          nextPayment.setMonth(startDate.getMonth() + 3);
          break;
        case 'Yearly':
          nextPayment.setFullYear(startDate.getFullYear() + 1);
          break;
        default:
          // Default to monthly if unknown billing cycle
          nextPayment.setMonth(startDate.getMonth() + 1);
      }
      
      // If calculated next payment is still in the past, keep advancing until it's in the future
      while (nextPayment <= today) {
        switch (body.billingCycle) {
          case 'Weekly':
            nextPayment.setDate(nextPayment.getDate() + 7);
            break;
          case 'Biweekly':
            nextPayment.setDate(nextPayment.getDate() + 14);
            break;
          case 'Monthly':
            nextPayment.setMonth(nextPayment.getMonth() + 1);
            break;
          case 'Quarterly':
            nextPayment.setMonth(nextPayment.getMonth() + 3);
            break;
          case 'Yearly':
            nextPayment.setFullYear(nextPayment.getFullYear() + 1);
            break;
          default:
            nextPayment.setMonth(nextPayment.getMonth() + 1);
        }
      }
    }
    
    // Create subscription with user ID
    const subscription = await Subscription.create({
      ...body,
      userId: user.id,
      nextPayment: nextPayment.toISOString().split('T')[0], // Format as YYYY-MM-DD
    });
    
    // Update the user registry with the new subscription
    try {
      await updateRegistrySubscriptions(user.id);
      console.log(`User registry updated with new subscription for user ${user.id}`);
    } catch (registryError) {
      // Log error but don't fail the request
      console.error('Error updating user registry with new subscription:', registryError);
    }
    
    return NextResponse.json({
      success: true,
      subscription,
    });
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 