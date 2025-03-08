"use client"

import { useState, useEffect } from "react"
import { CalendarClock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

// Define subscription type from API
interface ApiSubscription {
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

// Check if a date is in the current month
const isCurrentMonth = (dateString: string): boolean => {
  const date = new Date(dateString);
  const now = new Date();
  return date.getMonth() === now.getMonth() && 
         date.getFullYear() === now.getFullYear() &&
         date <= now;
};

// Format a date to a standardized string format (YYYY-MM-DD)
const formatDateString = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

// Get the start date of the current month
const getStartOfMonth = (): Date => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
};

export function PastPayments() {
  const { toast } = useToast()
  const [pastPayments, setPastPayments] = useState<PastPayment[]>([])
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
          // Process subscriptions to create past payments for current month only
          const now = new Date();
          const startOfMonth = getStartOfMonth();
          const payments: PastPayment[] = [];
          
          data.subscriptions.forEach((sub: ApiSubscription) => {
            // Determine how many payments to generate for this subscription in the current month
            // based on its billing cycle and start date
            let paymentDates: Date[] = [];
            const subStartDate = new Date(sub.startDate);
            
            switch (sub.billingCycle) {
              case 'Weekly':
                // Generate weekly payments within current month
                for (let date = new Date(startOfMonth); date <= now; date.setDate(date.getDate() + 7)) {
                  if (date >= subStartDate) {
                    paymentDates.push(new Date(date));
                  }
                }
                break;
                
              case 'Biweekly':
                // Generate biweekly payments within current month
                for (let date = new Date(startOfMonth); date <= now; date.setDate(date.getDate() + 14)) {
                  if (date >= subStartDate) {
                    paymentDates.push(new Date(date));
                  }
                }
                break;
                
              case 'Monthly':
                // If subscription day matches a day in the current month before now
                const dayOfMonth = subStartDate.getDate();
                const paymentDate = new Date(now.getFullYear(), now.getMonth(), dayOfMonth);
                if (paymentDate <= now && paymentDate >= startOfMonth) {
                  paymentDates.push(paymentDate);
                }
                break;
                
              case 'Yearly':
                // If yearly subscription anniversary is in current month before now
                if (subStartDate.getMonth() === now.getMonth() && 
                    subStartDate.getDate() <= now.getDate()) {
                  paymentDates.push(new Date(now.getFullYear(), now.getMonth(), subStartDate.getDate()));
                }
                break;
                
              case 'Quarterly':
                // Check if a quarterly payment would fall in current month
                const monthsSinceStart = (now.getFullYear() - subStartDate.getFullYear()) * 12 + 
                                         (now.getMonth() - subStartDate.getMonth());
                if (monthsSinceStart % 3 === 0 && subStartDate.getDate() <= now.getDate()) {
                  paymentDates.push(new Date(now.getFullYear(), now.getMonth(), subStartDate.getDate()));
                }
                break;
                
              default:
                // Default to monthly for unknown billing cycles
                const defaultDate = new Date(now.getFullYear(), now.getMonth(), subStartDate.getDate());
                if (defaultDate <= now && defaultDate >= startOfMonth) {
                  paymentDates.push(defaultDate);
                }
            }
            
            // Create payment objects for all payment dates
            paymentDates.forEach((date, i) => {
              payments.push({
                id: `${sub._id}-${i}`,
                name: sub.name,
                price: parseFloat(sub.price),
                date: formatDateString(date),
                status: 'Paid'
              });
            });
          });
          
          // Sort by date (newest first)
          payments.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
          
          // Final check to ensure all payments are in current month
          const currentMonthPayments = payments.filter(payment => isCurrentMonth(payment.date));
          
          setPastPayments(currentMonthPayments);
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
  }, [toast]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
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
      {pastPayments.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex h-[200px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center"
        >
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <CalendarClock className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No payments this month</h3>
            <p className="mt-2 text-sm text-muted-foreground">You don&apos;t have any subscription payments for the current month.</p>
          </div>
        </motion.div>
      ) : (
        pastPayments.map((payment, index) => (
          <motion.div
            key={payment.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ 
              delay: index * 0.1,
              type: "spring", 
              stiffness: 300, 
              damping: 10 
            }}
          >
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex items-center">
                  <div className="flex h-full w-2 flex-shrink-0 bg-green-500" />
                  <div className="flex flex-1 items-center justify-between p-4">
                    <div className="grid gap-1">
                      <div className="font-semibold">{payment.name}</div>
                      <div className="text-sm text-muted-foreground">{formatDate(payment.date)}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <div className="font-semibold">${payment.price.toFixed(2)}</div>
                      <div className="text-xs text-green-500">{payment.status}</div>
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