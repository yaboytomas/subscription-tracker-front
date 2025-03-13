"use client"

import { useState, useEffect } from "react"
// Only import basic components
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Calendar } from "lucide-react"

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

interface PastPayment {
  id: string;
  name: string;
  price: number;
  date: string;
  status: string;
}

interface UpcomingPayment {
  id: string;
  name: string;
  price: number;
  date: string;
}

interface IntermediatePayment {
  id: string;
  name: string;
  price: number;
  date: Date;
}

// Function to calculate next payment date based on start date and billing cycle
const calculateNextPaymentDate = (startDate: string, billingCycle: string): Date => {
  const now = new Date()
  const start = new Date(startDate)
  let nextPaymentDate = new Date(start)
  
  // Ensure we're working with a valid date
  if (isNaN(nextPaymentDate.getTime())) {
    return now // Default to current date if invalid
  }

  // If the subscription start date is in the future, that's the next payment
  if (nextPaymentDate > now) {
    return nextPaymentDate
  }
  
  // Calculate next payment based on billing cycle
  switch (billingCycle.toLowerCase()) {
    case 'weekly':
      // Find the next weekly payment from start date that's in the future
      while (nextPaymentDate <= now) {
        nextPaymentDate.setDate(nextPaymentDate.getDate() + 7)
      }
      break
      
    case 'biweekly':
      // Find the next biweekly payment from start date that's in the future
      while (nextPaymentDate <= now) {
        nextPaymentDate.setDate(nextPaymentDate.getDate() + 14)
      }
      break
      
    case 'monthly':
      // Find the next monthly payment date
      while (nextPaymentDate <= now) {
        // Move to the same day in the next month
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1)
      }
      break
      
    case 'quarterly':
      // Find the next quarterly payment date
      while (nextPaymentDate <= now) {
        // Move to the same day 3 months later
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 3)
      }
      break
      
    case 'yearly':
      // Find the next yearly payment date
      while (nextPaymentDate <= now) {
        // Move to the same day in the next year
        nextPaymentDate.setFullYear(nextPaymentDate.getFullYear() + 1)
      }
      break
      
    default:
      // Default to monthly if billing cycle not recognized
      while (nextPaymentDate <= now) {
        nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1)
      }
      break
  }
  
  return nextPaymentDate
}

