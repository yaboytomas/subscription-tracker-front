import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Subscription from '@/models/Subscription';
import { sendPaymentReminderEmail } from '@/lib/email-service';

export async function GET(req: NextRequest) {
  // Simple authorization check using header
  const authHeader = req.headers.get('Authorization');
  const expectedToken = `Bearer ${process.env.CRON_SECRET_KEY}`;
  
  if (authHeader !== expectedToken) {
    console.log('Unauthorized access attempt to payment reminders');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    console.log('Payment reminder cron job started');
    await dbConnect();
    
    // This cron job runs daily, so we need to handle different reminder frequencies
    // Get the current date as a reference
    const today = new Date();
    
    // For users with 'daily' preference: find subscriptions due in the next 1-7 days
    // For users with 'weekly' preference: find subscriptions due in the next 7 days
    // For users with '3days' preference (default): find subscriptions due in exactly 3 days
    
    // Get all upcoming subscriptions in the next 7 days
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    // Format dates in YYYY-MM-DD format
    const todayFormatted = today.toISOString().split('T')[0];
    const nextWeekFormatted = nextWeek.toISOString().split('T')[0];
    
    // Find subscriptions with payments due in the next 7 days
    const subscriptions = await Subscription.find({
      nextPayment: { 
        $gte: todayFormatted, 
        $lte: nextWeekFormatted 
      }
    });
    
    console.log(`Found ${subscriptions.length} subscriptions with upcoming payments in the next 7 days`);
    
    let emailsSent = 0;
    let errors = 0;
    
    // Send emails for each subscription based on user preferences
    for (const subscription of subscriptions) {
      try {
        const user = await User.findById(subscription.userId);
        
        // Skip if user doesn't exist or has disabled reminders
        if (!user || user.notificationPreferences?.paymentReminders === false) {
          continue;
        }
        
        const paymentDate = new Date(subscription.nextPayment);
        const daysUntilPayment = Math.ceil((paymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        
        // Determine if we should send a reminder based on user preferences
        let shouldSendReminder = false;
        
        const reminderFrequency = user.notificationPreferences?.reminderFrequency || '3days';
        
        switch (reminderFrequency) {
          case 'daily':
            // Send a daily reminder if payment is 1-7 days away
            shouldSendReminder = daysUntilPayment >= 1 && daysUntilPayment <= 7;
            break;
          case 'weekly':
            // Send a weekly reminder if payment is 7 days away
            shouldSendReminder = daysUntilPayment === 7;
            break;
          case '3days':
          default:
            // Send a reminder if payment is 3 days away (default behavior)
            shouldSendReminder = daysUntilPayment === 3;
            break;
        }
        
        // Send email if appropriate
        if (shouldSendReminder) {
          await sendPaymentReminderEmail(
            { email: user.email, name: user.name }, 
            {
              ...subscription.toObject(),
              daysUntilPayment
            }
          );
          emailsSent++;
          console.log(`Email sent to ${user.email} for ${subscription.name}, due in ${daysUntilPayment} days`);
        }
      } catch (err) {
        errors++;
        console.error(`Error processing subscription ${subscription._id}:`, err);
      }
    }
    
    return NextResponse.json({
      success: true,
      summary: {
        total: subscriptions.length,
        emailsSent,
        errors
      },
      message: `Processed ${subscriptions.length} subscriptions, sent ${emailsSent} emails, encountered ${errors} errors`
    });
  } catch (error) {
    console.error('Error processing payment reminders:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
} 