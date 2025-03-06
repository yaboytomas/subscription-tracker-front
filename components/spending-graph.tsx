"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { useTheme } from "next-themes"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DollarSign } from "lucide-react"

// This would come from your data source
const subscriptions = [
  {
    id: "1",
    name: "Netflix",
    price: 15.99,
    billingCycle: "Monthly",
    category: "Entertainment",
  },
  {
    id: "2",
    name: "Spotify",
    price: 9.99,
    billingCycle: "Monthly",
    category: "Music",
  },
  {
    id: "3",
    name: "Adobe Creative Cloud",
    price: 52.99,
    billingCycle: "Monthly",
    category: "Software",
  },
  {
    id: "4",
    name: "Amazon Prime",
    price: 139/12, // Converting yearly to monthly
    billingCycle: "Yearly",
    category: "Shopping",
  },
  // ... other subscriptions
]

// Calculate spending by category
const spendingByCategory = subscriptions.reduce((acc, sub) => {
  const monthlyPrice = sub.billingCycle === "Yearly" ? sub.price / 12 : sub.price
  acc[sub.category] = (acc[sub.category] || 0) + monthlyPrice
  return acc
}, {} as Record<string, number>)

const data = Object.entries(spendingByCategory).map(([name, value]) => ({
  name,
  value: parseFloat(value.toFixed(2))
}))

// Theme-aware colors with more contrast
const COLORS = {
  light: [
    '#2563eb', // Blue
    '#16a34a', // Green
    '#dc2626', // Red
    '#9333ea', // Purple
    '#ea580c', // Orange
    '#0891b2', // Cyan
    '#4f46e5', // Indigo
    '#db2777', // Pink
  ],
  dark: [
    '#3b82f6', // Blue
    '#22c55e', // Green
    '#ef4444', // Red
    '#a855f7', // Purple
    '#f97316', // Orange
    '#06b6d4', // Cyan
    '#6366f1', // Indigo
    '#ec4899', // Pink
  ]
}

export function SpendingGraph() {
  const { theme } = useTheme()
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)

  const colors = theme === 'dark' ? COLORS.dark : COLORS.light

  const handleClick = (category: string) => {
    setSelectedCategory(category)
    setOpenDialog(true)
  }

  const categorySubscriptions = selectedCategory
    ? subscriptions.filter(sub => sub.category === selectedCategory)
    : []

  const totalSpending = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <>
      <Card className="w-full cursor-pointer transition-all hover:shadow-md" onClick={() => setOpenDialog(true)}>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Monthly Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  onClick={(entry) => handleClick(entry.name)}
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={colors[index % colors.length]}
                      className="cursor-pointer hover:opacity-80"
                    />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `$${value.toFixed(2)}`,
                    name,
                  ]}
                  contentStyle={{ 
                    backgroundColor: theme === 'dark' ? 'hsl(var(--card))' : '#ffffff',
                    borderColor: theme === 'dark' ? 'hsl(var(--border))' : '#e5e7eb',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    boxShadow: theme === 'dark' ? '0 0 0 1px hsl(var(--border))' : 'none',
                    color: theme === 'dark' ? 'hsl(var(--card-foreground))' : '#000000',
                  }}
                  itemStyle={{
                    color: theme === 'dark' ? 'hsl(var(--card-foreground))' : '#000000',
                  }}
                  labelStyle={{
                    color: theme === 'dark' ? 'hsl(var(--card-foreground))' : '#000000',
                  }}
                />
                <Legend 
                  formatter={(value) => (
                    <span style={{ color: theme === 'dark' ? 'hsl(var(--card-foreground))' : '#000000' }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {selectedCategory ? `${selectedCategory} Subscriptions` : 'All Categories'}
            </DialogTitle>
            <DialogDescription>
              Total monthly spending: ${totalSpending.toFixed(2)}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 pr-4">
              {data.map((category) => (
                <div
                  key={category.name}
                  className="flex items-center justify-between rounded-lg border p-3 cursor-pointer hover:bg-accent"
                  onClick={() => setSelectedCategory(category.name)}
                >
                  <div className="font-medium">{category.name}</div>
                  <div className="text-right">
                    <div className="font-medium">${category.value.toFixed(2)}</div>
                    <div className="text-xs text-muted-foreground">per month</div>
                  </div>
                </div>
              ))}
              {selectedCategory && (
                <div className="mt-4 space-y-2">
                  <h3 className="font-semibold">Subscriptions in {selectedCategory}</h3>
                  {categorySubscriptions.map((sub) => (
                    <div key={sub.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div className="font-medium">{sub.name}</div>
                      <div className="text-right">
                        <div className="font-medium">
                          ${(sub.billingCycle === "Yearly" ? sub.price / 12 : sub.price).toFixed(2)}
                        </div>
                        <div className="text-xs text-muted-foreground">per month</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ScrollArea>
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => {
              setSelectedCategory(null)
              setOpenDialog(false)
            }}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
} 