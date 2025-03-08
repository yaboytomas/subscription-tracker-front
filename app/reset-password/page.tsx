"use client"

import { useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import Link from "next/link"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CheckCircle, XCircle } from "lucide-react"

const ResetPasswordPage = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { toast } = useToast()
  
  const [token, setToken] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [isInvalid, setIsInvalid] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  
  useEffect(() => {
    // Get token and email from URL params
    const tokenParam = searchParams.get("token")
    const emailParam = searchParams.get("email")
    
    if (!tokenParam || !emailParam) {
      setIsInvalid(true)
      setErrorMessage("Invalid or missing reset link parameters")
      return
    }
    
    setToken(tokenParam)
    setEmail(emailParam)
  }, [searchParams])
  
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    // Validate passwords
    if (password.length < 6) {
      toast({
        title: "Password too short",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      })
      return
    }
    
    if (password !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "Please make sure your passwords match",
        variant: "destructive",
      })
      return
    }
    
    setIsSubmitting(true)
    
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          email,
          password,
        }),
      })
      
      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password")
      }
      
      setIsSuccess(true)
      
      toast({
        title: "Password reset successful",
        description: "Your password has been reset. You can now log in with your new password.",
        duration: 5000,
      })
      
      // After 3 seconds, redirect to login
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (error) {
      console.error("Error resetting password:", error)
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to reset password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }
  
  if (isInvalid) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="h-6 w-6 text-red-500" />
              <CardTitle className="text-2xl">Invalid Reset Link</CardTitle>
            </div>
            <CardDescription>
              {errorMessage || "The password reset link is invalid or has expired."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please request a new password reset link from the forgot password page.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/forgot-password">Go to Forgot Password</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }
  
  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              <CardTitle className="text-2xl">Password Reset Successful</CardTitle>
            </div>
            <CardDescription>
              Your password has been successfully reset.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You can now log in with your new password. Redirecting to login page...
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild className="w-full">
              <Link href="/login">Go to Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">Reset Your Password</CardTitle>
            <Link href="/login" className="text-sm text-muted-foreground hover:underline flex items-center gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back to login
            </Link>
          </div>
          <CardDescription>
            Create a new password for your account
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-muted"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your new password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters long
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm your new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Resetting Password..." : "Reset Password"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default ResetPasswordPage 