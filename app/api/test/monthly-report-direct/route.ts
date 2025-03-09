import { NextRequest, NextResponse } from 'next/server';
import { sendMonthlySpendingReport } from '@/lib/email-service';

export async function GET(req: NextRequest) {
  try {
    // Get email from query string or use a default test email
    const userEmail = req.nextUrl.searchParams.get('email') || 'your-email@example.com';
    const userName = req.nextUrl.searchParams.get('name') || 'Test User';
    
    console.log(`Running direct monthly report test for ${userEmail}`);
    
    // Create a sample report with diversified data
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    
    // Create comprehensive sample data
    const totalSpent = 257.85;
    const previousMonthSpent = 243.50;
    const changeAmount = totalSpent - previousMonthSpent;
    const changePercent = (changeAmount / previousMonthSpent) * 100;
    
    // Categories with realistic distribution
    const categories = [
      { name: 'Entertainment', amount: 92.97, percentage: 36 },
      { name: 'Productivity', amount: 85.99, percentage: 33 },
      { name: 'Utilities', amount: 45.99, percentage: 18 },
      { name: 'Shopping', amount: 32.90, percentage: 13 }
    ];
    
    // Top subscriptions with realistic data
    const topSubscriptions = [
      { name: 'Netflix Premium', amount: 19.99, category: 'Entertainment' },
      { name: 'Adobe Creative Cloud', amount: 54.99, category: 'Productivity' },
      { name: 'AWS', amount: 45.99, category: 'Utilities' },
      { name: 'Spotify Family', amount: 16.99, category: 'Entertainment' },
      { name: 'Microsoft 365', amount: 9.99, category: 'Productivity' }
    ];
    
    // Upcoming renewals with realistic dates and amounts
    const upcomingRenewals = [
      { 
        name: 'Amazon Prime', 
        date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
        amount: 14.99, 
        daysUntil: 5 
      },
      { 
        name: 'Disney+', 
        date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
        amount: 7.99, 
        daysUntil: 12 
      },
      { 
        name: 'GitHub Pro', 
        date: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
        amount: 4.99, 
        daysUntil: 18 
      }
    ];
    
    // Prepare the report data
    const reportData = {
      monthName: currentMonth,
      year: currentYear,
      totalSpent,
      previousMonthSpent,
      categories,
      topSubscriptions,
      upcomingRenewals
    };
    
    // Calculate change text for the response
    const changeText = changeAmount >= 0 
      ? `increased by $${changeAmount.toFixed(2)} (${changePercent.toFixed(1)}%)` 
      : `decreased by $${Math.abs(changeAmount).toFixed(2)} (${Math.abs(changePercent).toFixed(1)}%)`;
    
    console.log(`Sending direct monthly report to ${userEmail} for ${currentMonth} ${currentYear}`);
    console.log(`Report shows spending ${changeText} from previous month`);
    
    try {
      // Send the monthly report
      await sendMonthlySpendingReport(
        { email: userEmail, name: userName },
        reportData
      );
      
      console.log(`Successfully sent monthly report to ${userEmail}`);
      
      return NextResponse.json({
        success: true,
        message: `Direct monthly report email sent successfully to ${userEmail}`,
        report: {
          recipient: userEmail,
          month: currentMonth,
          year: currentYear,
          totalSpent: totalSpent.toFixed(2),
          previousMonthSpent: previousMonthSpent.toFixed(2),
          changeFromPreviousMonth: changeText,
          categoriesCount: categories.length,
          topSubscriptionsCount: topSubscriptions.length,
          upcomingRenewalsCount: upcomingRenewals.length
        }
      });
    } catch (emailError) {
      console.error('Error sending monthly report email:', emailError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to send email',
          errorDetails: emailError instanceof Error ? emailError.message : 'Unknown error',
          reportData: reportData // Include the data for debugging
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Direct monthly report test failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : '') : undefined
      },
      { status: 500 }
    );
  }
} 