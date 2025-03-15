"use client"

import type { ReactNode } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { DashboardNav } from "@/components/dashboard-nav"
import { UserNav } from "@/components/user-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter()
  const [isMobile, setIsMobile] = useState(false)
  
  // Detect if we're on mobile
  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    // Initial check
    checkIsMobile()
    
    // Add resize listener
    window.addEventListener('resize', checkIsMobile)
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkIsMobile)
    }
  }, [])
  
  return (
    <div className="flex min-h-screen flex-col">
      <motion.header 
        className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="flex h-16 items-center justify-between px-6">
          <motion.div 
            className="flex items-center gap-2 font-bold text-xl cursor-pointer"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
            onClick={() => router.push('/dashboard')}
          >
            <span className="text-primary">Sub</span>
            <span>0</span>
          </motion.div>
          <div className="flex items-center gap-4">
            <ModeToggle />
            <UserNav />
          </div>
        </div>
      </motion.header>
      
      {/* Mobile Navigation appears here at the top only on mobile */}
      {isMobile && <DashboardNav />}
      
      {/* Main content area - conditionally styled for mobile */}
      <div className="flex flex-1">
        {/* Desktop sidebar is only shown on desktop */}
        {!isMobile && <DashboardNav />}
        <main className={`flex-1 ${isMobile ? 'p-2 pt-0' : 'p-6'}`}>{children}</main>
      </div>
    </div>
  )
}

