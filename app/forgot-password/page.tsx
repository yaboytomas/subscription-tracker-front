"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle } from "lucide-react"

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!email || !email.includes("@")) {
      toast({
        title: "Invalid email",
        description: "Please enter a valid email address.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Make API call to forgot-password endpoint
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset link")
      }

      // Show success message regardless of whether the email exists
      // This prevents email enumeration attacks
      setIsSubmitted(true)

      toast({
        title: "Check your email",
        description: "We've sent you a password reset link if the email exists in our system.",
      })
    } catch (err) {
      console.error("Error requesting password reset:", err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        {!isSubmitted ? (
          <>
            <CardHeader className="space-y-1">
              <div className="flex justify-between items-center">
                <CardTitle className="text-2xl">Reset password</CardTitle>
                <Link href="/login" className="text-sm text-muted-foreground hover:underline flex items-center gap-1">
                  <ArrowLeft className="h-4 w-4" />
                  Back to login
                </Link>
              </div>
              <CardDescription>
                Enter your email address and we&apos;ll send you a link to reset your password.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending reset link..." : "Send reset link"}
                </Button>
              </CardFooter>
            </form>
          </>
        ) : (
          <>
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                Check your email
              </CardTitle>
              <CardDescription>
                We&apos;ve sent a password reset link to <span className="font-medium">{email}</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                If you don&apos;t see the email in your inbox, please check your spam folder. The link will expire in 24
                hours.
              </p>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button variant="outline" className="w-full" onClick={() => setIsSubmitted(false)}>
                Try a different email
              </Button>
              <div className="text-center text-sm">
                <Link href="/login" className="text-primary hover:underline">
                  Back to login
                </Link>
              </div>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  )
}

export default ForgotPasswordPage

