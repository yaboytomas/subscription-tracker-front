"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle } from "lucide-react"

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [email, setEmail] = useState("")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [result, setResult] = useState<{
    success: boolean;
    notFound?: boolean;
    accountDeleted?: boolean;
    emailFailed?: boolean;
    message: string;
  } | null>(null)

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
    setResult(null)

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

      // Store the result
      setResult(data)
      
      // If successful, show success UI
      if (data.success) {
        setIsSubmitted(true)
        
        toast({
          title: "Email sent",
          description: "A password reset link has been sent to your email address.",
        })
      } else if (data.notFound) {
        // User not found
        toast({
          title: "Account not found",
          description: data.message,
          variant: "destructive",
        })
      } else if (data.accountDeleted) {
        // Account was deleted
        toast({
          title: "Account deleted",
          description: data.message,
          variant: "destructive",
        })
      } else if (data.emailFailed) {
        // Email failed to send
        toast({
          title: "Email failed",
          description: data.message,
          variant: "destructive",
        })
      }
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
                    name="email"
                    type="email"
                    placeholder=""
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={result && !result.success ? "border-red-500" : ""}
                  />
                </div>
                
                {/* Error Messages */}
                {result && !result.success && (
                  <div className={`p-3 rounded-md ${
                    result.accountDeleted ? "bg-amber-50 text-amber-800" :
                    result.notFound ? "bg-blue-50 text-blue-800" :
                    "bg-red-50 text-red-800"
                  } text-sm flex gap-2 items-start`}>
                    {result.accountDeleted ? (
                      <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                    ) : result.notFound ? (
                      <XCircle className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <p className="font-medium">
                        {result.accountDeleted ? "Account Deleted" : 
                         result.notFound ? "Account Not Found" : 
                         "Error"}
                      </p>
                      <p>{result.message}</p>
                      {result.notFound && (
                        <Link href="/signup" className="text-primary hover:underline mt-1 block">
                          Create a new account
                        </Link>
                      )}
                    </div>
                  </div>
                )}
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
                If you don&apos;t see the email in your inbox, please check your spam folder. The link will expire in 1
                hour.
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

