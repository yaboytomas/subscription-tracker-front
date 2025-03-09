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
    
    // Get the days until payment message
    const daysMessage = subscription.daysUntilPayment === 1 
      ? 'tomorrow' 
      : `in ${subscription.daysUntilPayment} days`;
    
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
          <p><strong>Due Date:</strong> ${dueDate} (${daysMessage})</p>
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
          <li>Contact our support team at <a href="mailto:support@subscriptiontracker.com">support@subscriptiontracker.com</a></li>
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
          <li>Contact our support team at <a href="mailto:support@subscriptiontracker.com">support@subscriptiontracker.com</a></li>
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

/**
 * Sends a monthly spending report with analytics
 */
export async function sendMonthlySpendingReport(
  user: { email: string; name: string },
  reportData: {
    monthName: string;
    year: number;
    totalSpent: number;
    previousMonthSpent: number;
    categories: Array<{ name: string; amount: number; percentage: number }>;
    topSubscriptions: Array<{ name: string; amount: number; category: string }>;
    upcomingRenewals: Array<{ name: string; date: string; amount: number; daysUntil: number }>;
  }
) {
  try {
    console.log(`Attempting to send monthly spending report to ${user.email} for ${reportData.monthName} ${reportData.year}`);
    
    // During testing with free Resend account, always send to your verified email
    const recipient = process.env.NODE_ENV === 'production' ? user.email : 'tomasszabo94@gmail.com';
    
    // Format the currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(amount);
    };
    
    // Calculate month-over-month change
    const change = reportData.totalSpent - reportData.previousMonthSpent;
    const percentChange = reportData.previousMonthSpent > 0 
      ? ((change / reportData.previousMonthSpent) * 100).toFixed(1) 
      : '0';
    const changeDirection = change > 0 ? 'up' : change < 0 ? 'down' : 'unchanged';
    const changeText = changeDirection === 'up' 
      ? `increased by ${formatCurrency(Math.abs(change))} (${Math.abs(parseFloat(percentChange))}%)` 
      : changeDirection === 'down'
      ? `decreased by ${formatCurrency(Math.abs(change))} (${Math.abs(parseFloat(percentChange))}%)`
      : 'remained the same';
    
    // Create the category breakdown
    let categoryBreakdown = '';
    for (const category of reportData.categories) {
      categoryBreakdown += `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${category.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${formatCurrency(category.amount)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${category.percentage.toFixed(1)}%</td>
        </tr>
      `;
    }
    
    // Create the top subscriptions section
    let topSubscriptionsSection = '';
    for (const sub of reportData.topSubscriptions) {
      topSubscriptionsSection += `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${sub.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${formatCurrency(sub.amount)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${sub.category}</td>
        </tr>
      `;
    }
    
    // Create the upcoming renewals section
    let upcomingRenewalsSection = '';
    for (const renewal of reportData.upcomingRenewals) {
      upcomingRenewalsSection += `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${renewal.name}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${renewal.date}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${formatCurrency(renewal.amount)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${renewal.daysUntil} days</td>
        </tr>
      `;
    }

    const data = await resend.emails.send({
      from: 'Subscription Tracker <onboarding@resend.dev>',
      to: recipient,
      subject: `Your ${reportData.monthName} ${reportData.year} Spending Report`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; border-bottom: 2px solid #5c6ac4; padding-bottom: 10px;">Monthly Spending Report</h1>
          
          <p>Hello ${user.name},</p>
          
          <p>Here's your subscription spending report for <strong>${reportData.monthName} ${reportData.year}</strong>.</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 4px; margin: 20px 0; border-left: 4px solid #5c6ac4;">
            <h2 style="margin-top: 0; color: #333;">Monthly Overview</h2>
            <p style="font-size: 24px; font-weight: bold; margin: 10px 0;">${formatCurrency(reportData.totalSpent)}</p>
            <p>Your spending has ${changeText} compared to last month.</p>
          </div>
          
          <h2 style="color: #333; border-bottom: 1px solid #eaeaea; padding-bottom: 10px;">Category Breakdown</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="text-align: left; padding: 10px; border-bottom: 2px solid #eaeaea;">Category</th>
                <th style="text-align: left; padding: 10px; border-bottom: 2px solid #eaeaea;">Amount</th>
                <th style="text-align: left; padding: 10px; border-bottom: 2px solid #eaeaea;">% of Total</th>
              </tr>
            </thead>
            <tbody>
              ${categoryBreakdown}
            </tbody>
          </table>
          
          <h2 style="color: #333; border-bottom: 1px solid #eaeaea; padding-bottom: 10px; margin-top: 30px;">Top Subscriptions</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="text-align: left; padding: 10px; border-bottom: 2px solid #eaeaea;">Subscription</th>
                <th style="text-align: left; padding: 10px; border-bottom: 2px solid #eaeaea;">Amount</th>
                <th style="text-align: left; padding: 10px; border-bottom: 2px solid #eaeaea;">Category</th>
              </tr>
            </thead>
            <tbody>
              ${topSubscriptionsSection}
            </tbody>
          </table>
          
          <h2 style="color: #333; border-bottom: 1px solid #eaeaea; padding-bottom: 10px; margin-top: 30px;">Upcoming Renewals</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="text-align: left; padding: 10px; border-bottom: 2px solid #eaeaea;">Subscription</th>
                <th style="text-align: left; padding: 10px; border-bottom: 2px solid #eaeaea;">Date</th>
                <th style="text-align: left; padding: 10px; border-bottom: 2px solid #eaeaea;">Amount</th>
                <th style="text-align: left; padding: 10px; border-bottom: 2px solid #eaeaea;">Days Until</th>
              </tr>
            </thead>
            <tbody>
              ${upcomingRenewalsSection}
            </tbody>
          </table>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 14px; color: #666;">
            <p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/analytics" style="color: #5c6ac4; text-decoration: none;">
                View Detailed Analytics →
              </a>
            </p>
            <p>
              You're receiving this email because you subscribed to monthly spending reports.
              <br>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/settings" style="color: #5c6ac4; text-decoration: none;">
                Update your email preferences
              </a>
            </p>
          </div>
        </div>
      `
    });
    
    console.log(`Monthly spending report sent to ${user.email} for ${reportData.monthName} ${reportData.year}`);
    return { success: true, data };
  } catch (error) {
    console.error(`Failed to send monthly spending report:`, error);
    return { success: false, error };
  }
} 