export default function RemindersPage() {
  const [activeTab, setActiveTab] = useState('upcoming')
  const [currentMonthPayments, setCurrentMonthPayments] = useState<PastPayment[]>([])
  const [upcomingReminders, setUpcomingReminders] = useState<UpcomingPayment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Function to get real subscription data
  useEffect(() => {
    // Get current date info
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    const fetchSubscriptions = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        // Fetch real subscription data from the API
        const response = await fetch('/api/subscriptions')
        
        if (!response.ok) {
          throw new Error('Failed to fetch subscriptions')
        }
        
        const data = await response.json()
        
        if (!data.success) {
          throw new Error(data.message || 'Failed to fetch subscriptions')
        }
        
        const subscriptions: Subscription[] = data.subscriptions || []
        
        // Calculate past payments for the current month
        const formattedPastPayments = subscriptions
          .map(subscription => {
            const paymentDate = new Date(subscription.startDate);
            if (paymentDate.getMonth() === currentMonth && 
                paymentDate.getFullYear() === currentYear &&
                paymentDate <= now) {
              return {
                id: subscription._id,
                name: subscription.name,
                price: parseFloat(subscription.price || '0'),
                date: paymentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
                status: "Paid"
              } as PastPayment;
            }
            return null;
          })
          .filter((payment): payment is PastPayment => payment !== null)
          .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        
        setCurrentMonthPayments(formattedPastPayments);
        
        // Calculate upcoming payments
        const upcoming = subscriptions
          .map(subscription => {
            const nextPaymentDate = calculateNextPaymentDate(
              subscription.startDate, 
              subscription.billingCycle
            );
            
            const today = new Date();
            
            if (nextPaymentDate.getMonth() === today.getMonth() && 
                nextPaymentDate.getFullYear() === today.getFullYear() &&
                nextPaymentDate >= today) {
              return {
                id: subscription._id,
                name: subscription.name,
                price: parseFloat(subscription.price || '0'),
                date: nextPaymentDate
              } as IntermediatePayment;
            }
            return null;
          })
          .filter((payment): payment is IntermediatePayment => payment !== null)
          .sort((a, b) => a.date.getTime() - b.date.getTime())
          .map(payment => ({
            id: payment.id,
            name: payment.name,
            price: payment.price,
            date: payment.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          }));
        
        setUpcomingReminders(upcoming);
      } catch (err) {
        console.error('Error fetching subscriptions:', err)
        setError(err instanceof Error ? err.message : 'An error occurred while fetching your subscriptions')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSubscriptions()
  }, [])

  return (
    <div className="container max-w-5xl py-8 space-y-8">
      {/* Header - Using styling from subscriptions page */}
      <div className="bg-card border border-border shadow-sm rounded-lg p-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Reminders</h1>
        </div>
        <p className="text-muted-foreground pl-12">Track your upcoming subscription payments and never miss a renewal.</p>
      </div>

      {/* Loading and error states */}
      {isLoading ? (
        <div className="border rounded-lg p-6 text-center">
          <p>Loading your subscriptions...</p>
        </div>
      ) : error ? (
        <div className="border rounded-lg p-6 text-center">
          <p className="text-destructive">{error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      ) : (
        /* Content with Card styling from subscriptions page */
        <Card className="border border-border shadow-sm overflow-hidden">
          <CardHeader className="pb-4 border-b bg-primary/5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                <div>
                  <CardTitle>Payment Reminders</CardTitle>
                  <CardDescription>Track your past and upcoming subscription payments.</CardDescription>
                </div>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant={activeTab === 'upcoming' ? "default" : "outline"}
                  onClick={() => setActiveTab('upcoming')}
                  className={activeTab !== 'upcoming' ? "border-primary/20 hover:bg-primary/5 hover:border-primary/30 transition-colors" : ""}
                >
                  Upcoming
                </Button>
                <Button
                  variant={activeTab === 'past' ? "default" : "outline"}
                  onClick={() => setActiveTab('past')}
                  className={activeTab !== 'past' ? "border-primary/20 hover:bg-primary/5 hover:border-primary/30 transition-colors" : ""}
                >
                  Past
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="pt-6 px-6 pb-6">
              {activeTab === 'upcoming' ? (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Upcoming Reminders</h2>
                  {upcomingReminders.length > 0 ? (
                    <div className="space-y-2">
                      {upcomingReminders.map(reminder => (
                        <div key={reminder.id} className="border p-4 rounded-md flex justify-between items-center hover:bg-muted/50 transition-colors">
                          <div>
                            <p className="font-medium">{reminder.name}</p>
                            <p className="text-sm text-muted-foreground">{reminder.date}</p>
                          </div>
                          <p className="font-medium">${reminder.price.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 border border-dashed rounded-lg">
                      <p className="text-muted-foreground">No upcoming payments this month.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-semibold mb-4">Past Payments (Current Month)</h2>
                  {currentMonthPayments.length > 0 ? (
                    <div className="space-y-2">
                      {currentMonthPayments.map(payment => (
                        <div key={payment.id} className="border p-4 rounded-md flex justify-between items-center hover:bg-muted/50 transition-colors">
                          <div>
                            <p className="font-medium">{payment.name}</p>
                            <p className="text-sm text-muted-foreground">{payment.date}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">${payment.price.toFixed(2)}</p>
                            <p className="text-xs text-green-500">{payment.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center p-8 border border-dashed rounded-lg">
                      <p className="text-muted-foreground">No payments recorded for the current month.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

