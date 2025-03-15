import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { SubscriptionDialogProvider } from "@/context/subscription-dialog-context"
import { SubscriptionFormDialog } from "@/components/subscription-form-dialog"
import { Toaster } from "@/components/ui/toaster"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from "@vercel/analytics/react"
import { cn } from "@/lib/utils"

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://subscription-tracker.com'),
  title: {
    default: "Sub0 - Smart Subscription Tracker & Manager",
    template: "%s | Sub0"
  },
  description: "Take control of your finances. Track all your subscriptions in one place, get timely reminders before charges, and save money by identifying unused services.",
  keywords: ['subscription tracker', 'subscription management', 'bill tracking', 'payment reminders', 'subscription analytics'],
  authors: [
    {
      name: "Sub0 Team",
    },
  ],
  creator: "Sub0",
  publisher: "Sub0",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#000000" media="(prefers-color-scheme: dark)" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <SubscriptionDialogProvider>
            {children}
            <SubscriptionFormDialog />
            <Toaster />
            <SpeedInsights />
            <Analytics />
          </SubscriptionDialogProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
