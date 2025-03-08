"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
  })
  
  // Email change state
  const [showEmailDialog, setShowEmailDialog] = useState(false)
  const [emailChangeData, setEmailChangeData] = useState({
    newEmail: "",
    password: "",
  })
  const [isChangingEmail, setIsChangingEmail] = useState(false)
  
  // Password change state
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [passwordChangeData, setPasswordChangeData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Fetch user data when component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoadingUser(true);
      try {
        const response = await fetch('/api/auth/profile');
        
        if (!response.ok) {
          throw new Error('Failed to fetch user data');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setFormData({
            name: data.user.name,
            email: data.user.email,
            bio: data.user.bio || '',
          });
        } else {
          throw new Error(data.message || 'Failed to fetch user data');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : 'Failed to load user data',
          variant: "destructive",
        });
      } finally {
        setIsLoadingUser(false);
      }
    };
    
    fetchUserData();
  }, [toast]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }
  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEmailChangeData((prev) => ({ ...prev, [name]: value }))
  }
  
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setPasswordChangeData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    try {
      // Call the API to update user profile
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
      
      // Force a reload to update all components with the new user data
      window.location.reload();
    } catch (err) {
      console.error('Error updating profile:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleEmailSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsChangingEmail(true)
    
    try {
      // Validate inputs
      if (!emailChangeData.newEmail) {
        throw new Error('Please enter a new email address');
      }
      
      if (!emailChangeData.password) {
        throw new Error('Please enter your password to confirm');
      }
      
      // Here you would make an API call to update the email
      // This would be a new endpoint that verifies the password and updates the email
      
      toast({
        title: "Email update requested",
        description: "A verification link has been sent to your new email address. Please check your inbox to complete the change.",
      })
      
      // Close the dialog
      setShowEmailDialog(false)
      
      // Reset form
      setEmailChangeData({
        newEmail: "",
        password: "",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsChangingEmail(false)
    }
  }
  
  const handlePasswordSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsChangingPassword(true)
    
    try {
      // Validate inputs
      if (!passwordChangeData.currentPassword) {
        throw new Error('Please enter your current password');
      }
      
      if (!passwordChangeData.newPassword) {
        throw new Error('Please enter a new password');
      }
      
      if (passwordChangeData.newPassword.length < 6) {
        throw new Error('New password must be at least 6 characters long');
      }
      
      if (passwordChangeData.newPassword !== passwordChangeData.confirmPassword) {
        throw new Error('New passwords do not match');
      }
      
      // Here you would make an API call to update the password
      // This would be a new endpoint that verifies the current password and updates to the new one
      
      toast({
        title: "Password updated",
        description: "Your password has been updated successfully.",
      })
      
      // Close the dialog
      setShowPasswordDialog(false)
      
      // Reset form
      setPasswordChangeData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  // Generate initials from name
  const getInitials = (name: string) => {
    if (!name) return '';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const userInitials = getInitials(formData.name);

  return (
    <div className="container max-w-5xl py-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="grid gap-6">
        {/* Personal Information */}
        <Card className="border-none shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Personal Information</CardTitle>
            <CardDescription>Update your personal details and profile picture.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingUser ? (
              <div className="flex items-start gap-6">
                <Skeleton className="h-24 w-24 rounded-full" />
                <div className="flex-1 space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                  <Skeleton className="h-24 w-full" />
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex items-start gap-6">
                  <div className="flex flex-col items-center gap-4">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src="/placeholder.svg?height=96&width=96" alt="User" />
                      <AvatarFallback className="text-2xl">{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col gap-2">
                      <Button type="button" variant="outline" size="sm" className="w-32">
                        Change Avatar
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="text-muted-foreground">
                        Remove
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="bio">Bio</Label>
                      <Textarea id="bio" name="bio" rows={3} value={formData.bio} onChange={handleChange} />
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <Separator />

        {/* Account Management */}
        <Card className="border-none shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Account Management</CardTitle>
            <CardDescription>Manage your account settings and security.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Button 
                variant="outline" 
                className="h-auto py-4 justify-start px-6"
                onClick={() => setShowEmailDialog(true)}
              >
                <div className="flex flex-col items-start gap-1">
                  <span className="font-medium">Change Email</span>
                  <span className="text-sm text-muted-foreground">Update your email address</span>
                </div>
              </Button>
              <Button 
                variant="outline" 
                className="h-auto py-4 justify-start px-6"
                onClick={() => setShowPasswordDialog(true)}
              >
                <div className="flex flex-col items-start gap-1">
                  <span className="font-medium">Change Password</span>
                  <span className="text-sm text-muted-foreground">Update your password</span>
                </div>
              </Button>
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="destructive">Delete Account</Button>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Data & Privacy */}
        <Card className="border-none shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Data & Privacy</CardTitle>
            <CardDescription>Manage your data and privacy settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <Button variant="outline" className="h-auto py-4 justify-start px-6">
                <div className="flex flex-col items-start gap-1">
                  <span className="font-medium">Export CSV</span>
                  <span className="text-sm text-muted-foreground">Download your data</span>
                </div>
              </Button>
              <Button variant="outline" className="h-auto py-4 justify-start px-6">
                <div className="flex flex-col items-start gap-1">
                  <span className="font-medium">Export PDF</span>
                  <span className="text-sm text-muted-foreground">Download report</span>
                </div>
              </Button>
              <Button variant="outline" className="h-auto py-4 justify-start px-6">
                <div className="flex flex-col items-start gap-1">
                  <span className="font-medium">Backup & Restore</span>
                  <span className="text-sm text-muted-foreground">Manage your backups</span>
                </div>
              </Button>
            </div>
            <div className="flex justify-end pt-2">
              <Button variant="destructive">Delete All Subscription Data</Button>
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Notification Settings */}
        <Card className="border-none shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Notification Settings</CardTitle>
            <CardDescription>Configure your notification preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="renewal-reminders" className="text-base">Renewal Reminders</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified before subscriptions renew
                </p>
              </div>
              <Switch id="renewal-reminders" defaultChecked />
            </div>
            <div className="space-y-2">
              <Label>Reminder Frequency</Label>
              <Select defaultValue="3days">
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Select reminder frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="3days">3 Days Before</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Change Email Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Email</DialogTitle>
            <DialogDescription>
              Update your email address. We'll send a verification link to your new email.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEmailSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="current-email">Current Email</Label>
                <Input 
                  id="current-email" 
                  value={formData.email} 
                  disabled 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-email">New Email</Label>
                <Input 
                  id="new-email" 
                  name="newEmail"
                  type="email" 
                  value={emailChangeData.newEmail}
                  onChange={handleEmailChange}
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-password">Password</Label>
                <Input 
                  id="confirm-password" 
                  name="password"
                  type="password" 
                  placeholder="Enter your password to confirm" 
                  value={emailChangeData.password}
                  onChange={handleEmailChange}
                  required 
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowEmailDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isChangingEmail}>
                {isChangingEmail ? "Updating..." : "Update Email"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Update your password. Make sure to use a strong, unique password.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePasswordSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input 
                  id="current-password" 
                  name="currentPassword"
                  type="password" 
                  value={passwordChangeData.currentPassword}
                  onChange={handlePasswordChange}
                  required 
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input 
                  id="new-password" 
                  name="newPassword"
                  type="password" 
                  value={passwordChangeData.newPassword}
                  onChange={handlePasswordChange}
                  required 
                />
                <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm-new-password">Confirm New Password</Label>
                <Input 
                  id="confirm-new-password" 
                  name="confirmPassword"
                  type="password" 
                  value={passwordChangeData.confirmPassword}
                  onChange={handlePasswordChange}
                  required 
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowPasswordDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword ? "Updating..." : "Update Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

