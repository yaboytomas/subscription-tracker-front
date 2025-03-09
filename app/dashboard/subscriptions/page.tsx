"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SubscriptionList } from "@/components/subscription-list"
import { Button } from "@/components/ui/button"
import { CreditCard, PlusCircle, ListChecks } from "lucide-react"

export default function SubscriptionsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  return (
    <div className="container max-w-5xl py-8 space-y-8">
      <div className="bg-card border border-border shadow-sm rounded-lg p-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <CreditCard className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>
        </div>
        <p className="text-muted-foreground pl-12">Manage all your subscription services in one place.</p>
      </div>

      <Card className="border border-border shadow-sm overflow-hidden">
        <CardHeader className="pb-4 border-b bg-primary/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ListChecks className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>All Subscriptions</CardTitle>
                <CardDescription>View, edit, and manage your subscriptions.</CardDescription>
              </div>
            </div>
            
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(true)}
              className="border-primary/20 hover:bg-primary/5 hover:border-primary/30 transition-colors"
            >
              <PlusCircle className="h-4 w-4 mr-2" />
              Add New
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="pt-6 px-6 pb-6">
            <SubscriptionList isAddDialogOpen={isAddDialogOpen} setIsAddDialogOpen={setIsAddDialogOpen} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

