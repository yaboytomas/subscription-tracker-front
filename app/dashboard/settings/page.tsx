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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Trash2, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"

// For profile refresh events
const PROFILE_UPDATE_EVENT = "profile-updated"

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingUser, setIsLoadingUser] = useState(true)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
  })
  
  // Use this to force refreshes when user data is updated elsewhere
  const [profileRefreshTrigger, setProfileRefreshTrigger] = useState(0)
  
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

  // Delete account state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmText, setDeleteConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()

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
  }, [toast, profileRefreshTrigger]);

  // Listen for profile update events from other components
  useEffect(() => {
    // Handler for when profile is updated elsewhere
    const handleProfileUpdate = () => {
      setProfileRefreshTrigger(prev => prev + 1);
    };

    // Add event listener
    window.addEventListener(PROFILE_UPDATE_EVENT, handleProfileUpdate);

    // Cleanup
    return () => {
      window.removeEventListener(PROFILE_UPDATE_EVENT, handleProfileUpdate);
    };
  }, []);

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
      // Create a copy of formData without modifying email
      const submitData = {
        name: formData.name,
        bio: formData.bio,
        email: formData.email // Keep email even though it's not in the form anymore
      };
      
      // Call the API to update user profile
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Something went wrong');
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
      
      // Dispatch event to notify other components about the profile update
      window.dispatchEvent(new Event(PROFILE_UPDATE_EVENT));
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
      
      // Call the API to update the email
      const response = await fetch('/api/auth/change-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailChangeData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update email');
      }
      
      toast({
        title: "Email updated",
        description: "Your email has been updated successfully.",
      })
      
      // Trigger a refresh of user data
      window.dispatchEvent(new Event(PROFILE_UPDATE_EVENT));
      
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
      
      console.log('Submitting password change...');
      
      // Call the API to update the password
      const response = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordChangeData.currentPassword,
          newPassword: passwordChangeData.newPassword,
          confirmPassword: passwordChangeData.confirmPassword,
        }),
      });
      
      const data = await response.json();
      console.log('Password change response:', data);
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update password');
      }
      
      // Show a more prominent success message
      toast({
        title: "Success!",
        description: "Your password has been updated successfully. Please use your new password next time you log in.",
        variant: "default",
        duration: 5000, // Show for a longer time
      });
      
      // Close the dialog
      setShowPasswordDialog(false);
      
      // Reset form
      setPasswordChangeData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err) {
      console.error('Password change error:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChangingPassword(false);
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

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "delete my account") {
      toast({
        title: "Confirmation text doesn't match",
        description: "Please type 'delete my account' to confirm deletion",
        variant: "destructive",
      })
      return
    }
    
    setIsDeleting(true)
    
    try {
      const response = await fetch("/api/auth/delete-account", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Failed to delete account")
      }
      
      toast({
        title: "Account deleted",
        description: "Your account has been permanently deleted. You will be redirected to the home page.",
        duration: 5000,
      })
      
      // Perform a complete logout
      try {
        // Call logout API to clear server-side cookies
        await fetch("/api/auth/logout", {
          method: "POST",
        });
        
        // Clear any client-side storage
        if (typeof window !== "undefined") {
          localStorage.clear();
          sessionStorage.clear();
        }
        
        console.log("Authentication state cleared");
      } catch (logoutError) {
        console.error("Error during logout after account deletion:", logoutError);
      }
      
      // Force redirect to home page
      setTimeout(() => {
        console.log("Redirecting to homepage after account deletion");
        window.location.href = "/"; // Use direct location change instead of router
      }, 1500);
    } catch (error) {
      console.error("Error deleting account:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while deleting your account",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setShowDeleteDialog(false)
      setDeleteConfirmText("")
    }
  }

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
                    <div className="grid gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input id="name" name="name" value={formData.name} onChange={handleChange} />
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
                  <span className="text-sm text-muted-foreground">
                    Current: {formData.email ? formData.email : "Loading..."}
                  </span>
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
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteDialog(true)}
              >
                Delete Account
              </Button>
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

      {/* Delete Account Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Delete Your Account
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-2">
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-amber-600 bg-amber-50 p-2 rounded-md">
                  <AlertCircle className="h-5 w-5 mt-0.5" />
                  <p>This action is <span className="font-bold">permanent and irreversible</span>. All your data, including subscriptions and personal information will be deleted.</p>
                </div>
                <p>To confirm, please type <span className="font-bold">delete my account</span> below:</p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Input 
              value={deleteConfirmText}
              onChange={(e) => setDeleteConfirmText(e.target.value)}
              placeholder="Type 'delete my account'"
              className="w-full"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => {
                setDeleteConfirmText("");
                console.log("Delete account cancelled");
              }}
              className="border-gray-300"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                handleDeleteAccount();
              }}
              className="bg-destructive hover:bg-destructive/90 text-white"
              disabled={deleteConfirmText !== "delete my account" || isDeleting}
            >
              {isDeleting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

