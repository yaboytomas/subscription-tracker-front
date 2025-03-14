"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle, Loader2, LogIn, Shield } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { motion } from "framer-motion"

const LoginPage = () => {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    twoFactorCode: ""
  })
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({})
  const [serverError, setServerError] = useState("")
  const [userName, setUserName] = useState("")
  const [requiresTwoFactor, setRequiresTwoFactor] = useState(false)
  const [twoFactorExpiry, setTwoFactorExpiry] = useState<Date | null>(null)

  // Log when component mounts and when 2FA state changes
  useEffect(() => {
    console.log("Login page initialized");
    
    // Log 2FA state changes
    console.log("2FA state:", requiresTwoFactor ? "REQUIRED" : "NOT REQUIRED");
    
    return () => {
      console.log("Login page unmounting");
    };
  }, [requiresTwoFactor]);

  // Redirect after success animation completes
  React.useEffect(() => {
    let redirectTimer: NodeJS.Timeout;
    if (isSuccess) {
      redirectTimer = setTimeout(() => {
        router.push('/dashboard');
      }, 1500); // Reduced from 2500ms to 1500ms
    }
    return () => {
      if (redirectTimer) clearTimeout(redirectTimer);
    };
  }, [isSuccess, router]);

  // Countdown timer for 2FA code expiry
  React.useEffect(() => {
    if (!twoFactorExpiry) return;
    
    const interval = setInterval(() => {
      const now = new Date();
      if (now > twoFactorExpiry) {
        setServerError("Verification code expired. Please try again.");
        setRequiresTwoFactor(false);
        clearInterval(interval);
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [twoFactorExpiry]);

  const validateForm = (): boolean => {
    const errors: { [key: string]: string } = {}
    
    if (!formData.email.trim()) {
      errors.email = "Email is required"
    }
    
    if (!requiresTwoFactor && !formData.password) {
      errors.password = "Password is required"
    }
    
    if (requiresTwoFactor && !formData.twoFactorCode) {
      errors.twoFactorCode = "Verification code is required"
    } else if (requiresTwoFactor && formData.twoFactorCode.length !== 6) {
      errors.twoFactorCode = "Verification code must be 6 digits"
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    // For 2FA code, only allow digits and limit to 6 characters
    if (name === 'twoFactorCode') {
      const numericValue = value.replace(/\D/g, '').slice(0, 6);
      setFormData((prev) => ({ ...prev, [name]: numericValue }))
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
    
    // Clear errors when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }))
    }
    if (serverError) {
      setServerError("")
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    
    // Validate form before submission
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    setServerError("")
    
    try {
      // Prepare request body based on authentication stage
      const requestBody = requiresTwoFactor
        ? {
            email: formData.email,
            password: formData.password,
            twoFactorCode: formData.twoFactorCode
          }
        : {
            email: formData.email,
            password: formData.password
          };
      
      console.log("Sending login request with:", { ...requestBody, password: "REDACTED" });
      
      // Call the login API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })
      
      const data = await response.json()
      
      console.log("Login response:", {
        status: response.status,
        ok: response.ok,
        requiresTwoFactor: data.requiresTwoFactor,
        success: data.success,
        message: data.message
      });
      
      // Handle 2FA requirement
      if (response.ok && data.requiresTwoFactor) {
        console.log("2FA required, showing 2FA prompt");
        setRequiresTwoFactor(true)
        setTwoFactorExpiry(new Date(data.expiresAt))
        toast({
          title: "Verification Required",
          description: "A verification code has been sent to your email",
        })
        setIsLoading(false)
        return
      }
      
      if (!response.ok) {
        throw new Error(data.message || 'Invalid credentials')
      }
      
      // Get user name for the welcome message if available
      if (data.user && data.user.name) {
        setUserName(data.user.name);
      }
      
      // Show success animation
      setIsSuccess(true)
      
      // Redirect will happen through useEffect
    } catch (err) {
      console.error("Login error:", err)
      // Set server error message
      setServerError(err instanceof Error ? err.message : "Invalid credentials. Please try again.")
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Invalid credentials. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="text-center"
        >
          <motion.div 
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="flex justify-center mb-6"
          >
            <div className="rounded-full bg-primary/10 p-4">
              <LogIn className="h-16 w-16 text-primary" />
            </div>
          </motion.div>
          <motion.h2 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="text-3xl font-bold mb-2"
          >
            {userName ? `Welcome back, ${userName}!` : 'Welcome back!'}
          </motion.h2>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.3 }}
            className="text-muted-foreground mb-8"
          >
            Login successful. Taking you to your dashboard...
          </motion.p>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          </motion.div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader className="space-y-1">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">{requiresTwoFactor ? "Two-Factor Authentication" : "Login"}</CardTitle>
            <Link href="/" className="text-sm text-muted-foreground hover:underline">
              Back to home
            </Link>
          </div>
          <CardDescription>
            {requiresTwoFactor 
              ? "Enter the verification code sent to your email"
              : "Enter your email and password to login to your account"}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          {serverError && (
            <div className="px-6 pb-2">
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            </div>
          )}
          <CardContent>
            {requiresTwoFactor ? (
              <>
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Shield className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="twoFactorCode">Verification Code</Label>
                  <Input 
                    id="twoFactorCode" 
                    name="twoFactorCode"
                    type="text" 
                    placeholder="123456"
                    inputMode="numeric"
                    required 
                    value={formData.twoFactorCode}
                    onChange={handleChange}
                    className={formErrors.twoFactorCode ? "border-red-500" : ""}
                    maxLength={6}
                    autoFocus
                  />
                  {formErrors.twoFactorCode && (
                    <p className="text-sm text-red-500">{formErrors.twoFactorCode}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter the 6-digit code sent to your email address.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    placeholder="" 
                    required 
                    value={formData.email}
                    onChange={handleChange}
                    className={formErrors.email ? "border-red-500" : ""}
                  />
                  {formErrors.email && (
                    <p className="text-sm text-red-500">{formErrors.email}</p>
                  )}
                </div>
                <div className="grid gap-2 mt-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                    id="password" 
                    name="password"
                    type="password" 
                    required 
                    value={formData.password}
                    onChange={handleChange}
                    className={formErrors.password ? "border-red-500" : ""}
                  />
                  {formErrors.password && (
                    <p className="text-sm text-red-500">{formErrors.password}</p>
                  )}
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {requiresTwoFactor ? "Verifying..." : "Logging in..."}
                </span>
              ) : (
                requiresTwoFactor ? "Verify" : "Login"
              )}
            </Button>
            {!requiresTwoFactor && (
              <>
                <div className="text-sm text-muted-foreground">
                  Don&apos;t have an account?{" "}
                  <Link href="/signup" className="text-primary hover:underline">
                    Sign up
                  </Link>
                </div>
                <Link href="/forgot-password" className="text-sm text-primary hover:underline">
                  Forgot your password?
                </Link>
              </>
            )}
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

export default LoginPage

