"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useSubscriptionDialog } from "@/context/subscription-dialog-context"
import { motion, AnimatePresence } from "framer-motion"
import { CheckCircle2 } from "lucide-react"

const categories = [
  "Entertainment",
  "Music",
  "Software",
  "Shopping",
  "Cloud Storage",
  "Gaming",
  "Fitness",
  "News",
  "Food",
  "Other",
]

const billingCycles = ["Monthly", "Quarterly", "Yearly", "Weekly", "Biweekly", "Custom"]

interface FormErrors {
  name?: string;
  price?: string;
  category?: string;
  billingCycle?: string;
  startDate?: string;
}

interface NewSubscription {
  name: string;
  price: string;
  category: string;
  billingCycle: string;
  startDate: string;
  description: string;
}

export function SubscriptionFormDialog() {
  const { isAddDialogOpen, closeAddDialog } = useSubscriptionDialog()
  const { toast } = useToast()
  const [formErrors, setFormErrors] = useState<FormErrors>({})
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false)
  const [newSubscription, setNewSubscription] = useState<NewSubscription>({
    name: "",
    price: "",
    category: "",
    billingCycle: "",
    startDate: new Date().toISOString().split('T')[0],
    description: "",
  })

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    
    // Validate name
    if (!newSubscription.name.trim()) {
      errors.name = "Name is required";
    }
    
    // Validate price
    if (!newSubscription.price) {
      errors.price = "Price is required";
    } else if (isNaN(parseFloat(newSubscription.price)) || parseFloat(newSubscription.price) <= 0) {
      errors.price = "Please enter a valid price";
    }
    
    // Validate category
    if (!newSubscription.category) {
      errors.category = "Category is required";
    }
    
    // Validate billing cycle
    if (!newSubscription.billingCycle) {
      errors.billingCycle = "Billing cycle is required";
    }
    
    // Validate start date
    if (!newSubscription.startDate) {
      errors.startDate = "Start date is required";
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const handleAddSubscription = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate the form
    if (!validateForm()) {
      toast({
        title: "Form validation failed",
        description: "Please check the form for errors",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Call the API to create a new subscription
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSubscription),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create subscription');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Show success animation
        setShowSuccessAnimation(true);
        
        toast({
          title: "Subscription added",
          description: "Your new subscription has been added successfully.",
        });
        
        // Close dialog and refresh after animation completes
        setTimeout(() => {
          setShowSuccessAnimation(false);
          setNewSubscription({
            name: "",
            price: "",
            category: "",
            billingCycle: "",
            startDate: new Date().toISOString().split('T')[0],
            description: "",
          });
          setFormErrors({});
          closeAddDialog();
          
          // Refresh the page to show the new subscription
          window.location.reload();
        }, 800);
      } else {
        throw new Error(data.message || 'Failed to create subscription');
      }
    } catch (err) {
      console.error('Error adding subscription:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to add subscription',
        variant: "destructive",
      });
    }
  }

  return (
    <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
      if (!open) {
        closeAddDialog();
        // Reset form errors when dialog is closed
        setFormErrors({});
        setShowSuccessAnimation(false);
      }
    }}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <AnimatePresence>
          {showSuccessAnimation ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center justify-center py-10 text-center"
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ 
                  type: "spring", 
                  stiffness: 260, 
                  damping: 20 
                }}
                className="mb-6 text-primary"
              >
                <CheckCircle2 size={80} />
              </motion.div>
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl font-bold mb-2"
              >
                Subscription Added!
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-muted-foreground"
              >
                Your subscription to {newSubscription.name} has been successfully added.
              </motion.p>
            </motion.div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Add New Subscription</DialogTitle>
                <DialogDescription>Add a new subscription to track.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddSubscription} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name" className="flex items-center">
                    Name {formErrors.name && <span className="text-destructive text-sm ml-2">*</span>}
                  </Label>
                  <Input
                    id="name"
                    value={newSubscription.name}
                    onChange={(e) => setNewSubscription({ ...newSubscription, name: e.target.value })}
                    className={formErrors.name ? "border-destructive" : ""}
                    required
                  />
                  {formErrors.name && (
                    <p className="text-destructive text-sm">{formErrors.name}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price" className="flex items-center">
                    Price {formErrors.price && <span className="text-destructive text-sm ml-2">*</span>}
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={newSubscription.price}
                    onChange={(e) => setNewSubscription({ ...newSubscription, price: e.target.value })}
                    className={formErrors.price ? "border-destructive" : ""}
                    required
                  />
                  {formErrors.price && (
                    <p className="text-destructive text-sm">{formErrors.price}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category" className="flex items-center">
                    Category {formErrors.category && <span className="text-destructive text-sm ml-2">*</span>}
                  </Label>
                  <Select
                    value={newSubscription.category}
                    onValueChange={(value) =>
                      setNewSubscription({ ...newSubscription, category: value })
                    }
                  >
                    <SelectTrigger id="category" className={formErrors.category ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.category && (
                    <p className="text-destructive text-sm">{formErrors.category}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="billingCycle" className="flex items-center">
                    Billing Cycle {formErrors.billingCycle && <span className="text-destructive text-sm ml-2">*</span>}
                  </Label>
                  <Select
                    value={newSubscription.billingCycle}
                    onValueChange={(value) =>
                      setNewSubscription({ ...newSubscription, billingCycle: value })
                    }
                  >
                    <SelectTrigger id="billingCycle" className={formErrors.billingCycle ? "border-destructive" : ""}>
                      <SelectValue placeholder="Select billing cycle" />
                    </SelectTrigger>
                    <SelectContent>
                      {billingCycles.map((cycle) => (
                        <SelectItem key={cycle} value={cycle}>
                          {cycle}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.billingCycle && (
                    <p className="text-destructive text-sm">{formErrors.billingCycle}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="startDate" className="flex items-center">
                    Start Date {formErrors.startDate && <span className="text-destructive text-sm ml-2">*</span>}
                  </Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newSubscription.startDate}
                    onChange={(e) => setNewSubscription({ ...newSubscription, startDate: e.target.value })}
                    className={formErrors.startDate ? "border-destructive" : ""}
                    required
                  />
                  {formErrors.startDate && (
                    <p className="text-destructive text-sm">{formErrors.startDate}</p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={newSubscription.description}
                    onChange={(e) => setNewSubscription({ ...newSubscription, description: e.target.value })}
                  />
                </div>
                <DialogFooter>
                  <Button type="submit">Add Subscription</Button>
                </DialogFooter>
              </form>
            </>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  )
} 