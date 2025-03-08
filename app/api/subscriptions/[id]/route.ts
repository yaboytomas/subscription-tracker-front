import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Subscription from '@/models/Subscription';
import { getCurrentUser } from '@/lib/auth';
import mongoose from 'mongoose';
import { updateRegistrySubscriptions } from '@/lib/registry-utils';

// Helper function to validate MongoDB ObjectId
const isValidObjectId = (id: string) => {
  return mongoose.Types.ObjectId.isValid(id);
};

// GET a single subscription by ID (only if it belongs to the authenticated user)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to database
    await dbConnect();
    
    const { id } = params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid subscription ID' },
        { status: 400 }
      );
    }
    
    // Get current user from token
    const user = await getCurrentUser(req);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Find subscription by ID and ensure it belongs to the authenticated user
    const subscription = await Subscription.findOne({
      _id: id,
      userId: user.id
    });
    
    if (!subscription) {
      return NextResponse.json(
        { success: false, message: 'Subscription not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      subscription,
    });
  } catch (error: any) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Update subscription by ID (only if it belongs to the authenticated user)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to database
    await dbConnect();
    
    const { id } = params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid subscription ID' },
        { status: 400 }
      );
    }
    
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
    
    // Find and update the subscription, ensuring it belongs to the authenticated user
    const updatedSubscription = await Subscription.findOneAndUpdate(
      { _id: id, userId: user.id },
      { ...body },
      { new: true, runValidators: true }
    );
    
    if (!updatedSubscription) {
      return NextResponse.json(
        { success: false, message: 'Subscription not found' },
        { status: 404 }
      );
    }
    
    // Update the user registry with the updated subscription
    try {
      await updateRegistrySubscriptions(user.id);
      console.log(`User registry updated after subscription update for user ${user.id}`);
    } catch (registryError) {
      // Log error but don't fail the request
      console.error('Error updating user registry after subscription update:', registryError);
    }
    
    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
    });
  } catch (error: any) {
    console.error('Error updating subscription:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Delete subscription by ID (only if it belongs to the authenticated user)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Connect to database
    await dbConnect();
    
    const { id } = params;
    
    if (!isValidObjectId(id)) {
      return NextResponse.json(
        { success: false, message: 'Invalid subscription ID' },
        { status: 400 }
      );
    }
    
    // Get current user from token
    const user = await getCurrentUser(req);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Find and delete the subscription, ensuring it belongs to the authenticated user
    const deletedSubscription = await Subscription.findOneAndDelete({
      _id: id,
      userId: user.id
    });
    
    if (!deletedSubscription) {
      return NextResponse.json(
        { success: false, message: 'Subscription not found' },
        { status: 404 }
      );
    }
    
    // Update the user registry after subscription deletion
    try {
      await updateRegistrySubscriptions(user.id);
      console.log(`User registry updated after subscription deletion for user ${user.id}`);
    } catch (registryError) {
      // Log error but don't fail the request
      console.error('Error updating user registry after subscription deletion:', registryError);
    }
    
    return NextResponse.json({
      success: true,
      message: 'Subscription deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting subscription:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
} 