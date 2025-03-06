import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { UpcomingReminders } from "@/components/upcoming-reminders"
import ReminderTimeline from "@/components/reminder-timeline"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import Link from "next/link"

export default function RemindersPage() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex justify-between items-center w-full">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Reminders</h1>
          <p className="text-muted-foreground">Track your upcoming subscription payments and never miss a renewal.</p>
        </div>
        <Link href="/dashboard/subscriptions/new" legacyBehavior passHref>
          <Button asChild className="gap-2">
            <a>
              <PlusCircle className="h-4 w-4" />
              <span>Add Subscription</span>
            </a>
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="upcoming" className="space-y-4">
        <TabsList>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Reminders</CardTitle>
              <CardDescription>View your upcoming subscription payments.</CardDescription>
            </CardHeader>
            <CardContent>
              <UpcomingReminders />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Reminder Timeline</CardTitle>
              <CardDescription>Visualize your subscription payments over time.</CardDescription>
            </CardHeader>
            <CardContent>
              <ReminderTimeline />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

