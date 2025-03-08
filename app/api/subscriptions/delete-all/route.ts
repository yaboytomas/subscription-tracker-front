import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Subscription from '@/models/Subscription';
import DeletedSubscription from '@/models/DeletedSubscription';
import { getCurrentUser } from '@/lib/auth';
import { updateRegistrySubscriptions } from '@/lib/registry-utils';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    
    // Get current user
    const user = await getCurrentUser(req);
    
    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Get all subscriptions for this user
    const subscriptions = await Subscription.find({ userId: user.id });
    
    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No subscriptions found to delete',
        count: 0
      });
    }
    
    // Save each subscription to the deleted history
    const deletedRecords = [];
    for (const subscription of subscriptions) {
      const deletedSubscription = new DeletedSubscription({
        userId: user.id,
        originalId: subscription._id,
        name: subscription.name,
        price: subscription.price,
        category: subscription.category,
        billingCycle: subscription.billingCycle,
        startDate: subscription.startDate,
        description: subscription.description || '',
        nextPayment: subscription.nextPayment,
        deletedAt: new Date(),
        deletedBy: 'user',
        deletionMethod: 'bulk',
        deletionReason: 'User cleared all subscriptions'
      });
      
      await deletedSubscription.save();
      deletedRecords.push(deletedSubscription);
    }
    
    // Delete all subscriptions
    const result = await Subscription.deleteMany({ userId: user.id });
    
    // Update user registry
    try {
      await updateRegistrySubscriptions(user.id);
    } catch (error) {
      console.error('Error updating user registry after bulk deletion:', error);
      // Continue with the operation even if registry update fails
    }
    
    return NextResponse.json({
      success: true,
      message: 'All subscriptions have been deleted',
      count: result.deletedCount,
      archived: deletedRecords.length
    });
  } catch (error) {
    console.error('Error deleting all subscriptions:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete subscriptions' },
      { status: 500 }
    );
  }
} 