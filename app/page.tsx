"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"
import { motion } from "framer-motion"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

const headerItem = {
  hidden: { opacity: 0, y: -20 },
  show: { opacity: 1, y: 0 }
}

const previewCard = {
  hidden: { opacity: 0, scale: 0.95 },
  show: { 
    opacity: 1, 
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
}

export default function Home() {
  return (
    <motion.div 
      className="flex min-h-screen flex-col"
      initial="hidden"
      animate="show"
      variants={container}
    >
      <motion.header 
        className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
        variants={headerItem}
      >
        <div className="w-full px-4 flex h-14 items-center justify-between">
          <motion.div 
            className="flex items-center gap-2 font-bold text-xl"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300, damping: 10 }}
          >
            <span className="text-primary">Sub</span>
            <span>0</span>
          </motion.div>
          <div className="flex items-center gap-2">
            <ModeToggle />
            <Link href="/login">
              <Button variant="outline" size="sm">Login</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Sign Up</Button>
            </Link>
          </div>
        </div>
      </motion.header>
      
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
          <div className="w-full px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:gap-12 xl:grid-cols-[1fr_1fr]">
              <motion.div 
                className="flex flex-col justify-center space-y-4"
                variants={item}
              >
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Never forget a subscription again
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Track all your subscriptions in one place. Get reminders before you&apos;re charged and save money by
                    identifying unused services.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/signup">
                    <Button size="lg" className="w-full">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                </div>
              </motion.div>
              
              <motion.div 
                className="relative h-[350px] w-full overflow-hidden rounded-xl bg-muted/50 p-4 md:h-[450px]"
                variants={previewCard}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
                <div className="relative z-10 flex h-full flex-col items-center justify-center space-y-4 text-center">
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold">Dashboard Preview</h2>
                    <p className="text-muted-foreground">Track all your subscriptions and upcoming payments</p>
                  </div>
                  <motion.div 
                    className="w-full max-w-sm rounded-lg border bg-background p-4 shadow-lg"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 10 }}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Netflix</div>
                        <div className="text-sm font-bold text-primary">$15.99</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Spotify</div>
                        <div className="text-sm font-bold text-primary">$9.99</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="font-medium">Adobe Creative Cloud</div>
                        <div className="text-sm font-bold text-primary">$52.99</div>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        <section className="w-full py-12 md:py-24 lg:py-32">
          <div className="w-full px-4 md:px-6">
            <motion.div 
              className="flex flex-col items-center justify-center space-y-4 text-center"
              variants={item}
            >
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Features</h2>
                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to manage your subscriptions effectively
                </p>
              </div>
            </motion.div>
            <div className="grid grid-cols-1 gap-6 py-12 md:grid-cols-3">
              {[
                {
                  title: "Track Subscriptions",
                  description: "Keep all your subscriptions in one place with detailed information",
                  number: 1
                },
                {
                  title: "Get Reminders",
                  description: "Never miss a payment with timely reminders before you're charged",
                  number: 2
                },
                {
                  title: "Save Money",
                  description: "Identify unused subscriptions and save money by canceling them",
                  number: 3
                }
              ].map((feature, index) => (
                <motion.div
                  key={feature.number}
                  className="flex flex-col items-center space-y-2 rounded-lg border bg-background p-6 shadow-sm"
                  variants={item}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300, damping: 10 }}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    {feature.number}
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-center text-muted-foreground">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <motion.footer 
        className="border-t py-6 md:py-0"
        variants={item}
      >
        <div className="w-full px-4 flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 Sub0. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <Link href="#" className="hover:underline">
              Terms
            </Link>
            <Link href="#" className="hover:underline">
              Privacy
            </Link>
            <Link href="#" className="hover:underline">
              Contact
            </Link>
          </div>
        </div>
      </motion.footer>
    </motion.div>
  )
}

