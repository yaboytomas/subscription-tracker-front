"use client"

import { useState, useEffect } from "react"
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
import { useToast } from "@/components/ui/use-toast"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { History, Info } from "lucide-react"
import { format } from "date-fns"

interface EmailHistoryRecord {
  _id: string
  userId: string
  previousEmail: string
  newEmail: string
  changedAt: string
  reason?: string
  ipAddress?: string
  userAgent?: string
}

interface PaginationData {
  total: number
  pages: number
  page: number
  limit: number
}

interface EmailHistoryProps {
  userId: string
}

export function EmailHistory({ userId }: EmailHistoryProps) {
  const [emailRecords, setEmailRecords] = useState<EmailHistoryRecord[]>([])
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    pages: 1,
    page: 1,
    limit: 5
  })
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  
  const fetchEmailHistory = async (page = 1) => {
    setIsLoading(true)
    
    try {
      const response = await fetch(`/api/user/email-history?page=${page}&limit=${pagination.limit}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch email history")
      }
      
      const data = await response.json()
      
      if (data.success) {
        setEmailRecords(data.data.emailHistory)
        setPagination(data.data.pagination)
      } else {
        throw new Error(data.message)
      }
    } catch (error) {
      console.error("Error fetching email history:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Could not load email history",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }
  
  // Initial load
  useEffect(() => {
    fetchEmailHistory()
  }, [userId])
  
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= pagination.pages) {
      fetchEmailHistory(page)
    }
  }
  
  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), "MMM d, yyyy 'at' h:mm a")
  }
  
  if (emailRecords.length === 0 && !isLoading) {
    return null // Don't show anything if there's no history
  }
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle className="text-xl">Email History</CardTitle>
              <CardDescription>Previous email addresses used with this account</CardDescription>
            </div>
          </div>
          {pagination.total > 0 && (
            <div className="text-sm text-muted-foreground">
              {pagination.total} {pagination.total === 1 ? 'change' : 'changes'} recorded
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-10 text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
            <p className="mt-4 text-muted-foreground">Loading email history...</p>
          </div>
        ) : (
          <>
            <Table>
              <TableCaption>Email address change history for your account</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Previous Email</TableHead>
                  <TableHead>New Email</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {emailRecords.map((record) => (
                  <TableRow key={record._id}>
                    <TableCell className="whitespace-nowrap">{formatDateTime(record.changedAt)}</TableCell>
                    <TableCell>{record.previousEmail}</TableCell>
                    <TableCell className="font-medium">{record.newEmail}</TableCell>
                    <TableCell>{record.reason || "—"}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {pagination.pages > 1 && (
              <div className="flex justify-center mt-4">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => handlePageChange(pagination.page - 1)}
                        className={pagination.page <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: pagination.pages }, (_, i) => i + 1)
                      .filter(page => (
                        page === 1 || 
                        page === pagination.pages || 
                        (page >= pagination.page - 1 && page <= pagination.page + 1)
                      ))
                      .map((page, index, array) => (
                        <PaginationItem key={page}>
                          {index > 0 && array[index - 1] !== page - 1 && (
                            <PaginationItem>
                              <span className="flex h-10 w-10 items-center justify-center">...</span>
                            </PaginationItem>
                          )}
                          <PaginationLink 
                            isActive={pagination.page === page}
                            onClick={() => handlePageChange(page)}
                          >
                            {page}
                          </PaginationLink>
                        </PaginationItem>
                      ))
                    }
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => handlePageChange(pagination.page + 1)}
                        className={pagination.page >= pagination.pages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
} 