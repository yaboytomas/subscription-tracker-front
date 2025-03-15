'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/components/ui/use-toast';

export default function TestEmailsPage() {
  const [loading, setLoading] = useState({
    sampleReport: false,
    cronSimulation: false,
    simpleTest: false,
    mockCronJob: false,
    debugConnection: false,
    directTest: false
  });
  const [results, setResults] = useState<{ [key: string]: string | null }>({
    sampleReport: null,
    cronSimulation: null,
    simpleTest: null,
    mockCronJob: null,
    debugConnection: null,
    directTest: null
  });

  const sendSampleReport = async () => {
    try {
      setLoading(prev => ({ ...prev, sampleReport: true }));
      
      // Get the current user's email from profile
      let userEmail = '';
      
      try {
        const profileResponse = await fetch('/api/auth/profile');
        if (!profileResponse.ok) {
          throw new Error(`Profile API returned ${profileResponse.status}`);
        }
        const profileData = await profileResponse.json();
        
        if (profileData.success) {
          userEmail = profileData.user.email;
        }
      } catch (profileError) {
        console.error('Error fetching profile:', profileError);
        
        // If we can't get the user's profile, we'll still try to send a test email
        // to the default address in the test endpoint
        toast({
          title: 'Warning',
          description: 'Could not retrieve your profile. Using default test email instead.',
          variant: 'default',
        });
      }
      
      // Call the test endpoint with the user's email if available
      const endpoint = userEmail 
        ? `/api/test/monthly-report?email=${encodeURIComponent(userEmail)}`
        : '/api/test/monthly-report';
        
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`Test email API returned ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Sample monthly report email sent successfully.',
        });
        setResults(prev => ({ 
          ...prev, 
          sampleReport: `Sample report sent to ${userEmail || 'default test email'}!` 
        }));
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to send sample report.',
          variant: 'destructive',
        });
        setResults(prev => ({ ...prev, sampleReport: `Error: ${data.error || 'Unknown error'}` }));
      }
    } catch (error) {
      console.error('Error sending sample report:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while sending the test email.',
        variant: 'destructive',
      });
      setResults(prev => ({ 
        ...prev, 
        sampleReport: `Error: ${error instanceof Error ? error.message : 'Unexpected error occurred'}` 
      }));
    } finally {
      setLoading(prev => ({ ...prev, sampleReport: false }));
    }
  };

  const simulateCronJob = async () => {
    try {
      setLoading(prev => ({ ...prev, cronSimulation: true }));
      
      // Get the current user's email from profile
      let userEmail = '';
      
      try {
        const profileResponse = await fetch('/api/auth/profile');
        if (!profileResponse.ok) {
          throw new Error(`Profile API returned ${profileResponse.status}`);
        }
        const profileData = await profileResponse.json();
        
        if (profileData.success) {
          userEmail = profileData.user.email;
        }
      } catch (profileError) {
        console.error('Error fetching profile:', profileError);
        toast({
          title: 'Authentication Error',
          description: 'Could not retrieve your profile. Please ensure you are logged in.',
          variant: 'destructive',
        });
        setResults(prev => ({ 
          ...prev, 
          cronSimulation: 'Authentication error: Could not access your profile. Please refresh the page and try again.' 
        }));
        setLoading(prev => ({ ...prev, cronSimulation: false }));
        return;
      }
      
      if (!userEmail) {
        toast({
          title: 'Error',
          description: 'Could not determine your email address. Please ensure you are logged in properly.',
          variant: 'destructive',
        });
        setResults(prev => ({ 
          ...prev, 
          cronSimulation: 'Error: Could not determine your email address. Please ensure you are logged in.' 
        }));
        setLoading(prev => ({ ...prev, cronSimulation: false }));
        return;
      }
      
      // Call the test cron endpoint with the user's email
      console.log(`Calling cron simulation API with email: ${userEmail}`);
      const response = await fetch(`/api/test/monthly-report-cron?email=${encodeURIComponent(userEmail)}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API error response:', errorText);
        throw new Error(`Cron simulation API returned ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Cron job API response:', data);
      
      if (data.success) {
        toast({
          title: 'Success',
          description: `Monthly report cron simulation completed. ${data.message || ''}`,
        });
        
        // Safely extract details if they exist
        const emailsSent = data.emailsSent || data.details?.emailsSent || 0;
        const errors = data.errors || data.details?.errors || 0;
        
        let resultText = `Simulation complete! Emails sent: ${emailsSent}, Errors: ${errors}`;
        
        // Add more details if available
        if (data.details) {
          resultText += '\n\nDetails:';
          if (data.details.totalUsers) resultText += `\n• Total users: ${data.details.totalUsers}`;
          if (data.details.testEmail) resultText += `\n• Test email: ${data.details.testEmail}`;
        }
        
        setResults(prev => ({ ...prev, cronSimulation: resultText }));
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to simulate cron job.',
          variant: 'destructive',
        });
        
        let errorDetails = `Error: ${data.error || 'Unknown error'}`;
        if (data.details) {
          errorDetails += `\nDetails: ${JSON.stringify(data.details)}`;
        }
        
        setResults(prev => ({ ...prev, cronSimulation: errorDetails }));
      }
    } catch (error) {
      console.error('Error simulating cron job:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while simulating the cron job.',
        variant: 'destructive',
      });
      setResults(prev => ({ ...prev, cronSimulation: `Error: ${error instanceof Error ? error.message : 'Unexpected error occurred'}` }));
    } finally {
      setLoading(prev => ({ ...prev, cronSimulation: false }));
    }
  };

  const sendSimpleTestReport = async () => {
    try {
      setLoading(prev => ({ ...prev, simpleTest: true }));
      
      // Get the user's email from the input field or use the logged-in user's email
      let userEmail = '';
      
      try {
        const profileResponse = await fetch('/api/auth/profile');
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.success) {
            userEmail = profileData.user.email;
          }
        }
      } catch (error) {
        console.error('Could not fetch profile, using default email', error);
      }
      
      // Call the simple test endpoint
      const endpoint = userEmail
        ? `/api/test/monthly-report-simple?email=${encodeURIComponent(userEmail)}`
        : '/api/test/monthly-report-simple';
        
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`Simple test API returned ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Simple test monthly report sent successfully.',
        });
        setResults(prev => ({ 
          ...prev, 
          simpleTest: `Simple test report sent to ${userEmail || 'default test email'}!
Details: ${data.reportDetails ? 
    `Month: ${data.reportDetails.month} ${data.reportDetails.year}
Total: $${data.reportDetails.totalSpent}
Change: ${data.reportDetails.changeFromPreviousMonth}` : 'No details available'}` 
        }));
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to send simple test report.',
          variant: 'destructive',
        });
        setResults(prev => ({ ...prev, simpleTest: `Error: ${data.error || 'Unknown error'}` }));
      }
    } catch (error) {
      console.error('Error sending simple test report:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while sending the simple test.',
        variant: 'destructive',
      });
      setResults(prev => ({ 
        ...prev, 
        simpleTest: `Error: ${error instanceof Error ? error.message : 'Unexpected error occurred'}` 
      }));
    } finally {
      setLoading(prev => ({ ...prev, simpleTest: false }));
    }
  };

  const testMockCronJob = async () => {
    try {
      setLoading(prev => ({ ...prev, mockCronJob: true }));
      
      // Get the user's email from the input field or use the logged-in user's email
      let userEmail = '';
      
      try {
        const profileResponse = await fetch('/api/auth/profile');
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.success) {
            userEmail = profileData.user.email;
          }
        }
      } catch (error) {
        console.error('Could not fetch profile, using default email', error);
      }
      
      // Call the mock cron endpoint
      const endpoint = userEmail
        ? `/api/test/monthly-report-cron-mock?email=${encodeURIComponent(userEmail)}`
        : '/api/test/monthly-report-cron-mock';
        
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`Mock cron API returned ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Mock cron job report sent successfully.',
        });
        
        const details = data.reportDetails;
        setResults(prev => ({ 
          ...prev, 
          mockCronJob: `Mock cron job report sent to ${userEmail || 'default test email'}!
