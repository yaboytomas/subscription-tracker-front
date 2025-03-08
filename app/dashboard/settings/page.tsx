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
import { Trash2, AlertCircle, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { EmailHistory } from "@/components/email-history"
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { motion } from "framer-motion"

// For profile refresh events
const PROFILE_UPDATE_EVENT = "profile-updated"

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(date);
}

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
    reason: "",
  })
  const [isChangingEmail, setIsChangingEmail] = useState(false)
  const [emailChangeError, setEmailChangeError] = useState<string | null>(null)
  
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

  // Add these states after the other state declarations
  const [isDeleteSubscriptionsDialogOpen, setIsDeleteSubscriptionsDialogOpen] = useState(false)
  const [isDeletingSubscriptions, setIsDeletingSubscriptions] = useState(false)
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false)
  const [deletedCount, setDeletedCount] = useState(0)

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
  
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setEmailChangeData({
      ...emailChangeData,
      [e.target.name]: e.target.value,
    })
    
    // Clear errors when user starts typing
    if (emailChangeError) {
      setEmailChangeError(null)
    }
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
    setEmailChangeError(null)
    
    try {
      // Validate inputs
      if (!emailChangeData.newEmail) {
        setEmailChangeError('Please enter a new email address')
        return
      }
      
      if (!emailChangeData.password) {
        setEmailChangeError('Please enter your password to confirm')
        return
      }
      
      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(emailChangeData.newEmail)) {
        setEmailChangeError('Please enter a valid email address')
        return
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
      
      // Close the dialog
      setShowEmailDialog(false)
      
      // Only update UI and show toast if email actually changed
      if (data.data && data.data.previousEmail !== data.data.newEmail) {
        // Update the form data with the new email
        setFormData({
          ...formData,
          email: emailChangeData.newEmail,
        })
        
        toast({
          title: "Email updated",
          description: `Your email has been changed from ${data.data.previousEmail} to ${data.data.newEmail}`,
          duration: 5000,
        })
        
        // Trigger a refresh of user data
        fetchUserData()
      } else {
        toast({
          title: "No change needed",
          description: "Your email remains unchanged.",
        })
      }
      
      // Reset the email change form
      setEmailChangeData({
        newEmail: "",
        password: "",
        reason: "",
      })
      
    } catch (err) {
      console.error('Error changing email:', err);
      setEmailChangeError(err instanceof Error ? err.message : "Something went wrong. Please try again.")
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

  // Handle CSV Export
  const handleExportCSV = async () => {
    try {
      // Show loading state
      toast({
        title: "Preparing CSV",
        description: "Your data is being prepared for download...",
      });

      // Fetch user data
      const userResponse = await fetch('/api/auth/me');
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }
      const userData = await userResponse.json();

      // Fetch subscriptions data
      const subsResponse = await fetch('/api/subscriptions');
      if (!subsResponse.ok) {
        throw new Error('Failed to fetch subscription data');
      }
      const subsData = await subsResponse.json();
      const subscriptions = subsData.subscriptions || [];

      // Create CSV rows
      const rows = [];
      
      // Add user info header and data
      rows.push(["USER INFORMATION"]);
      rows.push(["Name", "Email", "Member Since"]);
      rows.push([
        userData.user.name,
        userData.user.email,
        formatDate(new Date(userData.user.createdAt || new Date()))
      ]);
      rows.push([]);  // Empty row for spacing
      
      // Add subscriptions header and data
      rows.push(["SUBSCRIPTIONS"]);
      rows.push(["Name", "Price", "Category", "Billing Cycle", "Start Date", "Description", "Next Payment"]);
      
      // Add subscription data
      subscriptions.forEach((sub: any) => {
        rows.push([
          sub.name,
          sub.price,
          sub.category,
          sub.billingCycle,
          sub.startDate,
          sub.description || '',
          sub.nextPayment
        ]);
      });
      
      // Convert rows to CSV content
      let csvContent = rows.map(row => 
        row.map(cell => 
          typeof cell === 'string' && cell.includes(',') 
            ? `"${cell}"` 
            : cell
        ).join(',')
      ).join('\r\n');
      
      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const fileName = `subscription-data-${new Date().toISOString().split('T')[0]}.csv`;
      
      // Use FileSaver to trigger download
      saveAs(blob, fileName);
      
      toast({
        title: "CSV Export Complete",
        description: "Your data has been exported successfully.",
      });
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle PDF Export
  const handleExportPDF = async () => {
    try {
      // Show loading state
      toast({
        title: "Preparing PDF",
        description: "Your report is being generated...",
      });

      // Fetch user data
      const userResponse = await fetch('/api/auth/me');
      if (!userResponse.ok) {
        throw new Error('Failed to fetch user data');
      }
      const userData = await userResponse.json();

      // Fetch subscriptions data
      const subsResponse = await fetch('/api/subscriptions');
      if (!subsResponse.ok) {
        throw new Error('Failed to fetch subscription data');
      }
      const subsData = await subsResponse.json();
      const subscriptions = subsData.subscriptions || [];
      
      // Calculate total monthly cost
      let totalMonthlyCost = 0;
      subscriptions.forEach((sub: any) => {
        const price = parseFloat(sub.price || '0');
        if (!isNaN(price)) {
          switch (sub.billingCycle?.toLowerCase() || 'monthly') {
            case 'weekly':
              totalMonthlyCost += price * 4.33; // average weeks in a month
              break;
            case 'biweekly':
              totalMonthlyCost += price * 2.17; // average bi-weeks in a month
              break;
            case 'monthly':
              totalMonthlyCost += price;
              break;
            case 'quarterly':
              totalMonthlyCost += price / 3;
              break;
            case 'yearly':
              totalMonthlyCost += price / 12;
              break;
            default:
              totalMonthlyCost += price;
          }
        }
      });

      // Create a simpler HTML-based report
      const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Subscription Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            h1 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 10px; }
            h2 { color: #0070f3; margin-top: 30px; }
            .summary { background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th { background-color: #0070f3; color: white; text-align: left; padding: 10px; }
            td { border-bottom: 1px solid #ddd; padding: 10px; }
            tr:hover { background-color: #f5f5f5; }
            .footer { margin-top: 50px; text-align: center; color: #666; font-size: 0.8em; }
          </style>
        </head>
        <body>
          <h1>Subscription Tracker Report</h1>
          <p>Generated on: ${formatDate(new Date())}</p>
          
          <h2>User Information</h2>
          <p><strong>Name:</strong> ${userData.user.name}</p>
          <p><strong>Email:</strong> ${userData.user.email}</p>
          <p><strong>Member Since:</strong> ${formatDate(new Date(userData.user.createdAt || new Date()))}</p>
          
          <h2>Subscription Summary</h2>
          <div class="summary">
            <p><strong>Total Subscriptions:</strong> ${subscriptions.length}</p>
            <p><strong>Total Monthly Cost:</strong> $${totalMonthlyCost.toFixed(2)}</p>
            <p><strong>Annual Cost:</strong> $${(totalMonthlyCost * 12).toFixed(2)}</p>
          </div>
          
          <h2>Your Subscriptions</h2>
          ${subscriptions.length === 0 ? '<p>No subscriptions found.</p>' : `
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th>Billing Cycle</th>
                <th>Next Payment</th>
              </tr>
            </thead>
            <tbody>
              ${subscriptions.map(sub => `
                <tr>
                  <td>${sub.name}</td>
                  <td>$${sub.price}</td>
                  <td>${sub.category}</td>
                  <td>${sub.billingCycle}</td>
                  <td>${sub.nextPayment}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          `}
          
          <div class="footer">
            <p>Generated by Subscription Tracker</p>
          </div>
        </body>
        </html>
      `;
      
      // Use Blob and window.open to open a new tab with the report content
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      // Open the report in a new tab
      const newWindow = window.open(url, '_blank');
      
      // If popup is blocked, prompt the user
      if (!newWindow) {
        toast({
          title: "Popup Blocked",
          description: "Please allow popups to view your report",
          variant: "destructive",
        });
        return;
      }
      
      // Clean up the URL object
      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 1000);
      
      toast({
        title: "Report Generated",
        description: "Your report has been opened in a new tab. You can save it as PDF using your browser's print function (Ctrl+P).",
        duration: 5000,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Handle deleting all subscription data
  const handleDeleteAllSubscriptions = async () => {
    try {
      setIsDeletingSubscriptions(true);
      
      const response = await fetch('/api/subscriptions/delete-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete subscription data');
      }
      
      setIsDeleteSubscriptionsDialogOpen(false);
      
      // If there were no subscriptions to delete
      if (data.count === 0) {
        toast({
          title: "No Subscriptions Found",
          description: "You don't have any subscriptions to delete.",
        });
        return;
      }
      
      // Store the count for the success animation
      setDeletedCount(data.count);
      
      // Show the success animation
      setShowDeleteSuccess(true);
      
      // Clear the success animation after 2.5 seconds
      setTimeout(() => {
        setShowDeleteSuccess(false);
      }, 2500);
      
      // Success message - delayed slightly to not overlap with animation
      setTimeout(() => {
        toast({
          title: "Subscriptions Deleted",
          description: `${data.count} subscriptions have been removed. The data has been archived for historical purposes.`,
          duration: 5000,
        });
      }, 1000);
      
      // Refresh all data that might display subscriptions
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('subscription-data-changed'));
      }
      
    } catch (error) {
      console.error('Error deleting subscription data:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to delete subscription data',
        variant: "destructive",
      });
    } finally {
      setIsDeletingSubscriptions(false);
    }
  };

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

        {/* Email History - Only show if user data is loaded */}
        {!isLoadingUser && (
          <div className="mb-8">
            <EmailHistory userId={formData.id || ""} />
          </div>
        )}

        {/* Data & Privacy */}
        <Card className="border-none shadow-none">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl">Data & Privacy</CardTitle>
            <CardDescription>Manage your data and privacy settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Button
                variant="outline"
                className="h-auto py-4 justify-start px-6"
                onClick={handleExportCSV}
              >
                <div className="flex flex-col items-start gap-1">
                  <span className="font-medium">Export CSV</span>
                  <span className="text-sm text-muted-foreground">Download your data</span>
                </div>
              </Button>
              <Button
                variant="outline"
                className="h-auto py-4 justify-start px-6"
                onClick={handleExportPDF}
              >
                <div className="flex flex-col items-start gap-1">
                  <span className="font-medium">Export PDF</span>
                  <span className="text-sm text-muted-foreground">Download report</span>
                </div>
              </Button>
            </div>
            <div className="flex justify-end pt-2">
              <Button 
                variant="destructive"
                onClick={() => setIsDeleteSubscriptionsDialogOpen(true)}
              >
                Delete All Subscription Data
              </Button>
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
      
      {/* Email Change Dialog */}
      <Dialog open={showEmailDialog} onOpenChange={(open) => {
        setShowEmailDialog(open);
        if (!open) {
          // Reset form and error when dialog closes
          setEmailChangeData({
            newEmail: "",
            password: "",
            reason: "",
          });
          setEmailChangeError(null);
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Email Address</DialogTitle>
            <DialogDescription>
              Update your email address. This will require password verification for security.
              Notifications will be sent to both your current and new email addresses.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEmailSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="currentEmail">Current Email</Label>
                <Input
                  id="currentEmail"
                  value={formData.email}
                  disabled
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newEmail">New Email</Label>
                <Input
                  id="newEmail"
                  name="newEmail"
                  type="email"
                  placeholder="your.new.email@example.com"
                  value={emailChangeData.newEmail}
                  onChange={handleEmailChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Change (Optional)</Label>
                <Input
                  id="reason"
                  name="reason"
                  type="text"
                  placeholder="Why are you changing your email?"
                  value={emailChangeData.reason}
                  onChange={handleEmailChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailChangePassword">Confirm with Password</Label>
                <Input
                  id="emailChangePassword"
                  name="password"
                  type="password"
                  placeholder="Enter your current password"
                  value={emailChangeData.password}
                  onChange={handleEmailChange}
                  required
                />
              </div>
              
              {emailChangeError && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-md">
                  {emailChangeError}
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" type="button" onClick={() => setShowEmailDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isChangingEmail}>
                {isChangingEmail ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
                    Updating...
                  </>
                ) : "Update Email"}
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

      {/* Delete All Subscriptions Confirmation Dialog */}
      <AlertDialog open={isDeleteSubscriptionsDialogOpen} onOpenChange={setIsDeleteSubscriptionsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" /> Delete All Subscriptions
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <strong>all</strong> of your subscription data. Your subscriptions will be archived for historical purposes, but will no longer appear in your dashboard.
              <br /><br />
              <span className="font-medium">Are you sure you want to continue?</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAllSubscriptions}
              disabled={isDeletingSubscriptions}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeletingSubscriptions ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </span>
              ) : (
                "Yes, Delete All"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Success Animation */}
      {showDeleteSuccess && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="max-w-md w-full bg-card p-6 rounded-lg shadow-lg text-center"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20,
                delay: 0.1
              }}
              className="w-24 h-24 bg-red-100 rounded-full mx-auto mb-6 flex items-center justify-center"
            >
              <Trash2 className="h-12 w-12 text-red-600" />
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold mb-2">Data Cleared!</h2>
              <p className="text-muted-foreground mb-1">
                {deletedCount} {deletedCount === 1 ? 'subscription has' : 'subscriptions have'} been removed.
              </p>
              <p className="text-muted-foreground text-sm">
                Your data has been archived for historical purposes.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6"
            >
              <div className="relative pt-1">
                <div className="overflow-hidden h-2 text-xs flex rounded bg-red-200">
                  <motion.div
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5 }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
                  ></motion.div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

