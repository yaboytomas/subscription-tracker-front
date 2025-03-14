import { Resend } from 'resend';

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY);

// Sender email - using your verified domain (no need for actual email accounts)
const SENDER_EMAIL = 'Subscription Tracker <noreply@zabotec.com>'; // Using verified domain
const FALLBACK_SENDER_EMAIL = 'Subscription Tracker <onboarding@resend.dev>'; // Resend default domain

// Helper function to detect institutional emails that might need special handling
function isInstitutionalEmail(email: string): boolean {
  // Add known institutional domains that have delivery issues
  const institutionalDomains = [
    'estudiante.ipss.cl',
    'ipss.cl'
    // Add more domains if needed
  ];
  
  return institutionalDomains.some(domain => email.toLowerCase().endsWith(domain));
}

// Helper to get the appropriate sender email based on recipient
function getSenderEmail(recipient: string): string {
  // For institutional emails, use the fallback sender
  if (isInstitutionalEmail(recipient)) {
    console.log(`Using fallback sender for institutional email: ${recipient}`);
    return FALLBACK_SENDER_EMAIL;
  }
  
  // For all other emails, use the verified domain
  return SENDER_EMAIL;
}

/**
 * Sends a welcome email to a new user
 */
export async function sendWelcomeEmail(user: { email: string, name: string }) {
  try {
    console.log(`Attempting to send welcome email to ${user.email}`);
    
    // Send to the actual email address
    const recipient = user.email;
    
    // Choose appropriate sender based on recipient domain
    const sender = getSenderEmail(recipient);
    
    const data = await resend.emails.send({
      from: sender,
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
    
    // Send to the actual email address
    const recipient = user.email;
    
    // Choose appropriate sender based on recipient domain
    const sender = getSenderEmail(recipient);
    
    const data = await resend.emails.send({
      from: sender,
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
    
    // Send to the actual email address
    const recipient = user.email;
    
    // Choose appropriate sender based on recipient domain
    const sender = getSenderEmail(recipient);
    
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
      from: sender,
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
    
    // Send to the actual email address
    const recipient = user.email;
    
    // Choose appropriate sender based on recipient domain
    const sender = getSenderEmail(recipient);
    
    // Create the reset URL - use the deployment URL or localhost for development
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const resetUrl = `${baseUrl}/reset-password?token=${resetToken}&email=${encodeURIComponent(user.email)}`;
    
    const data = await resend.emails.send({
      from: sender,
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
    
    // Send to the actual email address
    const recipient = email;
    
    // Choose appropriate sender based on recipient domain
    const sender = getSenderEmail(recipient);
    
    const data = await resend.emails.send({
      from: sender,
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
    
    // Send to the actual previous email
    const recipient = user.previousEmail;
    
    // Format the IP address for display, if available
    const ipInfo = user.ipAddress ? `from IP address ${user.ipAddress}` : '';
    
    const data = await resend.emails.send({
      from: getSenderEmail(recipient),
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
    
    // Send to the actual new email address
    const recipient = user.newEmail;
    
    const data = await resend.emails.send({
      from: getSenderEmail(recipient),
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
    
    // Send to the actual email address
    const recipient = user.email;
    
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
      from: getSenderEmail(recipient), // Select appropriate sender based on recipient
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

/**
 * Sends a notification when a user signs in from a new device or location
 */
export async function sendSignInVerificationEmail(user: { 
  email: string, 
  name: string 
}, loginInfo: {
  ipAddress: string,
  deviceInfo: string,
  location?: string,
  time: Date
}) {
  try {
    console.log(`Sending sign-in verification email to ${user.email}`);
    
    // Send to the user's email address
    const recipient = user.email;
    
    // Choose appropriate sender based on recipient domain
    const sender = getSenderEmail(recipient);
    
    // Format the login time
    const loginTime = loginInfo.time.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Format location info if available
    const locationInfo = loginInfo.location 
      ? `from ${loginInfo.location}` 
      : '';
    
    const data = await resend.emails.send({
      from: sender,
      to: recipient,
      subject: 'New Sign-In to Your Subscription Tracker Account',
      html: `
        <h1>New Sign-In Detected</h1>
        <p>Hello ${user.name},</p>
        <p>We detected a new sign-in to your Subscription Tracker account.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0;">
          <p><strong>Time:</strong> ${loginTime}</p>
          <p><strong>IP Address:</strong> ${loginInfo.ipAddress}</p>
          <p><strong>Device:</strong> ${loginInfo.deviceInfo}</p>
          ${loginInfo.location ? `<p><strong>Location:</strong> ${loginInfo.location}</p>` : ''}
        </div>
        
        <p>If this was you, no action is needed. You can safely ignore this email.</p>
        
        <p><strong>Wasn't you?</strong> If you did not sign in at this time, please:</p>
        <ol>
          <li>Change your password immediately by visiting <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/reset-password">the password reset page</a></li>
          <li>Review your account activity</li>
          <li>Contact our support team if you believe your account has been compromised</li>
        </ol>
        
        <p>We take your account security seriously and notify you of any new sign-ins to help keep your account safe.</p>
        
        <p>Best regards,<br>The Subscription Tracker Security Team</p>
      `
    });
    
    console.log('Sign-in verification email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send sign-in verification email:', error);
    return { success: false, error };
  }
}

/**
 * Sends a confirmation email when a user adds a new subscription
 */
export async function sendSubscriptionAddedEmail(
  user: { email: string, name: string },
  subscription: {
    name: string,
    price: number,
    billingCycle: string,
    category: string,
    nextPayment: Date,
    description?: string
  }
) {
  try {
    console.log(`Sending subscription added confirmation to ${user.email} for ${subscription.name}`);
    
    // Send to the user's email address
    const recipient = user.email;
    
    // Choose appropriate sender based on recipient domain
    const sender = getSenderEmail(recipient);
    
    // Format the next payment date
    const nextPaymentDate = subscription.nextPayment.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Calculate days until next payment
    const today = new Date();
    const daysUntilPayment = Math.ceil(
      (subscription.nextPayment.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    // Format the payment amount based on billing cycle
    const paymentString = `$${subscription.price.toFixed(2)} ${subscription.billingCycle.toLowerCase()}`;
    
    const data = await resend.emails.send({
      from: sender,
      to: recipient,
      subject: `New Subscription Added: ${subscription.name}`,
      html: `
        <h1>New Subscription Added</h1>
        <p>Hello ${user.name},</p>
        <p>Your new subscription has been successfully added to your Subscription Tracker account.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 4px; margin: 15px 0;">
          <h2 style="margin-top: 0; color: #333;">${subscription.name}</h2>
          <p><strong>Price:</strong> ${paymentString}</p>
          <p><strong>Category:</strong> ${subscription.category}</p>
          <p><strong>Next Payment:</strong> ${nextPaymentDate} (in ${daysUntilPayment} days)</p>
          ${subscription.description ? `<p><strong>Description:</strong> ${subscription.description}</p>` : ''}
        </div>
        
        <p>You'll receive payment reminders before this subscription is due.</p>
        
        <div style="margin-top: 20px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="background-color: #0070f3; color: white; padding: 10px 15px; border-radius: 4px; text-decoration: none; display: inline-block;">
            View Your Subscriptions
          </a>
        </div>
        
        <p style="margin-top: 20px;">Thank you for using Subscription Tracker to manage your subscriptions!</p>
        
        <p>Best regards,<br>The Subscription Tracker Team</p>
      `
    });
    
    console.log('Subscription added email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send subscription added email:', error);
    return { success: false, error };
  }
}

/**
 * Sends a Two-Factor Authentication (2FA) code
 */
export async function send2FACodeEmail(user: { 
  email: string, 
  name: string 
}, code: string, expiresInMinutes: number = 10) {
  try {
    console.log(`Sending 2FA code to ${user.email}`);
    
    // Send to the user's email address
    const recipient = user.email;
    
    const data = await resend.emails.send({
      from: getSenderEmail(recipient),
      to: recipient,
      subject: 'Your Security Code - Subscription Tracker',
      html: `
        <h1>Authentication Code</h1>
        <p>Hello ${user.name},</p>
        <p>Your security code for Subscription Tracker is:</p>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 4px; margin: 20px 0; text-align: center;">
          <p style="font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 10px 0;">${code}</p>
          <p>This code will expire in ${expiresInMinutes} minutes.</p>
        </div>
        
        <p>If you didn't request this code, you can safely ignore this email.</p>
        <p>Someone might have typed your email address by mistake.</p>
        
        <p>Best regards,<br>The Subscription Tracker Security Team</p>
      `
    });
    
    console.log('2FA code email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send 2FA code email:', error);
    return { success: false, error };
  }
}

/**
 * Sends a security alert for suspicious activity
 */
export async function sendSecurityAlertEmail(user: { 
  email: string, 
  name: string 
}, alert: {
  type: 'login_attempts' | 'password_reset' | 'account_changes',
  details: string,
  time: Date,
  ipAddress?: string,
  location?: string
}) {
  try {
    console.log(`Sending security alert to ${user.email} for ${alert.type}`);
    
    // Send to the user's email address
    const recipient = user.email;
    
    // Format the alert time
    const alertTime = alert.time.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Create alert type title and message based on the alert type
    let alertTitle = 'Security Alert';
    let alertMessage = '';
    let actionSteps = '';
    
    switch (alert.type) {
      case 'login_attempts':
        alertTitle = 'Multiple Failed Login Attempts';
        alertMessage = 'We detected multiple failed login attempts to your Subscription Tracker account.';
        actionSteps = `
          <li>Change your password immediately</li>
          <li>Enable two-factor authentication if you haven't already</li>
          <li>Check for any unauthorized account changes</li>
        `;
        break;
      case 'password_reset':
        alertTitle = 'Password Reset Attempted';
        alertMessage = 'A password reset was requested for your Subscription Tracker account from an unfamiliar location.';
        actionSteps = `
          <li>If this wasn't you, secure your email account immediately</li>
          <li>Contact our support team</li>
        `;
        break;
      case 'account_changes':
        alertTitle = 'Important Account Changes';
        alertMessage = 'Your Subscription Tracker account settings were changed recently.';
        actionSteps = `
          <li>Review all recent account changes</li>
          <li>If you didn't make these changes, reset your password immediately</li>
        `;
        break;
    }
    
    const data = await resend.emails.send({
      from: getSenderEmail(recipient),
      to: recipient,
      subject: `Security Alert: ${alertTitle} - Subscription Tracker`,
      html: `
        <h1>${alertTitle}</h1>
        <p>Hello ${user.name},</p>
        <p>${alertMessage}</p>
        
        <div style="background-color: #fff8e1; padding: 15px; border-radius: 4px; margin: 15px 0; border-left: 4px solid #ffc107;">
          <p><strong>Details:</strong> ${alert.details}</p>
          <p><strong>Time:</strong> ${alertTime}</p>
          ${alert.ipAddress ? `<p><strong>IP Address:</strong> ${alert.ipAddress}</p>` : ''}
          ${alert.location ? `<p><strong>Location:</strong> ${alert.location}</p>` : ''}
        </div>
        
        <p><strong>Recommended actions:</strong></p>
        <ol>
          ${actionSteps}
        </ol>
        
        <p>If you recognize this activity, you can disregard this message.</p>
        
        <div style="margin-top: 20px;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/security" style="background-color: #dc3545; color: white; padding: 10px 15px; border-radius: 4px; text-decoration: none; display: inline-block;">
            Review Account Security
          </a>
        </div>
        
        <p style="margin-top: 20px;">We take the security of your account very seriously.</p>
        <p>Best regards,<br>The Subscription Tracker Security Team</p>
      `
    });
    
    console.log('Security alert email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send security alert email:', error);
    return { success: false, error };
  }
}

/**
 * Sends a weekly summary of subscriptions
 */
export async function sendWeeklySummaryEmail(user: { 
  email: string, 
  name: string 
}, summary: {
  totalActiveSubscriptions: number,
  totalMonthlySpend: number,
  upcomingPayments: Array<{
    name: string,
    amount: number,
    dueDate: Date,
    daysRemaining: number
  }>,
  recentlyAdded?: Array<{
    name: string,
    amount: number,
    category: string
  }>
}) {
  try {
    console.log(`Sending weekly summary to ${user.email}`);
    
    // Send to the user's email address
    const recipient = user.email;
    
    // Format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(amount);
    };
    
    // Generate the upcoming payments section
    let upcomingPaymentsHTML = '';
    if (summary.upcomingPayments.length === 0) {
      upcomingPaymentsHTML = '<p>You have no upcoming payments in the next 7 days.</p>';
    } else {
      upcomingPaymentsHTML = `
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="text-align: left; padding: 10px; border-bottom: 1px solid #eaeaea;">Subscription</th>
              <th style="text-align: left; padding: 10px; border-bottom: 1px solid #eaeaea;">Amount</th>
              <th style="text-align: left; padding: 10px; border-bottom: 1px solid #eaeaea;">Due In</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      // Sort by days remaining
      const sortedPayments = [...summary.upcomingPayments].sort((a, b) => a.daysRemaining - b.daysRemaining);
      
      for (const payment of sortedPayments) {
        const dueText = payment.daysRemaining === 0 
          ? 'Today' 
          : payment.daysRemaining === 1 
            ? 'Tomorrow' 
            : `${payment.daysRemaining} days`;
            
        upcomingPaymentsHTML += `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eaeaea;">${payment.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eaeaea;">${formatCurrency(payment.amount)}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eaeaea;">${dueText}</td>
          </tr>
        `;
      }
      
      upcomingPaymentsHTML += `
          </tbody>
        </table>
      `;
    }
    
    // Generate the recently added section
    let recentlyAddedHTML = '';
    if (summary.recentlyAdded && summary.recentlyAdded.length > 0) {
      recentlyAddedHTML = `
        <h2 style="color: #333; margin-top: 30px;">Recently Added</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="text-align: left; padding: 10px; border-bottom: 1px solid #eaeaea;">Subscription</th>
              <th style="text-align: left; padding: 10px; border-bottom: 1px solid #eaeaea;">Amount</th>
              <th style="text-align: left; padding: 10px; border-bottom: 1px solid #eaeaea;">Category</th>
            </tr>
          </thead>
          <tbody>
      `;
      
      for (const sub of summary.recentlyAdded) {
        recentlyAddedHTML += `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #eaeaea;">${sub.name}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eaeaea;">${formatCurrency(sub.amount)}</td>
            <td style="padding: 10px; border-bottom: 1px solid #eaeaea;">${sub.category}</td>
          </tr>
        `;
      }
      
      recentlyAddedHTML += `
          </tbody>
        </table>
      `;
    }
    
    const data = await resend.emails.send({
      from: getSenderEmail(recipient),
      to: recipient,
      subject: 'Your Weekly Subscription Summary',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; border-bottom: 2px solid #5c6ac4; padding-bottom: 10px;">Weekly Summary</h1>
          
          <p>Hello ${user.name},</p>
          <p>Here's a quick overview of your subscriptions for this week:</p>
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 4px; margin: 20px 0; display: flex; justify-content: space-around; text-align: center;">
            <div>
              <p style="font-size: 14px; margin-bottom: 5px; color: #666;">Active Subscriptions</p>
              <p style="font-size: 24px; font-weight: bold; margin: 0;">${summary.totalActiveSubscriptions}</p>
            </div>
            <div>
              <p style="font-size: 14px; margin-bottom: 5px; color: #666;">Monthly Spend</p>
              <p style="font-size: 24px; font-weight: bold; margin: 0;">${formatCurrency(summary.totalMonthlySpend)}</p>
            </div>
          </div>
          
          <h2 style="color: #333;">Upcoming Payments</h2>
          ${upcomingPaymentsHTML}
          
          ${recentlyAddedHTML}
          
          <div style="margin-top: 30px; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="background-color: #0070f3; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; display: inline-block;">
              View All Subscriptions
            </a>
          </div>
          
          <p style="margin-top: 30px; font-size: 14px; color: #666; text-align: center;">
            You're receiving this email because you've enabled weekly summaries.
            <br>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/settings" style="color: #5c6ac4; text-decoration: none;">
              Update your email preferences
            </a>
          </p>
        </div>
      `
    });
    
    console.log('Weekly summary email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send weekly summary email:', error);
    return { success: false, error };
  }
}

/**
 * Sends an annual review email with subscription insights
 */
export async function sendAnnualReviewEmail(user: { 
  email: string, 
  name: string 
}, review: {
  year: number,
  totalSpent: number,
  previousYearSpent: number,
  subscriptionCount: number,
  mostExpensiveSubscription: {
    name: string,
    totalSpent: number,
    monthlyCost: number
  },
  topCategories: Array<{
    name: string,
    percentage: number,
    totalSpent: number
  }>,
  canceledCount: number,
  addedCount: number,
  potentialSavings: number
}) {
  try {
    console.log(`Sending annual review for ${review.year} to ${user.email}`);
    
    // Send to the user's email address
    const recipient = user.email;
    
    // Format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(amount);
    };
    
    // Calculate year-over-year change
    const yearChange = review.totalSpent - review.previousYearSpent;
    const percentChange = review.previousYearSpent > 0 
      ? ((yearChange / review.previousYearSpent) * 100).toFixed(1) 
      : '0';
    
    const changeDirection = yearChange > 0 ? 'increased' : yearChange < 0 ? 'decreased' : 'remained the same';
    const changeText = yearChange !== 0 
      ? `${changeDirection} by ${formatCurrency(Math.abs(yearChange))} (${Math.abs(parseFloat(percentChange))}%)` 
      : 'remained the same';
      
    // Generate the top categories section
    let categoriesHTML = '';
    if (review.topCategories.length > 0) {
      for (const category of review.topCategories) {
        categoriesHTML += `
          <div style="display: flex; align-items: center; margin-bottom: 15px;">
            <div style="flex-grow: 1;">
              <p style="margin: 0; font-weight: bold;">${category.name}</p>
              <p style="margin: 0; color: #666; font-size: 14px;">${formatCurrency(category.totalSpent)}</p>
            </div>
            <div style="width: 100px; text-align: right;">
              <p style="margin: 0;">${category.percentage.toFixed(1)}%</p>
            </div>
          </div>
        `;
      }
    }
    
    const data = await resend.emails.send({
      from: getSenderEmail(recipient),
      to: recipient,
      subject: `Your ${review.year} Year in Review - Subscription Tracker`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; text-align: center; margin-bottom: 30px;">${review.year} Year in Review</h1>
          
          <p>Hello ${user.name},</p>
          <p>Here's a look back at your subscription spending for ${review.year}:</p>
          
          <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 25px 0; text-align: center;">
            <h2 style="margin-top: 0;">Total Spent on Subscriptions</h2>
            <p style="font-size: 36px; font-weight: bold; margin: 10px 0;">${formatCurrency(review.totalSpent)}</p>
            <p style="color: #666;">Your spending ${changeText} compared to ${review.year - 1}</p>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin: 30px 0; text-align: center;">
            <div style="flex: 1; padding: 15px; background-color: #f8f9fa; border-radius: 8px; margin-right: 10px;">
              <p style="font-size: 14px; margin-bottom: 5px; color: #666;">Active Subscriptions</p>
              <p style="font-size: 24px; font-weight: bold; margin: 0;">${review.subscriptionCount}</p>
            </div>
            <div style="flex: 1; padding: 15px; background-color: #f8f9fa; border-radius: 8px; margin-left: 10px;">
              <p style="font-size: 14px; margin-bottom: 5px; color: #666;">Monthly Average</p>
              <p style="font-size: 24px; font-weight: bold; margin: 0;">${formatCurrency(review.totalSpent / 12)}</p>
            </div>
          </div>
          
          <h2 style="color: #333; margin-top: 30px;">Most Expensive Subscription</h2>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
            <h3 style="margin-top: 0;">${review.mostExpensiveSubscription.name}</h3>
            <p><strong>Total spent:</strong> ${formatCurrency(review.mostExpensiveSubscription.totalSpent)}</p>
            <p><strong>Monthly cost:</strong> ${formatCurrency(review.mostExpensiveSubscription.monthlyCost)}</p>
          </div>
          
          <h2 style="color: #333; margin-top: 30px;">Top Spending Categories</h2>
          <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin: 15px 0;">
            ${categoriesHTML}
          </div>
          
          <h2 style="color: #333; margin-top: 30px;">Subscription Changes</h2>
          <div style="display: flex; justify-content: space-between; margin: 15px 0; text-align: center;">
            <div style="flex: 1; padding: 15px; background-color: #e8f5e9; border-radius: 8px; margin-right: 10px;">
              <p style="font-size: 14px; margin-bottom: 5px; color: #388e3c;">Added</p>
              <p style="font-size: 24px; font-weight: bold; margin: 0; color: #388e3c;">+${review.addedCount}</p>
            </div>
            <div style="flex: 1; padding: 15px; background-color: #ffebee; border-radius: 8px; margin-left: 10px;">
              <p style="font-size: 14px; margin-bottom: 5px; color: #d32f2f;">Canceled</p>
              <p style="font-size: 24px; font-weight: bold; margin: 0; color: #d32f2f;">-${review.canceledCount}</p>
            </div>
          </div>
          
          <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
            <h2 style="color: #388e3c; margin-top: 0;">Potential Savings</h2>
            <p style="font-size: 24px; font-weight: bold; margin: 10px 0; color: #388e3c;">${formatCurrency(review.potentialSavings)}</p>
            <p>You could save this amount by reviewing your unused subscriptions</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/optimize" style="background-color: #388e3c; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; display: inline-block; margin-top: 10px;">
              Optimize Subscriptions
            </a>
          </div>
          
          <div style="margin-top: 40px; text-align: center;">
            <p>Here's to smarter subscription management in ${review.year + 1}!</p>
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="background-color: #0070f3; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; display: inline-block; margin-top: 15px;">
              View Your Dashboard
            </a>
          </div>
          
          <p style="margin-top: 30px; font-size: 14px; color: #666; text-align: center;">
            Thanks for using Subscription Tracker throughout ${review.year}!
          </p>
        </div>
      `
    });
    
    console.log('Annual review email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send annual review email:', error);
    return { success: false, error };
  }
}

/**
 * Sends a reminder to inactive users to encourage re-engagement
 */
export async function sendInactiveAccountReminderEmail(user: { 
  email: string, 
  name: string 
}, inactivityData: {
  lastLoginDate: Date,
  daysSinceLastLogin: number,
  activeSubscriptionCount: number,
  totalMonthlySpend: number
}) {
  try {
    console.log(`Sending inactive account reminder to ${user.email}`);
    
    // Send to the user's email address
    const recipient = user.email;
    
    // Format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2
      }).format(amount);
    };
    
    // Format the last login date
    const lastLoginDate = inactivityData.lastLoginDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
    
    // Determine message intensity based on inactivity period
    let subject = 'We miss you at Subscription Tracker';
    let heading = "We noticed you've been away";
    let messageTone = 'friendly';
    
    if (inactivityData.daysSinceLastLogin > 60) {
      subject = 'Your Subscription Tracker account needs attention';
      heading = "It's been a while...";
      messageTone = 'concerned';
    }
    
    if (inactivityData.daysSinceLastLogin > 90) {
      subject = 'Important: Update on your Subscription Tracker account';
      heading = "Don't let your subscriptions go unmanaged";
      messageTone = 'urgent';
    }
    
    const data = await resend.emails.send({
      from: getSenderEmail(recipient),
      to: recipient,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; border-bottom: 2px solid #5c6ac4; padding-bottom: 10px;">${heading}</h1>
          
          <p>Hello ${user.name},</p>
          
          ${messageTone === 'friendly' ? `
            <p>We've noticed you haven't logged into your Subscription Tracker account in a while. We hope everything is going well!</p>
            <p>Your last login was on <strong>${lastLoginDate}</strong> (${inactivityData.daysSinceLastLogin} days ago).</p>
          ` : messageTone === 'concerned' ? `
            <p>It's been over 60 days since you last logged into your Subscription Tracker account.</p>
            <p>Your last login was on <strong>${lastLoginDate}</strong> (${inactivityData.daysSinceLastLogin} days ago). Without regular check-ins, you might miss important events related to your subscriptions.</p>
          ` : `
            <p>It's been over 90 days since you last logged into your Subscription Tracker account, and we're concerned you might be missing important information about your subscriptions.</p>
            <p>Your last login was on <strong>${lastLoginDate}</strong> (${inactivityData.daysSinceLastLogin} days ago).</p>
          `}
          
          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 4px; margin: 20px 0;">
            <h2 style="margin-top: 0;">Your Subscription Status</h2>
            <p><strong>Active Subscriptions:</strong> ${inactivityData.activeSubscriptionCount}</p>
            <p><strong>Total Monthly Cost:</strong> ${formatCurrency(inactivityData.totalMonthlySpend)}</p>
            <p>Without regular monitoring, you might be paying for services you're no longer using.</p>
          </div>
          
          <h2>Why Come Back?</h2>
          <ul>
            <li>Track upcoming payments to avoid surprises</li>
            <li>Identify subscriptions you might no longer need</li>
            <li>Get insights into your spending habits</li>
            <li>We've added new features to help you save money</li>
          </ul>
          
          <div style="margin-top: 30px; text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard" style="background-color: #0070f3; color: white; padding: 12px 24px; border-radius: 4px; text-decoration: none; display: inline-block; font-weight: bold;">
              Log In Now
            </a>
          </div>
          
          <p style="margin-top: 30px; font-size: 14px; color: #666;">
            If you no longer wish to use Subscription Tracker, you can 
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/account/delete" style="color: #5c6ac4; text-decoration: none;">delete your account</a> 
            or 
            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/unsubscribe?email=${encodeURIComponent(user.email)}" style="color: #5c6ac4; text-decoration: none;">unsubscribe from these reminders</a>.
          </p>
          
          <p>Best regards,<br>The Subscription Tracker Team</p>
        </div>
      `
    });
    
    console.log('Inactive account reminder email sent:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Failed to send inactive account reminder email:', error);
    return { success: false, error };
  }
} 