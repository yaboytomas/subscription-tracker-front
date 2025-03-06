"use client"

import { useState } from "react"
import Link from "next/link"
import { Edit, MoreHorizontal, Trash2 } from "lucide-react"
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

// Sample data - would be fetched from API in a real app
const subscriptions = [
  {
    id: "1",
    name: "Netflix",
    price: 15.99,
    billingCycle: "Monthly",
    nextPayment: "2025-04-15",
    category: "Entertainment",
  },
  {
    id: "2",
    name: "Spotify",
    price: 9.99,
    billingCycle: "Monthly",
    nextPayment: "2025-04-10",
    category: "Music",
  },
  {
    id: "3",
    name: "Adobe Creative Cloud",
    price: 52.99,
    billingCycle: "Monthly",
    nextPayment: "2025-04-22",
    category: "Software",
  },
  {
    id: "4",
    name: "Amazon Prime",
    price: 139,
    billingCycle: "Yearly",
    nextPayment: "2025-11-15",
    category: "Shopping",
  },
  {
    id: "5",
    name: "Disney+",
    price: 7.99,
    billingCycle: "Monthly",
    nextPayment: "2025-04-18",
    category: "Entertainment",
  },
  {
    id: "6",
    name: "Microsoft 365",
    price: 99.99,
    billingCycle: "Yearly",
    nextPayment: "2025-08-05",
    category: "Software",
  },
  {
    id: "7",
    name: "YouTube Premium",
    price: 11.99,
    billingCycle: "Monthly",
    nextPayment: "2025-04-12",
    category: "Entertainment",
  },
  {
    id: "8",
    name: "iCloud Storage",
    price: 2.99,
    billingCycle: "Monthly",
    nextPayment: "2025-04-08",
    category: "Cloud Storage",
  },
]

export function SubscriptionList() {
  const { toast } = useToast()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [subscriptionList, setSubscriptionList] = useState(subscriptions)

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

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Billing Cycle</TableHead>
              <TableHead>Next Payment</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subscriptionList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  No subscriptions found. Add your first subscription to get started.
                </TableCell>
              </TableRow>
            ) : (
              subscriptionList.map((subscription) => (
                <TableRow key={subscription.id}>
                  <TableCell className="font-medium">{subscription.name}</TableCell>
                  <TableCell>${subscription.price.toFixed(2)}</TableCell>
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
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

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

