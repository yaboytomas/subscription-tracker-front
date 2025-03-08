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
    
    // Calculate the date 3 days from now
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);
    const formattedDate = targetDate.toISOString().split('T')[0];
    
    console.log(`Finding subscriptions with next payment on ${formattedDate}`);
    
    // Find subscriptions with payments due in 3 days
    const subscriptions = await Subscription.find({ nextPayment: formattedDate });
    console.log(`Found ${subscriptions.length} subscriptions with upcoming payments`);
    
    let emailsSent = 0;
    let errors = 0;
    
    // Send emails for each subscription
    for (const subscription of subscriptions) {
      try {
        const user = await User.findById(subscription.userId);
        
        // Only send if user exists and has enabled payment reminders
        if (user && user.notificationPreferences?.paymentReminders !== false) {
          await sendPaymentReminderEmail(
            { email: user.email, name: user.name }, 
            subscription
          );
          emailsSent++;
          console.log(`Email sent to ${user.email} for ${subscription.name}`);
        }
      } catch (err) {
        errors++;
        console.error(`Error sending reminder for subscription ${subscription._id}:`, err);
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