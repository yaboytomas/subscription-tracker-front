"use client"

import { CalendarClock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Sample data - would be fetched from API in a real app
const calculateDaysLeft = (dateString: string) => {
  const today = new Date()
  const paymentDate = new Date(dateString)
  const diffTime = paymentDate.getTime() - today.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

const reminders = [
  {
    id: "1",
    name: "Netflix",
    price: 15.99,
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    daysLeft: 7,
  },
  {
    id: "2",
    name: "Spotify",
    price: 9.99,
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    daysLeft: 7,
  },
  {
    id: "3",
    name: "Adobe Creative Cloud",
    price: 52.99,
    date: "2025-04-22",
    daysLeft: calculateDaysLeft("2025-04-22"),
  },
  {
    id: "5",
    name: "Disney+",
    price: 7.99,
    date: "2025-04-18",
    daysLeft: calculateDaysLeft("2025-04-18"),
  },
  {
    id: "7",
    name: "YouTube Premium",
    price: 11.99,
    date: "2025-04-12",
    daysLeft: calculateDaysLeft("2025-04-12"),
  },
  {
    id: "8",
    name: "iCloud Storage",
    price: 2.99,
    date: "2025-04-08",
    daysLeft: calculateDaysLeft("2025-04-08"),
  },
].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

export function UpcomingReminders() {
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

  return (
    <div className="space-y-4">
      {reminders.length === 0 ? (
        <div className="flex h-[200px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <CalendarClock className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No upcoming reminders</h3>
            <p className="mt-2 text-sm text-muted-foreground">You don&apos;t have any upcoming subscription payments.</p>
          </div>
        </div>
      ) : (
        reminders.map((reminder) => (
          <Card key={reminder.id} className="overflow-hidden">
            <CardContent className="p-0">
              <div className="flex items-center">
                <div
                  className={cn(
                    "flex h-full w-2 flex-shrink-0",
                    reminder.daysLeft < 0
                      ? "bg-destructive"
                      : reminder.daysLeft === 0
                        ? "bg-orange-500"
                        : reminder.daysLeft <= 3
                          ? "bg-yellow-500"
                          : "bg-green-500",
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
                        reminder.daysLeft < 0
                          ? "text-destructive"
                          : reminder.daysLeft === 0
                            ? "text-orange-500"
                            : reminder.daysLeft <= 3
                              ? "text-yellow-500"
                              : "text-green-500",
                      )}
                    >
                      {getDaysText(reminder.daysLeft)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}

