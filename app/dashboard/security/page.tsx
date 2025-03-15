'use client';

import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Shield, Bell, Lock, AlertCircle, CheckCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';

export default function SecuritySettings() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Security preferences
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [loginNotifications, setLoginNotifications] = useState(true);
  const [alwaysRequire2FA, setAlwaysRequire2FA] = useState(false);
  
  // 2FA verification
  const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    }
  };
  
  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };
  
  // Load user security preferences and get user info
  useEffect(() => {
    const fetchSecuritySettings = async () => {
      try {
        console.log("Fetching security settings...");
        const response = await fetch('/api/auth/profile');
        const data = await response.json();
        
        console.log("Security settings response:", data);
        
        if (data.success && data.user) {
          setUserEmail(data.user.email);
          const securityPrefs = data.user.securityPreferences || {};
          console.log("User security preferences:", securityPrefs);
          setTwoFactorEnabled(securityPrefs.twoFactorEnabled || false);
          setLoginNotifications(securityPrefs.loginNotifications !== false); // default to true
          setAlwaysRequire2FA(securityPrefs.alwaysRequire2FA || false); // default to false
          setLoading(false);
        }
      } catch (error) {
        console.error('Failed to fetch security settings:', error);
        setErrorMessage('Failed to load security settings. Please try again.');
        setLoading(false);
      }
    };
    
    fetchSecuritySettings();
  }, []);
  
  // Handle toggling 2FA
  const handleToggle2FA = async () => {
    console.log("Toggle 2FA clicked. Current state:", twoFactorEnabled);
    
    if (twoFactorEnabled) {
      console.log("Turning off 2FA");
      // Turning off 2FA - just update settings
      await updateSecuritySettings({ 
        twoFactorEnabled: false, 
        loginNotifications,
        alwaysRequire2FA: false // Also disable always require when turning off 2FA
      });
    } else {
      console.log("Initiating 2FA setup process");
      // Turning on 2FA - request verification code
      try {
        setLoading(true);
        const response = await fetch('/api/auth/2fa', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: userEmail }),
        });
        
        const data = await response.json();
        console.log("2FA setup request response:", data);
        
        if (data.success) {
          toast({
            title: 'Verification Code Sent',
            description: 'Please check your email and enter the code to enable 2FA.',
          });
          setShowTwoFactorDialog(true);
        } else {
          throw new Error(data.message || 'Failed to send verification code');
        }
      } catch (error: any) {
        console.error("Error setting up 2FA:", error);
        setErrorMessage(error.message || 'Failed to send verification code');
        toast({
          title: 'Error',
          description: error.message || 'Failed to send verification code',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
  };
  
  // Handle verification code submission
  const handleVerifyCode = async () => {
    console.log("Verifying 2FA code:", verificationCode);
    
    if (!verificationCode || verificationCode.length !== 6) {
      console.log("Invalid code format");
      setErrorMessage('Please enter a valid 6-digit verification code');
      toast({
        title: 'Invalid Code',
        description: 'Please enter a valid 6-digit verification code',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setVerifying(true);
      setErrorMessage(null);
      
      const response = await fetch('/api/auth/2fa', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          code: verificationCode,
        }),
      });
      
      const data = await response.json();
      console.log("2FA verification response:", data);
      
      if (data.success) {
        console.log("2FA code verified, updating security settings");
        // Code verified, update settings
        await updateSecuritySettings({ 
          twoFactorEnabled: true, 
          loginNotifications,
          alwaysRequire2FA
        });
        setShowTwoFactorDialog(false);
        setVerificationCode('');
        setSuccessMessage('Two-Factor Authentication has been enabled successfully.');
        setTimeout(() => setSuccessMessage(null), 5000);
        toast({
          title: 'Two-Factor Authentication Enabled',
          description: 'Your account is now more secure with 2FA.',
        });
      } else {
        throw new Error(data.message || 'Invalid verification code');
      }
    } catch (error: any) {
      console.error("2FA verification failed:", error);
      setErrorMessage(error.message || 'Invalid verification code');
      toast({
        title: 'Verification Failed',
        description: error.message || 'Invalid verification code',
        variant: 'destructive',
      });
    } finally {
      setVerifying(false);
    }
  };
  
  // Handle toggling always require 2FA
  const handleToggleAlwaysRequire2FA = async () => {
    console.log("Toggle always require 2FA clicked. Current state:", alwaysRequire2FA);
    
    if (!twoFactorEnabled && !alwaysRequire2FA) {
      setErrorMessage('You need to enable Two-Factor Authentication before requiring it on every login.');
      toast({
        title: 'Enable 2FA First',
        description: 'You need to enable Two-Factor Authentication before requiring it on every login.',
        variant: 'destructive',
      });
      return;
    }
    
    await updateSecuritySettings({ 
      twoFactorEnabled, 
      loginNotifications, 
      alwaysRequire2FA: !alwaysRequire2FA 
    });
  };
  
  // Handle toggling login notifications
  const handleToggleLoginNotifications = async () => {
    console.log("Toggle login notifications clicked. Current state:", loginNotifications);
    await updateSecuritySettings({ 
      twoFactorEnabled, 
      loginNotifications: !loginNotifications,
      alwaysRequire2FA 
    });
  };
  
  // Update security settings
  const updateSecuritySettings = async (settings: { 
    twoFactorEnabled: boolean, 
    loginNotifications: boolean,
    alwaysRequire2FA: boolean 
  }) => {
    console.log("Updating security settings:", settings);
    
    try {
      setSaving(true);
      setErrorMessage(null);
      
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          securityPreferences: settings,
        }),
      });
      
      const data = await response.json();
      console.log("Security settings update response:", data);
      
      if (data.success) {
        setTwoFactorEnabled(settings.twoFactorEnabled);
        setLoginNotifications(settings.loginNotifications);
        setAlwaysRequire2FA(settings.alwaysRequire2FA);
        console.log("Security settings updated successfully, new state:", {
          twoFactorEnabled: settings.twoFactorEnabled,
          loginNotifications: settings.loginNotifications,
          alwaysRequire2FA: settings.alwaysRequire2FA
        });
        
        setSuccessMessage('Your security settings have been updated successfully.');
        setTimeout(() => setSuccessMessage(null), 5000);
        
        toast({
          title: 'Settings Updated',
          description: 'Your security settings have been updated successfully.',
        });
      } else {
        throw new Error(data.message || 'Failed to update settings');
      }
    } catch (error: any) {
      console.error("Failed to update security settings:", error);
      setErrorMessage(error.message || 'Failed to update settings');
      toast({
        title: 'Error',
        description: error.message || 'Failed to update settings',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[50vh] p-8">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-lg text-muted-foreground">Loading security settings...</p>
      </div>
    );
  }
  
  return (
    <motion.div 
      className="container px-4 sm:px-6 max-w-4xl py-8"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold mb-2">Security Settings</h1>
        <p className="text-muted-foreground mb-8">Manage your account security preferences and authentication methods.</p>
      </motion.div>
      
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6"
          >
            <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <AlertDescription>{successMessage}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
      
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6"
          >
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div variants={itemVariants}>
        <Card className="mb-8 overflow-hidden border-2 hover:border-primary/50 transition-all duration-300">
          <CardHeader className="bg-muted/50">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-primary/10 p-2">
                <Shield className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>
                  Add an extra layer of security to protect your account
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <motion.div 
              whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
              transition={{ duration: 0.2 }}
              className="flex items-center justify-between p-2 rounded-md"
            >
              <div className="space-y-0.5">
                <h3 className="font-medium">Two-Factor Authentication (2FA)</h3>
                <p className="text-sm text-muted-foreground">
                  Require a verification code sent to your email when signing in
                </p>
              </div>
              <Switch
                checked={twoFactorEnabled}
                onCheckedChange={handleToggle2FA}
                disabled={saving}
              />
            </motion.div>
            
            <AnimatePresence>
              {twoFactorEnabled && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div 
                    className="flex items-center justify-between pl-6 mt-2 p-2 rounded-md"
                    whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="space-y-0.5">
                      <h3 className="font-medium">Require 2FA on every login</h3>
                      <p className="text-sm text-muted-foreground">
                        Always prompt for 2FA code, even on trusted devices
                      </p>
                    </div>
                    <Switch
                      checked={alwaysRequire2FA}
                      onCheckedChange={handleToggleAlwaysRequire2FA}
                      disabled={saving || !twoFactorEnabled}
                    />
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
            
            <Separator className="my-4" />
            
            <motion.div 
              className="flex items-center justify-between p-2 rounded-md"
              whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
              transition={{ duration: 0.2 }}
            >
              <div className="space-y-0.5">
                <h3 className="font-medium">Login Notifications</h3>
                <p className="text-sm text-muted-foreground">
                  Receive email alerts when someone signs into your account
                </p>
              </div>
              <Switch
                checked={loginNotifications}
                onCheckedChange={handleToggleLoginNotifications}
                disabled={saving}
              />
            </motion.div>
          </CardContent>
          <CardFooter className="bg-muted/30 flex flex-row items-center gap-2">
            <div className="rounded-full bg-primary/10 p-1">
              <Lock className="h-4 w-4 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">
              We recommend enabling all security features for maximum account protection.
            </p>
          </CardFooter>
        </Card>
      </motion.div>
      
      <motion.div variants={itemVariants}>
        <Card className="border-2 hover:border-primary/50 transition-all duration-300">
          <CardHeader className="bg-muted/50">
            <div className="flex items-center space-x-3">
              <div className="rounded-full bg-primary/10 p-2">
                <Bell className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>Security Recommendations</CardTitle>
                <CardDescription>
                  Tips to keep your account secure
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ul className="space-y-4">
              <motion.li 
                className="flex gap-3 p-3 rounded-md"
                whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                transition={{ duration: 0.2 }}
              >
                <div className="rounded-full bg-green-100 p-1 h-fit">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Use a strong password</h3>
                  <p className="text-sm text-muted-foreground">Create a unique password with a mix of letters, numbers, and symbols.</p>
                </div>
              </motion.li>
              
              <motion.li 
                className="flex gap-3 p-3 rounded-md"
                whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                transition={{ duration: 0.2 }}
              >
                <div className="rounded-full bg-green-100 p-1 h-fit">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Enable two-factor authentication</h3>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                </div>
              </motion.li>
              
              <motion.li 
                className="flex gap-3 p-3 rounded-md"
                whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                transition={{ duration: 0.2 }}
              >
                <div className="rounded-full bg-green-100 p-1 h-fit">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <h3 className="font-medium">Monitor login notifications</h3>
                  <p className="text-sm text-muted-foreground">Stay informed about new sign-ins to your account.</p>
                </div>
              </motion.li>
            </ul>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* 2FA Verification Dialog */}
      <Dialog open={showTwoFactorDialog} onOpenChange={setShowTwoFactorDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Shield className="h-6 w-6 text-primary" />
              </div>
            </div>
            <DialogTitle className="text-center">Verify Your Email</DialogTitle>
            <DialogDescription className="text-center">
              Enter the 6-digit verification code sent to your email address to enable two-factor authentication.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {errorMessage && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errorMessage}</AlertDescription>
              </Alert>
            )}
            
            <div className="grid gap-2">
              <Label htmlFor="verification-code">Verification Code</Label>
              <Input
                id="verification-code"
                placeholder="123456"
                value={verificationCode}
                onChange={(e) => {
                  setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                  setErrorMessage(null);
                }}
                maxLength={6}
                className="text-lg tracking-widest text-center"
                autoComplete="one-time-code"
                inputMode="numeric"
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-1 text-center">
                The code will expire in 10 minutes.
              </p>
            </div>
          </div>
          
          <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
            <Button variant="outline" onClick={() => setShowTwoFactorDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleVerifyCode} disabled={verifying || verificationCode.length !== 6} className="mb-2 sm:mb-0">
              {verifying ? (
                <span className="flex items-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </span>
              ) : (
                'Verify & Enable 2FA'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </motion.div>
  );
} 