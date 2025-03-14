"use client"

import { useState } from "react"
import { motion } from "framer-motion"

interface AnimatedTestimonialProps {
  quote: string
  author: string
  role: string
  index: number
}

export default function AnimatedTestimonial({ quote, author, role, index }: AnimatedTestimonialProps) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <motion.div
      className="rounded-xl border bg-background/80 backdrop-blur-sm p-8 shadow-sm transition-all relative overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ 
        opacity: 1, 
        y: 0,
        transition: { 
          duration: 0.6, 
          delay: index * 0.15,
          ease: "easeOut" 
        }
      }}
      viewport={{ once: true, margin: "-50px" }}
      whileHover={{ 
        boxShadow: "0 10px 30px -10px rgba(var(--primary-rgb), 0.15)",
        y: -5
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background gradient that appears on hover */}
      <motion.div 
        className="absolute top-0 right-0 w-full h-full bg-gradient-to-br from-primary/5 to-secondary/5 -z-10"
        initial={{ opacity: 0 }}
        animate={{ 
          opacity: isHovered ? 1 : 0,
          transition: { duration: 0.4 }
        }}
      />
      
      {/* Quote mark that moves on hover */}
      <motion.div 
        className="text-4xl text-primary opacity-90 mb-3"
        animate={{ 
          y: isHovered ? -5 : 0,
          scale: isHovered ? 1.1 : 1,
          transition: { duration: 0.3 }
        }}
      >
        "
      </motion.div>
      
      {/* Quote text */}
      <motion.p 
        className="text-muted-foreground italic mb-4"
        animate={{ 
          color: isHovered ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
          transition: { duration: 0.3 }
        }}
      >
        {quote}
      </motion.p>
      
      {/* Author info */}
      <div className="mt-4">
        <motion.div 
          className="font-semibold"
          animate={{ 
            color: isHovered ? "hsl(var(--primary))" : "hsl(var(--foreground))",
            transition: { duration: 0.3 }
          }}
        >
          {author}
        </motion.div>
        
        <motion.div 
          className="text-sm text-muted-foreground"
          animate={{ 
            opacity: isHovered ? 0.9 : 0.7,
            transition: { duration: 0.3 }
          }}
        >
          {role}
        </motion.div>
      </div>
      
      {/* Corner accent that appears on hover */}
      <motion.div 
        className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-primary/10 to-transparent rounded-tl-3xl"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ 
          opacity: isHovered ? 1 : 0,
          scale: isHovered ? 1 : 0.6,
          transition: { duration: 0.3 }
        }}
      />
    </motion.div>
  )
} 