"use client"

import { useState } from "react"
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

// Sample data - would be fetched from API in a real app
const subscriptions = [
  {
    id: "1",
    name: "Netflix",
    price: "15.99",
    billingCycle: "Monthly",
    nextPayment: "2025-04-15",
    category: "Entertainment",
    startDate: "2023-01-15",
    description: "Premium plan with 4K streaming",
  },
  {
    id: "2",
    name: "Spotify",
    price: "9.99",
    billingCycle: "Monthly",
    nextPayment: "2025-04-10",
    category: "Music",
    startDate: "2022-05-10",
    description: "Family plan",
  },
  {
    id: "3",
    name: "Adobe Creative Cloud",
    price: "52.99",
    billingCycle: "Monthly",
    nextPayment: "2025-04-22",
    category: "Software",
    startDate: "2023-03-01",
    description: "Creative Cloud All Apps",
  },
  {
    id: "4",
    name: "Amazon Prime",
    price: "139",
    billingCycle: "Yearly",
    nextPayment: "2025-11-15",
    category: "Shopping",
    startDate: "2023-01-01",
    description: "Prime membership with free shipping",
  },
  {
    id: "5",
    name: "Disney+",
    price: "7.99",
    billingCycle: "Monthly",
    nextPayment: "2025-04-18",
    category: "Entertainment",
    startDate: "2023-06-15",
    description: "Basic plan with ads",
  },
  {
    id: "6",
    name: "Microsoft 365",
    price: "99.99",
    billingCycle: "Yearly",
    nextPayment: "2025-08-05",
    category: "Software",
    startDate: "2023-01-01",
    description: "Family plan with 6 users",
  },
  {
    id: "7",
    name: "YouTube Premium",
    price: "11.99",
    billingCycle: "Monthly",
    nextPayment: "2025-04-12",
    category: "Entertainment",
    startDate: "2023-02-01",
    description: "Family plan",
  },
  {
    id: "8",
    name: "iCloud Storage",
    price: "2.99",
    billingCycle: "Monthly",
    nextPayment: "2025-04-08",
    category: "Cloud Storage",
    startDate: "2023-01-01",
    description: "50GB storage plan",
  },
]

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

export function SubscriptionList({ isAddDialogOpen, setIsAddDialogOpen }: SubscriptionListProps) {
  const { toast } = useToast()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [subscriptionList, setSubscriptionList] = useState(subscriptions)
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [newSubscription, setNewSubscription] = useState({
    name: "",
    price: "",
    category: "",
    billingCycle: "",
    startDate: "",
    description: "",
  })

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
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue
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

  const handleDelete = () => {
    if (deleteId) {
      setSubscriptionList(subscriptionList.filter((sub) => sub.id !== deleteId))
      toast({
        title: "Subscription deleted",
        description: "The subscription has been removed from your account.",
      })
      setIsDeleteDialogOpen(false)
      setDeleteId(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const handleAddSubscription = (e: React.FormEvent) => {
    e.preventDefault()
    const newId = (subscriptionList.length + 1).toString()
    const subscription = {
      ...newSubscription,
      id: newId,
      nextPayment: new Date().toISOString().split('T')[0], // Set to today's date initially
    }
    
    setSubscriptionList([...subscriptionList, subscription])
    setIsAddDialogOpen(false)
    setNewSubscription({
      name: "",
      price: "",
      category: "",
      billingCycle: "",
      startDate: "",
      description: "",
    })
    
    toast({
      title: "Subscription added",
      description: "Your new subscription has been added successfully.",
    })
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead 
                className="cursor-pointer hover:bg-accent"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-1">
                  Name
                  <ArrowUpDown className="h-4 w-4" />
                  {sortField === "name" && (
                    <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-accent"
                onClick={() => handleSort("price")}
              >
                <div className="flex items-center gap-1">
                  Price
                  <ArrowUpDown className="h-4 w-4" />
                  {sortField === "price" && (
                    <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-accent"
                onClick={() => handleSort("billingCycle")}
              >
                <div className="flex items-center gap-1">
                  Billing Cycle
                  <ArrowUpDown className="h-4 w-4" />
                  {sortField === "billingCycle" && (
                    <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-accent"
                onClick={() => handleSort("nextPayment")}
              >
                <div className="flex items-center gap-1">
                  Next Payment
                  <ArrowUpDown className="h-4 w-4" />
                  {sortField === "nextPayment" && (
                    <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </TableHead>
              <TableHead 
                className="cursor-pointer hover:bg-accent"
                onClick={() => handleSort("category")}
              >
                <div className="flex items-center gap-1">
                  Category
                  <ArrowUpDown className="h-4 w-4" />
                  {sortField === "category" && (
                    <span className="text-xs">{sortDirection === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedSubscriptions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No subscriptions found. Add your first subscription to get started.
                </TableCell>
              </TableRow>
            ) : (
              sortedSubscriptions.map((subscription, index) => (
                <motion.tr
                  key={subscription.id}
                  variants={rowVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  transition={{ delay: index * 0.1 }}
                  className="cursor-pointer"
                >
                  <TableCell className="font-medium">{subscription.name}</TableCell>
                  <TableCell>${parseFloat(subscription.price).toFixed(2)}</TableCell>
                  <TableCell>{subscription.billingCycle}</TableCell>
                  <TableCell>{formatDate(subscription.nextPayment)}</TableCell>
                  <TableCell>{subscription.category}</TableCell>
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
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/subscriptions/${subscription.id}`}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => {
                            setDeleteId(subscription.id)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Subscription Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New Subscription</DialogTitle>
            <DialogDescription>
              Add a new subscription to track and get reminders.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddSubscription}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Subscription Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Netflix, Spotify, etc."
                  required
                  value={newSubscription.name}
                  onChange={(e) => setNewSubscription({ ...newSubscription, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="price">Price</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                    <Input
                      id="price"
                      name="price"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="9.99"
                      className="pl-7"
                      required
                      value={newSubscription.price}
                      onChange={(e) => setNewSubscription({ ...newSubscription, price: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={newSubscription.category} 
                    onValueChange={(value) => setNewSubscription({ ...newSubscription, category: value })}
                  >
                    <SelectTrigger id="category">
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
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="billingCycle">Billing Cycle</Label>
                  <Select
                    value={newSubscription.billingCycle}
                    onValueChange={(value) => setNewSubscription({ ...newSubscription, billingCycle: value })}
                  >
                    <SelectTrigger id="billingCycle">
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

                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    required
                    value={newSubscription.startDate}
                    onChange={(e) => setNewSubscription({ ...newSubscription, startDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  name="description"
                  placeholder="Add notes about this subscription"
                  value={newSubscription.description}
                  onChange={(e) => setNewSubscription({ ...newSubscription, description: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit">Add Subscription</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this subscription and remove all associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

