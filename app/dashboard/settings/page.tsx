"use client"

import { useState } from "react"
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

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "john@example.com",
    bio: "Software engineer and subscription enthusiast.",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    try {
      // Handle form submission
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
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
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-start gap-6">
                <div className="flex flex-col items-center gap-4">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="/placeholder.svg?height=96&width=96" alt="User" />
                    <AvatarFallback className="text-2xl">JD</AvatarFallback>
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
              <Button variant="outline" className="h-auto py-4 justify-start px-6">
                <div className="flex flex-col items-start gap-1">
                  <span className="font-medium">Change Email</span>
                  <span className="text-sm text-muted-foreground">Update your email address</span>
                </div>
              </Button>
              <Button variant="outline" className="h-auto py-4 justify-start px-6">
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
    </div>
  )
}

