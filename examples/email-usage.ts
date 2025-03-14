import {
  send2FACodeEmail,
  sendSecurityAlertEmail,
  sendWeeklySummaryEmail,
  sendAnnualReviewEmail,
  sendInactiveAccountReminderEmail,
  sendSignInVerificationEmail,
  sendSubscriptionAddedEmail
} from '../lib/email-service';

/**
 * Example of using the 2FA code email
 */
async function example2FACodeEmail() {
  const user = {
    email: 'user@example.com',
    name: 'John Doe'
  };
  
  // Generate a random 6-digit code
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  
  // Send the 2FA code email
  const result = await send2FACodeEmail(user, code, 10);
  console.log('2FA Email Result:', result);
}

/**
 * Example of using the security alert email
 */
async function exampleSecurityAlertEmail() {
  const user = {
    email: 'user@example.com',
    name: 'John Doe'
  };
  
  // Create an alert for multiple failed login attempts
  const alert = {
    type: 'login_attempts' as const,
    details: '5 failed login attempts from different locations',
    time: new Date(),
    ipAddress: '192.168.1.1',
    location: 'New York, USA'
  };
  
  // Send the security alert email
  const result = await sendSecurityAlertEmail(user, alert);
  console.log('Security Alert Email Result:', result);
}

/**
 * Example of using the weekly summary email
 */
async function exampleWeeklySummaryEmail() {
  const user = {
    email: 'user@example.com',
    name: 'John Doe'
  };
  
  // Create summary data
  const summary = {
    totalActiveSubscriptions: 12,
    totalMonthlySpend: 125.97,
    upcomingPayments: [
      {
        name: 'Netflix',
        amount: 15.99,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        daysRemaining: 2
      },
      {
        name: 'Spotify',
        amount: 9.99,
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        daysRemaining: 5
      }
    ],
    recentlyAdded: [
      {
        name: 'Disney+',
        amount: 7.99,
        category: 'Entertainment'
      }
    ]
  };
  
  // Send the weekly summary email
  const result = await sendWeeklySummaryEmail(user, summary);
  console.log('Weekly Summary Email Result:', result);
}

/**
 * Example of using the annual review email
 */
async function exampleAnnualReviewEmail() {
  const user = {
    email: 'user@example.com',
    name: 'John Doe'
  };
  
  // Create annual review data
  const review = {
    year: 2023,
    totalSpent: 1542.68,
    previousYearSpent: 1350.25,
    subscriptionCount: 15,
    mostExpensiveSubscription: {
      name: 'Adobe Creative Cloud',
      totalSpent: 239.88,
      monthlyCost: 19.99
    },
    topCategories: [
      {
        name: 'Entertainment',
        percentage: 45.2,
        totalSpent: 697.09
      },
      {
        name: 'Productivity',
        percentage: 30.1,
        totalSpent: 464.34
      },
      {
        name: 'Utilities',
        percentage: 15.5,
        totalSpent: 239.12
      }
    ],
    canceledCount: 3,
    addedCount: 5,
    potentialSavings: 182.88
  };
  
  // Send the annual review email
  const result = await sendAnnualReviewEmail(user, review);
  console.log('Annual Review Email Result:', result);
}

/**
 * Example of using the inactive account reminder email
 */
async function exampleInactiveAccountReminderEmail() {
  const user = {
    email: 'user@example.com',
    name: 'John Doe'
  };
  
  // Create inactivity data (45 days of inactivity)
  const inactivityData = {
    lastLoginDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
    daysSinceLastLogin: 45,
    activeSubscriptionCount: 8,
    totalMonthlySpend: 89.92
  };
  
  // Send the inactive account reminder email
  const result = await sendInactiveAccountReminderEmail(user, inactivityData);
  console.log('Inactive Account Reminder Email Result:', result);
}

/**
 * Example of using the sign-in verification email
 */
async function exampleSignInVerificationEmail() {
  const user = {
    email: 'user@example.com',
    name: 'John Doe'
  };
  
  // Create login info
  const loginInfo = {
    ipAddress: '203.0.113.42',
    deviceInfo: 'Chrome 114 on Windows 11',
    location: 'Chicago, USA',
    time: new Date()
  };
  
  // Send the sign-in verification email
  const result = await sendSignInVerificationEmail(user, loginInfo);
  console.log('Sign-in Verification Email Result:', result);
}

/**
 * Example of using the subscription added email
 */
async function exampleSubscriptionAddedEmail() {
  const user = {
    email: 'user@example.com',
    name: 'John Doe'
  };
  
  // Create subscription data
  const subscription = {
    name: 'HBO Max',
    price: 14.99,
    billingCycle: 'Monthly',
    category: 'Entertainment',
    nextPayment: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
    description: 'Premium plan with 4K streaming'
  };
  
  // Send the subscription added email
  const result = await sendSubscriptionAddedEmail(user, subscription);
  console.log('Subscription Added Email Result:', result);
}

// Example function to run all examples
export async function runAllEmailExamples() {
  try {
    console.log('Running 2FA Code Email Example...');
    await example2FACodeEmail();
    
    console.log('\nRunning Security Alert Email Example...');
    await exampleSecurityAlertEmail();
    
    console.log('\nRunning Weekly Summary Email Example...');
    await exampleWeeklySummaryEmail();
    
    console.log('\nRunning Annual Review Email Example...');
    await exampleAnnualReviewEmail();
    
    console.log('\nRunning Inactive Account Reminder Email Example...');
    await exampleInactiveAccountReminderEmail();
    
    console.log('\nRunning Sign-in Verification Email Example...');
    await exampleSignInVerificationEmail();
    
    console.log('\nRunning Subscription Added Email Example...');
    await exampleSubscriptionAddedEmail();
    
    console.log('\nAll email examples completed!');
  } catch (error) {
    console.error('Error running email examples:', error);
  }
}

// Uncomment the line below to run all examples
// runAllEmailExamples(); 