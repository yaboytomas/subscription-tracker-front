"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'

export default function EmailPreviewPage() {
  const { toast } = useToast()
  const [emailType, setEmailType] = useState('payment-reminder')
  const [daysUntilPayment, setDaysUntilPayment] = useState('3')
  const [frequency, setFrequency] = useState('3days')
  const [isLoading, setIsLoading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [emailSent, setEmailSent] = useState(false)
  
  const sendTestEmail = async () => {
    try {
      setIsLoading(true)
      setEmailSent(false)
      
      const response = await fetch(`/api/test/email-preview?type=${emailType}&days=${daysUntilPayment}&frequency=${frequency}`)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to send test email')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setPreview(data.preview)
        setEmailSent(true)
        toast({
          title: "Email sent",
          description: data.message,
        })
      } else {
        throw new Error(data.message || 'Failed to send test email')
      }
    } catch (error) {
      console.error('Error sending test email:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Something went wrong',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-2">Email Preview Tester</h1>
      <p className="text-muted-foreground mb-6">Test and preview email notifications</p>
      
      <Tabs defaultValue="config" className="space-y-4">
        <TabsList>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="preview" disabled={!preview}>Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Email Configuration</CardTitle>
              <CardDescription>Configure the test email parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Email Type</label>
                <Select 
                  value={emailType} 
                  onValueChange={setEmailType}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select email type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="payment-reminder">Payment Reminder</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Days Until Payment</label>
                <Select 
                  value={daysUntilPayment} 
                  onValueChange={setDaysUntilPayment}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select days until payment" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Day (Tomorrow)</SelectItem>
                    <SelectItem value="3">3 Days</SelectItem>
                    <SelectItem value="7">7 Days (One Week)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  This simulates how many days until the payment is due
                </p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">User Preference Setting</label>
                <Select 
                  value={frequency} 
                  onValueChange={setFrequency}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select user preference" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily Reminders</SelectItem>
                    <SelectItem value="weekly">Weekly Reminders</SelectItem>
                    <SelectItem value="3days">3 Days Before (Default)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  This simulates the user's notification preference setting
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={sendTestEmail}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>Send Test Email</>
                )}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="preview">
          <Card>
            <CardHeader>
              <CardTitle>Email Preview</CardTitle>
              <CardDescription>
                {emailSent ? 
                  'Email was sent to the test email address. Preview of the email content below.' : 
                  'Send a test email to see the preview'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {preview ? (
                <div 
                  className="border rounded-md p-4 bg-white"
                  dangerouslySetInnerHTML={{ __html: preview }}
                />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No preview available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 