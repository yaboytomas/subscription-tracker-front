import { NextRequest, NextResponse } from 'next/server';
import { sendPaymentReminderEmail } from '@/lib/email-service';

// This is a test-only endpoint to preview email notifications
// It should be disabled or access-restricted in production

export async function GET(req: NextRequest) {
  try {
    // Only allow in development mode
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { success: false, message: 'This endpoint is only available in development mode' },
        { status: 403 }
      );
    }
    
    // Get test parameters from query string
    const searchParams = req.nextUrl.searchParams;
    const type = searchParams.get('type') || 'payment-reminder';
    const days = parseInt(searchParams.get('days') || '3', 10);
    const frequency = searchParams.get('frequency') || '3days';
    
    // Test user data
    const user = {
      name: 'Test User',
      email: 'tomasszabo94@gmail.com' // This will be overridden in development mode
    };
    
    // Result object to return
    const result: any = {
      success: true,
      emailType: type,
      preview: null
    };
    
    if (type === 'payment-reminder') {
      // Create a test subscription
      const subscription = {
        _id: 'test-subscription-id',
        name: 'Netflix Premium',
        price: '19.99',
        category: 'Entertainment',
        billingCycle: 'Monthly',
        startDate: '2023-01-01',
        daysUntilPayment: days,
        nextPayment: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      };
      
      // Send a test email
      const emailResult = await sendPaymentReminderEmail(user, subscription);
      
      result.emailResult = emailResult;
      result.subscription = subscription;
      result.message = `A payment reminder email was sent to the test email account. It simulates a notification that would be sent to a user with "${frequency}" frequency setting when payment is due in ${days} days.`;
      
      // Add preview HTML to the response
      const dueDate = new Date(subscription.nextPayment).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
      
      const daysMessage = subscription.daysUntilPayment === 1 
        ? 'tomorrow' 
        : `in ${subscription.daysUntilPayment} days`;
        
      result.preview = `
        <h1>Payment Reminder</h1>
        <p>Hello ${user.name},</p>
        <p>This is a friendly reminder that your subscription payment is coming up soon:</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0;">
          <p><strong>Subscription:</strong> ${subscription.name}</p>
          <p><strong>Amount:</strong> $${subscription.price}</p>
          <p><strong>Due Date:</strong> ${dueDate} (${daysMessage})</p>
          <p><strong>Billing Cycle:</strong> ${subscription.billingCycle}</p>
        </div>
        
        <p>You're receiving this reminder to help you avoid any unexpected charges.</p>
        <p>Best regards,<br>The Subscription Tracker Team</p>
      `;
    }
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Error in email preview:', error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
} 