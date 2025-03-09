import { NextRequest, NextResponse } from 'next/server';
import { sendMonthlySpendingReport } from '@/lib/email-service';

export async function GET(req: NextRequest) {
  try {
    // Get email from query string or use a default test email
    const userEmail = req.nextUrl.searchParams.get('email') || 'your-email@example.com';
    const userName = req.nextUrl.searchParams.get('name') || 'Test User';
    
    // Create a more realistic test report with a variety of data
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    
    const reportData = {
      monthName: currentMonth,
      year: currentYear,
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
        { name: 'Microsoft 365', amount: 6.99, category: 'Productivity' },
        { name: 'AWS', amount: 29.99, category: 'Utilities' }
      ],
      upcomingRenewals: [
        { name: 'Amazon Prime', date: '2023-10-05', amount: 14.99, daysUntil: 5 },
        { name: 'Disney+', date: '2023-10-12', amount: 7.99, daysUntil: 12 },
        { name: 'GitHub Pro', date: '2023-10-15', amount: 4.99, daysUntil: 15 },
        { name: 'Office 365', date: '2023-10-20', amount: 9.99, daysUntil: 20 }
      ]
    };
    
    // Generate month-over-month statistics
    const changeAmount = reportData.totalSpent - reportData.previousMonthSpent;
    const changePercent = (changeAmount / reportData.previousMonthSpent) * 100;
    const changeText = changeAmount >= 0 
      ? `increased by $${changeAmount.toFixed(2)} (${changePercent.toFixed(1)}%)` 
      : `decreased by $${Math.abs(changeAmount).toFixed(2)} (${Math.abs(changePercent).toFixed(1)}%)`;
      
    console.log(`Sending simple test monthly report to ${userEmail}`);
    console.log(`Report shows spending ${changeText} from previous month`);
    
    // Send the test report
    await sendMonthlySpendingReport(
      { email: userEmail, name: userName },
      reportData
    );
    
    return NextResponse.json({ 
      success: true, 
      message: `Test monthly report email sent successfully to ${userEmail}`,
      reportDetails: {
        month: currentMonth,
        year: currentYear,
        totalSpent: reportData.totalSpent,
        changeFromPreviousMonth: changeText
      }
    });
  } catch (error) {
    console.error('Error sending test monthly report:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to send test email' 
      },
      { status: 500 }
    );
  }
} 