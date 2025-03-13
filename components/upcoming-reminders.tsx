"use client"

import { useState, useEffect } from "react"
import { CalendarClock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

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

// Calculate days left between today and a given date
const calculateDaysLeft = (dateString: string) => {
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Set to beginning of day
  const paymentDate = new Date(dateString)
  paymentDate.setHours(0, 0, 0, 0) // Set to beginning of day
  const diffTime = paymentDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Calculate next payment date based on billing cycle
const calculateNextPaymentDate = (subscription: Subscription) => {
  const { startDate, billingCycle, nextPayment } = subscription;
  
  // Parse dates
  const start = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  // Check if start date is in the future (for new subscriptions)
  if (start > today) {
    return startDate; // Return the future start date as the next payment
  }
  
  // If nextPayment is already in the future, return it
  const nextPaymentDate = new Date(nextPayment);
  if (nextPaymentDate > today) {
    return nextPayment;
  }
  
  // Calculate new next payment date based on billing cycle
  let newNextPayment = new Date(nextPaymentDate);
  
  while (newNextPayment <= today) {
    switch (billingCycle) {
      case 'Monthly':
        newNextPayment.setMonth(newNextPayment.getMonth() + 1);
        break;
      case 'Yearly':
        newNextPayment.setFullYear(newNextPayment.getFullYear() + 1);
        break;
      case 'Weekly':
        newNextPayment.setDate(newNextPayment.getDate() + 7);
        break;
      case 'Biweekly':
        newNextPayment.setDate(newNextPayment.getDate() + 14);
        break;
      case 'Quarterly':
        newNextPayment.setMonth(newNextPayment.getMonth() + 3);
        break;
      default:
        newNextPayment.setMonth(newNextPayment.getMonth() + 1);
        break;
    }
  }
  
  return newNextPayment.toISOString().split('T')[0];
};

export function UpcomingReminders({ refreshTrigger = 0 }) {
  const { toast } = useToast()
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch subscriptions from the API
  useEffect(() => {
    const fetchSubscriptions = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/subscriptions');
        
        if (!response.ok) {
          throw new Error('Failed to fetch subscriptions');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setSubscriptions(data.subscriptions || []);
        } else {
          throw new Error(data.message || 'Failed to fetch subscriptions');
        }
      } catch (err) {
        console.error('Error fetching subscriptions:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : 'Failed to load subscriptions',
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubscriptions();
  }, [toast, refreshTrigger]);

  // Process subscriptions to create reminders sorted by next payment date
  const reminders = subscriptions
    .map(sub => {
      // Calculate accurate next payment date
      const accurateNextPayment = calculateNextPaymentDate(sub);
      
      return {
        _id: sub._id,
        name: sub.name,
        price: parseFloat(sub.price),
        date: accurateNextPayment,
        daysLeft: calculateDaysLeft(accurateNextPayment),
        originalDate: sub.nextPayment
      };
    })
    // Only include payments for current month
    .filter(reminder => {
      const paymentDate = new Date(reminder.date);
      const today = new Date();
      return paymentDate.getMonth() === today.getMonth() && 
             paymentDate.getFullYear() === today.getFullYear() &&
             paymentDate >= today;
    })
    // Show soonest payments first
    .sort((a, b) => a.daysLeft - b.daysLeft);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const getDaysText = (days: number) => {
    if (days < 0) return `${Math.abs(days)} days ago`
    if (days === 0) return "Today"
    if (days === 1) return "Tomorrow"
    return `In ${days} days`
  }

  if (isLoading) {
    return (
      <div className="flex flex-col space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-10 text-center">
        <p className="text-destructive">Error: {error}</p>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {reminders.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex h-[200px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center"
        >
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <CalendarClock className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No upcoming reminders</h3>
            <p className="mt-2 text-sm text-muted-foreground">You don&apos;t have any upcoming subscription payments.</p>
          </div>
        </motion.div>
      ) : (
        reminders.map((reminder, index) => (
          <motion.div
            key={reminder._id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center">
                  <div
                    className={cn(
                      "flex h-full w-2 flex-shrink-0",
                      reminder.daysLeft === 0
                        ? "bg-orange-500"
                        : reminder.daysLeft <= 3
                          ? "bg-yellow-500"
                          : "bg-green-500"
                    )}
                  />
                  <div className="flex flex-1 items-center justify-between p-4">
                    <div className="grid gap-1">
                      <div className="font-semibold">{reminder.name}</div>
                      <div className="text-sm text-muted-foreground">{formatDate(reminder.date)}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="font-semibold">${reminder.price.toFixed(2)}</div>
                      <div
                        className={cn(
                          "text-xs",
                          reminder.daysLeft === 0
                            ? "text-orange-500"
                            : reminder.daysLeft <= 3
                              ? "text-yellow-500"
                              : "text-green-500"
                        )}
                      >
                        {getDaysText(reminder.daysLeft)}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))
      )}
    </div>
  )
}