Details:
• Month: ${details.month} ${details.year}
• Total Spent: $${details.totalSpent}
• Subscriptions: ${details.subscriptions}
• Change: ${details.changeFromPreviousMonth}
• Top Category: ${details.topCategory}
• Next Renewal: ${details.nearestRenewal}`
        }));
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to run mock cron job.',
          variant: 'destructive',
        });
        setResults(prev => ({ ...prev, mockCronJob: `Error: ${data.error || 'Unknown error'}` }));
      }
    } catch (error) {
      console.error('Error running mock cron job:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while running the mock cron job.',
        variant: 'destructive',
      });
      setResults(prev => ({ 
        ...prev, 
        mockCronJob: `Error: ${error instanceof Error ? error.message : 'Unexpected error occurred'}` 
      }));
    } finally {
      setLoading(prev => ({ ...prev, mockCronJob: false }));
    }
  };

  const debugDatabaseConnection = async () => {
    try {
      setLoading(prev => ({ ...prev, debugConnection: true }));
      
      // Get the user's email from the input field or use the logged-in user's email
      let userEmail = '';
      
      try {
        const profileResponse = await fetch('/api/auth/profile');
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.success) {
            userEmail = profileData.user.email;
          }
        }
      } catch (error) {
        console.error('Could not fetch profile, proceeding without email', error);
      }
      
      // Call the debug endpoint
      const endpoint = userEmail
        ? `/api/test/debug-db?email=${encodeURIComponent(userEmail)}`
        : '/api/test/debug-db';
        
      console.log('Calling debug endpoint:', endpoint);
      const response = await fetch(endpoint);
      const data = await response.json();
      console.log('Debug API response:', data);
      
      if (data.success) {
        toast({
          title: 'Database Diagnosis',
          description: 'Database connection diagnosis complete. Check results below.',
        });
        
        // Format the results in a readable way
        let resultText = '';
        
        // Database connection
        resultText += `📡 Database Connection: ${data.dbConnection.success ? '✅ Connected' : '❌ Failed'}\n`;
        if (data.dbConnection.version) {
          resultText += `   Version: ${data.dbConnection.version}\n`;
        }
        if (data.dbConnection.models) {
          resultText += `   Available Models: ${data.dbConnection.models.join(', ')}\n`;
        }
        
        // User model
        resultText += `\n👤 User Model: ${data.userModel.success ? '✅ OK' : '❌ Error'}\n`;
        if (data.userModel.hasNotificationPreferences) {
          resultText += `   Has notificationPreferences field: ✅\n`;
        } else if (data.userModel.success) {
          resultText += `   Has notificationPreferences field: ❌\n`;
        }
        
        // Subscription model
        resultText += `\n📆 Subscription Model: ${data.subscriptionModel.success ? '✅ OK' : '❌ Error'}\n`;
        
        // User fetch result
        resultText += `\n🔍 User Fetch: ${data.userFetch.success ? (data.userFetch.found ? '✅ Found' : '⚠️ No users found') : '❌ Error'}\n`;
        if (data.userFetch.success && data.userFetch.found) {
          resultText += `   Email: ${data.userFetch.email}\n`;
          resultText += `   Has name: ${data.userFetch.hasName ? '✅' : '❌'}\n`;
          resultText += `   Has notification preferences: ${data.userFetch.hasNotificationPreferences ? '✅' : '❌'}\n`;
          
          if (data.userFetch.notificationPreferences) {
            resultText += `   Payment reminders: ${data.userFetch.notificationPreferences.paymentReminders ? '✅' : '❌'}\n`;
            resultText += `   Reminder frequency: ${data.userFetch.notificationPreferences.reminderFrequency}\n`;
            resultText += `   Monthly reports: ${data.userFetch.notificationPreferences.monthlyReports ? '✅' : '❌'}\n`;
          }
        }
        
        // Subscription fetch result
        resultText += `\n📝 Subscription Fetch: `;
        if (!data.subscriptionFetch.success) {
          resultText += `❌ Error or Skipped\n`;
          if (data.subscriptionFetch.message) {
            resultText += `   Message: ${data.subscriptionFetch.message}\n`;
          }
        } else if (!data.subscriptionFetch.found) {
          resultText += `⚠️ No subscriptions found\n`;
        } else {
          resultText += `✅ Found ${data.subscriptionFetch.count} subscriptions\n`;
          
          if (data.subscriptionFetch.sampleSubscription) {
            const sample = data.subscriptionFetch.sampleSubscription;
            resultText += `   Sample subscription: ${sample.name}\n`;
            resultText += `   Has amount: ${sample.hasAmount ? '✅' : '❌'}\n`;
            resultText += `   Has nextPaymentDate: ${sample.hasNextPaymentDate ? '✅' : '❌'}\n`;
            resultText += `   Has billingCycle: ${sample.hasBillingCycle ? '✅' : '❌'}\n`;
            resultText += `   Has category: ${sample.hasCategory ? '✅' : '❌'}\n`;
            resultText += `   Properties: ${sample.propertyNames.join(', ')}\n`;
          }
        }
        
        resultText += `\n⏰ Timestamp: ${data.timestamp}`;
        
        setResults(prev => ({ 
          ...prev, 
          debugConnection: resultText
        }));
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to run database diagnosis.',
          variant: 'destructive',
        });
        setResults(prev => ({ 
          ...prev, 
          debugConnection: `Error: ${data.error || 'Unknown error'}`
        }));
      }
    } catch (error) {
      console.error('Error diagnosing database connection:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred during database diagnosis.',
        variant: 'destructive',
      });
      setResults(prev => ({ 
        ...prev, 
        debugConnection: `Error: ${error instanceof Error ? error.message : 'Unexpected error occurred'}` 
      }));
    } finally {
      setLoading(prev => ({ ...prev, debugConnection: false }));
    }
  };

  const runDirectTest = async () => {
    try {
      setLoading(prev => ({ ...prev, directTest: true }));
      
      // Get the user's email from profile
      let userEmail = '';
      let userName = 'Test User';
      
      try {
        const profileResponse = await fetch('/api/auth/profile');
        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          if (profileData.success) {
            userEmail = profileData.user.email;
            userName = profileData.user.name || 'Test User';
          }
        }
      } catch (error) {
        console.error('Could not fetch profile, using default email', error);
      }
      
      // Call the direct test endpoint
      const endpoint = userEmail
        ? `/api/test/monthly-report-direct?email=${encodeURIComponent(userEmail)}&name=${encodeURIComponent(userName)}`
        : '/api/test/monthly-report-direct';
        
      console.log('Calling direct test endpoint:', endpoint);
      const response = await fetch(endpoint);
      const data = await response.json();
      console.log('Direct test API response:', data);
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'Direct test monthly report sent successfully.',
        });
        
        const report = data.report;
        setResults(prev => ({ 
          ...prev, 
          directTest: `Direct monthly report sent to ${report.recipient}!
          
