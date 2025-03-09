import { NextRequest, NextResponse } from 'next/server';
import { sendMonthlySpendingReport } from '@/lib/email-service';

// Helper functions from the original cron job
function getMonthlyPrice(subscription: any): number {
  const amount = parseFloat(subscription.amount);
  
  switch (subscription.billingCycle) {
    case 'Monthly':
      return amount;
    case 'Yearly':
      return amount / 12;
    case 'Weekly':
      return amount * 4.33; // Average weeks in a month
    case 'Quarterly':
      return amount / 3;
    case 'Biweekly':
      return amount * 2.17; // Average bi-weeks in a month
    default:
      return amount;
  }
}

function getDaysUntil(dateString: string): number {
  const today = new Date();
  const targetDate = new Date(dateString);
  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export async function GET(req: NextRequest) {
  try {
    // Get email from query string or use a default test email
    const userEmail = req.nextUrl.searchParams.get('email') || 'your-email@example.com';
    const userName = req.nextUrl.searchParams.get('name') || 'Test User';
    
    console.log(`Running mock cron job simulation for ${userEmail}`);
    
    // Create mock subscriptions - these would normally come from the database
    const mockSubscriptions = [
      {
        name: 'Netflix',
        amount: '19.99',
        billingCycle: 'Monthly',
        category: 'Entertainment',
        nextPaymentDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 3 days from now
      },
      {
        name: 'Spotify Premium',
        amount: '14.99',
        billingCycle: 'Monthly',
        category: 'Entertainment',
        nextPaymentDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 10 days from now
      },
      {
        name: 'Adobe Creative Cloud',
        amount: '599.88',
        billingCycle: 'Yearly',
        category: 'Productivity',
        nextPaymentDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 45 days from now
      },
      {
        name: 'Microsoft 365',
        amount: '6.99',
        billingCycle: 'Monthly',
        category: 'Productivity',
        nextPaymentDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 15 days from now
      },
      {
        name: 'Amazon Prime',
        amount: '139.99',
        billingCycle: 'Yearly',
        category: 'Shopping',
        nextPaymentDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 5 days from now
      },
      {
        name: 'Disney+',
        amount: '7.99',
        billingCycle: 'Monthly',
        category: 'Entertainment',
        nextPaymentDate: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 12 days from now
      },
      {
        name: 'HBO Max',
        amount: '15.99',
        billingCycle: 'Monthly',
        category: 'Entertainment',
        nextPaymentDate: new Date(Date.now() + 22 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 22 days from now
      },
      {
        name: 'AWS',
        amount: '45.67',
        billingCycle: 'Monthly',
        category: 'Utilities',
        nextPaymentDate: new Date(Date.now() + 18 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 18 days from now
      }
    ];

    console.log(`Processing ${mockSubscriptions.length} mock subscriptions`);
    
    // Calculate current month's spending
    const totalSpent = mockSubscriptions.reduce((total, sub) => total + getMonthlyPrice(sub), 0);
    
    // Simulate previous month's spending (random variation between -10% and +10%)
    const variation = Math.random() * 0.2 - 0.1; // Between -0.1 and 0.1
    const previousMonthSpent = totalSpent * (1 + variation);
    
    // Group subscriptions by category
    const categoryMap = new Map<string, number>();
    
    mockSubscriptions.forEach(sub => {
      const category = sub.category || 'Uncategorized';
      const monthlyPrice = getMonthlyPrice(sub);
      categoryMap.set(category, (categoryMap.get(category) || 0) + monthlyPrice);
    });
    
    // Create categories array
    const categories = Array.from(categoryMap.entries()).map(([name, amount]) => ({
      name,
      amount,
      percentage: Math.round((amount / totalSpent) * 100)
    }));
    
    // Sort subscriptions by price (highest first)
    const sortedSubscriptions = [...mockSubscriptions].sort((a, b) => 
      getMonthlyPrice(b) - getMonthlyPrice(a)
    );
    
    // Get top subscriptions (up to 5)
    const topSubscriptions = sortedSubscriptions.slice(0, 5).map(sub => ({
      name: sub.name,
      amount: getMonthlyPrice(sub),
      category: sub.category || 'Uncategorized'
    }));
    
    // Get upcoming renewals in the next 30 days
    const upcomingRenewals = mockSubscriptions
      .filter(sub => {
        const daysUntil = getDaysUntil(sub.nextPaymentDate);
        return daysUntil >= 0 && daysUntil <= 30;
      })
      .map(sub => ({
        name: sub.name,
        date: sub.nextPaymentDate,
        amount: parseFloat(sub.amount),
        daysUntil: getDaysUntil(sub.nextPaymentDate)
      }))
      .sort((a, b) => a.daysUntil - b.daysUntil)
      .slice(0, 5);
    
    const currentDate = new Date();
    const currentMonth = currentDate.toLocaleString('default', { month: 'long' });
    const currentYear = currentDate.getFullYear();
    
    // Prepare the report data
    const reportData = {
      monthName: currentMonth,
      year: currentYear,
      totalSpent: totalSpent,
      previousMonthSpent: previousMonthSpent,
      categories: categories,
      topSubscriptions: topSubscriptions,
      upcomingRenewals: upcomingRenewals
    };
    
    console.log(`Sending mock cron job report to ${userEmail}`);
    
    // Send the monthly report
    await sendMonthlySpendingReport(
      { email: userEmail, name: userName },
      reportData
    );
    
    // Calculate change text for the response
    const changeAmount = totalSpent - previousMonthSpent;
    const changePercent = (changeAmount / previousMonthSpent) * 100;
    const changeText = changeAmount >= 0 
      ? `increased by $${changeAmount.toFixed(2)} (${changePercent.toFixed(1)}%)` 
      : `decreased by $${Math.abs(changeAmount).toFixed(2)} (${Math.abs(changePercent).toFixed(1)}%)`;
    
    return NextResponse.json({
      success: true,
      message: `Mock cron job simulation complete. Sent report to ${userEmail}`,
      reportDetails: {
        subscriptions: mockSubscriptions.length,
        totalSpent: totalSpent.toFixed(2),
        month: currentMonth,
        year: currentYear,
        changeFromPreviousMonth: changeText,
        topCategory: categories.sort((a, b) => b.amount - a.amount)[0]?.name || 'None',
        nearestRenewal: upcomingRenewals[0] ? `${upcomingRenewals[0].name} in ${upcomingRenewals[0].daysUntil} days` : 'None'
      }
    });
  } catch (error) {
    console.error('Mock cron job simulation failed:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to simulate cron job' 
      },
      { status: 500 }
    );
  }
} 