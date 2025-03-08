"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"
import { Pagination } from "@/components/ui/pagination"
import { CalendarIcon, DownloadIcon, SearchIcon } from "lucide-react"

interface DeletedUser {
  _id: string
  originalId: string
  name: string
  email: string
  createdAt: string
  deletedAt: string
  subscriptionCount: number
  totalSpent: number
  reason?: string
  deletedBy: 'user' | 'admin' | 'system'
}

interface PaginationData {
  total: number
  pages: number
  page: number
  limit: number
}

export default function DeletedUsersPage() {
  const [deletedUsers, setDeletedUsers] = useState<DeletedUser[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    pages: 1,
    page: 1,
    limit: 10
  })
  const [isLoading, setIsLoading] = useState(true)
  const [searchEmail, setSearchEmail] = useState("")
  const [fromDate, setFromDate] = useState("")
  const [toDate, setToDate] = useState("")
  
  const router = useRouter()
  const { toast } = useToast()
  
  // Fetch deleted users
  const fetchDeletedUsers = async (page = 1) => {
    setIsLoading(true)
    
    try {
      // Build query parameters
      const queryParams = new URLSearchParams()
      queryParams.set('page', page.toString())
      queryParams.set('limit', pagination.limit.toString())
      
      if (searchEmail.trim()) {
        queryParams.set('email', searchEmail.trim())
      }
      
      if (fromDate) {
        queryParams.set('fromDate', fromDate)
      }
      
      if (toDate) {
        queryParams.set('toDate', toDate)
      }
      
      const response = await fetch(`/api/admin/deleted-users?${queryParams.toString()}`)
      
      if (!response.ok) {
        // If unauthorized, redirect to dashboard
        if (response.status === 401 || response.status === 403) {
          toast({
            title: "Access denied",
            description: "You don't have permission to view this page",
            variant: "destructive",
          })
          router.push('/dashboard')
          return
        }
        
        throw new Error('Failed to fetch deleted users')
      }
      
      const data = await response.json()
      
      if (data.success) {
        setDeletedUsers(data.data.deletedUsers)
        setPagination(data.data.pagination)
      } else {
        throw new Error(data.message || 'Failed to fetch deleted users')
      }
    } catch (error) {
      console.error('Error fetching deleted users:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to fetch deleted users',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Initial fetch
  useEffect(() => {
    fetchDeletedUsers()
  }, [])
  
  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }
  
  // Handle search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    fetchDeletedUsers(1) // Reset to first page
  }
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= pagination.pages) {
      fetchDeletedUsers(page)
    }
  }
  
  // Export to CSV
  const exportToCsv = () => {
    // Convert data to CSV
    const headers = ['Name', 'Email', 'Account Created', 'Account Deleted', 'Subscriptions', 'Monthly Spend', 'Reason', 'Deleted By']
    const rows = deletedUsers.map(user => [
      user.name,
      user.email,
      formatDate(user.createdAt),
      formatDate(user.deletedAt),
      user.subscriptionCount.toString(),
      `$${user.totalSpent.toFixed(2)}`,
      user.reason || 'N/A',
      user.deletedBy
    ])
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n')
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `deleted-users-export-${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl">Deleted Users</CardTitle>
              <CardDescription>View and manage deleted user accounts</CardDescription>
            </div>
            <Button
              onClick={exportToCsv}
              variant="outline"
              disabled={deletedUsers.length === 0}
              className="flex items-center gap-2"
            >
              <DownloadIcon className="h-4 w-4" />
              Export to CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and Filter */}
          <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-6">
            <div className="flex-1 min-w-[200px]">
              <Input
                placeholder="Search by email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <Input
                type="date"
                placeholder="From date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-[150px]"
              />
              <span className="text-sm text-muted-foreground">to</span>
              <Input
                type="date"
                placeholder="To date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-[150px]"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              <SearchIcon className="h-4 w-4 mr-2" />
              Search
            </Button>
          </form>
          
          {/* Results Table */}
          {isLoading ? (
            <div className="py-20 text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
              <p className="mt-4 text-muted-foreground">Loading deleted users...</p>
            </div>
          ) : deletedUsers.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-muted-foreground">No deleted users found</p>
            </div>
          ) : (
            <>
              <Table>
                <TableCaption>List of deleted user accounts</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Deleted</TableHead>
                    <TableHead>Subscriptions</TableHead>
                    <TableHead>Monthly Spend</TableHead>
                    <TableHead>Deleted By</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {deletedUsers.map((user) => (
                    <TableRow key={user._id}>
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{formatDate(user.createdAt)}</TableCell>
                      <TableCell>{formatDate(user.deletedAt)}</TableCell>
                      <TableCell>{user.subscriptionCount}</TableCell>
                      <TableCell>${user.totalSpent.toFixed(2)}</TableCell>
                      <TableCell>
                        <span className={`capitalize ${
                          user.deletedBy === 'user' ? 'text-orange-500' :
                          user.deletedBy === 'admin' ? 'text-red-500' : 'text-blue-500'
                        }`}>
                          {user.deletedBy}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex justify-center mt-6">
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page === 1}
                    >
                      Previous
                    </Button>
                    
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                      .filter(page => (
                        page === 1 || 
                        page === pagination.pages || 
                        (page >= pagination.page - 1 && page <= pagination.page + 1)
                      ))
                      .map((page, index, array) => (
                        <React.Fragment key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <Button variant="outline" size="sm" disabled>
                              ...
                            </Button>
                          )}
                          <Button
                            variant={pagination.page === page ? "default" : "outline"}
                            size="sm"
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </Button>
                        </React.Fragment>
                      ))
                    }
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page === pagination.pages}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 