"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { CalendarClock, CreditCard, Home, LogOut, PlusCircle, Settings, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { LogoutAnimation } from "@/components/logout-animation"
import { useState } from "react"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
  },
  {
    title: "Analytics",
    href: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Subscriptions",
    href: "/dashboard/subscriptions",
    icon: CreditCard,
  },
  {
    title: "Reminders",
    href: "/dashboard/reminders",
    icon: CalendarClock,
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: Settings,
  },
]

export function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [showLogoutAnimation, setShowLogoutAnimation] = useState(false)

  const handleLogout = async () => {
    try {
      setShowLogoutAnimation(true)
      
      // Call the logout API
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!response.ok) {
        throw new Error('Logout failed')
      }
      
      // Show toast notification
      toast({
        title: "Logged out",
        description: "You have been logged out successfully.",
      })
      
      // Don't redirect immediately - the animation component will handle it
    } catch (error) {
      console.error('Logout error:', error)
      setShowLogoutAnimation(false)
      toast({
        title: "Error",
        description: "Logout failed. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <>
      <div className="group flex w-16 flex-col border-r bg-background p-2 md:w-60">
        <div className="flex flex-col gap-2">
          
          <nav className="grid gap-1 px-2 group-[[data-collapsed=true]]:justify-center group-[[data-collapsed=true]]:px-2">
            {navItems.map((item, index) => (
              <Link key={index} href={item.href} legacyBehavior passHref>
                <Button
                  variant="ghost"
                  className={cn(
                    "flex justify-start items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                    pathname === item.href ? "bg-accent text-accent-foreground" : "transparent",
                  )}
                  asChild
                >
                  <a>
                    <item.icon className="h-4 w-4" />
                    <span className="hidden md:inline-flex">{item.title}</span>
                  </a>
                </Button>
              </Link>
            ))}
            <Button
              variant="ghost"
              className="flex justify-start items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground text-destructive hover:text-destructive"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline-flex">Logout</span>
            </Button>
          </nav>
        </div>
      </div>
      
      {/* Logout Animation */}
      {showLogoutAnimation && <LogoutAnimation />}
    </>
  )
}

