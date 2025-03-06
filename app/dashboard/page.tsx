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
        <Link href="/dashboard/subscriptions/new" legacyBehavior passHref>
          <Button asChild className="gap-2">
            <a>
              <PlusCircle className="h-4 w-4" />
              <span>Add Subscription</span>
            </a>
          </Button>
        </Link>
      </div>

      <SubscriptionStats />

      <Tabs defaultValue="subscriptions" className="space-y-4">
        <TabsList>
          <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
          <TabsTrigger value="reminders">Upcoming Reminders</TabsTrigger>
        </TabsList>
        <TabsContent value="subscriptions" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Active Subscriptions</CardTitle>
                <CardDescription>Manage your active subscriptions and their details.</CardDescription>
              </div>
              <Link href="/dashboard/subscriptions/new" legacyBehavior passHref>
                <Button asChild size="sm" variant="outline" className="gap-1">
                  <a>
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Add</span>
                  </a>
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <SubscriptionList />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="reminders" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Upcoming Reminders</CardTitle>
                <CardDescription>View your upcoming subscription payments.</CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Don&apos;t forget about these upcoming payments.</p>
              <UpcomingReminders />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

