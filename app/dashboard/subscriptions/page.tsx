"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SubscriptionList } from "@/components/subscription-list"

export default function SubscriptionsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-muted-foreground">Manage all your subscription services in one place.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Subscriptions</CardTitle>
          <CardDescription>View, edit, and manage your subscriptions.</CardDescription>
        </CardHeader>
        <CardContent>
          <SubscriptionList />
        </CardContent>
      </Card>
    </div>
  )
}

