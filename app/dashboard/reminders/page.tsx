"use client"

import { useState, useEffect } from "react"
// Only import basic components
import { Button } from "@/components/ui/button"
import { Bell } from "lucide-react"

export default function RemindersPage() {
  const [activeTab, setActiveTab] = useState('upcoming')
  const [currentMonthPayments, setCurrentMonthPayments] = useState([])
  const [upcomingReminders, setUpcomingReminders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  // Function to calculate next payment date based on start date and billing cycle
  const calculateNextPaymentDate = (startDate, billingCycle) => {
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
        
        const subscriptions = data.subscriptions || []
        
        // Calculate past payments for the current month
        const pastPayments = subscriptions
          .map(subscription => {
            // Create a date object for the subscription payment in current month
            const paymentDate = new Date(subscription.startDate)
            // Adjust to the current month
            paymentDate.setFullYear(currentYear)
            paymentDate.setMonth(currentMonth)
            
            // Only include if payment date is in the past (already paid this month)
            if (paymentDate <= now && paymentDate.getMonth() === currentMonth) {
              return {
                id: subscription._id,
                name: subscription.name,
                price: parseFloat(subscription.price || 0),
                date: paymentDate,
                status: "Paid"
              }
            }
            return null
          })
          .filter(payment => payment !== null)
        
        // Format dates for past payments
        const formattedPastPayments = pastPayments.map(payment => ({
          ...payment,
          date: payment.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        }))
        
        setCurrentMonthPayments(formattedPastPayments)
        
        // Calculate upcoming payments
        const upcoming = subscriptions
          .map(subscription => {
            // Get the next payment date
            const nextPaymentDate = calculateNextPaymentDate(
              subscription.startDate, 
              subscription.billingCycle
            )
            
            // Show payments in the next 30 days
            const futureLimit = new Date(now)
            futureLimit.setDate(now.getDate() + 30)
            
            if (nextPaymentDate > now && nextPaymentDate <= futureLimit) {
              return {
                id: subscription._id,
                name: subscription.name,
                price: parseFloat(subscription.price || 0),
                date: nextPaymentDate
              }
            }
            return null
          })
          .filter(payment => payment !== null)
          .sort((a, b) => a.date - b.date) // Sort by date (earliest first)
          .map(payment => ({
            ...payment,
            date: payment.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
          }))
        
        setUpcomingReminders(upcoming)
      } catch (err) {
        console.error('Error fetching subscriptions:', err)
        setError(err.message || 'An error occurred while fetching your subscriptions')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchSubscriptions()
  }, [])

  return (
    <div className="container max-w-5xl py-8 space-y-8">
      {/* Header - Using only basic styling */}
      <div className="p-6 border rounded-lg mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Bell className="h-5 w-5" />
          <h1 className="text-3xl font-bold">Reminders</h1>
        </div>
        <p className="text-gray-500">Track your upcoming subscription payments and never miss a renewal.</p>
      </div>

      {/* Tab Buttons - Using the Button component */}
      <div className="flex space-x-2">
        <Button
          variant={activeTab === 'upcoming' ? 'default' : 'outline'}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming
        </Button>
        <Button
          variant={activeTab === 'past' ? 'default' : 'outline'}
          onClick={() => setActiveTab('past')}
        >
          Past
        </Button>
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
        /* Content */
        <div className="border rounded-lg p-6">
          {activeTab === 'upcoming' ? (
            <div>
              <h2 className="text-xl font-bold mb-4">Upcoming Reminders</h2>
              {upcomingReminders.length > 0 ? (
                upcomingReminders.map(reminder => (
                  <div key={reminder.id} className="border p-4 rounded mb-2">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold">{reminder.name}</p>
                        <p className="text-sm text-gray-500">{reminder.date}</p>
                      </div>
                      <p className="font-semibold">${reminder.price.toFixed(2)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 border border-dashed rounded-lg">
                  <p className="text-gray-500">No upcoming payments in the next 30 days.</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <h2 className="text-xl font-bold mb-4">Past Payments (Current Month)</h2>
              {currentMonthPayments.length > 0 ? (
                currentMonthPayments.map(payment => (
                  <div key={payment.id} className="border p-4 rounded mb-2">
                    <div className="flex justify-between">
                      <div>
                        <p className="font-semibold">{payment.name}</p>
                        <p className="text-sm text-gray-500">{payment.date}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${payment.price.toFixed(2)}</p>
                        <p className="text-xs text-green-500">{payment.status}</p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center p-8 border border-dashed rounded-lg">
                  <p className="text-gray-500">No payments recorded for the current month.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

