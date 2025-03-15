"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { CalendarClock, CreditCard, Home, LogOut, PlusCircle, Settings, BarChart3, Shield, Menu, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { LogoutAnimation } from "@/components/logout-animation"
import { useState, useEffect } from "react"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { useSubscriptionDialog } from "@/context/subscription-dialog-context"

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
  {
    title: "Security",
    href: "/dashboard/security",
    icon: Shield,
  },
]

export function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const [showLogoutAnimation, setShowLogoutAnimation] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { openAddDialog } = useSubscriptionDialog()

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
      
      // Clear any client-side storage
      if (typeof window !== "undefined") {
        localStorage.clear();
        sessionStorage.clear();
      }
      
      // Force a full page reload to ensure clean state
      window.location.href = "/";
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
      {/* Mobile Navigation Bar */}
      <div className="md:hidden flex items-center justify-between w-full border-b bg-background p-2 sticky top-16 z-40">
        {/* Left side - Hamburger menu */}
        <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[240px] p-4">
            <div className="flex flex-col gap-4 mt-4">
              <h2 className="text-lg font-semibold mb-2">Menu</h2>
              {navItems.map((item, index) => (
                <Link 
                  key={index} 
                  href={item.href} 
                  onClick={() => setMenuOpen(false)}
                >
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                      pathname === item.href 
                        ? "bg-primary/10 text-primary" 
                        : "hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </div>
                </Link>
              ))}
              <div
                className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-destructive hover:bg-accent hover:text-destructive cursor-pointer"
                onClick={() => {
                  setMenuOpen(false)
                  handleLogout()
                }}
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </div>
            </div>
          </SheetContent>
        </Sheet>
        
        {/* Center - Current page title */}
        <div className="font-medium">
          {navItems.find(item => item.href === pathname)?.title || 'Dashboard'}
        </div>
        
        {/* Right side - Quick access icons */}
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-9 w-9"
            onClick={openAddDialog}
          >
            <PlusCircle className="h-5 w-5" />
            <span className="sr-only">Add Subscription</span>
          </Button>
        </div>
      </div>
      
      {/* Desktop sidebar navigation */}
      <div className="hidden md:flex w-16 flex-col border-r bg-background p-2 md:w-60">
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

