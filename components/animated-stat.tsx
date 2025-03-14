"use client"

import { useState } from "react"
import { motion } from "framer-motion"

interface AnimatedStatProps {
  value: string
  label: string
  index: number
}

export default function AnimatedStat({ value, label, index }: AnimatedStatProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <motion.div 
      className="space-y-2 relative"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: 0.5, 
          delay: index * 0.1,
          ease: "easeOut" 
        }
      }}
      viewport={{ once: true, margin: "-100px" }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div 
        className="absolute inset-0 bg-primary/5 rounded-xl -z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ 
          opacity: isHovered ? 1 : 0, 
          scale: isHovered ? 1 : 0.8,
          transition: { duration: 0.3 }
        }}
      />
      
      <motion.div 
        className="text-3xl md:text-4xl font-bold text-primary"
        animate={{ 
          scale: isHovered ? 1.05 : 1,
          transition: { type: "spring", stiffness: 300, damping: 10 }
        }}
      >
        {value}
      </motion.div>
      
      <motion.div 
        className="text-sm text-muted-foreground"
        animate={{ 
          color: isHovered ? "rgb(var(--primary-rgb))" : "rgb(var(--muted-foreground-rgb))",
          transition: { duration: 0.3 }
        }}
      >
        {label}
      </motion.div>
    </motion.div>
  )
} 