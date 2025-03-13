import { Metadata } from "next"
import Link from "next/link"
import AnimatedContent from "@/components/animated-content"
import { Button } from "@/components/ui/button"
import { FloatingNav } from "@/components/floating-nav"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import dynamic from "next/dynamic"

// Add static metadata
export const metadata: Metadata = {
  title: 'Sub0 - Track Your Subscriptions',
  description: 'Never forget a subscription again. Track all your subscriptions in one place, get reminders before you\'re charged, and save money by identifying unused services.',
  keywords: ['subscription tracker', 'subscription management', 'bill tracking', 'payment reminders', 'subscription analytics'],
}

// Move animations to a client component
const AnimatedContentComponent = dynamic(() => import('@/components/animated-content'), {
  ssr: false
})

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/20">
      <FloatingNav />
      
      <main className="flex-1">
        <section className="w-full py-24 md:py-32 lg:py-40">
          <div className="container mx-auto px-4">
            <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16 xl:grid-cols-[1fr_1fr]">
              <div className="flex flex-col justify-center space-y-6">
                <div className="space-y-4">
                  <div className="inline-flex items-center rounded-full border bg-background px-4 py-1 text-sm font-medium">
                    <span className="mr-2">✨</span>
                    Track your subscriptions with ease
                  </div>
                  <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                    Never forget a subscription again
                  </h1>
                  <p className="max-w-[600px] text-lg text-muted-foreground">
                    Track all your subscriptions in one place. Get reminders before you&apos;re charged and save money by
                    identifying unused services.
                  </p>
                </div>
                <div className="flex flex-col gap-4 min-[400px]:flex-row">
                  <Link href="/signup">
                    <Button size="lg" className="w-full">
                      Get Started
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/login">
                    <Button size="lg" variant="outline" className="w-full">
                      Login
                    </Button>
                  </Link>
                </div>
                <div className="space-y-2">
                  {[
                    "Free forever",
                    "No credit card",
                    "Secure & private",
                    "Easy to use"
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      {feature}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="relative h-[400px] w-full overflow-hidden rounded-2xl bg-muted/50 p-6 md:h-[500px]">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/10" />
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">Dashboard Preview</h2>
                  <p className="text-muted-foreground">Track all your subscriptions and upcoming payments</p>
                </div>
                <div className="w-full max-w-sm rounded-xl border bg-background/80 backdrop-blur-sm p-6 shadow-lg">
                  <div className="space-y-4">
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
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Features</h2>
                <p className="max-w-[900px] text-lg text-muted-foreground">
                  Everything you need to manage your subscriptions effectively
                </p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-8 py-12 md:grid-cols-3">
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
              ].map((feature) => (
                <div
                  key={feature.number}
                  className="group flex flex-col items-center space-y-4 rounded-xl border bg-background/80 backdrop-blur-sm p-8 shadow-sm transition-all hover:shadow-md"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-110">
                    {feature.number}
                  </div>
                  <h3 className="text-xl font-bold">{feature.title}</h3>
                  <p className="text-center text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 flex flex-col items-center justify-between gap-4 md:h-24 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 Sub0. All rights reserved.
          </p>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-primary transition-colors">
              Terms
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link href="#" className="hover:text-primary transition-colors">
              Contact
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

