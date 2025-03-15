"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, PieChart as PieChartIcon, CalendarClock, CreditCard, DollarSign, LineChart as LineChartIcon, TrendingUp, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from "framer-motion"
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  ReferenceLine
} from "recharts"
import { useTheme } from "next-themes"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { useRef } from "react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

// Define subscription type
interface Subscription {
  _id: string;
  name: string;
  price: string;
  billingCycle: string;
  nextPayment: string;
  category: string;
  startDate: string;
  description: string;
  userId: string;
}

// Define colors for the charts
const CHART_COLORS = [
  "#8884d8", "#83a6ed", "#8dd1e1", "#82ca9d", "#a4de6c",
  "#d0ed57", "#ffc658", "#ff8042", "#ff6b6b", "#bc5090"
];

// Month names for the charts
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Animation variants - simplified for better performance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2 }
  }
};

const itemVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.2 }
  }
};

export default function AnalyticsPage() {
  const { toast } = useToast()
  const { theme } = useTheme()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("spending")
  const [isMobile, setIsMobile] = useState(false)
  
  // Detect if we're on mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  // For generating spending trend data
  const [spendingHistory, setSpendingHistory] = useState<any[]>([])
  
  // Current month for reference line
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  // Fetch subscriptions data
  useEffect(() => {
    const fetchSubscriptions = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/subscriptions')
        
        if (!response.ok) {
          throw new Error('Failed to fetch subscriptions')
        }
        
        const data = await response.json()
        
        if (data.success) {
          setSubscriptions(data.subscriptions || [])
          setIsLoading(false);
        } else {
          throw new Error(data.message || 'Failed to fetch subscriptions')
        }
      } catch (err) {
        console.error('Error fetching subscriptions:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : 'Failed to load subscriptions',
          variant: "destructive",
        })
        setIsLoading(false);
      }
    }
    
    fetchSubscriptions()
  }, [toast])
  
  // Generate spending history data for the line chart
  useEffect(() => {
    if (subscriptions.length > 0) {
      try {
        // Generate data for all months of the current year
        const data = [];
        for (let i = 0; i < 12; i++) {
          // For months in the past (up to current month)
          const isPastMonth = i <= currentMonth;
          
          // Calculate spending for this month based on actual subscriptions
          let monthlyTotal = 0;
          
          if (isPastMonth) {
            // For past months, calculate based on subscriptions that would have been active
            subscriptions.forEach(sub => {
              try {
                const startDate = new Date(sub.startDate);
                // Check if subscription was active in this month of current year
                if (startDate <= new Date(currentYear, i, 28)) {
                  monthlyTotal += getMonthlyPrice(sub);
                }
              } catch (err) {
                console.error("Error processing subscription:", err);
                // Skip this subscription but continue processing others
              }
            });
          } else {
            // For future months, use current subscriptions
            monthlyTotal = subscriptions.reduce((acc, sub) => {
              try {
                return acc + getMonthlyPrice(sub);
              } catch (err) {
                console.error("Error getting monthly price:", err);
                return acc;
              }
            }, 0);
          }
          
          data.push({
            name: MONTHS[i],
            month: i + 1, // 1-indexed month for sorting
            year: currentYear,
            amount: parseFloat(monthlyTotal.toFixed(2))
          });
        }
        
        setSpendingHistory(data);
      } catch (err) {
        console.error("Error generating spending history:", err);
        // Set empty data to prevent crashes
        setSpendingHistory([]);
      }
    }
  }, [subscriptions, currentMonth, currentYear]);

  // Calculate monthly spending
  const monthlySpending = subscriptions.reduce((total, sub) => {
    const price = parseFloat(sub.price);
    if (sub.billingCycle === "Monthly") {
      return total + price;
    } else if (sub.billingCycle === "Yearly") {
      return total + price / 12;
    } else if (sub.billingCycle === "Weekly") {
      return total + (price * 4.33); // Average weeks in a month
    } else if (sub.billingCycle === "Quarterly") {
      return total + (price / 3);
    } else if (sub.billingCycle === "Biweekly") {
      return total + (price * 2.17); // Average biweekly periods in a month
    }
    return total;
  }, 0);

  // Calculate yearly spending
  const yearlySpending = subscriptions.reduce((total, sub) => {
    const price = parseFloat(sub.price);
    if (sub.billingCycle === "Monthly") {
      return total + price * 12;
    } else if (sub.billingCycle === "Yearly") {
      return total + price;
    } else if (sub.billingCycle === "Weekly") {
      return total + (price * 52);
    } else if (sub.billingCycle === "Quarterly") {
      return total + (price * 4);
    } else if (sub.billingCycle === "Biweekly") {
      return total + (price * 26);
    }
    return total;
  }, 0);

  // Calculate average subscription cost
  const averageSubscriptionCost = subscriptions.length > 0 
    ? monthlySpending / subscriptions.length 
    : 0;

  // Group subscriptions by category
  const categoryBreakdown = subscriptions.reduce<Record<string, number>>((acc, sub) => {
    const category = sub.category || "Uncategorized";
    const monthlyPrice = getMonthlyPrice(sub);
    
    acc[category] = (acc[category] || 0) + monthlyPrice;
    return acc;
  }, {});
  
  // Format category data for the pie chart
  const categoryPieData = Object.entries(categoryBreakdown).map(([name, value], index) => ({
    name,
    value: parseFloat(value.toFixed(2)),
    color: CHART_COLORS[index % CHART_COLORS.length]
  }));

  // Group subscriptions by billing cycle
  const billingCycleBreakdown = subscriptions.reduce<Record<string, number>>((acc, sub) => {
    const cycle = sub.billingCycle;
    acc[cycle] = (acc[cycle] || 0) + 1;
    return acc;
  }, {});

  // Find most expensive subscription
  const mostExpensiveSubscription = subscriptions.length > 0
    ? [...subscriptions].sort((a, b) => getMonthlyPrice(b) - getMonthlyPrice(a))[0]
    : null;

  // Find subscription ending soonest
  const subscriptionEndingSoonest = subscriptions.length > 0
    ? [...subscriptions].sort((a, b) => new Date(a.nextPayment).getTime() - new Date(b.nextPayment).getTime())[0]
    : null;

  // Helper function to calculate monthly price based on billing cycle
  function getMonthlyPrice(subscription: Subscription): number {
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

  // Helper to format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Helper to format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Get next payment date
  const getNextPaymentDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    
    // If date is in the past, adjust it to future
    if (date < today) {
      // This is simplified, in reality should check billing cycle
      date.setMonth(date.getMonth() + 1);
    }
    
    return formatDate(date.toISOString());
  };

  // Calculate days until next payment
  const getDaysUntil = (dateString: string): number => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
  
  // Custom tooltip for the line chart
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card border rounded-md p-2 shadow-sm">
          <p className="text-sm font-medium">{`${label} ${payload[0].payload.year}`}</p>
          <p className="text-sm">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  // Helper function to calculate remaining days in the billing cycle
  const calculateRemainingDays = (nextPayment: string, billingCycle: string): number => {
    const today = new Date();
    const paymentDate = new Date(nextPayment);
    const diffDays = Math.ceil((paymentDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate total days in billing cycle
    let cycleDays = 30; // Default to monthly
    
    switch(billingCycle.toLowerCase()) {
      case 'weekly':
        cycleDays = 7;
        break;
      case 'biweekly':
        cycleDays = 14;
        break;
      case 'monthly':
        cycleDays = 30;
        break;
      case 'quarterly':
        cycleDays = 90;
        break;
      case 'yearly':
        cycleDays = 365;
        break;
    }
    
    return diffDays > 0 ? diffDays : cycleDays + diffDays;
  };

  if (isLoading) {
    return (
      <div className="container px-4 sm:px-6 max-w-5xl py-6 md:py-8 space-y-6 md:space-y-8">
        <div className="bg-card border border-border shadow-sm rounded-lg p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics</h1>
          </div>
          <p className="text-sm md:text-base text-muted-foreground pl-10 md:pl-12">Loading your subscription analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container px-4 sm:px-6 max-w-5xl py-6 md:py-8 space-y-6 md:space-y-8">
        <div className="bg-card border border-border shadow-sm rounded-lg p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics</h1>
          </div>
          <p className="text-sm md:text-base text-muted-foreground pl-10 md:pl-12">Error: {error}</p>
          <Button 
            variant="outline" 
            className="mt-4 ml-10 md:ml-12"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container px-4 sm:px-6 max-w-5xl py-6 md:py-8 space-y-6 md:space-y-8">
      {/* Header Section */}
      <div className="bg-card border border-border shadow-sm rounded-lg p-4 md:p-6 mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Analytics</h1>
        </div>
        <p className="text-sm md:text-base text-muted-foreground pl-10 md:pl-12">Comprehensive insights about your subscription spending and usage patterns.</p>
      </div>

      {/* Key Metrics Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <HoverCard>
          <HoverCardTrigger asChild>
            <div className="cursor-pointer">
              <Card className="border border-border shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    Monthly Spending
                    <DollarSign className="h-4 w-4 text-primary" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatCurrency(monthlySpending)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(yearlySpending)} per year
                  </p>
                </CardContent>
              </Card>
            </div>
          </HoverCardTrigger>
          <HoverCardContent side="bottom" align="start" className="w-80 p-0">
            <div className="p-4 border-b">
              <div className="font-semibold mb-1">Monthly Spending Details</div>
              <div className="text-sm text-muted-foreground">Breakdown of your monthly subscription costs</div>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-muted-foreground">Monthly Total</div>
                  <div className="font-medium">{formatCurrency(monthlySpending)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Yearly Total</div>
                  <div className="font-medium">{formatCurrency(yearlySpending)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Daily Average</div>
                  <div className="font-medium">{formatCurrency(monthlySpending / 30)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Weekly Average</div>
                  <div className="font-medium">{formatCurrency(monthlySpending / 4.33)}</div>
                </div>
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Top 3 Expenses</div>
                {subscriptions
                  .sort((a, b) => getMonthlyPrice(b) - getMonthlyPrice(a))
                  .slice(0, 3)
                  .map((sub, i) => (
                    <div key={i} className="flex justify-between text-sm py-1">
                      <span>{sub.name}</span>
                      <span className="font-medium">{formatCurrency(getMonthlyPrice(sub))}</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>

        <HoverCard>
          <HoverCardTrigger asChild>
            <div className="cursor-pointer">
              <Card className="border border-border shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    Total Subscriptions
                    <CreditCard className="h-4 w-4 text-primary" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{subscriptions.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(averageSubscriptionCost)} avg cost per service
                  </p>
                </CardContent>
              </Card>
            </div>
          </HoverCardTrigger>
          <HoverCardContent side="bottom" align="start" className="w-80 p-0">
            <div className="p-4 border-b">
              <div className="font-semibold mb-1">Subscription Metrics</div>
              <div className="text-sm text-muted-foreground">Overview of your subscription services</div>
            </div>
            <div className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="text-xs text-muted-foreground">Total Services</div>
                  <div className="font-medium">{subscriptions.length}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Average Cost</div>
                  <div className="font-medium">{formatCurrency(averageSubscriptionCost)}</div>
                </div>
                {Object.entries(billingCycleBreakdown).length > 0 && (
                  <div className="col-span-2">
                    <div className="text-xs text-muted-foreground mb-1">Billing Frequency</div>
                    <div className="grid grid-cols-2 gap-1">
                      {Object.entries(billingCycleBreakdown)
                        .sort(([, countA], [, countB]) => countB - countA)
                        .map(([cycle, count], i) => (
                          <div key={i} className="flex justify-between text-sm">
                            <span>{cycle}</span>
                            <span className="font-medium">{count}</span>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-1">
                <div className="text-xs text-muted-foreground">Categories</div>
                {Object.entries(categoryBreakdown)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 3)
                  .map(([category, amount], i) => (
                    <div key={i} className="flex justify-between text-sm py-1">
                      <span>{category}</span>
                      <span className="font-medium">{subscriptions.filter(sub => (sub.category || "Uncategorized") === category).length} services</span>
                    </div>
                  ))
                }
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>

        <HoverCard>
          <HoverCardTrigger asChild>
            <div className="cursor-pointer">
              <Card className="border border-border shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02]">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center justify-between">
                    Next Payment
                    <CalendarClock className="h-4 w-4 text-primary" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {subscriptionEndingSoonest ? (
                    <>
                      <div className="text-2xl font-bold">{formatDate(subscriptionEndingSoonest.nextPayment)}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {subscriptionEndingSoonest.name} - {formatCurrency(parseFloat(subscriptionEndingSoonest.price))}
                      </p>
                    </>
                  ) : (
                    <div className="text-lg">No upcoming payments</div>
                  )}
                </CardContent>
              </Card>
            </div>
          </HoverCardTrigger>
          <HoverCardContent side="bottom" align="start" className="w-80 p-0">
            <div className="p-4 border-b">
              <div className="font-semibold mb-1">Upcoming Payments</div>
              <div className="text-sm text-muted-foreground">The next 5 subscription payments due</div>
            </div>
            <div className="p-4 space-y-3">
              {subscriptions
                .sort((a, b) => new Date(a.nextPayment).getTime() - new Date(b.nextPayment).getTime())
                .slice(0, 5)
                .map((sub, i) => (
                  <div key={i} className="flex justify-between items-center py-1 border-b border-border last:border-0">
                    <div>
                      <div className="font-medium">{sub.name}</div>
                      <div className="text-xs text-muted-foreground">Due in {getDaysUntil(sub.nextPayment)} days</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(parseFloat(sub.price))}</div>
                      <div className="text-xs text-muted-foreground">{formatDate(sub.nextPayment)}</div>
                    </div>
                  </div>
                ))
              }
              {subscriptions.length === 0 && (
                <div className="text-center py-2 text-muted-foreground">
                  No upcoming payments scheduled
                </div>
              )}
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>

      {/* Tabs for different analytics views */}
      <Card className="border border-border shadow-sm overflow-hidden">
        <CardHeader className="pb-3 md:pb-4 border-b bg-primary/5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <Tabs defaultValue="spending" onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-3 w-full">
                <TabsTrigger value="spending">
                  <div className="flex items-center">
                    <DollarSign className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Spending Analysis</span>
                    <span className="inline sm:hidden ml-1 text-xs">Spending</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="breakdown">
                  <div className="flex items-center">
                    <PieChartIcon className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Category Breakdown</span>
                    <span className="inline sm:hidden ml-1 text-xs">Categories</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="trends">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Spending Trends</span>
                    <span className="inline sm:hidden ml-1 text-xs">Trends</span>
                  </div>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="pt-4 md:pt-6 px-4 md:px-6 pb-4 md:pb-6">
          {activeTab === "spending" && (
            <div className="space-y-4 md:space-y-6">
              <div className="flex flex-col space-y-1 md:space-y-2">
                <h3 className="text-base md:text-lg font-semibold">Monthly Spending Breakdown</h3>
                <p className="text-xs md:text-sm text-muted-foreground">Your subscription costs shown as monthly figures.</p>
              </div>

              {/* Spending visualization - simple for now */}
              <div className="bg-background rounded-md p-3 md:p-4 border">
                <div className="space-y-4">
                  {Object.entries(categoryBreakdown)
                    .sort(([, a], [, b]) => b - a)
                    .map(([category, amount], index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span>{category}</span>
                          <span className="font-medium">{formatCurrency(amount)}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                          <div 
                            className="bg-primary h-full rounded-full" 
                            style={{ width: `${(amount / monthlySpending) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </div>

              {/* Key insights */}
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <div className="cursor-pointer h-full">
                      <Card className="bg-muted/50 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] hover:shadow-md h-full">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium flex items-center justify-between">
                            Highest Expense
                            <ArrowUpRight className="h-4 w-4 text-primary" />
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          {mostExpensiveSubscription ? (
                            <div className="flex justify-between items-center">
                              <div>
                                <div className="font-semibold">{mostExpensiveSubscription.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {mostExpensiveSubscription.billingCycle} - {formatCurrency(parseFloat(mostExpensiveSubscription.price))}
                                </div>
                              </div>
                              <div className="flex items-center text-primary">
                                <ArrowUpRight className="h-4 w-4 mr-1" />
                                <span className="text-sm font-medium">
                                  {((getMonthlyPrice(mostExpensiveSubscription) / monthlySpending) * 100).toFixed(0)}%
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div className="text-sm">No subscription data</div>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80 p-0">
                    <div className="p-4 border-b">
                      <div className="font-semibold mb-1">Expense Analysis</div>
                      <div className="text-sm text-muted-foreground">Your highest subscription costs and their impact</div>
                    </div>
                    <div className="p-4 space-y-4">
                      {mostExpensiveSubscription && (
                        <>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-sm font-medium">{mostExpensiveSubscription.name}</span>
                              <span className="text-sm font-bold">{formatCurrency(parseFloat(mostExpensiveSubscription.price))}</span>
                            </div>
                            <div className="text-xs text-muted-foreground flex justify-between">
                              <span>Percentage of monthly budget</span>
                              <span>{((getMonthlyPrice(mostExpensiveSubscription) / monthlySpending) * 100).toFixed(1)}%</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                              <div 
                                className="bg-primary h-full rounded-full" 
                                style={{ 
                                  width: `${(getMonthlyPrice(mostExpensiveSubscription) / monthlySpending) * 100}%` 
                                }}
                              ></div>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-2 pt-1">
                            <div>
                              <div className="text-xs text-muted-foreground">Monthly Cost</div>
                              <div className="font-medium">{formatCurrency(getMonthlyPrice(mostExpensiveSubscription))}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Yearly Cost</div>
                              <div className="font-medium">
                                {formatCurrency(mostExpensiveSubscription.billingCycle === "Yearly" 
                                  ? parseFloat(mostExpensiveSubscription.price) 
                                  : getMonthlyPrice(mostExpensiveSubscription) * 12)}
                              </div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Next Payment</div>
                              <div className="font-medium">{formatDate(mostExpensiveSubscription.nextPayment)}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Category</div>
                              <div className="font-medium">{mostExpensiveSubscription.category || "Uncategorized"}</div>
                            </div>
                          </div>

                          <div className="text-xs text-muted-foreground pt-2">
                            <div className="font-medium text-sm mb-1">Cost-Saving Tip</div>
                            <p>
                              This subscription represents a significant portion of your monthly budget. 
                              {mostExpensiveSubscription.billingCycle === "Monthly" 
                                ? " Consider looking for annual payment options which often come with discounts."
                                : " Review if all features are being utilized to ensure you're getting full value."}
                            </p>
                          </div>
                        </>
                      )}
                    </div>
                  </HoverCardContent>
                </HoverCard>

                <HoverCard>
                  <HoverCardTrigger asChild>
                    <div className="cursor-pointer h-full">
                      <Card className="bg-muted/50 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] hover:shadow-md h-full">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">Subscription Frequency</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-1">
                            {Object.entries(billingCycleBreakdown)
                              .sort(([, countA], [, countB]) => countB - countA)
                              .map(([cycle, count], index) => (
                                <div key={index} className="flex justify-between text-xs">
                                  <span>{cycle}</span>
                                  <span className="font-medium text-xs">{count} subscription{count !== 1 ? 's' : ''}</span>
                                </div>
                              ))
                            }
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80 p-0">
                    <div className="p-4 border-b">
                      <div className="font-semibold mb-1">Billing Cycle Distribution</div>
                      <div className="text-sm text-muted-foreground">How your subscriptions are distributed across different billing periods</div>
                    </div>
                    <div className="p-4 space-y-4">
                      {/* Visualize billing cycle distribution as a chart */}
                      <div className="space-y-3">
                        {Object.entries(billingCycleBreakdown).map(([cycle, count], index) => (
                          <div key={index} className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium">{cycle}</span>
                              <span className="font-medium">{count} ({((count / subscriptions.length) * 100).toFixed(0)}%)</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                              <div 
                                className="bg-primary h-full rounded-full" 
                                style={{ 
                                  width: `${(count / subscriptions.length) * 100}%`,
                                  opacity: 0.7 + (0.3 * (index / Object.keys(billingCycleBreakdown).length))
                                }}
                              ></div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Billing cycle cost analysis */}
                      <div className="space-y-2 pt-1">
                        <div className="text-xs text-muted-foreground font-medium">Cost by Billing Cycle</div>
                        {Object.entries(billingCycleBreakdown).map(([cycle, _], index) => {
                          const cycleSubscriptions = subscriptions.filter(sub => sub.billingCycle === cycle);
                          const monthlyCost = cycleSubscriptions.reduce((sum, sub) => sum + getMonthlyPrice(sub), 0);
                          return (
                            <div key={index} className="flex justify-between text-xs">
                              <span>{cycle}</span>
                              <span className="font-medium">{formatCurrency(monthlyCost)}/month</span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Optimization tip */}
                      <div className="text-xs text-muted-foreground pt-2 border-t">
                        <div className="font-medium text-sm mt-2 mb-1">Billing Cycle Tips</div>
                        <p>
                          {billingCycleBreakdown["Monthly"] > billingCycleBreakdown["Yearly"] 
                            ? "Consider converting some monthly subscriptions to yearly plans to potentially save 10-20% on total costs."
                            : "You're doing well with annual subscriptions, which typically offer better value than monthly plans."}
                        </p>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </div>
          )}

          {activeTab === "breakdown" && (
            <div className="space-y-6">
              <div className="flex flex-col space-y-1 md:space-y-2">
                <h3 className="text-base md:text-lg font-semibold">Category Distribution ({new Date().getFullYear()})</h3>
                <p className="text-xs md:text-sm text-muted-foreground">How your current subscriptions are distributed across categories.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category distribution pie chart */}
                <div className="bg-background rounded-md p-3 md:p-4 border h-64 md:h-72">
                  {categoryPieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                        <Pie
                          data={categoryPieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={isMobile ? 40 : 60}
                          outerRadius={isMobile ? 60 : 80}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) => {
                            if (isMobile) {
                              return percent > 0.1 ? `${(percent * 100).toFixed(0)}%` : '';
                            } else {
                              return `${name} (${(percent * 100).toFixed(0)}%)`;
                            }
                          }}
                          labelLine={!isMobile}
                        >
                          {categoryPieData.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={entry.color} 
                              stroke={theme === 'dark' ? '#1a1a1a' : '#ffffff'} 
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-card border rounded-md p-2 shadow-sm">
                                  <p className="text-sm font-medium">{data.name}</p>
                                  <p className="text-sm">{formatCurrency(data.value)}</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No category data available</p>
                    </div>
                  )}
                </div>

                {/* Category breakdown list - in the breakdown tab */}
                <div className="space-y-3">
                  {Object.entries(categoryBreakdown)
                    .sort(([, a], [, b]) => b - a)
                    .map(([category, amount], index) => (
                      <HoverCard key={index}>
                        <HoverCardTrigger asChild>
                          <div
                            className="bg-muted/50 rounded-md p-3 flex justify-between items-center hover:bg-muted/70 transition-colors cursor-pointer"
                          >
                            <div>
                              <div className="font-medium">{category}</div>
                              <div className="text-xs text-muted-foreground">
                                {((amount / monthlySpending) * 100).toFixed(1)}% of total
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{formatCurrency(amount)}</div>
                              <div className="text-xs text-muted-foreground">monthly</div>
                            </div>
                          </div>
                        </HoverCardTrigger>
                        <HoverCardContent side="right" className="w-80 p-0">
                          <div className="p-4 border-b">
                            <div className="font-semibold mb-1">{category} Subscriptions</div>
                            <div className="text-sm text-muted-foreground">All subscriptions in this category</div>
                          </div>
                          <div className="p-2 max-h-[300px] overflow-y-auto">
                            {subscriptions
                              .filter(sub => (sub.category || "Uncategorized") === category)
                              .map((sub, i) => (
                                <div key={i} className="p-2 hover:bg-muted rounded-md">
                                  <div className="flex justify-between items-center">
                                    <div className="font-medium">{sub.name}</div>
                                    <div className="font-medium">{formatCurrency(parseFloat(sub.price))}</div>
                                  </div>
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <div>{sub.billingCycle}</div>
                                    <div>Next: {formatDate(sub.nextPayment)}</div>
                                  </div>
                                </div>
                              ))
                            }
                            {subscriptions.filter(sub => (sub.category || "Uncategorized") === category).length === 0 && (
                              <div className="p-2 text-center text-sm text-muted-foreground">
                                No subscriptions found in this category
                              </div>
                            )}
                          </div>
                        </HoverCardContent>
                      </HoverCard>
                    ))
                  }
                </div>
              </div>

              {/* Recommendations based on category spending */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center">
                    <LineChartIcon className="h-4 w-4 mr-2 text-primary" />
                    Spending Optimization Opportunities
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    {Object.entries(categoryBreakdown)
                      .sort(([, a], [, b]) => b - a)
                      .slice(0, 1)
                      .map(([category, amount], index) => (
                        <div 
                          key={index} 
                          className="p-3 bg-muted/30 rounded-md"
                        >
                          <p className="font-medium mb-1">Consider reviewing your {category.toLowerCase()} subscriptions</p>
                          <p className="text-muted-foreground">You're spending {formatCurrency(amount)} monthly on {category.toLowerCase()} services, which is {((amount / monthlySpending) * 100).toFixed(0)}% of your total subscription budget.</p>
                        </div>
                      ))
                    }
                    {billingCycleBreakdown["Monthly"] > 3 && (
                      <div 
                        className="p-3 bg-muted/30 rounded-md"
                      >
                        <p className="font-medium mb-1">Consider annual subscriptions</p>
                        <p className="text-muted-foreground">You have {billingCycleBreakdown["Monthly"]} monthly subscriptions. Switching some to annual billing could save you money.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "trends" && (
            <div className="space-y-6">
              <div className="flex flex-col space-y-1 md:space-y-2">
                <h3 className="text-base md:text-lg font-semibold">Subscription Trends ({new Date().getFullYear()})</h3>
                <p className="text-xs md:text-sm text-muted-foreground">Your subscription spending throughout the current year.</p>
              </div>

              {/* Spending trend line chart */}
              <div className="bg-background rounded-md p-3 md:p-4 border h-64 md:h-72">
                {spendingHistory.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    {(() => {
                      try {
                        return (
                          <LineChart
                            data={spendingHistory}
                            margin={{
                              top: 5,
                              right: 20,
                              left: isMobile ? 10 : 20,
                              bottom: 20,
                            }}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#333' : '#eee'} />
                            <XAxis 
                              dataKey="name" 
                              tick={{ fontSize: isMobile ? 10 : 12 }} 
                              stroke={theme === 'dark' ? '#aaa' : '#666'} 
                              height={isMobile ? 30 : 40}
                              angle={isMobile ? -45 : 0}
                              tickMargin={isMobile ? 10 : 5}
                            />
                            <YAxis 
                              tick={{ fontSize: isMobile ? 10 : 12 }}
                              stroke={theme === 'dark' ? '#aaa' : '#666'}
                              tickFormatter={(value) => `$${value}`}
                              width={isMobile ? 40 : 60}
                            />
                            <Tooltip content={<CustomTooltip />} />
                            <Line
                              type="monotone"
                              dataKey="amount"
                              stroke="#8884d8"
                              strokeWidth={2}
                              dot={{ r: 4 }}
                              activeDot={{ r: 8 }}
                            />
                            {/* Add reference line for current month */}
                            {currentMonth >= 0 && currentMonth < 12 && (
                              <ReferenceLine
                                x={MONTHS[currentMonth]}
                                stroke="#ff4081"
                                strokeWidth={2}
                                strokeDasharray="3 3"
                                label={{
                                  value: "Current",
                                  position: "insideTopRight",
                                  fill: "#ff4081",
                                  fontSize: 12
                                }}
                              />
                            )}
                          </LineChart>
                        );
                      } catch (err) {
                        console.error("Error rendering line chart:", err);
                        return (
                          <div className="flex items-center justify-center h-full">
                            <p className="text-destructive">Error rendering chart</p>
                          </div>
                        );
                      }
                    })()}
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No trend data available</p>
                  </div>
                )}
              </div>

              {/* Upcoming payments */}
              <div className="flex flex-col space-y-1 md:space-y-2 mt-4 md:mt-6">
                <h3 className="text-base md:text-lg font-semibold">Upcoming Payments</h3>
                <p className="text-xs md:text-sm text-muted-foreground">Payments due in the next 30 days.</p>
              </div>

              <div className="space-y-3">
                {subscriptions
                  .filter(sub => getDaysUntil(sub.nextPayment) <= 30)
                  .sort((a, b) => new Date(a.nextPayment).getTime() - new Date(b.nextPayment).getTime())
                  .map((sub, index) => (
                    <HoverCard key={index}>
                      <HoverCardTrigger asChild>
                        <div
                          className="bg-muted/50 rounded-md p-3 flex justify-between items-center hover:bg-muted/70 transition-colors cursor-pointer"
                        >
                          <div>
                            <div className="font-medium">{sub.name}</div>
                            <div className="text-xs text-muted-foreground">
                              Due in {getDaysUntil(sub.nextPayment)} days
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{formatCurrency(parseFloat(sub.price))}</div>
                            <div className="text-xs text-muted-foreground">{formatDate(sub.nextPayment)}</div>
                          </div>
                        </div>
                      </HoverCardTrigger>
                      <HoverCardContent side="right" className="w-80 p-0">
                        <div className="p-4 border-b">
                          <div className="font-semibold mb-1">{sub.name}</div>
                          <div className="text-sm text-muted-foreground">{sub.category || "Uncategorized"} Subscription</div>
                        </div>
                        <div className="p-4 space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <div className="text-xs text-muted-foreground">Price</div>
                              <div className="font-medium">{formatCurrency(parseFloat(sub.price))}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Billing Cycle</div>
                              <div className="font-medium">{sub.billingCycle}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Next Payment</div>
                              <div className="font-medium">{formatDate(sub.nextPayment)}</div>
                            </div>
                            <div>
                              <div className="text-xs text-muted-foreground">Days Left</div>
                              <div className="font-medium">{getDaysUntil(sub.nextPayment)} days</div>
                            </div>
                          </div>
                          
                          {/* Payment progress bar */}
                          <div className="space-y-1">
                            <div className="text-xs text-muted-foreground flex justify-between">
                              <span>Payment Cycle Progress</span>
                              <span>{getDaysUntil(sub.nextPayment)} days left</span>
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                              <div 
                                className="bg-primary h-full rounded-full" 
                                style={{ 
                                  width: `${(1 - (getDaysUntil(sub.nextPayment) / (sub.billingCycle === "Monthly" ? 30 : sub.billingCycle === "Yearly" ? 365 : sub.billingCycle === "Weekly" ? 7 : sub.billingCycle === "Biweekly" ? 14 : 90))) * 100}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                          
                          {sub.description && (
                            <div>
                              <div className="text-xs text-muted-foreground">Description</div>
                              <div className="text-sm">{sub.description}</div>
                            </div>
                          )}
                        </div>
                      </HoverCardContent>
                    </HoverCard>
                  ))
                }
                {subscriptions.filter(sub => getDaysUntil(sub.nextPayment) <= 30).length === 0 && (
                  <div className="text-center p-8 border border-dashed rounded-lg">
                    <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No payments due in the next 30 days</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 