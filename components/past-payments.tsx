"use client"

import { CalendarClock } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

// Sample data - would be fetched from API in a real app
const pastPayments = [
  {
    id: "1",
    name: "Netflix",
    price: 15.99,
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: "Paid",
  },
  {
    id: "2",
    name: "Spotify",
    price: 9.99,
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: "Paid",
  },
  {
    id: "3",
    name: "Adobe Creative Cloud",
    price: 52.99,
    date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: "Paid",
  },
].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

export function PastPayments() {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      {pastPayments.length === 0 ? (
        <div className="flex h-[200px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <CalendarClock className="h-10 w-10 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No past payments</h3>
            <p className="mt-2 text-sm text-muted-foreground">You don&apos;t have any past subscription payments.</p>
          </div>
        </div>
      ) : (
        pastPayments.map((payment) => (
          <Card key={payment.id} className="overflow-hidden">
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
        ))
      )}
    </div>
  )
} 