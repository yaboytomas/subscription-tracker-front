import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db-connect';
import User from '@/models/User';
import Subscription from '@/models/Subscription';

export async function GET(req: NextRequest) {
  try {
    console.log('Testing database connection...');
    
    // Test database connection
    let connectionResult;
    try {
      const conn = await dbConnect();
      connectionResult = {
        success: true,
        status: 'Connected',
        version: conn.version,
        models: Object.keys(mongoose.models)
      };
    } catch (dbError) {
      connectionResult = {
        success: false,
        status: 'Connection failed',
        error: dbError instanceof Error ? dbError.message : 'Unknown error'
      };
      return NextResponse.json({
        success: false,
        dbConnection: connectionResult,
        error: 'Database connection failed'
      }, { status: 500 });
    }
    
    // Check if the User model is correctly defined
    let userModelInfo;
    try {
      // Get schema information
      const userModel = mongoose.model('User');
      const schemaPaths = Object.keys(userModel.schema.paths);
      
      userModelInfo = {
        success: true,
        modelName: userModel.modelName,
        schemaFields: schemaPaths,
        hasNotificationPreferences: schemaPaths.includes('notificationPreferences')
      };
    } catch (userModelError) {
      userModelInfo = {
        success: false,
        error: userModelError instanceof Error ? userModelError.message : 'Unknown error'
      };
    }
    
    // Check if the Subscription model is correctly defined
    let subscriptionModelInfo;
    try {
      // Get schema information
      const subscriptionModel = mongoose.model('Subscription');
      const schemaPaths = Object.keys(subscriptionModel.schema.paths);
      
      subscriptionModelInfo = {
        success: true,
        modelName: subscriptionModel.modelName,
        schemaFields: schemaPaths
      };
    } catch (subscriptionModelError) {
      subscriptionModelInfo = {
        success: false,
        error: subscriptionModelError instanceof Error ? subscriptionModelError.message : 'Unknown error'
      };
    }
    
    // Test fetch a user
    let userFetchResult;
    try {
      // Get the test email from query params if provided
      const testEmail = req.nextUrl.searchParams.get('email');
      let query = {};
      
      if (testEmail) {
        query = { email: testEmail };
      }
      
      const users = await User.find(query).limit(1);
      if (users.length > 0) {
        // Get the user data but redact sensitive info
        const user = users[0];
        userFetchResult = {
          success: true,
          found: true,
          userId: user._id.toString(),
          email: user.email,
          hasName: !!user.name,
          hasNotificationPreferences: !!user.notificationPreferences,
          notificationPreferences: user.notificationPreferences ? {
            paymentReminders: user.notificationPreferences.paymentReminders,
            reminderFrequency: user.notificationPreferences.reminderFrequency,
            monthlyReports: user.notificationPreferences.monthlyReports
          } : null
        };
      } else {
        userFetchResult = {
          success: true,
          found: false,
          message: 'No users found'
        };
      }
    } catch (userFetchError) {
      userFetchResult = {
        success: false,
        error: userFetchError instanceof Error ? userFetchError.message : 'Unknown error'
      };
    }
    
    // Test fetch subscriptions if we found a user
    let subscriptionFetchResult;
    if (userFetchResult.success && userFetchResult.found) {
      try {
        // Try to find subscriptions for this user
        const userId = userFetchResult.userId;
        const subscriptions = await Subscription.find({ user: userId }).limit(5);
        
        if (subscriptions.length > 0) {
          // Get basic information about the subscriptions
          subscriptionFetchResult = {
            success: true,
            found: true,
            count: subscriptions.length,
            // Include some sample information from the first subscription
            sampleSubscription: {
              id: subscriptions[0]._id.toString(),
              name: subscriptions[0].name,
              hasAmount: !!subscriptions[0].amount,
              hasNextPaymentDate: !!subscriptions[0].nextPaymentDate,
              hasBillingCycle: !!subscriptions[0].billingCycle,
              hasCategory: !!subscriptions[0].category,
              propertyNames: Object.keys(subscriptions[0].toObject())
            }
          };
        } else {
          subscriptionFetchResult = {
            success: true,
            found: false,
            message: 'No subscriptions found for this user'
          };
        }
      } catch (subscriptionFetchError) {
        subscriptionFetchResult = {
          success: false,
          error: subscriptionFetchError instanceof Error ? subscriptionFetchError.message : 'Unknown error'
        };
      }
    } else {
      subscriptionFetchResult = {
        success: false,
        message: 'Skipped because no valid user was found'
      };
    }
    
    return NextResponse.json({
      success: true,
      dbConnection: connectionResult,
      userModel: userModelInfo,
      subscriptionModel: subscriptionModelInfo,
      userFetch: userFetchResult,
      subscriptionFetch: subscriptionFetchResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : '') : undefined
    }, { status: 500 });
  }
} 