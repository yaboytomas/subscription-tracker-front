"use client"

import { ReactNode, useEffect, useState } from "react"
import { motion } from "framer-motion"

interface AnimatedFeatureBadgeProps {
  feature: {
    text: string
    icon: ReactNode
  }
  delay: number
}

export default function AnimatedFeatureBadge({ feature, delay }: AnimatedFeatureBadgeProps) {
  const [isAnimated, setIsAnimated] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  
  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 300)
    return () => clearTimeout(timer)
  }, [])
  
  // Animation variants
  const badgeVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.5, 
        delay,
        ease: "easeOut" 
      } 
    },
    hover: { 
      scale: 1.05,
      backgroundColor: "rgba(var(--primary-rgb), 0.1)",
      transition: { duration: 0.2 } 
    }
  }
  
  const textVariants = {
    normal: { color: "rgb(var(--muted-foreground-rgb))" },
    animated: {
      color: isHovered ? "rgb(var(--primary-rgb))" : "rgb(var(--muted-foreground-rgb))",
      transition: { duration: 0.3 }
    }
  }
  
  const iconVariants = {
    normal: { scale: 1, rotate: 0 },
    animated: { 
      scale: isHovered ? 1.2 : 1, 
      rotate: isHovered ? 5 : 0,
      transition: { duration: 0.2 } 
    }
  }
  
  return (
    <motion.div
      className="flex items-center gap-2 text-sm px-2 py-1 rounded-md cursor-pointer"
      initial="hidden"
      animate="visible"
      whileHover="hover"
      variants={badgeVariants}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        variants={iconVariants}
        animate="animated"
      >
        {feature.icon}
      </motion.div>
      <motion.span
        variants={textVariants}
        animate="animated"
        className="font-medium"
      >
        {feature.text}
      </motion.span>
    </motion.div>
  )
} 