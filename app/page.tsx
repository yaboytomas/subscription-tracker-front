import { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ResponsiveNav } from "@/components/responsive-nav"
import { ArrowRight, CheckCircle2, CreditCard, Bell, PiggyBank, BarChart4, Calendar, Shield } from "lucide-react"
import dynamic from "next/dynamic"

// Add enhanced metadata for better SEO
export const metadata: Metadata = {
  title: 'Sub0 - Smart Subscription Tracker & Manager',
  description: 'Take control of your finances. Track all your subscriptions in one place, get timely reminders before charges, and save money by identifying unused services.',
  keywords: ['subscription tracker', 'subscription management', 'bill tracking', 'payment reminders', 'subscription analytics', 'budget planning', 'expense management', 'recurring payments'],
  openGraph: {
    title: 'Sub0 - Smart Subscription Tracker & Manager',
    description: 'Take control of your finances. Track all your subscriptions in one place, get timely reminders before charges, and save money by identifying unused services.',
    images: ['/og-image.png'],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sub0 - Smart Subscription Tracker & Manager',
    description: 'Take control of your finances. Track all your subscriptions in one place, get timely reminders before charges, and save money by identifying unused services.',
    images: ['/og-image.png'],
  },
}

// Move animations to a client component
const AnimatedContentComponent = dynamic(() => import('@/components/animated-content'), {
  ssr: false
})

// Animated Feature Badge Component - Client Component
const AnimatedFeatureBadge = dynamic(() => import('@/components/animated-feature-badge'), {
  ssr: false
})

// Animated Heading Component
const AnimatedHeading = dynamic(() => import('@/components/animated-heading'), {
  ssr: false
})

// Animated Stat Component
const AnimatedStat = dynamic(() => import('@/components/animated-stat'), {
  ssr: false
})

// Animated Testimonial Component
const AnimatedTestimonial = dynamic(() => import('@/components/animated-testimonial'), {
  ssr: false
})

