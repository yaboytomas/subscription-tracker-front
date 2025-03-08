"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { SubscriptionList } from "@/components/subscription-list"
import { UpcomingReminders } from "@/components/upcoming-reminders"
import { SubscriptionStats } from "@/components/subscription-stats"
import { SubscriptionsSection } from "@/components/subscriptions-section"
import { motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"

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
  const router = useRouter()
  const { toast } = useToast()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<{ id: string; name: string; email: string } | null>(null)
  const [greeting, setGreeting] = useState("Hello")
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  
  const refreshData = () => {
    setRefreshTrigger(prev => prev + 1)
  }
  
  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        
        if (!response.ok) {
          // Not authenticated, redirect to login
          router.push('/login')
          return
        }
        
        const data = await response.json()
        setUser(data.user)
        setIsAuthenticated(true)
        
        // Set greeting based on time of day
        const hour = new Date().getHours()
        if (hour < 12) setGreeting("Good morning")
        else if (hour < 18) setGreeting("Good afternoon")
        else setGreeting("Good evening")
        
      } catch (error) {
        console.error('Auth check error:', error)
        router.push('/login')
      } finally {
        setLoading(false)
      }
    }
    
    checkAuth()
  }, [router])
  
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg">Loading...</p>
      </div>
    )
  }
  
  if (!isAuthenticated) {
    return null // This prevents any flicker of content before redirect
  }

  return (
    <motion.div 
      className="flex flex-col gap-4 w-full"
      initial="hidden"
      animate="show"
      variants={container}
    >
      <motion.div 
        className="flex flex-col gap-2"
        variants={item}
      >
        <h1 className="text-3xl font-bold tracking-tight">{greeting}, {user?.name?.split(' ')[0] || 'there'}!</h1>
        <p className="text-sm text-muted-foreground">Welcome back to your subscription dashboard. Here's what's happening.</p>
      </motion.div>

      <motion.div variants={item}>
        <SubscriptionStats refreshTrigger={refreshTrigger} />
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
                <UpcomingReminders refreshTrigger={refreshTrigger} />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="subscriptions">
            <SubscriptionsSection refreshData={refreshData} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  )
}

