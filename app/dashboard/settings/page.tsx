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
import { 
  Trash2, 
  AlertCircle, 
  Loader2, 
  User, 
  Check, 
  Mail, 
  Bell, 
  CalendarClock, 
  Info, 
  Settings, 
  FileText, 
  FileSpreadsheet, 
  Database
} from "lucide-react"
import { useRouter } from "next/navigation"
import { EmailHistory } from "@/components/email-history"
import { saveAs } from 'file-saver';
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

  // Add a state for the delete account animation
  const [showDeleteAccountAnimation, setShowDeleteAccountAnimation] = useState(false)

  // Add notification preferences state after other state declarations
  const [notificationPreferences, setNotificationPreferences] = useState({
    paymentReminders: true,
    reminderFrequency: '3days',
  });
  const [isUpdatingNotifications, setIsUpdatingNotifications] = useState(false);

  // Add these states after the other state declarations
  const [showPasswordChangeSuccess, setShowPasswordChangeSuccess] = useState(false)
  const [showEmailChangeSuccess, setShowEmailChangeSuccess] = useState(false)

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
          
          // Set notification preferences if available
          if (data.user.notificationPreferences) {
            setNotificationPreferences(data.user.notificationPreferences);
          }
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
      
      // Only update UI and show animation if email actually changed
      if (data.data && data.data.previousEmail !== data.data.newEmail) {
        // Update the form data with the new email
        setFormData({
          ...formData,
          email: emailChangeData.newEmail,
        })
        
        // Store email change data for the animation
        const previousEmail = data.data.previousEmail;
        const newEmail = data.data.newEmail;
        
        // Show success animation
        setShowEmailChangeSuccess(true);
        
        // Hide animation after a delay
        setTimeout(() => {
          setShowEmailChangeSuccess(false);
        }, 3000);
        
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
      
      // Close the dialog
      setShowPasswordDialog(false);
      
      // Reset form
      setPasswordChangeData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      // Show success animation
      setShowPasswordChangeSuccess(true);
      
      // Hide animation after a delay
      setTimeout(() => {
        setShowPasswordChangeSuccess(false);
      }, 3000);
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
      
      // Close the dialog
      setShowDeleteDialog(false)
      
      // Show the animation
      setShowDeleteAccountAnimation(true)
      
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
      
      // Skip toast notification since we're showing the animation
      
      // Force redirect to home page after animation completes
      setTimeout(() => {
        console.log("Redirecting to homepage after account deletion");
        window.location.href = "/";
      }, 3000);
    } catch (error) {
      console.error("Error deleting account:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred while deleting your account",
        variant: "destructive",
      })
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

  // Add a function to handle notification preference changes
  const handleNotificationChange = async (value: boolean) => {
    try {
      setIsUpdatingNotifications(true);
      
      // Update local state immediately for responsive UI
      setNotificationPreferences(prev => ({
        ...prev,
        paymentReminders: value
      }));
      
      // Call API to update preferences
      const response = await fetch('/api/auth/notification-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentReminders: value,
          reminderFrequency: notificationPreferences.reminderFrequency
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update notification preferences');
      }
      
      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been updated.",
      });
      
    } catch (err) {
      console.error('Error updating notification preferences:', err);
      
      // Revert state on error
      setNotificationPreferences(prev => ({
        ...prev,
        paymentReminders: !value
      }));
      
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update preferences",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingNotifications(false);
    }
  };
  
  // Add a function to handle reminder frequency changes
  const handleFrequencyChange = async (value: string) => {
    try {
      setIsUpdatingNotifications(true);
      
      // Update local state immediately for responsive UI
      setNotificationPreferences(prev => ({
        ...prev,
        reminderFrequency: value
      }));
      
      // Call API to update preferences
      const response = await fetch('/api/auth/notification-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentReminders: notificationPreferences.paymentReminders,
          reminderFrequency: value
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update reminder frequency');
      }
      
      toast({
        title: "Frequency updated",
        description: "Your reminder frequency has been updated.",
      });
      
    } catch (err) {
      console.error('Error updating reminder frequency:', err);
      
      // Revert state on error
      setNotificationPreferences(prev => ({
        ...prev,
        reminderFrequency: prev.reminderFrequency // Revert to previous
      }));
      
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to update frequency",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingNotifications(false);
    }
  };

  return (
    <div className="container max-w-5xl py-8 space-y-8">
      <div className="bg-card border border-border shadow-sm rounded-lg p-6 mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="bg-primary/10 p-2 rounded-full">
            <Settings className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        </div>
        <p className="text-muted-foreground pl-12">Manage your account settings and preferences.</p>
      </div>

      <div className="grid gap-8">
        {/* Personal Information */}
        <Card className="border border-border shadow-sm overflow-hidden">
          <CardHeader className="pb-4 border-b bg-primary/5">
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">Personal Information</CardTitle>
            </div>
            <CardDescription>Update your personal details and profile picture.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoadingUser ? (
              <div className="p-6 flex items-start gap-6">
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
              <form onSubmit={handleSubmit} className="space-y-0">
                {/* Profile Header - Avatar and Basic Info */}
                <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-6 flex flex-col md:flex-row items-center md:items-start gap-6">
                  <div className="flex flex-col items-center gap-4 relative">
                    <div className="relative group">
                      <Avatar className="h-28 w-28 border-4 border-background shadow-md">
                        <AvatarImage src="/placeholder.svg?height=96&width=96" alt="User" />
                        <AvatarFallback className="text-3xl bg-primary/10">{userInitials}</AvatarFallback>
                      </Avatar>
                      <div className="absolute inset-0 bg-black/30 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="text-white text-xs">Change</div>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button type="button" variant="outline" size="sm" className="w-32 border-primary/20 text-xs transition-all hover:border-primary/40">
                        Upload Image
                      </Button>
                      <Button type="button" variant="ghost" size="sm" className="text-muted-foreground text-xs hover:text-destructive">
                        Remove Photo
                      </Button>
                    </div>
                  </div>
                  <div className="flex-1 space-y-1 w-full">
                    <h3 className="font-medium text-sm text-muted-foreground">PROFILE DETAILS</h3>
                    <h2 className="text-2xl font-bold">{formData.name || 'Your Name'}</h2>
                    <p className="text-muted-foreground italic text-sm">{formData.bio || 'No bio added yet...'}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="bg-primary/10 rounded-full py-0.5 px-2 text-xs text-primary">
                        Member
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Joined {formatDate(new Date())}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Profile Form */}
                <div className="p-6 space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="font-medium text-sm">
                        Full Name
                      </Label>
                      <div className="relative">
                        <User className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="name" 
                          name="name" 
                          value={formData.name} 
                          onChange={handleChange}
                          className="border-primary/20 focus:ring-primary pl-10 transition-all" 
                          placeholder="Enter your full name"
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        This is the name displayed on your profile and emails.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email" className="font-medium text-sm">
                        Email Address
                      </Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                          id="email" 
                          name="email" 
                          type="email"
                          value={formData.email} 
                          disabled
                          className="border-primary/20 bg-muted/50 pl-10" 
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        To change your email address, use the Account Management section.
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="bio" className="font-medium text-sm">
                      Bio
                    </Label>
                    <Textarea 
                      id="bio" 
                      name="bio" 
                      rows={3} 
                      value={formData.bio} 
                      onChange={handleChange}
                      className="border-primary/20 focus:ring-primary resize-none transition-all" 
                      placeholder="Tell us a little about yourself"
                    />
                    <p className="text-xs text-muted-foreground">
                      A brief description about yourself. This will be visible on your profile.
                    </p>
                  </div>
                </div>
                
                <div className="bg-muted/30 p-4 flex justify-end border-t">
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="bg-primary hover:bg-primary/90 transition-colors"
                  >
                    {isLoading ? (
                      <span className="flex items-center">
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </span>
                    ) : (
                      <span className="flex items-center">
                        <Check className="mr-2 h-4 w-4" />
                        Save Changes
                      </span>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Account Management */}
        <Card className="border border-border shadow-sm overflow-hidden">
          <CardHeader className="pb-4 border-b bg-primary/5">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">Account Management</CardTitle>
            </div>
            <CardDescription>Manage your account settings and security.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-3">ACCOUNT SETTINGS</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="bg-card border border-border/60 rounded-lg overflow-hidden transition-all hover:shadow-md hover:border-primary/30">
                    <div className="p-4 border-b border-border/60 bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Mail className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Email Address</h3>
                          <p className="text-xs text-muted-foreground">
                            {formData.email ? formData.email : "Loading..."}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        Change the email address associated with your account. Notifications will be sent to both addresses.
                      </p>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-full border-primary/20 hover:bg-primary/5 hover:border-primary/30 transition-colors"
                        onClick={() => setShowEmailDialog(true)}
                      >
                        Change Email
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-card border border-border/60 rounded-lg overflow-hidden transition-all hover:shadow-md hover:border-primary/30">
                    <div className="p-4 border-b border-border/60 bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <Settings className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">Password</h3>
                          <p className="text-xs text-muted-foreground">
                            Last updated: {formatDate(new Date())}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        Update your password regularly to keep your account secure. Use a strong, unique password.
                      </p>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="w-full border-primary/20 hover:bg-primary/5 hover:border-primary/30 transition-colors"
                        onClick={() => setShowPasswordDialog(true)}
                      >
                        Change Password
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-3">DANGER ZONE</h3>
                <div className="bg-destructive/5 border border-destructive/20 rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-destructive/10 bg-destructive/10">
                    <div className="flex items-center gap-3">
                      <div className="bg-destructive/20 p-2 rounded-full">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </div>
                      <div>
                        <h3 className="font-medium text-destructive">Delete Account</h3>
                        <p className="text-xs text-muted-foreground">
                          This action cannot be undone
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      Permanently delete your account and all associated data. Once deleted, your information cannot be recovered.
                    </p>
                    <div className="flex justify-end">
                      <Button 
                        variant="destructive" 
                        size="sm"
                        className="bg-destructive/90 hover:bg-destructive transition-colors"
                        onClick={() => setShowDeleteDialog(true)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete Account
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Email History - Only show if user data is loaded */}
        {!isLoadingUser && (
          <div className="mb-2">
            <EmailHistory userId={formData.id || ""} />
          </div>
        )}

        {/* Data & Privacy */}
        <Card className="border border-border shadow-sm overflow-hidden">
          <CardHeader className="pb-4 border-b bg-primary/5">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">Data & Privacy</CardTitle>
            </div>
            <CardDescription>Manage your data and privacy settings.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-3">EXPORT OPTIONS</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="bg-card border border-border/60 rounded-lg overflow-hidden transition-all hover:shadow-md hover:border-primary/30">
                    <div className="p-4 border-b border-border/60 bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <FileSpreadsheet className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">CSV Export</h3>
                          <p className="text-xs text-muted-foreground">
                            Export your data in CSV format
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        Download all your subscription data in CSV format for use in spreadsheet applications.
                      </p>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="w-full border-primary/20 hover:bg-primary/5 hover:border-primary/30 transition-colors"
                        onClick={handleExportCSV}
                      >
                        <FileSpreadsheet className="mr-2 h-4 w-4" />
                        Export CSV
                      </Button>
                    </div>
                  </div>
                  
                  <div className="bg-card border border-border/60 rounded-lg overflow-hidden transition-all hover:shadow-md hover:border-primary/30">
                    <div className="p-4 border-b border-border/60 bg-muted/30">
                      <div className="flex items-center gap-3">
                        <div className="bg-primary/10 p-2 rounded-full">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-medium">PDF Report</h3>
                          <p className="text-xs text-muted-foreground">
                            Generate a PDF report
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-muted-foreground mb-3">
                        Create a formatted PDF report with your subscription details and spending overview.
                      </p>
                      <Button 
                        variant="outline"
                        size="sm"
                        className="w-full border-primary/20 hover:bg-primary/5 hover:border-primary/30 transition-colors"
                        onClick={handleExportPDF}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Export PDF
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-3">DATA MANAGEMENT</h3>
                <div className="bg-destructive/5 border border-destructive/20 rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-destructive/10 bg-destructive/10">
                    <div className="flex items-center gap-3">
                      <div className="bg-destructive/20 p-2 rounded-full">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </div>
                      <div>
                        <h3 className="font-medium text-destructive">Delete All Subscriptions</h3>
                        <p className="text-xs text-muted-foreground">
                          Remove all your subscriptions
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground mb-3">
                      Delete all subscription data from your account. Your subscriptions will be archived but no longer visible in your dashboard.
                    </p>
                    <div className="flex justify-end">
                      <Button 
                        variant="destructive"
                        size="sm"
                        className="bg-destructive/90 hover:bg-destructive transition-colors"
                        onClick={() => setIsDeleteSubscriptionsDialogOpen(true)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete All Subscriptions
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="border border-border shadow-sm overflow-hidden">
          <CardHeader className="pb-4 border-b bg-primary/5">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl">Notification Settings</CardTitle>
            </div>
            <CardDescription>Configure how and when you receive notifications about your subscriptions.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-3">EMAIL NOTIFICATIONS</h3>
                <div className="bg-card border border-border/60 rounded-lg overflow-hidden transition-all hover:shadow-md hover:border-primary/30">
                  <div className="p-4 border-b border-border/60 bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <CalendarClock className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">Renewal Reminders</h3>
                        <p className="text-xs text-muted-foreground">
                          Get notified before your subscriptions renew
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-4">
                      <p className="text-sm text-muted-foreground">
                        Receive email notifications before your subscriptions are charged so you're never caught by surprise.
                      </p>
                      <Switch 
                        id="renewal-reminders" 
                        checked={notificationPreferences.paymentReminders}
                        onCheckedChange={handleNotificationChange}
                        disabled={isUpdatingNotifications}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                    
                    <div className={`space-y-3 border-t pt-4 transition-all ${notificationPreferences.paymentReminders ? 'opacity-100' : 'opacity-50'}`}>
                      <h4 className="text-sm font-medium">Reminder Timing</h4>
                      <div className="bg-background border border-border/60 rounded-lg">
                        <Select 
                          value={notificationPreferences.reminderFrequency}
                          onValueChange={handleFrequencyChange}
                          disabled={!notificationPreferences.paymentReminders || isUpdatingNotifications}
                        >
                          <SelectTrigger className="w-full border-none focus:ring-primary">
                            <div className="flex items-center gap-2">
                              <CalendarClock className="h-4 w-4 text-muted-foreground" />
                              <SelectValue placeholder="Select reminder frequency" />
                            </div>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="daily" className="flex items-center">
                              <div className="flex items-center gap-2">
                                <span>Daily (On the day)</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="3days">
                              <div className="flex items-center gap-2">
                                <span>3 Days Before</span>
                              </div>
                            </SelectItem>
                            <SelectItem value="weekly">
                              <div className="flex items-center gap-2">
                                <span>Weekly (7 Days Before)</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <p className="text-xs text-muted-foreground italic">
                        Choose when you'll receive payment reminders. We'll email you according to this schedule.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium text-sm text-muted-foreground mb-3">ADDITIONAL INFORMATION</h3>
                <div className="bg-primary/5 border border-primary/20 rounded-lg overflow-hidden">
                  <div className="p-4 border-b border-primary/10 bg-primary/10">
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/20 p-2 rounded-full">
                        <Info className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-medium">About Notifications</h3>
                        <p className="text-xs text-muted-foreground">
                          How notifications work
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="space-y-3">
                      <p className="text-sm">
                        All notifications are sent via email to your registered email address. Make sure your email is up-to-date to receive important reminders.
                      </p>
                      <div className="flex items-start gap-2 text-sm">
                        <Mail className="h-4 w-4 text-primary mt-1" />
                        <span>Notification emails come from <span className="font-medium">noreply@subscriptiontracker.com</span></span>
                      </div>
                      <div className="flex items-start gap-2 text-sm">
                        <AlertCircle className="h-4 w-4 text-primary mt-1" />
                        <span>If you're not receiving notifications, please check your spam folder and add our email to your safe senders list.</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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
                <Label htmlFor="currentEmail">Email</Label>
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
                  placeholder=""
                  required
                  value={emailChangeData.newEmail}
                  onChange={handleEmailChange}
                  className={emailChangeError ? "border-red-500" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Change (Optional)</Label>
                <Input
                  id="reason"
                  name="reason"
                  type="text"
                  placeholder=""
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
                  placeholder=""
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
              className="bg-destructive hover:bg-destructive/90 text-white !text-white font-medium"
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
              className="bg-destructive hover:bg-destructive/90 text-white"
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
              transition={{ delay: 0.6 }}
            >
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => setShowDeleteSuccess(false)}
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        </div>
      )}

      {/* Account Deletion Animation */}
      {showDeleteAccountAnimation && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-md w-full"
          >
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20,
                delay: 0.2 
              }}
              className="mx-auto mb-6 w-24 h-24 rounded-full bg-red-100 flex items-center justify-center"
            >
              <User className="h-12 w-12 text-red-600" />
            </motion.div>
            
            <motion.h2
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-3xl font-bold mb-2"
            >
              Account Deleted
            </motion.h2>
            
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="text-muted-foreground mb-8"
            >
              Your account has been permanently deleted. Thank you for using Subscription Tracker.
            </motion.p>
            
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="mx-auto"
            >
              <div className="relative w-full pt-1">
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-red-200">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 2.5 }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-red-500"
                  ></motion.div>
                </div>
                <div className="text-center text-sm text-muted-foreground">
                  Redirecting to home page...
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      )}

      {/* Email Change Success Animation */}
      {showEmailChangeSuccess && (
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
              className="w-24 h-24 bg-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center"
            >
              <Mail className="h-12 w-12 text-blue-600" />
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold mb-2">Email Address Updated!</h2>
              <p className="text-muted-foreground mb-1">
                Your email address has been successfully changed.
              </p>
              <p className="text-muted-foreground text-sm">
                Notifications have been sent to both your previous and new email addresses.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => setShowEmailChangeSuccess(false)}
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        </div>
      )}

      {/* Password Change Success Animation */}
      {showPasswordChangeSuccess && (
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
              className="w-24 h-24 bg-green-100 rounded-full mx-auto mb-6 flex items-center justify-center"
            >
              <Check className="h-12 w-12 text-green-600" />
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <h2 className="text-2xl font-bold mb-2">Password Updated!</h2>
              <p className="text-muted-foreground mb-1">
                Your password has been successfully changed.
              </p>
              <p className="text-muted-foreground text-sm">
                Please use your new password next time you login.
              </p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                variant="outline"
                className="mt-6"
                onClick={() => setShowPasswordChangeSuccess(false)}
              >
                Close
              </Button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

