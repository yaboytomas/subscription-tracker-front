import mongoose from 'mongoose';
import User from '@/models/User';
import Subscription from '@/models/Subscription';
import UserRegistry from '@/models/UserRegistry';
import EmailHistory from '@/models/EmailHistory';

/**
 * Creates or updates a user registry entry
 */
export async function updateUserRegistry(userId: string): Promise<boolean> {
  try {
    // Get complete user data
    const user = await User.findById(userId);
    if (!user) {
      console.error(`User not found for registry update: ${userId}`);
      return false;
    }

    // Get user's subscriptions
    const subscriptions = await Subscription.find({ userId });

    // Calculate total monthly spend
    let totalMonthlySpend = 0;
    const subscriptionSummaries = subscriptions.map(subscription => {
      // Calculate normalized monthly cost
      const price = parseFloat(subscription.price || '0');
      let monthlyCost = 0;
      
      if (!isNaN(price)) {
        switch (subscription.billingCycle) {
          case 'weekly': 
            monthlyCost = price * 4.33; // Average weeks per month
            break;
          case 'biweekly':
            monthlyCost = price * 2.17; // Average bi-weeks per month
            break;
          case 'monthly':
            monthlyCost = price;
            break;
          case 'quarterly':
            monthlyCost = price / 3;
            break;
          case 'yearly':
            monthlyCost = price / 12;
            break;
          default:
            monthlyCost = price;
        }
      }
      
      totalMonthlySpend += monthlyCost;
      
      return {
        subscriptionId: subscription._id,
        name: subscription.name,
        provider: subscription.description || '',
        price: subscription.price,
        billingCycle: subscription.billingCycle,
        addedAt: subscription.createdAt || new Date(),
        lastUpdatedAt: subscription.updatedAt || new Date(),
        status: 'active' // Default status, can be updated later
      };
    });

    // Get email history
    const emailHistoryRecords = await EmailHistory.find({ userId })
      .sort({ changedAt: 1 }); // Oldest first to build chronological history

    // Build email history array
    const emailEntries = [];
    
    // Add initial email (signup email)
    const oldestEmailChange = emailHistoryRecords[0];
    if (oldestEmailChange) {
      emailEntries.push({
        email: oldestEmailChange.previousEmail,
        isPrimary: false,
        isVerified: true, // Assume verified since they were able to sign up
        addedAt: user.createdAt,
        source: 'signup'
      });
    }
    
    // Add all email changes
    emailHistoryRecords.forEach(record => {
      // Add the new email that was changed to
      emailEntries.push({
        email: record.newEmail,
        isPrimary: record.newEmail === user.email, // Current email is primary
        isVerified: true, // Assume verified if change was allowed
        addedAt: record.changedAt,
        source: 'change'
      });
    });
    
    // If no email history, just add current email
    if (emailEntries.length === 0) {
      emailEntries.push({
        email: user.email,
        isPrimary: true,
        isVerified: true,
        addedAt: user.createdAt,
        source: 'signup'
      });
    }

    // Find existing registry or create new one
    let registry = await UserRegistry.findOne({ userId });
    
    if (!registry) {
      // Create new registry
      registry = new UserRegistry({
        userId: user._id,
        name: user.name,
        currentEmail: user.email,
        emailHistory: emailEntries,
        subscriptions: subscriptionSummaries,
        totalMonthlySpend: Math.round(totalMonthlySpend * 100) / 100, // Round to 2 decimal places
        accountCreatedAt: user.createdAt,
        lastActive: new Date(),
      });
    } else {
      // Update existing registry
      registry.name = user.name;
      registry.currentEmail = user.email;
      registry.emailHistory = emailEntries;
      registry.subscriptions = subscriptionSummaries;
      registry.totalMonthlySpend = Math.round(totalMonthlySpend * 100) / 100;
      registry.lastActive = new Date();
    }
    
    await registry.save();
    console.log(`User registry updated for user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error updating user registry:', error);
    return false;
  }
}

/**
 * Updates a user's email in the registry when it changes
 */
export async function updateRegistryEmail(userId: string, previousEmail: string, newEmail: string): Promise<boolean> {
  try {
    const registry = await UserRegistry.findOne({ userId });
    
    if (!registry) {
      // If registry doesn't exist, create a full registry
      return await updateUserRegistry(userId);
    }
    
    // Update current email
    registry.currentEmail = newEmail;
    
    // Update email history - mark previous primary as not primary
    registry.emailHistory.forEach(entry => {
      if (entry.isPrimary) {
        entry.isPrimary = false;
      }
    });
    
    // Add new email entry
    registry.emailHistory.push({
      email: newEmail,
      isPrimary: true,
      isVerified: true,
      addedAt: new Date(),
      source: 'change'
    });
    
    registry.lastActive = new Date();
    await registry.save();
    
    console.log(`Email updated in registry for user ${userId}: ${previousEmail} → ${newEmail}`);
    return true;
  } catch (error) {
    console.error('Error updating registry email:', error);
    return false;
  }
}

/**
 * Updates subscription information in the user registry
 */
export async function updateRegistrySubscriptions(userId: string): Promise<boolean> {
  try {
    const registry = await UserRegistry.findOne({ userId });
    
    if (!registry) {
      // If registry doesn't exist, create a full registry
      return await updateUserRegistry(userId);
    }
    
    // Get user's subscriptions
    const subscriptions = await Subscription.find({ userId });
    
    // Calculate total monthly spend
    let totalMonthlySpend = 0;
    const subscriptionSummaries = subscriptions.map(subscription => {
      // Calculate normalized monthly cost
      const price = parseFloat(subscription.price || '0');
      let monthlyCost = 0;
      
      if (!isNaN(price)) {
        switch (subscription.billingCycle) {
          case 'weekly': 
            monthlyCost = price * 4.33;
            break;
          case 'biweekly':
            monthlyCost = price * 2.17;
            break;
          case 'monthly':
            monthlyCost = price;
            break;
          case 'quarterly':
            monthlyCost = price / 3;
            break;
          case 'yearly':
            monthlyCost = price / 12;
            break;
          default:
            monthlyCost = price;
        }
      }
      
      totalMonthlySpend += monthlyCost;
      
      return {
        subscriptionId: subscription._id,
        name: subscription.name,
        provider: subscription.description || '',
        price: subscription.price,
        billingCycle: subscription.billingCycle,
        addedAt: subscription.createdAt || new Date(),
        lastUpdatedAt: subscription.updatedAt || new Date(),
        status: 'active'
      };
    });
    
    // Update registry
    registry.subscriptions = subscriptionSummaries;
    registry.totalMonthlySpend = Math.round(totalMonthlySpend * 100) / 100;
    registry.lastActive = new Date();
    
    await registry.save();
    console.log(`Subscriptions updated in registry for user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error updating registry subscriptions:', error);
    return false;
  }
}

/**
 * Gets a user's registry data
 */
export async function getUserRegistry(userId: string) {
  try {
    let registry = await UserRegistry.findOne({ userId });
    
    if (!registry) {
      // Create registry if it doesn't exist
      await updateUserRegistry(userId);
      registry = await UserRegistry.findOne({ userId });
    }
    
    return registry;
  } catch (error) {
    console.error('Error getting user registry:', error);
    return null;
  }
} 