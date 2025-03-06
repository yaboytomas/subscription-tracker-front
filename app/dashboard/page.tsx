"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SubscriptionList } from "@/components/subscription-list"
import { UpcomingReminders } from "@/components/upcoming-reminders"
import { SubscriptionStats } from "@/components/subscription-stats"
import { SubscriptionsSection } from "@/components/subscriptions-section"
import { motion } from "framer-motion"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

const hoverCard = {
  hover: {
    scale: 1.02,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 10
    }
  }
}

export default function DashboardPage() {
  return (
    <motion.div 
      className="flex flex-col gap-4 w-full"
      initial="hidden"
      animate="show"
      variants={container}
    >
      <motion.div 
        className="flex justify-between items-center"
        variants={item}
      >
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Here&apos;s what&apos;s happening with your subscriptions.</p>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <SubscriptionStats />
      </motion.div>

      <motion.div variants={item}>
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
            <SubscriptionsSection />
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}

