import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure how you receive notifications.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="email-notifications" className="flex flex-col space-y-1">
                <span>Email Notifications</span>
                <span className="text-xs font-normal text-muted-foreground">Receive notifications via email.</span>
              </Label>
              <Switch id="email-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="payment-reminders" className="flex flex-col space-y-1">
                <span>Payment Reminders</span>
                <span className="text-xs font-normal text-muted-foreground">Get reminded before payments are due.</span>
              </Label>
              <Switch id="payment-reminders" defaultChecked />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="price-changes" className="flex flex-col space-y-1">
                <span>Price Change Alerts</span>
                <span className="text-xs font-normal text-muted-foreground">
                  Get notified when subscription prices change.
                </span>
              </Label>
              <Switch id="price-changes" defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize how the application looks.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="dark-mode" className="flex flex-col space-y-1">
                <span>Dark Mode</span>
                <span className="text-xs font-normal text-muted-foreground">Use dark mode by default.</span>
              </Label>
              <Switch id="dark-mode" />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="compact-view" className="flex flex-col space-y-1">
                <span>Compact View</span>
                <span className="text-xs font-normal text-muted-foreground">Display more items on screen.</span>
              </Label>
              <Switch id="compact-view" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Currency</CardTitle>
            <CardDescription>Set your preferred currency.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="usd" className="flex flex-col space-y-1">
                <span>USD ($)</span>
                <span className="text-xs font-normal text-muted-foreground">United States Dollar</span>
              </Label>
              <Switch id="usd" defaultChecked />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="eur" className="flex flex-col space-y-1">
                <span>EUR (€)</span>
                <span className="text-xs font-normal text-muted-foreground">Euro</span>
              </Label>
              <Switch id="eur" />
            </div>
            <div className="flex items-center justify-between space-x-2">
              <Label htmlFor="gbp" className="flex flex-col space-y-1">
                <span>GBP (£)</span>
                <span className="text-xs font-normal text-muted-foreground">British Pound</span>
              </Label>
              <Switch id="gbp" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

