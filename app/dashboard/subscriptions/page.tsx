"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SubscriptionList } from "@/components/subscription-list"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"

export default function SubscriptionsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
        <p className="text-muted-foreground">Manage all your subscription services in one place.</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Subscriptions</CardTitle>
              <CardDescription>View, edit, and manage your subscriptions.</CardDescription>
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setIsAddDialogOpen(true)}
              className="h-8 w-8"
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <SubscriptionList isAddDialogOpen={isAddDialogOpen} setIsAddDialogOpen={setIsAddDialogOpen} />
        </CardContent>
      </Card>
    </div>
  )
}

