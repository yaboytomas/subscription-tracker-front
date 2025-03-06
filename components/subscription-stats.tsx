"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarClock, CreditCard, DollarSign } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { SpendingGraph } from "@/components/spending-graph"

// Sample data for subscriptions
const subscriptions = [
  {
    id: "1",
    name: "Netflix",
    price: 15.99,
    billingCycle: "Monthly",
    nextPayment: "2025-04-15",
    category: "Entertainment",
  },
  {
    id: "2",
    name: "Spotify",
    price: 9.99,
    billingCycle: "Monthly",
    nextPayment: "2025-04-10",
    category: "Music",
  },
  {
    id: "3",
    name: "Adobe Creative Cloud",
    price: 52.99,
    billingCycle: "Monthly",
    nextPayment: "2025-04-22",
    category: "Software",
  },
  {
    id: "4",
    name: "Amazon Prime",
    price: 139,
    billingCycle: "Yearly",
    nextPayment: "2025-11-15",
    category: "Shopping",
  },
  {
    id: "5",
    name: "Disney+",
    price: 7.99,
    billingCycle: "Monthly",
    nextPayment: "2025-04-18",
    category: "Entertainment",
  },
  {
    id: "6",
    name: "Microsoft 365",
    price: 99.99,
    billingCycle: "Yearly",
    nextPayment: "2025-08-05",
    category: "Software",
  },
  {
    id: "7",
    name: "YouTube Premium",
    price: 11.99,
    billingCycle: "Monthly",
    nextPayment: "2025-04-12",
    category: "Entertainment",
  },
  {
    id: "8",
    name: "iCloud Storage",
    price: 2.99,
    billingCycle: "Monthly",
    nextPayment: "2025-04-08",
    category: "Cloud Storage",
  },
]

// Get upcoming payments (next 7 days)
const upcomingPayments = subscriptions
  .filter((sub) => {
    const paymentDate = new Date(sub.nextPayment)
    const today = new Date()
    const sevenDaysLater = new Date()
    sevenDaysLater.setDate(today.getDate() + 7)
    return paymentDate >= today && paymentDate <= sevenDaysLater
  })
  .sort((a, b) => new Date(a.nextPayment).getTime() - new Date(b.nextPayment).getTime())

// Calculate monthly spending
const monthlySpending = subscriptions.reduce((total, sub) => {
  if (sub.billingCycle === "Monthly") {
    return total + sub.price
  } else if (sub.billingCycle === "Yearly") {
    return total + sub.price / 12
  }
  return total
}, 0)

export function SubscriptionStats() {
  const router = useRouter()
  const [openDialog, setOpenDialog] = useState<string | null>(null)

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <>
      <div className="flex flex-col gap-4 w-full">
        <SpendingGraph />
        <div className="grid gap-4 md:grid-cols-3 w-full">
          <Card className="cursor-pointer transition-all hover:shadow-md" onClick={() => setOpenDialog("subscriptions")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Subscriptions</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{subscriptions.length}</div>
              <p className="text-xs text-muted-foreground">+2 from last month</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-all hover:shadow-md" onClick={() => setOpenDialog("spending")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Monthly Spending</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${monthlySpending.toFixed(2)}</div>
              <p className="text-xs text-muted-foreground">+$29.99 from last month</p>
            </CardContent>
          </Card>

          <Card className="cursor-pointer transition-all hover:shadow-md" onClick={() => setOpenDialog("upcoming")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Payments</CardTitle>
              <CalendarClock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingPayments.length}</div>
              <p className="text-xs text-muted-foreground">Next 7 days</p>
            </CardContent>
          </Card>
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
            <div className="space-y-4 pr-4">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <div className="font-medium">{sub.name}</div>
                    <div className="text-sm text-muted-foreground">{sub.category}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">${sub.price.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">{sub.billingCycle}</div>
                  </div>
                </div>
              ))}
            </div>
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
              Monthly Spending Breakdown
            </DialogTitle>
            <DialogDescription>You spend ${monthlySpending.toFixed(2)} monthly on subscriptions.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 pr-4">
              {subscriptions.map((sub) => {
                const monthlyPrice = sub.billingCycle === "Yearly" ? sub.price / 12 : sub.price
                return (
                  <div key={sub.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <div className="font-medium">{sub.name}</div>
                      <div className="text-sm text-muted-foreground">{sub.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${monthlyPrice.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">
                        {sub.billingCycle === "Yearly" ? `${sub.price.toFixed(2)}/year` : "Monthly"}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
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
              Manage Subscriptions
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upcoming Payments Dialog */}
      <Dialog open={openDialog === "upcoming"} onOpenChange={(open) => !open && setOpenDialog(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarClock className="h-5 w-5" />
              Upcoming Payments
            </DialogTitle>
            <DialogDescription>You have {upcomingPayments.length} payments due in the next 7 days.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 pr-4">
              {upcomingPayments.length > 0 ? (
                upcomingPayments.map((sub) => (
                  <div key={sub.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <div className="font-medium">{sub.name}</div>
                      <div className="text-sm text-muted-foreground">{formatDate(sub.nextPayment)}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">${sub.price.toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground">{sub.billingCycle}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex h-20 items-center justify-center rounded-lg border border-dashed">
                  <p className="text-sm text-muted-foreground">No upcoming payments in the next 7 days.</p>
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setOpenDialog(null)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setOpenDialog(null)
                router.push("/dashboard/reminders")
              }}
            >
              View All Reminders
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

