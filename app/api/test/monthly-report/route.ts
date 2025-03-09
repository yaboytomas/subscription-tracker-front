import { NextRequest, NextResponse } from 'next/server';
import { sendMonthlySpendingReport } from '@/lib/email-service';

export async function GET(req: NextRequest) {
  try {
    // Get email from query string or use a default test email
    const userEmail = req.nextUrl.searchParams.get('email') || 'your-email@example.com';
    
    // Sample test data to generate a report
    const user = {
      email: userEmail, // Use the provided email or default
      name: 'Test User'
    };
    
    const reportData = {
      monthName: 'September',
      year: 2023,
      totalSpent: 249.97,
      previousMonthSpent: 230.50,
      categories: [
        { name: 'Entertainment', amount: 89.97, percentage: 36 },
        { name: 'Productivity', amount: 79.99, percentage: 32 },
        { name: 'Utilities', amount: 45.99, percentage: 18 },
        { name: 'Other', amount: 34.02, percentage: 14 }
      ],
      topSubscriptions: [
        { name: 'Netflix', amount: 19.99, category: 'Entertainment' },
        { name: 'Spotify Premium', amount: 14.99, category: 'Entertainment' },
        { name: 'Adobe Creative Cloud', amount: 52.99, category: 'Productivity' },
        { name: 'Microsoft 365', amount: 6.99, category: 'Productivity' }
      ],
      upcomingRenewals: [
        { name: 'Amazon Prime', date: '2023-10-05', amount: 14.99, daysUntil: 5 },
        { name: 'Disney+', date: '2023-10-12', amount: 7.99, daysUntil: 12 },
        { name: 'GitHub Pro', date: '2023-10-15', amount: 4.99, daysUntil: 15 }
      ]
    };
    
    // Send the test report
    await sendMonthlySpendingReport(user, reportData);
    
    return NextResponse.json({ 
      success: true, 
      message: `Test monthly report email sent successfully to ${userEmail}` 
    });
  } catch (error) {
    console.error('Error sending test monthly report:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send test email' },
      { status: 500 }
    );
  }
} 