Report details:
• Month: ${report.month} ${report.year}
• Total Spent: $${report.totalSpent}
• Previous Month: $${report.previousMonthSpent}
• Change: ${report.changeFromPreviousMonth}
• Categories: ${report.categoriesCount}
• Top Subscriptions: ${report.topSubscriptionsCount}
• Upcoming Renewals: ${report.upcomingRenewalsCount}`
        }));
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to send direct test report.',
          variant: 'destructive',
        });
        
        let errorDetails = `Error: ${data.error || 'Unknown error'}`;
        if (data.errorDetails) {
          errorDetails += `\nDetails: ${data.errorDetails}`;
        }
        
        setResults(prev => ({ ...prev, directTest: errorDetails }));
      }
    } catch (error) {
      console.error('Error running direct test:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred while running the direct test.',
        variant: 'destructive',
      });
      setResults(prev => ({ 
        ...prev, 
        directTest: `Error: ${error instanceof Error ? error.message : 'Unexpected error occurred'}` 
      }));
    } finally {
      setLoading(prev => ({ ...prev, directTest: false }));
    }
  };

  return (
    <div className="container px-4 sm:px-6 max-w-5xl py-10">
      <h1 className="text-3xl font-bold mb-6">Email Testing Page</h1>
      <p className="text-muted-foreground mb-8">
        Use this page to test the monthly spending report emails and cron job.
      </p>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Monthly Spending Report</CardTitle>
            <CardDescription>
              Send a sample monthly spending report email with mock data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Button 
                onClick={sendSampleReport} 
                disabled={loading.sampleReport}
              >
                {loading.sampleReport ? 'Sending...' : 'Send Sample Report'}
              </Button>
              
              {results.sampleReport && (
                <div className="text-sm p-3 border rounded-md bg-slate-50 dark:bg-slate-900">
                  {results.sampleReport}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Monthly Reports Cron Job</CardTitle>
            <CardDescription>
              Simulate the monthly reports cron job using your actual subscription data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Button 
                onClick={simulateCronJob} 
                disabled={loading.cronSimulation}
                variant="outline"
              >
                {loading.cronSimulation ? 'Simulating...' : 'Simulate Cron Job'}
              </Button>
              
              {results.cronSimulation && (
                <div className="text-sm p-3 border rounded-md bg-slate-50 dark:bg-slate-900">
                  {results.cronSimulation}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Test (No Authentication Required)</CardTitle>
            <CardDescription>
              Test the monthly report email template with current date and mock data without requiring authentication.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Button 
                onClick={sendSimpleTestReport} 
                disabled={loading.simpleTest}
                variant="secondary"
              >
                {loading.simpleTest ? 'Sending...' : 'Send Simple Test Report'}
              </Button>
              
              {results.simpleTest && (
                <div className="text-sm p-3 border rounded-md bg-slate-50 dark:bg-slate-900 whitespace-pre-line">
                  {results.simpleTest}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Mock Cron Job</CardTitle>
            <CardDescription>
              Simulate the cron job with realistic mock subscription data without requiring database access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Button 
                onClick={testMockCronJob} 
                disabled={loading.mockCronJob}
                variant="default"
              >
                {loading.mockCronJob ? 'Processing...' : 'Run Mock Cron Job'}
              </Button>
              
              {results.mockCronJob && (
                <div className="text-sm p-3 border rounded-md bg-slate-50 dark:bg-slate-900 whitespace-pre-line">
                  {results.mockCronJob}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-50 dark:bg-gray-900 border-dashed">
          <CardHeader>
            <CardTitle>Database Connection Diagnosis</CardTitle>
            <CardDescription>
              Diagnose any database connection issues to help troubleshoot the monthly reports cron job.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Button 
                onClick={debugDatabaseConnection} 
                disabled={loading.debugConnection}
                variant="outline"
              >
                {loading.debugConnection ? 'Diagnosing...' : 'Diagnose Database Connection'}
              </Button>
              
              {results.debugConnection && (
                <div className="text-sm p-3 border rounded-md bg-slate-100 dark:bg-slate-800 whitespace-pre-line font-mono">
                  {results.debugConnection}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Direct Email Test</CardTitle>
            <CardDescription>
              Test sending a monthly report directly, completely bypassing database access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <Button 
                onClick={runDirectTest} 
                disabled={loading.directTest}
                variant="default"
                className="bg-blue-600 hover:bg-blue-700"
              >
                {loading.directTest ? 'Sending...' : 'Send Direct Test Email'}
              </Button>
              
              {results.directTest && (
                <div className="text-sm p-3 border rounded-md bg-slate-50 dark:bg-slate-900 whitespace-pre-line">
                  {results.directTest}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />
      
      <h2 className="text-xl font-semibold mb-4">Testing Instructions</h2>
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-medium">1. Test Sample Report</h3>
          <p className="text-muted-foreground">
            The &quot;Send Sample Report&quot; button sends a mock report to the email configured in the test endpoint 
            (you should modify the email in <code>app/api/test/monthly-report/route.ts</code> to use your email).
          </p>
        </div>
        
        <div>
          <h3 className="text-lg font-medium">2. Test Cron Simulation</h3>
          <p className="text-muted-foreground">
            The &quot;Simulate Cron Job&quot; button runs the monthly report cron job logic against your actual 
            subscription data and sends a real report to your email. This uses your account&apos;s data to generate 
            a personalized report.
          </p>
        </div>
        
        <div>
          <h3 className="text-lg font-medium">3. Quick Test Option</h3>
          <p className="text-muted-foreground">
            The &quot;Send Simple Test Report&quot; button tests the email template without requiring 
            database access. This is useful if you&apos;re having authentication issues or just want 
            to quickly test the email format.
          </p>
        </div>
        
        <div>
          <h3 className="text-lg font-medium">4. Mock Cron Job Option</h3>
          <p className="text-muted-foreground">
            The &quot;Run Mock Cron Job&quot; button simulates how the real cron job would work, but uses 
            predefined mock subscription data instead of pulling from the database. This is useful for testing 
            the monthly report with more realistic data when database connectivity is an issue.
          </p>
        </div>
        
        <div>
          <h3 className="text-lg font-medium">5. Test via Direct URL</h3>
          <p className="text-muted-foreground">
            You can also test the monthly report directly by visiting these URLs in your browser:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
            <li>
              <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
                /api/test/monthly-report-simple?email=your-email@example.com
              </span> 
              - Simple test with mock data
            </li>
            <li>
              <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
                /api/test/monthly-report?email=your-email@example.com
              </span> 
              - Test with static mock data
            </li>
            <li>
              <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">
                /api/test/monthly-report-cron-mock?email=your-email@example.com
              </span> 
              - Test with realistic mock subscription data
            </li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-lg font-medium">6. Test UI Settings</h3>
          <p className="text-muted-foreground">
            To test the UI settings for monthly reports, go to the <a href="/dashboard/settings" className="text-blue-500 hover:underline">Settings page</a>,
            find the Monthly Spending Reports toggle, and try enabling/disabling it.
          </p>
        </div>
        
        <div>
          <h3 className="text-lg font-medium">7. Troubleshooting</h3>
          <p className="text-muted-foreground">
            If you encounter issues with the cron job simulation:
          </p>
          <ul className="list-disc pl-6 mt-2 space-y-1 text-sm">
            <li>The original cron job implementation requires the file <code>@/lib/db-connect</code> which might be missing</li>
            <li>Use the &quot;Run Mock Cron Job&quot; button instead, which doesn&apos;t require database connectivity</li>
            <li>Make sure you&apos;re logged in and your session is valid</li>
            <li>Check server logs for detailed error messages</li>
            <li>Try the Simple Test option which doesn&apos;t rely on authentication</li>
            <li>Verify your email sending service (Resend) is properly configured</li>
          </ul>
        </div>
        
        <div>
          <h3 className="text-lg font-medium">8. Database Connection Status</h3>
          <p className="text-muted-foreground mb-2">
            We&apos;ve created a database connection file at <code>lib/db-connect.ts</code> to connect to your MongoDB Atlas database.
            This should allow the original cron job to work with your real data now.
          </p>
          <p className="text-muted-foreground">
            <strong>To test with real data:</strong> Restart your development server with <code>npm run dev</code> and then try
            the &quot;Simulate Cron Job&quot; button again. It should now access your actual subscriptions.
          </p>
          <p className="text-muted-foreground mt-2">
            If the real data cron job still fails, you can continue using the mock version for testing purposes.
          </p>
        </div>
      </div>
    </div>
  );
} 