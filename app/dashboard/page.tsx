"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SubscriptionList } from "@/components/subscription-list"
import { UpcomingReminders } from "@/components/upcoming-reminders"
import { SubscriptionStats } from "@/components/subscription-stats"
import { SubscriptionsSection } from "@/components/subscriptions-section"
import { Button } from "@/components/ui/button"
import { 
  BarChart3, 
  CreditCard, 
  CalendarClock, 
  DollarSign, 
  PlusCircle, 
  TrendingUp, 
  ArrowUpRight, 
  Clock, 
  Bell
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"

export default function DashboardPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null)
  const [greeting, setGreeting] = useState("Hello")
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [subscriptions, setSubscriptions] = useState<any[]>([])
  const [totalMonthlySpending, setTotalMonthlySpending] = useState(0)
  const [upcomingPayments, setUpcomingPayments] = useState<any[]>([])
  
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  // Calculate monthly price based on billing cycle
  const getMonthlyPrice = (subscription: any): number => {
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

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  };

  // Calculate days until payment
  const getDaysUntil = (dateString: string): number => {
    const date = new Date(dateString);
    const today = new Date();
    const diffTime = date.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };
  
  // Fetch subscription data
  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        // Add cache-busting timestamp to avoid cached responses
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/subscriptions?_t=${timestamp}`, {
          // Add cache: 'no-store' to prevent caching
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch subscriptions')
        }
        
        const data = await response.json()
        console.log('Dashboard - Fetched subscription data:', data);
        
        if (data.success) {
          const subs = data.subscriptions || [];
          console.log(`Dashboard - Displaying ${subs.length} subscriptions`);
          setSubscriptions(subs);
          
          // Calculate monthly spending
          const monthlyTotal = subs.reduce((total: number, sub: any) => {
            return total + getMonthlyPrice(sub);
          }, 0);
          setTotalMonthlySpending(monthlyTotal);
          
          // Get upcoming payments
          const upcoming = subs
            .filter((sub: any) => {
              const paymentDate = new Date(sub.nextPayment);
              const today = new Date();
              return paymentDate >= today;
            })
            .sort((a: any, b: any) => new Date(a.nextPayment).getTime() - new Date(b.nextPayment).getTime());
          setUpcomingPayments(upcoming);
        }
      } catch (error) {
        console.error('Error fetching subscriptions:', error);
      }
    };
    
    if (isAuthenticated) {
      fetchSubscriptions();
    }
  }, [isAuthenticated, refreshTrigger]);
  
  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        
        if (!response.ok) {
          // Not authenticated, redirect to login
          router.push('/login')
          return
        }
        
        const data = await response.json()
        setUser(data.user)
        setIsAuthenticated(true)
        
        // Set greeting based on time of day
        const hour = new Date().getHours()
        if (hour < 12) setGreeting("Good morning")
        else if (hour < 18) setGreeting("Good afternoon")
        else setGreeting("Good evening")
        
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [router])
  
  if (loading) {
    return (
      <div className="container px-4 sm:px-6 w-full max-w-full md:max-w-7xl py-8 space-y-8">
        <div className="bg-card border border-border shadow-sm rounded-lg p-6 mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-primary/10 p-2 rounded-full">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          </div>
          <p className="text-muted-foreground pl-12">Loading your subscription data...</p>
        </div>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return null // This prevents any flicker of content before redirect
  }

  return (
    <div className="container px-4 sm:px-6 w-full max-w-full md:max-w-7xl py-8 space-y-8">
      {/* Header Section */}
      <div className="bg-card border border-border shadow-sm rounded-lg p-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{greeting}, {user?.name?.split(' ')[0] || 'there'}!</h1>
        </div>
        <p className="text-muted-foreground pl-12">Welcome to your subscription dashboard. Here's an overview of your subscription services.</p>
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
                  <div className="text-2xl font-bold">{formatCurrency(totalMonthlySpending)}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(totalMonthlySpending * 12)} per year
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
                  <div className="font-medium">{formatCurrency(totalMonthlySpending)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Yearly Total</div>
                  <div className="font-medium">{formatCurrency(totalMonthlySpending * 12)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Daily Average</div>
                  <div className="font-medium">{formatCurrency(totalMonthlySpending / 30)}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Weekly Average</div>
                  <div className="font-medium">{formatCurrency(totalMonthlySpending / 4.33)}</div>
                </div>
              </div>
              
              <div className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                <Button 
                  variant="link" 
                  className="p-0 h-auto text-xs text-primary"
                  onClick={() => router.push('/dashboard/analytics')}
                >
                  View detailed spending analytics →
                </Button>
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
                    Active Subscriptions
                    <CreditCard className="h-4 w-4 text-primary" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{subscriptions.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {formatCurrency(totalMonthlySpending / (subscriptions.length || 1))} avg per service
                  </p>
                </CardContent>
              </Card>
            </div>
          </HoverCardTrigger>
          <HoverCardContent side="bottom" align="start" className="w-80 p-0">
            <div className="p-4 border-b">
              <div className="font-semibold mb-1">Subscription Management</div>
              <div className="text-sm text-muted-foreground">Quick access to your subscription services</div>
            </div>
            <div className="p-4 space-y-3">
              <Button 
                className="w-full mb-2"
                onClick={() => router.push('/dashboard/subscriptions/new')}
              >
                <PlusCircle className="h-4 w-4 mr-2" />
                Add New Subscription
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => router.push('/dashboard/subscriptions')}
              >
                <CreditCard className="h-4 w-4 mr-2" />
                Manage Subscriptions
              </Button>
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
                  {upcomingPayments.length > 0 ? (
                    <>
                      <div className="text-2xl font-bold">
                        {formatCurrency(parseFloat(upcomingPayments[0]?.price))}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(upcomingPayments[0]?.nextPayment)} - {upcomingPayments[0]?.name}
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
              <div className="text-sm text-muted-foreground">Your subscription payments for this month</div>
            </div>
            <div className="p-4 space-y-3">
              {upcomingPayments.slice(0, 3).map((payment, index) => (
                <div key={index} className="flex justify-between items-center py-1 border-b border-border last:border-0">
                  <div>
                    <div className="font-medium">{payment.name}</div>
                    <div className="text-xs text-muted-foreground">In {getDaysUntil(payment.nextPayment)} days</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(parseFloat(payment.price))}</div>
                    <div className="text-xs text-muted-foreground">{formatDate(payment.nextPayment)}</div>
                  </div>
                </div>
              ))}
              
              <Button 
                variant="outline" 
                className="w-full text-xs"
                onClick={() => router.push('/dashboard/reminders')}
              >
                <Bell className="h-3 w-3 mr-2" />
                View All Reminders
              </Button>
            </div>
          </HoverCardContent>
        </HoverCard>
      </div>

      {/* Main Content Tabs */}
      <Card className="border border-border shadow-sm">
        <Tabs defaultValue="overview" className="w-full">
          <CardHeader className="pb-2 border-b">
            <TabsList className="grid grid-cols-2 w-full md:w-auto">
              <TabsTrigger value="overview">
                <div className="flex items-center">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Overview
                </div>
              </TabsTrigger>
              <TabsTrigger value="activity">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Recent Activity
                </div>
              </TabsTrigger>
            </TabsList>
          </CardHeader>
          
          <CardContent className="pt-6">
            <TabsContent value="overview">
              <div className="space-y-6">
                {/* Subscription Stats */}
                <SubscriptionStats refreshTrigger={refreshTrigger} />
                
                {/* Recent Subscriptions */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Recent Subscriptions</h3>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => router.push('/dashboard/subscriptions')}
                    >
                      View All
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {subscriptions.slice(0, 4).map((subscription, index) => (
                      <Card key={index} className="bg-muted/50 transition-all duration-300 transform hover:-translate-y-1 hover:scale-[1.02] hover:shadow-md cursor-pointer" onClick={() => router.push(`/dashboard/subscriptions/${subscription._id}`)}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="font-semibold">{subscription.name}</div>
                              <div className="text-xs text-muted-foreground">
                                {subscription.billingCycle} - Next: {formatDate(subscription.nextPayment)}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="font-medium">{formatCurrency(parseFloat(subscription.price))}</div>
                              <div className="text-xs text-muted-foreground">{subscription.category || "Uncategorized"}</div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="activity">
              <div className="space-y-6">
                {/* Upcoming Reminders */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Upcoming Payments</h3>
                  <div className="space-y-3">
                    {upcomingPayments.slice(0, 5).map((payment, index) => (
                      <div
                        key={index} 
                        className="bg-muted/50 rounded-md p-3 flex justify-between items-center hover:bg-muted/70 transition-colors cursor-pointer"
                        onClick={() => router.push(`/dashboard/subscriptions/${payment._id}`)}
                      >
                        <div>
                          <div className="font-medium">{payment.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Due in {getDaysUntil(payment.nextPayment)} days
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(parseFloat(payment.price))}</div>
                          <div className="text-xs text-muted-foreground">{formatDate(payment.nextPayment)}</div>
                        </div>
                      </div>
                    ))}
                    
                    {upcomingPayments.length === 0 && (
                      <div className="text-center p-8 border border-dashed rounded-lg">
                        <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No upcoming payments this month</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                  <Button 
                    variant="outline" 
                    className="bg-card hover:bg-muted"
                    onClick={() => router.push('/dashboard/subscriptions/new')}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Subscription
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-card hover:bg-muted"
                    onClick={() => router.push('/dashboard/analytics')}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                  <Button 
                    variant="outline" 
                    className="bg-card hover:bg-muted"
                    onClick={() => router.push('/dashboard/reminders')}
                  >
                    <Bell className="h-4 w-4 mr-2" />
                    Manage Reminders
                  </Button>
                </div>
              </div>
            </TabsContent>
          </CardContent>
        </Tabs>
      </Card>
    </div>
  )
}

