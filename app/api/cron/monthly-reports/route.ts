import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Subscription from '@/models/Subscription';
import { sendMonthlySpendingReport } from '@/lib/email-service';

// Function to calculate monthly price based on billing cycle
function getMonthlyPrice(subscription: any): number {
  const price = parseFloat(subscription.price);
  if (subscription.billingCycle === "Monthly") {
    return price;
  } else if (subscription.billingCycle === "Yearly") {
    return price / 12;
  } else if (subscription.billingCycle === "Weekly") {
    return price * 4.33;
  } else if (subscription.billingCycle === "Quarterly") {
    return price / 3;
  } else if (subscription.billingCycle === "Biweekly") {
    return price * 2.17;
  }
  return price;
}

// Calculates days until payment
function getDaysUntil(dateString: string): number {
  const date = new Date(dateString);
  const today = new Date();
  const diffTime = date.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays > 0 ? diffDays : 0;
}

// Format date string
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}

export async function GET(req: NextRequest) {
  // Simple authorization check using header
  const authHeader = req.headers.get('Authorization');
  const expectedToken = `Bearer ${process.env.CRON_SECRET_KEY}`;
  
  if (authHeader !== expectedToken) {
    console.log('Unauthorized access attempt to monthly reports');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    console.log('Monthly reports cron job started');
    await dbConnect();
    
    // This should run on the 1st of each month
    // Let's get the current month and previous month for reporting
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    
    // Previous month (adjust year if needed)
    const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const previousMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
    
    // Get month names
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    // Month name for the report (which is the previous month)
    const reportMonthName = monthNames[previousMonth];
    const reportYear = previousMonthYear;
    
    // Get all users with monthly reports enabled
    const users = await User.find({
      'notificationPreferences.monthlyReports': true
    });
    
    console.log(`Found ${users.length} users with monthly reports enabled`);
    
    let emailsSent = 0;
    let errors = 0;
    
    // Process each user
    for (const user of users) {
      try {
        // Get user's subscriptions
        const subscriptions = await Subscription.find({ userId: user._id });
        
        if (subscriptions.length === 0) {
          console.log(`Skipping monthly report for ${user.email} - no subscriptions found`);
          continue;
        }
        
        // Calculate current month's spending
        const currentMonthSpending = subscriptions.reduce((total, sub) => {
          return total + getMonthlyPrice(sub);
        }, 0);
        
        // For demonstration, use 95% of current month as previous month's spending
        // In a real system, you would have historical payment data to calculate this accurately
        const previousMonthSpending = currentMonthSpending * 0.95;
        
        // Calculate category breakdown
        const categories: Record<string, number> = {};
        
        subscriptions.forEach(sub => {
          const category = sub.category || "Uncategorized";
          const monthlyPrice = getMonthlyPrice(sub);
          categories[category] = (categories[category] || 0) + monthlyPrice;
        });
        
        // Format category data for the report
        const categoryData = Object.entries(categories).map(([name, amount]) => ({
          name,
          amount,
          percentage: (amount / currentMonthSpending) * 100
        })).sort((a, b) => b.amount - a.amount);
        
        // Get top 3 subscriptions by price
        const topSubscriptions = [...subscriptions]
          .sort((a, b) => getMonthlyPrice(b) - getMonthlyPrice(a))
          .slice(0, 3)
          .map(sub => ({
            name: sub.name,
            amount: getMonthlyPrice(sub),
            category: sub.category || "Uncategorized"
          }));
        
        // Get upcoming renewals in the next 30 days
        const nextMonth = new Date();
        nextMonth.setDate(nextMonth.getDate() + 30);
        
        const upcomingRenewals = subscriptions
          .filter(sub => {
            const nextPayment = new Date(sub.nextPayment);
            return nextPayment >= today && nextPayment <= nextMonth;
          })
          .sort((a, b) => new Date(a.nextPayment).getTime() - new Date(b.nextPayment).getTime())
          .slice(0, 5)
          .map(sub => ({
            name: sub.name,
            date: formatDate(sub.nextPayment),
            amount: parseFloat(sub.price),
            daysUntil: getDaysUntil(sub.nextPayment)
          }));
        
        // Send the monthly report
        await sendMonthlySpendingReport(
          { email: user.email, name: user.name },
          {
            monthName: reportMonthName,
            year: reportYear,
            totalSpent: currentMonthSpending,
            previousMonthSpent: previousMonthSpending,
            categories: categoryData,
            topSubscriptions,
            upcomingRenewals
          }
        );
        
        emailsSent++;
        console.log(`Monthly report sent to ${user.email} for ${reportMonthName} ${reportYear}`);
      } catch (err) {
        errors++;
        console.error(`Error processing monthly report for user ${user._id}:`, err);
      }
    }
    
    return NextResponse.json({
      success: true,
      summary: {
        total: users.length,
        emailsSent,
        errors
      },
      message: `Processed ${users.length} users, sent ${emailsSent} monthly reports, encountered ${errors} errors`
    });
  } catch (error) {
    console.error('Error processing monthly reports:', error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Internal server error' 
    }, { status: 500 });
  }
} 