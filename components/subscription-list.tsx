"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Edit, MoreHorizontal, Trash2, ArrowUpDown, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { motion } from "framer-motion"

// Define the subscription type
interface Subscription {
  _id: string;
  name: string;
  price: string;
  billingCycle: string;
  nextPayment: string;
  category: string;
  startDate: string;
  description: string;
  userId: string;
}

type SortField = "name" | "price" | "billingCycle" | "nextPayment" | "category"
type SortDirection = "asc" | "desc"

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

interface SubscriptionListProps {
  isAddDialogOpen: boolean
  setIsAddDialogOpen: (open: boolean) => void
  refreshData?: () => void
}

const rowVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.3,
      ease: "easeOut"
    }
  },
  hover: {
    backgroundColor: "hsl(var(--accent))",
    transition: {
      duration: 0.2
    }
  }
}

export function SubscriptionList({ isAddDialogOpen, setIsAddDialogOpen, refreshData }: SubscriptionListProps) {
  const { toast } = useToast()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [subscriptionList, setSubscriptionList] = useState<Subscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [editingSubscription, setEditingSubscription] = useState<Subscription | null>(null)
  const [newSubscription, setNewSubscription] = useState({
    name: "",
    price: "",
    category: "",
    billingCycle: "",
    startDate: "",
    description: "",
  })
  const [formErrors, setFormErrors] = useState<{
    name?: string;
    price?: string;
    category?: string;
    billingCycle?: string;
    startDate?: string;
  }>({})

  // Fetch subscriptions from the API
  useEffect(() => {
    const fetchSubscriptions = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch('/api/subscriptions');
        
        if (!response.ok) {
          throw new Error('Failed to fetch subscriptions');
        }
        
        const data = await response.json();
        
        if (data.success) {
          setSubscriptionList(data.subscriptions || []);
        } else {
          throw new Error(data.message || 'Failed to fetch subscriptions');
        }
      } catch (err) {
        console.error('Error fetching subscriptions:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : 'Failed to load subscriptions',
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSubscriptions();
  }, [toast]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const sortedSubscriptions = [...subscriptionList].sort((a, b) => {
    const aValue = a[sortField]
    const bValue = b[sortField]

    if (sortField === "price") {
      return sortDirection === "asc" ? parseFloat(aValue) - parseFloat(bValue) : parseFloat(bValue) - parseFloat(aValue)
    }

    if (sortField === "nextPayment") {
      return sortDirection === "asc"
        ? new Date(aValue).getTime() - new Date(bValue).getTime()
        : new Date(bValue).getTime() - new Date(aValue).getTime()
    }

    return sortDirection === "asc"
      ? String(aValue).localeCompare(String(bValue))
      : String(bValue).localeCompare(String(aValue))
  })

  const handleDelete = async () => {
    if (!deleteId) {
      console.error("No subscription ID provided for deletion");
      toast({
        title: "Error",
        description: "No subscription selected for deletion",
        variant: "destructive",
      });
      return;
    }

    console.log(`Attempting to delete subscription with ID: ${deleteId}`);
    setIsDeleting(true);
    
    try {
      const response = await fetch(`/api/subscriptions/${deleteId}`, {
        method: 'DELETE',
      });
      
      console.log(`Delete API response status: ${response.status}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Delete API error: ${errorText}`);
        throw new Error(`Failed to delete subscription: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Delete API response data:", data);
      
      if (data.success) {
        // Update local state to remove the deleted subscription
        setSubscriptionList(subscriptionList.filter((sub) => sub._id !== deleteId));
        
        toast({
          title: "Subscription deleted",
          description: "The subscription has been successfully removed.",
          duration: 5000,
        });
        
        // Refresh dashboard data
        if (refreshData) {
          console.log("Refreshing dashboard data after deletion");
          refreshData();
        }
      } else {
        throw new Error(data.message || 'Failed to delete subscription');
      }
    } catch (err) {
      console.error('Error deleting subscription:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to delete subscription',
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setDeleteId(null);
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const validateForm = (): boolean => {
    const errors: {
      name?: string;
      price?: string;
      category?: string;
      billingCycle?: string;
      startDate?: string;
    } = {};
    
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
        // Add the new subscription to the list
        setSubscriptionList([...subscriptionList, data.subscription]);
        
        // Reset form and close dialog
        setNewSubscription({
          name: "",
          price: "",
          category: "",
          billingCycle: "",
          startDate: "",
          description: "",
        });
        setFormErrors({});
        
        setIsAddDialogOpen(false);
        
        toast({
          title: "Subscription added",
          description: "Your new subscription has been added successfully.",
        });
        
        // Refresh dashboard data
        if (refreshData) {
          refreshData();
        }
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

  const handleEditSubscription = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingSubscription) return;
    
    try {
      // Call the API to update the subscription
      const response = await fetch(`/api/subscriptions/${editingSubscription._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingSubscription),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Update the subscription in the list
        setSubscriptionList(subscriptionList.map(sub => 
          sub._id === editingSubscription._id ? data.subscription : sub
        ));
        
        setEditingSubscription(null);
        
        toast({
          title: "Subscription updated",
          description: "Your subscription has been updated successfully.",
        });
        
        // Refresh dashboard data
        if (refreshData) {
          refreshData();
        }
      } else {
        throw new Error(data.message || 'Failed to update subscription');
      }
    } catch (err) {
      console.error('Error updating subscription:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to update subscription',
        variant: "destructive",
      });
    }
  }

  return (
    <>
      {/* Edit Subscription Dialog */}
      <Dialog open={!!editingSubscription} onOpenChange={(open) => !open && setEditingSubscription(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
            <DialogDescription>Make changes to your subscription here.</DialogDescription>
          </DialogHeader>
          {editingSubscription && (
            <form onSubmit={handleEditSubscription} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editingSubscription.name}
                  onChange={(e) =>
                    setEditingSubscription({ ...editingSubscription, name: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Price</Label>
                <Input
                  id="edit-price"
                  type="number"
                  step="0.01"
                  value={editingSubscription.price}
                  onChange={(e) =>
                    setEditingSubscription({ ...editingSubscription, price: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-category">Category</Label>
                <Select
                  value={editingSubscription.category}
                  onValueChange={(value) =>
                    setEditingSubscription({ ...editingSubscription, category: value })
                  }
                >
                  <SelectTrigger id="edit-category">
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
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-billingCycle">Billing Cycle</Label>
                <Select
                  value={editingSubscription.billingCycle}
                  onValueChange={(value) =>
                    setEditingSubscription({ ...editingSubscription, billingCycle: value })
                  }
                >
                  <SelectTrigger id="edit-billingCycle">
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
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-startDate">Start Date</Label>
                <Input
                  id="edit-startDate"
                  type="date"
                  value={editingSubscription.startDate}
                  onChange={(e) =>
                    setEditingSubscription({ ...editingSubscription, startDate: e.target.value })
                  }
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Input
                  id="edit-description"
                  value={editingSubscription.description}
                  onChange={(e) =>
                    setEditingSubscription({ ...editingSubscription, description: e.target.value })
                  }
                />
              </div>
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Subscription Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
        setIsAddDialogOpen(open);
        if (!open) {
          // Reset form errors when dialog is closed
          setFormErrors({});
        }
      }}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
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
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={(open) => {
        setIsDeleteDialogOpen(open);
        if (!open) setDeleteId(null);
      }}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" /> 
              Confirm Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="mt-2">
              <p className="mb-2 font-medium">Are you sure you want to delete this subscription?</p>
              <p>This action <span className="font-semibold">cannot be undone</span>. This will permanently remove the subscription from your account and the database.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-4">
            <AlertDialogCancel 
              onClick={() => {
                setDeleteId(null);
                console.log("Delete operation cancelled");
              }}
              className="border-gray-300"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault();
                console.log("Confirming delete for ID:", deleteId);
                handleDelete();
              }}
              className="bg-destructive hover:bg-destructive/90 text-white"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-solid border-current border-r-transparent"></span>
                  Deleting...
                </>
              ) : (
                "Delete Subscription"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Main Subscription Table */}
      {isLoading ? (
        <div className="py-10 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
            <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
          </div>
          <p className="mt-4 text-muted-foreground">Loading your subscriptions...</p>
        </div>
      ) : error ? (
        <div className="py-10 text-center">
          <p className="text-destructive">Error: {error}</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </div>
      ) : subscriptionList.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-muted-foreground">You don't have any subscriptions yet.</p>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => setIsAddDialogOpen(true)}
          >
            Add Your First Subscription
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[220px]">
                  <Button variant="ghost" onClick={() => handleSort("name")} className="font-medium">
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button variant="ghost" onClick={() => handleSort("price")} className="font-medium">
                    Price
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <Button variant="ghost" onClick={() => handleSort("billingCycle")} className="font-medium">
                    Billing Cycle
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="hidden md:table-cell">
                  <Button variant="ghost" onClick={() => handleSort("nextPayment")} className="font-medium">
                    Next Payment
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="hidden lg:table-cell">
                  <Button variant="ghost" onClick={() => handleSort("category")} className="font-medium">
                    Category
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                  </Button>
                </TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSubscriptions.map((subscription, index) => (
                <motion.tr
                  key={subscription._id}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.05 }}
                  whileHover="hover"
                  className="group"
                >
                  <TableCell className="font-medium">
                    <div>
                      <div>{subscription.name}</div>
                      <div className="text-xs text-muted-foreground lg:hidden">{subscription.category}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div>${parseFloat(subscription.price).toFixed(2)}</div>
                      <div className="text-xs text-muted-foreground md:hidden">{subscription.billingCycle}</div>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{subscription.billingCycle}</TableCell>
                  <TableCell className="hidden md:table-cell">{formatDate(subscription.nextPayment)}</TableCell>
                  <TableCell className="hidden lg:table-cell">{subscription.category}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => setEditingSubscription(subscription)}
                          className="text-blue-500 focus:text-blue-500"
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setDeleteId(subscription._id);
                            setIsDeleteDialogOpen(true);
                            console.log("Opening delete dialog for subscription:", subscription.name);
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </>
  )
}

