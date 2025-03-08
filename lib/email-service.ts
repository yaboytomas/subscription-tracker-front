import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends a welcome email to a new user
 */
export async function sendWelcomeEmail(user: { email: string, name: string }) {
  try {
    console.log(`Attempting to send welcome email to ${user.email}`);
    
    // During testing with free Resend account, always send to your verified email
    const recipient = process.env.NODE_ENV === 'production' ? user.email : 'tomasszabo94@gmail.com';
    
    const data = await resend.emails.send({
      from: 'Subscription Tracker <onboarding@resend.dev>', // Default sender that works without domain verification
      to: recipient,
      subject: 'Welcome to Subscription Tracker',
      html: `
        <h1>Welcome to Subscription Tracker!</h1>
        <p>Hello ${user.name},</p>
        <p>Thank you for joining Subscription Tracker. We're excited to help you manage your subscriptions.</p>
        <p>Get started by adding your first subscription on your dashboard.</p>
        <p>Best regards,<br>The Subscription Tracker Team</p>
      `
    });
    
    console.log('Welcome email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send welcome email:', error);
    return { success: false, error };
  }
}

/**
 * Sends a notification when a user's password has changed
 */
export async function sendPasswordChangedEmail(user: { email: string, name: string }) {
  try {
    console.log(`Attempting to send password changed email to ${user.email}`);
    
    // During testing with free Resend account, always send to your verified email
    const recipient = process.env.NODE_ENV === 'production' ? user.email : 'tomasszabo94@gmail.com';
    
    const data = await resend.emails.send({
      from: 'Subscription Tracker <onboarding@resend.dev>', // Default sender that works without domain verification
      to: recipient,
      subject: 'Your Password Has Been Changed',
      html: `
        <h1>Password Changed</h1>
        <p>Hello ${user.name},</p>
        <p>Your password was recently changed. If you did not make this change, please contact support immediately.</p>
        <p>Best regards,<br>The Subscription Tracker Team</p>
      `
    });
    
    console.log('Password changed email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send password change email:', error);
    return { success: false, error };
  }
}

/**
 * Sends a payment reminder email
 */
export async function sendPaymentReminderEmail(user: { email: string, name: string }, subscription: any) {
  try {
    console.log(`Attempting to send payment reminder email to ${user.email} for ${subscription.name}`);
    
    // During testing with free Resend account, always send to your verified email
    const recipient = process.env.NODE_ENV === 'production' ? user.email : 'tomasszabo94@gmail.com';
    
    const dueDate = new Date(subscription.nextPayment).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    const data = await resend.emails.send({
      from: 'Subscription Tracker <onboarding@resend.dev>', // Default sender that works without domain verification
      to: recipient,
      subject: `Reminder: ${subscription.name} payment due soon`,
      html: `
        <h1>Payment Reminder</h1>
        <p>Hello ${user.name},</p>
        <p>This is a friendly reminder that your subscription payment is coming up soon:</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0;">
          <p><strong>Subscription:</strong> ${subscription.name}</p>
          <p><strong>Amount:</strong> $${subscription.price}</p>
          <p><strong>Due Date:</strong> ${dueDate} (in 3 days)</p>
          <p><strong>Billing Cycle:</strong> ${subscription.billingCycle}</p>
        </div>
        
        <p>You're receiving this reminder to help you avoid any unexpected charges.</p>
        <p>Best regards,<br>The Subscription Tracker Team</p>
      `
    });
    
    console.log(`Payment reminder email sent to ${user.email} for ${subscription.name}`);
    return { success: true, data };
  } catch (error) {
    console.error(`Failed to send payment reminder email for ${subscription.name}:`, error);
    return { success: false, error };
  }
}

/**
 * For testing purposes only
 */
export async function sendTestEmail(email: string) {
  try {
    console.log(`Sending test email to ${email}`);
    
    // During testing with free Resend account, always send to your verified email
    const recipient = process.env.NODE_ENV === 'production' ? email : 'tomasszabo94@gmail.com';
    
    const data = await resend.emails.send({
      from: 'Subscription Tracker <onboarding@resend.dev>',
      to: recipient,
      subject: 'Test Email from Subscription Tracker',
      html: `
        <h1>Test Email</h1>
        <p>This is a test email from Subscription Tracker.</p>
        <p>If you're seeing this, the email service is working correctly!</p>
      `
    });
    
    console.log('Test email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send test email:', error);
    return { success: false, error };
  }
} 