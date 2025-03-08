"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { motion, useScroll, useTransform } from "framer-motion"
import { cn } from "@/lib/utils"

export function FloatingNav() {
  const router = useRouter();
  const { scrollY } = useScroll()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const opacity = useTransform(scrollY, [0, 100], [0, 1])
  const scale = useTransform(scrollY, [0, 100], [0.8, 1])
  const y = useTransform(scrollY, [0, 100], [20, 0])

  // Check if user is logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me', {
          // Add cache: 'no-store' to prevent caching issues
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        setIsLoggedIn(response.ok);
      } catch (error) {
        setIsLoggedIn(false);
      }
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    return scrollY.onChange((latest) => {
      setIsScrolled(latest > 50)
    })
  }, [scrollY])

  const handleLogoClick = () => {
    if (isLoggedIn) {
      router.push('/dashboard');
    } else {
      router.push('/');
    }
  };

  return (
    <div className="fixed top-4 left-0 right-0 z-50">
      <div className="container mx-auto px-4">
        <motion.div
          className="w-full max-w-5xl mx-auto"
          style={{
            opacity,
            scale,
            y,
          }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-background/80 backdrop-blur-md rounded-full border shadow-lg" />
            <div className="relative flex h-16 items-center justify-between px-8">
              <motion.div 
                className="flex items-center gap-2 font-bold text-2xl cursor-pointer"
                whileHover={{ scale: 1.05 }}
                transition={{ type: "spring", stiffness: 300, damping: 10 }}
                onClick={handleLogoClick}
              >
                <span className="text-primary">Sub</span>
                <span>0</span>
              </motion.div>
              <div className="flex items-center gap-4">
                <ModeToggle />
                {isLoggedIn ? (
                  <Link href="/dashboard">
                    <Button size="sm">Dashboard</Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="outline" size="sm">Login</Button>
                    </Link>
                    <Link href="/signup">
                      <Button size="sm">Sign Up</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
} 