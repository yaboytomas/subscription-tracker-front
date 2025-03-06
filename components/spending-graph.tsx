"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts"
import { useTheme } from "next-themes"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DollarSign, TrendingUp } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

// This would come from your data source
const subscriptions = [
  {
    id: "1",
    name: "Netflix",
    price: 15.99,
    billingCycle: "Monthly",
    nextPayment: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    category: "Entertainment",
  },
  {
    id: "2",
    name: "Spotify",
    price: 9.99,
    billingCycle: "Monthly",
    nextPayment: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
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

// Calculate spending by category
const spendingByCategory = subscriptions.reduce((acc, sub) => {
  const monthlyPrice = sub.billingCycle === "Yearly" ? Math.round((sub.price / 12) * 100) / 100 : sub.price
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

// Add category color mapping
const CATEGORY_COLORS = {
  Entertainment: 0, // Blue
  Music: 1, // Green
  Software: 2, // Red
  Shopping: 4, // Orange (changed to yellow)
  Utilities: 3, // Purple
  Gaming: 5, // Cyan
  Fitness: 6, // Indigo
  Other: 7, // Pink
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
                      fill={colors[CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS] || index % colors.length]}
                      className="cursor-pointer hover:opacity-80"
                    />
                  ))}
                </Pie>
                <text
                  x="50%"
                  y="45%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-2xl font-bold"
                  fill={isDark ? 'hsl(var(--card-foreground))' : '#000000'}
                >
                  ${totalSpending.toFixed(2)}
                </text>
                <text
                  x="50%"
                  y="55%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="text-sm text-muted-foreground"
                  fill={isDark ? 'hsl(var(--card-foreground))' : '#000000'}
                >
                  Total Monthly
                </text>
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
          <CardTitle className="text-sm font-medium">Monthly Spending Breakdown</CardTitle>
          <CardDescription>Last 6 months of subscription spending</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={timeData.slice(-6)} 
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                onClick={(data) => {
                  if (data && data.activePayload) {
                    const entry = data.activePayload[0].payload
                    setSelectedCategory(null)
                    setOpenDialog(true)
                  }
                }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'hsl(var(--border))' : '#e5e7eb'} />
                <XAxis 
                  dataKey="month" 
                  stroke={isDark ? 'hsl(var(--card-foreground))' : '#000000'}
                  tick={{ fill: isDark ? 'hsl(var(--card-foreground))' : '#000000' }}
                />
                <YAxis 
                  stroke={isDark ? 'hsl(var(--card-foreground))' : '#000000'}
                  tickFormatter={(value) => `$${value}`}
                  tick={{ fill: isDark ? 'hsl(var(--card-foreground))' : '#000000' }}
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
                    return [parts.join('\n'), 'Monthly Spending']
                  }}
                />
                <Bar
                  dataKey="amount"
                  fill={colors[0]}
                  radius={[4, 4, 0, 0]}
                  cursor="pointer"
                >
                  {timeData.slice(-6).map((entry, index) => (
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
        </CardContent>
      </Card>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              {selectedCategory ? `${selectedCategory} Subscriptions` : 'Monthly Spending Details'}
            </DialogTitle>
            <DialogDescription>
              Total monthly spending: ${totalSpending.toFixed(2)}
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="space-y-4 pr-4">
              {selectedCategory ? (
                <>
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
                </>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold mb-2">Current Subscriptions</h3>
                    <div className="space-y-2">
                      {subscriptions.map((sub) => (
                        <div key={sub.id} className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{sub.name}</div>
                            <div className="text-xs text-muted-foreground">{sub.category}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              ${(sub.billingCycle === "Yearly" ? sub.price / 12 : sub.price).toFixed(2)}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {sub.billingCycle} • Next: {new Date(sub.nextPayment).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-lg border p-4">
                    <h3 className="font-semibold mb-2">Recent Changes</h3>
                    <div className="space-y-2">
                      {timeData.slice(-6).map((entry, index) => (
                        entry.changeText && (
                          <div key={index} className="flex items-center justify-between">
                            <div className="font-medium">{entry.month}</div>
                            <div className="text-muted-foreground">{entry.changeText}</div>
                          </div>
                        )
                      ))}
                    </div>
                  </div>
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