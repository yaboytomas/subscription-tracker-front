"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

export default function AnimatedHeading() {
  const [isInView, setIsInView] = useState(false)
  
  useEffect(() => {
    setIsInView(true)
  }, [])
  
  const words = ["Take", "Control", "of", "Your", "Subscriptions"]
  
  // Animation settings
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.04 * i },
    }),
  }
  
  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  }
  
  return (
    <motion.h1
      className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none"
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={container}
    >
      <div className="flex flex-wrap">
        {words.map((word, index) => (
          <motion.span
            key={index}
            variants={child}
            className="mr-2 mb-1 inline-block bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent"
            style={{ 
              textShadow: isInView ? "0px 2px 8px rgba(var(--primary-rgb), 0.2)" : "none",
              transition: "text-shadow 0.5s ease-in-out"
            }}
          >
            {word}
          </motion.span>
        ))}
      </div>
    </motion.h1>
  )
} 