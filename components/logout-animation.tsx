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
    // Redirect after animation completes
    const timer = setTimeout(() => {
      if (onAnimationComplete) {
        onAnimationComplete()
      } else {
        router.push("/login")
      }
    }, 2000)

    return () => clearTimeout(timer)
  }, [router, onAnimationComplete])

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
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
      </motion.div>
    </div>
  )
} 