// Testimonial data
const testimonials = [
  {
    quote: "Sub0 helped me discover I was paying for 3 services I wasn't using. I saved over $50 a month!",
    author: "Sarah J.",
    role: "Marketing Professional"
  },
  {
    quote: "The reminder feature is a game-changer. I never get surprised by charges anymore.",
    author: "Michael T.",
    role: "Software Developer"
  },
  {
    quote: "Clean interface, easy to use, and actually helped me budget better. Highly recommend!",
    author: "Alex P.",
    role: "Small Business Owner"
  }
];

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-background to-muted/20">
      <ResponsiveNav />
      
      <main className="flex-1 pt-16 md:pt-0">
        {/* Hero Section */}
        <section className="w-full py-6 md:py-12 lg:py-16 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-5 pointer-events-none"></div>
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-secondary/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
          
          <div className="container mx-auto px-4 sm:px-6 relative z-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:gap-12 xl:grid-cols-[1fr_1fr]">
              <AnimatedContentComponent>
                <div className="flex flex-col justify-center space-y-6 text-center sm:text-left">
                  <div className="space-y-3">
                    <div className="inline-block sm:inline-flex mx-auto sm:mx-0 items-center rounded-full border bg-background/80 backdrop-blur-sm px-4 py-1.5 text-sm font-medium shadow-sm">
                      <span className="mr-2 text-primary">✨</span>
                      Smart subscription management
                    </div>
                    <AnimatedHeading />
                    <p className="max-w-[600px] text-lg text-muted-foreground mx-auto sm:mx-0">
                      Track all your subscriptions in one place. Get reminders before you&apos;re charged and save money by
                      identifying unused services. Your financial peace of mind starts here.
                    </p>
                  </div>
                  <div className="flex flex-col gap-4 min-[400px]:flex-row sm:justify-start justify-center">
                    <Link href="/signup">
                      <Button size="lg" className="w-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all duration-300 shadow-lg">
                        Start Saving Today
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href="/login">
                      <Button size="lg" variant="outline" className="w-full border-primary/20 hover:border-primary/50 transition-all duration-300">
                        Login
                      </Button>
                    </Link>
                  </div>
                  <div className="grid grid-cols-2 gap-4 sm:flex sm:items-center sm:gap-6 justify-center sm:justify-start">
                    {[
                      { text: "Free forever", icon: <Shield className="h-4 w-4 text-primary" /> },
                      { text: "No credit card", icon: <CreditCard className="h-4 w-4 text-primary" /> },
                      { text: "Secure & private", icon: <CheckCircle2 className="h-4 w-4 text-primary" /> },
                      { text: "Easy to use", icon: <CheckCircle2 className="h-4 w-4 text-primary" /> }
                    ].map((feature, index) => (
                      <AnimatedFeatureBadge 
                        key={feature.text}
                        feature={feature}
                        delay={index * 0.15}
                      />
                    ))}
                  </div>
                </div>
              </AnimatedContentComponent>
              
              <AnimatedContentComponent>
                <div className="relative h-[400px] w-full overflow-hidden rounded-2xl bg-muted/50 p-6 md:h-[500px] border border-primary/10 shadow-xl">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/10" />
                  <div className="relative z-10 space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                      <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    </div>
                    <h2 className="text-2xl font-bold">Dashboard Preview</h2>
                  </div>
                  
                  <div className="absolute top-24 left-6 right-6 grid gap-4">
                    <div className="w-full rounded-xl border bg-background/90 backdrop-blur-sm p-4 shadow-lg transition-all hover:shadow-xl hover:translate-y-[-2px] duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md bg-red-500 flex items-center justify-center text-white font-bold">N</div>
                          <div>
                            <div className="font-medium">Netflix</div>
                            <div className="text-xs text-muted-foreground">Next payment: May 15</div>
                          </div>
                        </div>
                        <div className="text-sm font-bold text-primary">$15.99</div>
                      </div>
                    </div>
                    
                    <div className="w-full rounded-xl border bg-background/90 backdrop-blur-sm p-4 shadow-lg transition-all hover:shadow-xl hover:translate-y-[-2px] duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md bg-green-500 flex items-center justify-center text-white font-bold">S</div>
                          <div>
                            <div className="font-medium">Spotify</div>
                            <div className="text-xs text-muted-foreground">Next payment: May 20</div>
                          </div>
                        </div>
                        <div className="text-sm font-bold text-primary">$9.99</div>
                      </div>
                    </div>
                    
                    <div className="w-full rounded-xl border bg-background/90 backdrop-blur-sm p-4 shadow-lg transition-all hover:shadow-xl hover:translate-y-[-2px] duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md bg-blue-500 flex items-center justify-center text-white font-bold">A</div>
                          <div>
                            <div className="font-medium">Adobe Creative Cloud</div>
                            <div className="text-xs text-muted-foreground">Next payment: June 1</div>
                          </div>
                        </div>
                        <div className="text-sm font-bold text-primary">$52.99</div>
                      </div>
                    </div>
                    
                    <div className="w-full rounded-xl border bg-background/90 backdrop-blur-sm p-4 shadow-lg transition-all hover:shadow-xl hover:translate-y-[-2px] duration-300">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-md bg-purple-500 flex items-center justify-center text-white font-bold">D</div>
                          <div>
                            <div className="font-medium">Disney+</div>
                            <div className="text-xs text-muted-foreground">Next payment: May 28</div>
                          </div>
                        </div>
                        <div className="text-sm font-bold text-primary">$7.99</div>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedContentComponent>
            </div>
          </div>
        </section>
        
        {/* Stats Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { value: "2,500+", label: "Active Users" },
                { value: "$125K+", label: "Money Saved" },
                { value: "15,000+", label: "Subscriptions Tracked" },
                { value: "99.9%", label: "Uptime" }
              ].map((stat, index) => (
                <AnimatedStat
                  key={index}
                  value={stat.value}
                  label={stat.label}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <div className="inline-flex items-center rounded-full border bg-background/80 backdrop-blur-sm px-4 py-1.5 text-sm font-medium shadow-sm mb-4">
                <span className="mr-2 text-primary">🚀</span>
                Powerful Features
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Everything You Need</h2>
              <p className="max-w-[800px] text-lg text-muted-foreground">
                Comprehensive tools to manage your subscriptions effectively and save money
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                {
                  title: "Track Subscriptions",
                  description: "Keep all your subscriptions in one place with detailed information about billing cycles, costs, and usage.",
                  icon: <CreditCard className="h-10 w-10 text-primary" />,
                  number: 1
                },
                {
                  title: "Smart Reminders",
                  description: "Never miss a payment with customizable notifications before you're charged. Choose email or app notifications for timely alerts.",
                  icon: <Bell className="h-10 w-10 text-primary" />,
                  number: 2
                },
                {
                  title: "Save Money",
                  description: "Identify unused or overlapping subscriptions and get recommendations on what to cancel or downgrade.",
                  icon: <PiggyBank className="h-10 w-10 text-primary" />,
                  number: 3
                },
                {
                  title: "Spending Analytics",
                  description: "Visualize your subscription spending with beautiful charts and graphs. Track spending trends over time.",
                  icon: <BarChart4 className="h-10 w-10 text-primary" />,
                  number: 4
                },
                {
                  title: "Renewal Calendar",
                  description: "See all your upcoming renewals in a convenient calendar view. Plan your budget with confidence.",
                  icon: <Calendar className="h-10 w-10 text-primary" />,
                  number: 5
                },
                {
                  title: "Secure Storage",
                  description: "Your data is encrypted and securely stored. We never share your information with third parties.",
                  icon: <Shield className="h-10 w-10 text-primary" />,
                  number: 6
                }
              ].map((feature) => (
                <div
                  key={feature.number}
                  className="group flex flex-col items-center space-y-4 rounded-xl border bg-background/80 backdrop-blur-sm p-8 shadow-sm transition-all hover:shadow-lg hover:border-primary/50 hover:translate-y-[-5px]"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110 group-hover:bg-primary/20">
                    {feature.icon}
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
        
        {/* Testimonials Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-16">
              <div className="inline-flex items-center rounded-full border bg-background/80 backdrop-blur-sm px-4 py-1.5 text-sm font-medium shadow-sm mb-4">
                <span className="mr-2 text-primary">💬</span>
                User Testimonials
              </div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">What Our Users Say</h2>
              <p className="max-w-[600px] text-lg text-muted-foreground">
                Join thousands of satisfied users who have taken control of their subscriptions
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <AnimatedTestimonial
                  key={index}
                  quote={testimonial.quote}
                  author={testimonial.author}
                  role={testimonial.role}
                  index={index}
                />
              ))}
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-secondary/20 opacity-50"></div>
          <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-secondary/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
          
          <div className="container mx-auto px-4 relative z-10">
            <div className="max-w-3xl mx-auto text-center space-y-8">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Ready to Take Control?</h2>
              <p className="text-lg text-muted-foreground">
                Join thousands of users who have already saved money and reduced financial stress with Sub0.
                Start your journey to better subscription management today.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/signup">
                  <Button size="lg" className="w-full sm:w-auto bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all duration-300 shadow-lg">
                    Get Started for Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline" className="w-full sm:w-auto border-primary/20 hover:border-primary/50 transition-all duration-300">
                    Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t py-12 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex flex-col gap-8 items-center text-center">
            <div className="space-y-4 flex flex-col items-center">
              <div className="flex items-center gap-2 font-bold text-2xl">
                <span className="text-primary">Sub</span>
                <span>0</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-md">
                Take control of your subscriptions and save money with our smart tracking tools.
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 md:grid-cols-3 w-full max-w-md">
              <div className="text-center">
                <h3 className="font-semibold text-sm md:text-base">Product</h3>
                <ul className="mt-2 space-y-1 text-xs md:text-sm text-muted-foreground">
                  <li><Link href="#" className="hover:text-primary transition-colors">Features</Link></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">Pricing</Link></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">FAQ</Link></li>
                </ul>
              </div>
              
              <div className="text-center">
                <h3 className="font-semibold text-sm md:text-base">Company</h3>
                <ul className="mt-2 space-y-1 text-xs md:text-sm text-muted-foreground">
                  <li><Link href="#" className="hover:text-primary transition-colors">About</Link></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">Blog</Link></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">Careers</Link></li>
                </ul>
              </div>
              
              <div className="text-center">
                <h3 className="font-semibold text-sm md:text-base">Legal</h3>
                <ul className="mt-2 space-y-1 text-xs md:text-sm text-muted-foreground">
                  <li><Link href="#" className="hover:text-primary transition-colors">Terms</Link></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">Privacy</Link></li>
                  <li><Link href="#" className="hover:text-primary transition-colors">Cookies</Link></li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-center text-sm text-muted-foreground md:text-left">
              © 2025 Sub0. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"></path></svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>
              </Link>
              <Link href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"></path></svg>
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

