import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Subscription from '@/models/Subscription';
import { getCurrentUser } from '@/lib/auth';

// GET all subscriptions for the authenticated user
export async function GET(req: NextRequest) {
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
    
    // Find all subscriptions for this user
    const subscriptions = await Subscription.find({ userId: user.id });
    
    return NextResponse.json({
      success: true,
      subscriptions,
    });
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
    
    // Create subscription with user ID
    const subscription = await Subscription.create({
      ...body,
      userId: user.id,
      nextPayment: nextPayment.toISOString().split('T')[0], // Format as YYYY-MM-DD
    });
    
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