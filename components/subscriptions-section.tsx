"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { SubscriptionList } from "@/components/subscription-list"

export function SubscriptionsSection() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  return (
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
  )
} 