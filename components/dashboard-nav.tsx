"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { CalendarClock, CreditCard, Home, PlusCircle, Settings } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: Home,
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

  return (
    <div className="group flex w-16 flex-col border-r bg-background p-2 md:w-60">
      <div className="flex flex-col gap-2">
        <Link href="/dashboard/subscriptions/new" legacyBehavior passHref>
          <Button variant="default" className="justify-start gap-2 w-full" asChild>
            <a>
              <PlusCircle className="h-4 w-4" />
              <span className="hidden md:inline-flex">Add Subscription</span>
            </a>
          </Button>
        </Link>
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
        </nav>
      </div>
    </div>
  )
}

