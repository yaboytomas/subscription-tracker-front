"use client"

import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SubscriptionList } from "@/components/subscription-list"

export default function SubscriptionsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
          <p className="text-muted-foreground">Manage all your subscription services in one place.</p>
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

