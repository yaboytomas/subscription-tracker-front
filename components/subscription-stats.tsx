"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarClock, CreditCard, DollarSign, ArrowLeft } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SpendingGraph } from "@/components/spending-graph"
import { motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"

// Calculate days left until a payment date
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

const dialogItemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  hover: {
    backgroundColor: "hsl(var(--accent))",
    transition: {
      duration: 0.1
    }
  }
}

export function SubscriptionStats({ refreshTrigger = 0 }) {
  const router = useRouter()
  const { toast } = useToast()
  const [openDialog, setOpenDialog] = useState<string | null>(null)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
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

  // Get upcoming payments (current month only)
  const upcomingPayments = subscriptions
    .map(sub => {
      // Calculate accurate next payment date
      const accurateNextPayment = calculateNextPaymentDate(sub);
      const daysLeft = calculateDaysLeft(accurateNextPayment);
      
      return {
        ...sub,
        accurateNextPayment,
        daysLeft
      };
    })
    // Only include payments for current month
    .filter(sub => {
      const paymentDate = new Date(sub.accurateNextPayment);
      const today = new Date();
      return paymentDate.getMonth() === today.getMonth() && 
             paymentDate.getFullYear() === today.getFullYear() &&
             sub.daysLeft >= 0;
    })
    // Sort by days left (soonest first)
    .sort((a, b) => a.daysLeft - b.daysLeft);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const calculateAnnualCost = (subscription: Subscription | null) => {
    if (!subscription) return 0;
    const price = parseFloat(subscription.price);
    
    if (subscription.billingCycle === "Yearly") {
      return price;
    } else if (subscription.billingCycle === "Monthly") {
      return price * 12;
    } else if (subscription.billingCycle === "Weekly") {
      return price * 52;
    } else if (subscription.billingCycle === "Quarterly") {
      return price * 4;
    } else if (subscription.billingCycle === "Biweekly") {
      return price * 26;
    }
    return price;
  }

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 w-full">
        <div className="grid gap-4 md:grid-cols-3 w-full">
          {[1, 2, 3].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                delay: i * 0.1,
                duration: 0.5
              }}
            >
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    <motion.div 
                      className="h-4 w-24 bg-gray-200 rounded"
                      initial={{ opacity: 0.5 }}
                      animate={{ opacity: [0.5, 0.8, 0.5] }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                    />
                  </CardTitle>
                  <motion.div 
                    className="h-4 w-4 bg-gray-200 rounded-full"
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: [0.5, 0.8, 0.5] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.2
                    }}
                  />
                </CardHeader>
                <CardContent>
                  <motion.div 
                    className="h-8 w-16 bg-gray-200 rounded mb-2"
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: [0.5, 0.9, 0.5] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.3
                    }}
                  />
                  <motion.div 
                    className="h-3 w-28 bg-gray-200 rounded"
                    initial={{ opacity: 0.5 }}
                    animate={{ opacity: [0.5, 0.7, 0.5] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.4
                    }}
                  />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4 w-full">
        <SpendingGraph refreshTrigger={refreshTrigger} />
        <div className="grid gap-4 md:grid-cols-3 w-full">
          <motion.div
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 10,
              delay: 0.1
            }}
          >
            <Card className="cursor-pointer transition-all hover:shadow-md" onClick={() => setOpenDialog("subscriptions")}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <motion.div 
                  className="text-2xl font-bold"
                  initial={{ scale: 0.7 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    delay: 0.2
                  }}
                >
                  {subscriptions.length}
                </motion.div>
                <p className="text-xs text-muted-foreground">Active subscription services</p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 10,
              delay: 0.2
            }}
          >
            <Card className="cursor-pointer transition-all hover:shadow-md" onClick={() => setOpenDialog("payments")}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Payments</CardTitle>
                <CalendarClock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <motion.div 
                  className="text-2xl font-bold"
                  initial={{ scale: 0.7 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    delay: 0.3
                  }}
                >
                  {upcomingPayments.length}
                </motion.div>
                <p className="text-xs text-muted-foreground">Payments due this month</p>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 10,
              delay: 0.3
            }}
          >
            <Card className="cursor-pointer transition-all hover:shadow-md" onClick={() => setOpenDialog("spending")}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Monthly Spending</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <motion.div 
                  className="text-2xl font-bold"
                  initial={{ scale: 0.7 }}
                  animate={{ scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    delay: 0.4
                  }}
                >
                  ${monthlySpending.toFixed(2)}
                </motion.div>
                <p className="text-xs text-muted-foreground">${(monthlySpending * 12).toFixed(2)} per year</p>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      {/* Subscriptions Dialog */}
      <Dialog open={openDialog === "subscriptions"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              All Subscriptions
            </DialogTitle>
            <DialogDescription>You have {subscriptions.length} active subscriptions.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {subscriptions.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-muted-foreground">You don't have any subscriptions yet.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setOpenDialog(null);
                    router.push("/dashboard/subscriptions");
                  }}
                >
                  Add Your First Subscription
                </Button>
              </div>
            ) : (
              <div className="space-y-4 pr-4">
                {subscriptions.map((sub, index) => (
                  <motion.div
                    key={sub._id}
                    variants={dialogItemVariants}
                    initial="hidden"
                    animate="show"
                    whileHover="hover"
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between rounded-lg border p-3 cursor-pointer"
                    onClick={() => setSelectedSubscription(sub)}
                  >
                    <div>
                      <div className="font-medium">{sub.name}</div>
                      <div className="text-sm text-muted-foreground">{sub.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${parseFloat(sub.price).toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">{sub.billingCycle}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </ScrollArea>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setOpenDialog(null)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setOpenDialog(null)
                router.push("/dashboard/subscriptions")
              }}
            >
              View All Subscriptions
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Monthly Spending Dialog */}
      <Dialog open={openDialog === "spending"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Monthly Spending
            </DialogTitle>
            <DialogDescription>Your estimated monthly spending on subscriptions.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {subscriptions.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-muted-foreground">You don't have any subscriptions yet.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setOpenDialog(null);
                    router.push("/dashboard/subscriptions");
                  }}
                >
                  Add Your First Subscription
                </Button>
              </div>
            ) : (
              <div className="space-y-4 pr-4">
                {subscriptions.map((sub, index) => (
                  <motion.div
                    key={sub._id}
                    variants={dialogItemVariants}
                    initial="hidden"
                    animate="show"
                    whileHover="hover"
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between rounded-lg border p-3 cursor-pointer"
                    onClick={() => setSelectedSubscription(sub)}
                  >
                    <div>
                      <div className="font-medium">{sub.name}</div>
                      <div className="text-sm text-muted-foreground">{sub.billingCycle}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">
                        ${sub.billingCycle === "Monthly" 
                          ? parseFloat(sub.price).toFixed(2) 
                          : sub.billingCycle === "Yearly" 
                            ? (parseFloat(sub.price) / 12).toFixed(2)
                            : sub.billingCycle === "Weekly"
                              ? (parseFloat(sub.price) * 4.33).toFixed(2)
                              : sub.billingCycle === "Quarterly"
                                ? (parseFloat(sub.price) / 3).toFixed(2)
                                : sub.billingCycle === "Biweekly"
                                  ? (parseFloat(sub.price) * 2.17).toFixed(2)
                                  : parseFloat(sub.price).toFixed(2)
                        }/mo
                      </div>
                      <div className="text-xs text-muted-foreground">
                        ${parseFloat(sub.price).toFixed(2)}/{sub.billingCycle.toLowerCase().replace('ly', '')}
                      </div>
                    </div>
                  </motion.div>
                ))}
                <div className="mt-4 flex justify-between border-t pt-4">
                  <div className="font-semibold">Total Monthly</div>
                  <div className="font-semibold">${monthlySpending.toFixed(2)}</div>
                </div>
                <div className="flex justify-between">
                  <div className="text-sm text-muted-foreground">Annual Cost</div>
                  <div className="text-sm">${(monthlySpending * 12).toFixed(2)}</div>
                </div>
              </div>
            )}
          </ScrollArea>
          <Button variant="outline" onClick={() => setOpenDialog(null)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>

      {/* Upcoming Payments Dialog */}
      <Dialog open={openDialog === "payments"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5" />
              Upcoming Payments
            </DialogTitle>
            <DialogDescription>Payments due this month.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {upcomingPayments.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-muted-foreground">No payments due this month.</p>
              </div>
            ) : (
              <div className="space-y-4 pr-4">
                {upcomingPayments.map((sub, index) => (
                  <motion.div
                    key={sub._id}
                    variants={dialogItemVariants}
                    initial="hidden"
                    animate="show"
                    whileHover="hover"
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between rounded-lg border p-3 cursor-pointer"
                    onClick={() => setSelectedSubscription(sub)}
                  >
                    <div>
                      <div className="font-medium">{sub.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(sub.accurateNextPayment)} 
                        {sub.daysLeft === 0 ? " (Today)" : sub.daysLeft === 1 ? " (Tomorrow)" : ` (${sub.daysLeft} days)`}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${parseFloat(sub.price).toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">{sub.billingCycle}</div>
                    </div>
                  </motion.div>
                ))}
                <div className="mt-4 flex justify-between border-t pt-4">
                  <div className="font-semibold">Total Upcoming</div>
                  <div className="font-semibold">
                    ${upcomingPayments.reduce((total, sub) => total + parseFloat(sub.price), 0).toFixed(2)}
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
          <Button variant="outline" onClick={() => setOpenDialog(null)}>
            Close
          </Button>
        </DialogContent>
      </Dialog>

      {/* Subscription Detail Dialog */}
      <Dialog open={!!selectedSubscription} onOpenChange={(open) => !open && setSelectedSubscription(null)}>
        <DialogContent className="sm:max-w-[500px]">
          {selectedSubscription && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  {selectedSubscription.name}
                </DialogTitle>
                <DialogDescription>Subscription details</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
                    <p className="text-base">{selectedSubscription.category}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Price</h4>
                    <p className="text-base">${parseFloat(selectedSubscription.price).toFixed(2)}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Billing Cycle</h4>
                    <p className="text-base">{selectedSubscription.billingCycle}</p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Next Payment</h4>
                    <p className="text-base">{formatDate(selectedSubscription.nextPayment)}</p>
                  </div>
                </div>

                {selectedSubscription.description && (
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                    <p className="text-sm mt-1">{selectedSubscription.description}</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Monthly Cost</h4>
                    <p className="text-base font-medium">
                      ${selectedSubscription.billingCycle === "Monthly" 
                          ? parseFloat(selectedSubscription.price).toFixed(2) 
                          : selectedSubscription.billingCycle === "Yearly" 
                            ? (parseFloat(selectedSubscription.price) / 12).toFixed(2)
                            : selectedSubscription.billingCycle === "Weekly"
                              ? (parseFloat(selectedSubscription.price) * 4.33).toFixed(2)
                              : selectedSubscription.billingCycle === "Quarterly"
                                ? (parseFloat(selectedSubscription.price) / 3).toFixed(2)
                                : selectedSubscription.billingCycle === "Biweekly"
                                  ? (parseFloat(selectedSubscription.price) * 2.17).toFixed(2)
                                  : parseFloat(selectedSubscription.price).toFixed(2)
                        }
                    </p>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Annual Cost</h4>
                    <p className="text-base font-medium">
                      ${calculateAnnualCost(selectedSubscription).toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => setSelectedSubscription(null)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setSelectedSubscription(null);
                    setOpenDialog(null);
                    router.push(`/dashboard/subscriptions/${selectedSubscription._id}`);
                  }}
                >
                  Edit Subscription
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

