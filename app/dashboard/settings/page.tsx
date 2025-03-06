import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {/* Account Management */}
        <Card>
          <CardHeader>
            <CardTitle>Account Management</CardTitle>
            <CardDescription>Manage your account settings and security.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                Change Email
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Change Password
              </Button>
            </div>
            <div className="flex justify-center pt-2">
              <Button variant="destructive" className="w-fit">
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Subscription Preferences</CardTitle>
            <CardDescription>Customize how you view and manage subscriptions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Preferred Billing Cycle Display</Label>
              <Select defaultValue="monthly">
                <SelectTrigger>
                  <SelectValue placeholder="Select billing cycle display" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                  <SelectItem value="both">Show Both</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Reminder Settings</Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-reminders" className="flex flex-col space-y-1">
                    <span>Email Reminders</span>
                  </Label>
                  <Switch id="email-reminders" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="push-notifications" className="flex flex-col space-y-1">
                    <span>Push Notifications</span>
                  </Label>
                  <Switch id="push-notifications" defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="in-app-alerts" className="flex flex-col space-y-1">
                    <span>In-App Alerts</span>
                  </Label>
                  <Switch id="in-app-alerts" defaultChecked />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle>Data & Privacy</CardTitle>
            <CardDescription>Manage your data and privacy settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                Export Data (CSV)
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Export Data (PDF)
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Backup & Restore Data
              </Button>
            </div>
            <div className="flex justify-center pt-2">
              <Button variant="destructive" className="w-fit">
                Delete All Subscription Data
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>Configure your notification preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="renewal-reminders" className="flex flex-col space-y-1">
                <span>Renewal Reminders</span>
                <span className="text-xs font-normal text-muted-foreground">
                  Get notified before subscriptions renew
                </span>
              </Label>
              <Switch id="renewal-reminders" defaultChecked />
            </div>
            <div className="space-y-2">
              <Label>Reminder Frequency</Label>
              <Select defaultValue="3days">
                <SelectTrigger>
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

