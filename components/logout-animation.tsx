"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { LogOut, Loader2 } from "lucide-react"

interface LogoutAnimationProps {
  onAnimationComplete?: () => void
}

export function LogoutAnimation({ onAnimationComplete }: LogoutAnimationProps) {
  const router = useRouter()

  useEffect(() => {
    // Prevent scrolling while animation is active
    document.body.style.overflow = 'hidden'
    
    // Redirect after animation completes
    const timer = setTimeout(() => {
      if (onAnimationComplete) {
        onAnimationComplete()
      } else {
        // Clear any client-side storage before redirecting
        if (typeof window !== "undefined") {
          localStorage.clear();
          sessionStorage.clear();
        }
        // Use window.location for a full page reload to ensure clean state
        window.location.href = "/";
      }
    }, 2000)

    return () => {
      clearTimeout(timer)
      document.body.style.overflow = ''
    }
  }, [router, onAnimationComplete])

  return (
    <div 
      className="fixed inset-0 w-screen h-screen bg-background" 
      style={{ zIndex: 999999 }}
    >
      <div className="h-full w-full flex flex-col justify-center">
        <div className="container mx-auto px-4 text-center" style={{ paddingTop: '15vh' }}>
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex justify-center mb-6"
          >
            <div className="rounded-full bg-amber-100 p-4">
              <LogOut className="h-16 w-16 text-amber-600" />
            </div>
          </motion.div>
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-3xl font-bold mb-2"
          >
            Logging out...
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-muted-foreground mb-8"
          >
            Thank you for using Subscription Tracker!
          </motion.p>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-amber-600" />
          </motion.div>
        </div>
      </div>
    </div>
  )
} 