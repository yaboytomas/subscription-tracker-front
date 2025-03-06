"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts"
import { useTheme } from "next-themes"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DollarSign } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

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

// Generate monthly data showing spending history and projections
const generateTimeData = (months: number) => {
  const data = []
  const today = new Date()
  
  // Calculate current total monthly spending
  const currentMonthlyTotal = subscriptions.reduce((total, sub) => {
    return total + (sub.billingCycle === "Yearly" ? sub.price / 12 : sub.price)
  }, 0)

  // For 6M, 9M, and 12M views, show Jan-Jun, Jan-Sep, or Jan-Dec of current year
  if (months === 12 || months === 6 || months === 9) {
    const currentYear = today.getFullYear()
    
    for (let month = 0; month < months; month++) {
      const date = new Date(currentYear, month, 1)
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      const isPast = date <= today
      const isProjection = !isPast
      
      // For this example, let's show some subscription changes
      let monthTotal = currentMonthlyTotal
      let changeText = ''
      
      // Simulate some changes (you would replace this with real data)
      if (monthKey === 'Feb 24') {
        monthTotal -= 15.99 // Netflix wasn't subscribed yet
        changeText = 'Before Netflix'
      } else if (monthKey === 'Mar 24') {
        monthTotal += 14.99 // Will add new gaming subscription
        changeText = '+ Gaming Sub ($14.99)'
      } else if (monthKey === 'May 24') {
        monthTotal -= 52.99 // Planning to cancel Adobe
        changeText = '- Adobe CC ($52.99)'
      }
      
      data.push({
        month: monthKey,
        amount: parseFloat(monthTotal.toFixed(2)),
        isProjection,
        changeText
      })
    }
  } else {
    // For 3M view, show rolling months including projections
    for (let i = months - 1; i >= -3; i--) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1)
      const monthKey = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
      
      let monthTotal = currentMonthlyTotal
      let changeText = ''
      
      if (monthKey === 'Feb 24') {
        monthTotal -= 15.99
        changeText = 'Before Netflix'
      } else if (monthKey === 'Mar 24') {
        monthTotal += 14.99
        changeText = '+ Gaming Sub ($14.99)'
      } else if (monthKey === 'May 24') {
        monthTotal -= 52.99
        changeText = '- Adobe CC ($52.99)'
      }
      
      data.push({
        month: monthKey,
        amount: parseFloat(monthTotal.toFixed(2)),
        isProjection: i < 0,
        changeText
      })
    }
  }
  
  return data
}

export function SpendingGraph() {
  const { theme, systemTheme } = useTheme()
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState("3")

  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark')
  const colors = isDark ? COLORS.dark : COLORS.light

  const handleClick = (category: string) => {
    setSelectedCategory(category)
    setOpenDialog(true)
  }

  const categorySubscriptions = selectedCategory
    ? subscriptions.filter(sub => sub.category === selectedCategory)
    : []

  const totalSpending = data.reduce((sum, item) => sum + item.value, 0)

  const timeData = generateTimeData(parseInt(timeRange))
  const currentTotal = timeData.find(d => !d.isProjection)?.amount || 0

  return (
    <div className="grid gap-4 md:grid-cols-2">
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
                    backgroundColor: isDark ? 'hsl(var(--card))' : '#ffffff',
                    borderColor: isDark ? 'hsl(var(--border))' : '#e5e7eb',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    boxShadow: isDark ? '0 0 0 1px hsl(var(--border))' : 'none',
                    color: isDark ? 'hsl(var(--card-foreground))' : '#000000',
                  }}
                  itemStyle={{
                    color: isDark ? 'hsl(var(--card-foreground))' : '#000000',
                  }}
                  labelStyle={{
                    color: isDark ? 'hsl(var(--card-foreground))' : '#000000',
                  }}
                />
                <Legend 
                  formatter={(value) => (
                    <span style={{ color: isDark ? 'hsl(var(--card-foreground))' : '#000000' }}>
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium">Monthly Spending Timeline</CardTitle>
            <ToggleGroup type="single" value={timeRange} onValueChange={(value) => value && setTimeRange(value)}>
              <ToggleGroupItem value="3" aria-label="3 Months">
                3M
              </ToggleGroupItem>
              <ToggleGroupItem value="6" aria-label="6 Months">
                6M
              </ToggleGroupItem>
              <ToggleGroupItem value="9" aria-label="9 Months">
                9M
              </ToggleGroupItem>
              <ToggleGroupItem value="12" aria-label="12 Months">
                12M
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'hsl(var(--border))' : '#e5e7eb'} />
                <XAxis 
                  dataKey="month" 
                  stroke={isDark ? 'hsl(var(--card-foreground))' : '#000000'}
                />
                <YAxis 
                  stroke={isDark ? 'hsl(var(--card-foreground))' : '#000000'}
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: isDark ? 'hsl(var(--card))' : '#ffffff',
                    borderColor: isDark ? 'hsl(var(--border))' : '#e5e7eb',
                    borderRadius: '0.5rem',
                    padding: '0.75rem',
                    color: isDark ? 'hsl(var(--card-foreground))' : '#000000',
                  }}
                  formatter={(value: number, name: string, props: any) => {
                    const entry = props.payload
                    const parts = [`$${value.toFixed(2)} per month`]
                    if (entry.changeText) {
                      parts.push(entry.changeText)
                    }
                    if (entry.isProjection) {
                      parts.push('(Projected)')
                    }
                    return [parts.join('\n'), '']
                  }}
                />
                {/* Current spending reference line */}
                <ReferenceLine
                  y={currentTotal}
                  stroke={colors[1]}
                  strokeDasharray="3 3"
                  label={{
                    value: 'Current',
                    fill: isDark ? 'hsl(var(--card-foreground))' : '#000000',
                    position: 'right'
                  }}
                />
                {/* Past months */}
                <Bar
                  dataKey="amount"
                  fill={colors[0]}
                  opacity={(entry) => entry.isProjection ? 0.7 : 1}
                  stroke={isDark ? 'hsl(var(--border))' : '#e5e7eb'}
                  strokeWidth={1}
                >
                  {timeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isProjection ? colors[1] : colors[0]}
                      opacity={entry.isProjection ? 0.7 : 1}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-1 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <span className="h-3 w-3" style={{ backgroundColor: colors[0] }}></span>
              <span>Past Spending</span>
              <span className="h-3 w-3 ml-4" style={{ backgroundColor: colors[1], opacity: 0.7 }}></span>
              <span>Projected Spending</span>
            </div>
            <p className="text-xs">
              Hover over bars to see details. Dashed line shows your current monthly spending level.
            </p>
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
    </div>
  )
} 