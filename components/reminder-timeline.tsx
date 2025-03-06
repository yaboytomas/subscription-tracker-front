"use client"

import { useState } from "react"
import { format } from "date-fns"
import { DayPicker } from "react-day-picker"
import { cn } from "@/lib/utils"

const ReminderTimeline = () => {
  const [selectedDate, setSelectedDate] = useState<Date>()

  const hasReminderOnDate = (date: Date) => {
    // Check if there are any reminders for the given date
    const dateString = format(date, "yyyy-MM-dd")
    // TODO: Implement actual reminder checking logic
    return dateString === format(new Date(), "yyyy-MM-dd") // Example: Only show indicator for today
  }

  return (
    <div className="space-y-8">
      <DayPicker
        mode="single"
        selected={selectedDate}
        onSelect={setSelectedDate}
        className="border rounded-md p-3"
        components={{
          DayContent: ({ date }: { date: Date }) => (
            <div className="relative">
              <div className={cn(
                "h-9 w-9 p-0 font-normal",
                hasReminderOnDate(date) && "font-bold text-primary"
              )}>
                {format(date, "d")}
              </div>
              {hasReminderOnDate(date) && (
                <div className="absolute bottom-1 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-primary" />
              )}
            </div>
          ),
        }}
      />
    </div>
  )
}

export default ReminderTimeline

