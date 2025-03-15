"use client"

import { useState, useEffect } from "react"
// Only import basic components
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, Calendar, ArrowLeft, ArrowRight } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar as CalendarComponent } from "@/components/calendar"

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

// Function to generate the next several payment dates
const generateFuturePaymentDates = (startDate: string, billingCycle: string, count: number = 6): Date[] => {
  const dates: Date[] = [];
  let nextDate = new Date(startDate);
  
  for (let i = 0; i < count; i++) {
    // First handle the initial payment date
    if (i === 0) {
      // If start date is in the future, use it as the first payment
      if (nextDate > new Date()) {
        dates.push(new Date(nextDate));
        continue;
      }
      
      // Otherwise, find the next payment date after today
      nextDate = calculateNextPaymentDate(startDate, billingCycle);
      dates.push(new Date(nextDate));
      continue;
    }
    
    // For subsequent payments, add according to billing cycle
    switch (billingCycle.toLowerCase()) {
      case 'weekly':
        nextDate = new Date(dates[i-1]);
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'biweekly':
        nextDate = new Date(dates[i-1]);
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case 'monthly':
        nextDate = new Date(dates[i-1]);
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case 'quarterly':
        nextDate = new Date(dates[i-1]);
        nextDate.setMonth(nextDate.getMonth() + 3);
        break;
      case 'yearly':
        nextDate = new Date(dates[i-1]);
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      default:
        nextDate = new Date(dates[i-1]);
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
    }
    
    dates.push(new Date(nextDate));
  }
  
  return dates;
}

