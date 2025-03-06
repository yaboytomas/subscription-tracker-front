import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SubscriptionList } from "@/components/subscription-list"
import { UpcomingReminders } from "@/components/upcoming-reminders"
import { SubscriptionStats } from "@/components/subscription-stats"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s happening with your subscriptions.</p>
        </div>
      </div>

      <SubscriptionStats />

      <Tabs defaultValue="reminders" className="w-full">
        <TabsList>
          <TabsTrigger value="reminders">Upcoming Reminders</TabsTrigger>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
        </TabsList>
        <TabsContent value="reminders">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Reminders</CardTitle>
              <CardDescription>View and manage your upcoming payment reminders.</CardDescription>
            </CardHeader>
            <CardContent>
              <UpcomingReminders />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="subscriptions">
          <Card>
            <CardHeader>
              <CardTitle>All Subscriptions</CardTitle>
              <CardDescription>View, edit, and manage your subscriptions.</CardDescription>
            </CardHeader>
            <CardContent>
              <SubscriptionList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

