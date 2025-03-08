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
 * Sends a password reset email with a token link
 */
export async function sendPasswordResetEmail(user: { email: string, name: string }, resetToken: string) {
  try {
    console.log(`Attempting to send password reset email to ${user.email}`);
    
    // During testing with free Resend account, always send to your verified email
    const recipient = process.env.NODE_ENV === 'production' ? user.email : 'tomasszabo94@gmail.com';
    
    // Create the reset URL - use the deployment URL or localhost for development
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;
    
    const data = await resend.emails.send({
      from: 'Subscription Tracker <onboarding@resend.dev>', // Default sender that works without domain verification
      to: recipient,
      subject: 'Reset Your Password - Subscription Tracker',
      html: `
        <h1>Password Reset Request</h1>
        <p>Hello ${user.name},</p>
        <p>We received a request to reset your password for your Subscription Tracker account.</p>
        <p>To reset your password, please click the button below:</p>
        
        <div style="text-align: center; margin: 20px 0;">
          <a href="${resetUrl}" style="background-color: #0070f3; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; display: inline-block; font-weight: bold;">
            Reset Password
          </a>
        </div>
        
        <p>Or copy and paste this URL into your browser: <br>
        <a href="${resetUrl}">${resetUrl}</a></p>
        
        <p>This reset link will expire in 1 hour for security reasons.</p>
        
        <p>If you did not request a password reset, you can safely ignore this email. Your password will not be changed.</p>
        
        <p>Best regards,<br>The Subscription Tracker Team</p>
      `
    });
    
    console.log('Password reset email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send password reset email:', error);
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

/**
 * Sends a notification to the previous email address when email is changed
 */
export async function sendEmailChangeNotificationToOldEmail(user: { 
  name: string, 
  previousEmail: string, 
  newEmail: string, 
  ipAddress?: string 
}) {
  try {
    console.log(`Sending email change notification to previous email: ${user.previousEmail}`);
    
    // During testing with free Resend account, always send to your verified email
    const recipient = process.env.NODE_ENV === 'production' ? user.previousEmail : 'tomasszabo94@gmail.com';
    
    // Format the IP address for display, if available
    const ipInfo = user.ipAddress ? `from IP address ${user.ipAddress}` : '';
    
    const data = await resend.emails.send({
      from: 'Subscription Tracker <onboarding@resend.dev>', // Using default sender that works without domain verification
      to: recipient,
      subject: 'Your Email Address Has Been Changed',
      html: `
        <h1>Email Address Change Notification</h1>
        <p>Hello ${user.name},</p>
        <p>We're contacting you because your email address for Subscription Tracker has been changed.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0;">
          <p><strong>Previous Email:</strong> ${user.previousEmail}</p>
          <p><strong>New Email:</strong> ${user.newEmail}</p>
          <p><strong>Changed:</strong> ${new Date().toLocaleString()} ${ipInfo}</p>
        </div>
        
        <p>If you made this change, no further action is required.</p>
        
        <p><strong>Did not make this change?</strong> If you did not authorize this change, please:</p>
        <ol>
          <li>Reset your password immediately by visiting <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/forgot-password">the password reset page</a></li>
          <li>Contact our support team at <a href="mailto:support@example.com">support@example.com</a></li>
        </ol>
        
        <p>For security reasons, this is the last message we'll send to this email address unless you change your email back.</p>
        
        <p>Best regards,<br>The Subscription Tracker Security Team</p>
      `
    });
    
    console.log('Email change notification sent to previous email:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email change notification to previous email:', error);
    return { success: false, error };
  }
}

/**
 * Sends a confirmation to the new email address when email is changed
 */
export async function sendEmailChangeConfirmationToNewEmail(user: { 
  name: string, 
  previousEmail: string, 
  newEmail: string 
}) {
  try {
    console.log(`Sending email change confirmation to new email: ${user.newEmail}`);
    
    // During testing with free Resend account, always send to your verified email
    const recipient = process.env.NODE_ENV === 'production' ? user.newEmail : 'tomasszabo94@gmail.com';
    
    const data = await resend.emails.send({
      from: 'Subscription Tracker <onboarding@resend.dev>', // Using default sender that works without domain verification
      to: recipient,
      subject: 'Email Address Change Confirmation',
      html: `
        <h1>Email Address Change Confirmation</h1>
        <p>Hello ${user.name},</p>
        <p>This email confirms that your email address for Subscription Tracker has been successfully changed.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0;">
          <p><strong>Previous Email:</strong> ${user.previousEmail}</p>
          <p><strong>New Email:</strong> ${user.newEmail}</p>
          <p><strong>Changed:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <p>This email will now be used for all communications related to your Subscription Tracker account.</p>
        
        <p>If you did not make this change, please:</p>
        <ol>
          <li>Reset your password immediately by visiting <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/forgot-password">the password reset page</a></li>
          <li>Contact our support team at <a href="mailto:support@example.com">support@example.com</a></li>
        </ol>
        
        <p>Best regards,<br>The Subscription Tracker Team</p>
      `
    });
    
    console.log('Email change confirmation sent to new email:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send email change confirmation to new email:', error);
    return { success: false, error };
  }
} 