export default function RemindersPage() {
  const [activeTab, setActiveTab] = useState('upcoming')
  const [currentMonthPayments, setCurrentMonthPayments] = useState<PastPayment[]>([])
  const [upcomingReminders, setUpcomingReminders] = useState<UpcomingPayment[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarEvents, setCalendarEvents] = useState<{date: Date; subscriptions: {id: string; name: string; price: number}[]}[]>([])
  const [allSubscriptions, setAllSubscriptions] = useState<Subscription[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Function to get real subscription data
  useEffect(() => {
    // Get current date info
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    
    // Reset selected date when changing view
    setSelectedDate(null)
    
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
        setAllSubscriptions(subscriptions)
        
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
        
        // Calculate upcoming payments - MODIFIED to only show current month
        const upcoming = subscriptions
          .map(subscription => {
            const nextPaymentDate = calculateNextPaymentDate(
              subscription.startDate, 
              subscription.billingCycle
            );
            
            const today = new Date();
            
            // Only include payments for the current month
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
        
        // Generate calendar events for the next 6 months
        const events: {date: Date; subscriptions: {id: string; name: string; price: number}[]}[] = [];
        const processedDates = new Map<string, {id: string; name: string; price: number}[]>();
        
        subscriptions.forEach(subscription => {
          const nextSixPayments = generateFuturePaymentDates(
            subscription.startDate, 
            subscription.billingCycle,
            6
          );
          
          nextSixPayments.forEach(paymentDate => {
            const dateString = paymentDate.toISOString().split('T')[0];
            
            if (!processedDates.has(dateString)) {
              processedDates.set(dateString, []);
            }
            
            processedDates.get(dateString)?.push({
              id: subscription._id,
              name: subscription.name,
              price: parseFloat(subscription.price || '0')
            });
          });
        });
        
        // Convert map to array
        processedDates.forEach((subscriptions, dateString) => {
          events.push({
            date: new Date(dateString),
            subscriptions
          });
        });
        
        setCalendarEvents(events);
        
      } catch (err) {
        console.error('Error fetching subscriptions:', err)
        setError(err instanceof Error ? err.message : 'An error occurred while fetching your subscriptions')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSubscriptions()
  }, [])

  // Handle month navigation for the calendar
  const handlePreviousMonth = () => {
    const previousMonth = new Date(currentMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    setCurrentMonth(previousMonth);
    setSelectedDate(null);
  };
  
  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
    setSelectedDate(null);
  };
  
  // Function to get events for a specific day
  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return calendarEvents
      .filter(event => event.date.toISOString().split('T')[0] === dateString)
      .flatMap(event => event.subscriptions);
  };
  
  // Function to check if a date has any events
  const hasEvents = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return calendarEvents.some(event => 
      event.date.toISOString().split('T')[0] === dateString
    );
  };
  
  // Handle calendar day selection
  const handleDaySelect = (date: Date | undefined) => {
    if (date && hasEvents(date)) {
      setSelectedDate(date);
    } else {
      setSelectedDate(null);
    }
  };

  return (
    <div className="container px-4 sm:px-6 w-full max-w-full md:max-w-5xl py-6 md:py-8 space-y-6 md:space-y-8">
      {/* Header - Using styling from subscriptions page */}
      <div className="bg-card border border-border shadow-sm rounded-lg p-4 md:p-6 mb-6 md:mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <Bell className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Reminders</h1>
        </div>
        <p className="text-sm md:text-base text-muted-foreground pl-10 md:pl-12">Track your upcoming subscription payments and never miss a renewal.</p>
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
        /* View toggle and content */
        <div className="space-y-4 md:space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
            <h2 className="text-lg font-semibold">Payment Reminders</h2>
            <div className="flex items-center space-x-2">
              <Button
                variant={view === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('list')}
                className="flex-1 sm:flex-initial"
              >
                List View
              </Button>
              <Button
                variant={view === 'calendar' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setView('calendar')}
                className="flex-1 sm:flex-initial"
              >
                Calendar View
              </Button>
            </div>
          </div>
          
          {view === 'list' ? (
            /* List view - Original content with Card styling from subscriptions page */
            <Card className="border border-border shadow-sm overflow-hidden">
              <CardHeader className="pb-3 md:pb-4 border-b bg-primary/5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle>Payment Reminders</CardTitle>
                      <CardDescription>Track your past and upcoming subscription payments.</CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
                      <TabsList className="w-full grid grid-cols-2 sm:w-auto sm:inline-flex">
                        <TabsTrigger value="upcoming">
                          Upcoming
                        </TabsTrigger>
                        <TabsTrigger value="past">
                          This Month
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-0">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsContent value="upcoming">
                    <div className="p-4 md:p-6">
                      {upcomingReminders.length === 0 ? (
                        <div className="text-center py-6">
                          <p className="text-muted-foreground">You have no upcoming renewals in the current month.</p>
                        </div>
                      ) : (
                        <div className="divide-y">
                          {upcomingReminders.map(reminder => (
                            <div key={reminder.id} className="py-3 md:py-4 flex items-center justify-between">
                              <div>
                                <div className="font-medium">{reminder.name}</div>
                                <div className="text-xs md:text-sm text-muted-foreground">Due on {reminder.date}</div>
                              </div>
                              <div className="font-medium text-primary">${reminder.price.toFixed(2)}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="past">
                    <div className="p-4 md:p-6">
                      {currentMonthPayments.length === 0 ? (
                        <div className="text-center py-6">
                          <p className="text-muted-foreground">No payments for the current month yet.</p>
                        </div>
                      ) : (
                        <div className="divide-y">
                          {currentMonthPayments.map(payment => (
                            <div key={payment.id} className="py-3 md:py-4 flex items-center justify-between">
                              <div>
                                <div className="font-medium">{payment.name}</div>
                                <div className="text-xs md:text-sm text-muted-foreground">Paid on {payment.date}</div>
                              </div>
                              <div className="font-medium text-green-600">${payment.price.toFixed(2)}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          ) : (
            /* Calendar view */
            <Card className="border border-border shadow-sm overflow-hidden">
              <CardHeader className="pb-3 md:pb-4 border-b bg-primary/5">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle>Renewal Calendar</CardTitle>
                      <CardDescription>View all your subscription renewals in calendar format.</CardDescription>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" onClick={handlePreviousMonth} className="px-2 h-8 sm:h-9">
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div className="font-medium text-sm md:text-base whitespace-nowrap">
                      {currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                    <Button variant="outline" size="sm" onClick={handleNextMonth} className="px-2 h-8 sm:h-9">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-3 md:p-4">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr] gap-4 md:gap-6">
                  <div className="flex flex-col">
                    <div className="calendar-container text-sm md:text-base">
                      <CalendarComponent
                        mode="default"
                        month={currentMonth}
                        onMonthChange={setCurrentMonth}
                        modifiers={{
                          hasEvent: (date) => hasEvents(date)
                        }}
                        modifiersClassNames={{
                          hasEvent: "bg-primary/20 font-bold text-primary"
                        }}
                        className="rounded-md border"
                        onDayClick={handleDaySelect}
                        selected={selectedDate ? selectedDate : undefined}
                      />
                    </div>
                    
                    <div className="mt-4 md:mt-6 md:hidden">
                      <h3 className="font-semibold mb-3 text-sm md:text-base">Renewals This Month</h3>
                      {calendarEvents
                        .filter(event => 
                          event.date.getMonth() === currentMonth.getMonth() && 
                          event.date.getFullYear() === currentMonth.getFullYear()
                        )
                        .sort((a, b) => a.date.getTime() - b.date.getTime())
                        .map((event, index) => (
                          <div 
                            key={index} 
                            className={`mb-3 p-3 rounded-lg border ${
                              selectedDate && event.date.toISOString().split('T')[0] === selectedDate.toISOString().split('T')[0]
                                ? 'bg-primary/10 border-primary'
                                : 'bg-card'
                            }`}
                            onClick={() => setSelectedDate(event.date)}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-medium text-sm">
                                {event.date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {event.subscriptions.length} {event.subscriptions.length === 1 ? 'renewal' : 'renewals'}
                              </div>
                            </div>
                            <div className="space-y-2">
                              {event.subscriptions.map((sub, idx) => (
                                <div key={idx} className="flex justify-between items-center py-2 px-3 rounded bg-background text-sm">
                                  <div className="truncate mr-2">{sub.name}</div>
                                  <div className="font-medium text-primary whitespace-nowrap">${sub.price.toFixed(2)}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      
                      {calendarEvents.filter(event => 
                        event.date.getMonth() === currentMonth.getMonth() && 
                        event.date.getFullYear() === currentMonth.getFullYear()
                      ).length === 0 && (
                        <div className="text-center py-4 text-muted-foreground text-sm">
                          No renewals scheduled for this month.
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Right side - Selected date details */}
                  <div className="hidden md:block">
                    {selectedDate ? (
                      <div className="h-full border rounded-md p-4">
                        <div className="mb-4 border-b pb-3">
                          <h3 className="text-lg font-semibold">
                            {selectedDate.toLocaleDateString('en-US', { 
                              weekday: 'long', 
                              month: 'long', 
                              day: 'numeric',
                              year: 'numeric' 
                            })}
                          </h3>
                        </div>
                        
                        <div className="space-y-4">
                          <h4 className="font-medium text-sm text-muted-foreground">SUBSCRIPTION RENEWALS</h4>
                          
                          {getEventsForDate(selectedDate).length > 0 ? (
                            <div className="space-y-3">
                              {getEventsForDate(selectedDate).map((sub, idx) => (
                                <div key={idx} className="border p-3 rounded-md hover:bg-muted/30 transition-colors">
                                  <div className="flex justify-between items-center">
                                    <div className="font-medium">{sub.name}</div>
                                    <div className="text-primary font-bold">${sub.price.toFixed(2)}</div>
                                  </div>
                                  {allSubscriptions.find(s => s._id === sub.id)?.description && (
                                    <div className="text-sm text-muted-foreground mt-1">
                                      {allSubscriptions.find(s => s._id === sub.id)?.description}
                                    </div>
                                  )}
                                </div>
                              ))}
                              
                              <div className="pt-2 border-t mt-4">
                                <div className="flex justify-between items-center">
                                  <div className="font-medium">Total</div>
                                  <div className="font-bold">
                                    ${getEventsForDate(selectedDate)
                                      .reduce((sum, sub) => sum + sub.price, 0)
                                      .toFixed(2)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-6 text-muted-foreground">
                              No subscription renewals for this date.
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="h-full border rounded-md p-6 flex flex-col items-center justify-center text-center text-muted-foreground">
                        <Calendar className="h-10 w-10 text-primary/40 mb-2" />
                        <p>Select a highlighted date on the calendar to view subscription renewals.</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

