"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, ReferenceLine } from "recharts"
import { useTheme } from "next-themes"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DollarSign, TrendingUp, ArrowLeft } from "lucide-react"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { motion } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"

// Define subscription type from API
interface ApiSubscription {
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

// Local subscription type for the graph
interface Subscription {
  id: string;
  name: string;
  price: number;
  billingCycle: string;
  nextPayment: string;
  category: string;
}

interface CategoryDetails {
  name: string
  total: number
  subscriptions: Subscription[]
}

const dialogItemVariants = {
  hidden: { opacity: 0, x: -20 },
  show: { 
    opacity: 1, 
    x: 0,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  },
  hover: {
    backgroundColor: "hsl(var(--accent))",
    transition: {
      duration: 0.2
    }
  }
}

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
  Shopping: 4, // Orange
  "Cloud Storage": 5, // Cyan
  Utilities: 3, // Purple
  Gaming: 6, // Indigo
  Fitness: 6, // Indigo
  News: 7, // Pink
  Food: 1, // Green
  Other: 7, // Pink
}

// Generate empty graph when no subscriptions are available
const generateEmptyData = () => {
  return [
    { name: "No data", value: 1 }
  ];
}

// Generate monthly data showing spending history and projections
const generateTimeData = (subscriptions: Subscription[], months: number) => {
  if (subscriptions.length === 0) {
    return Array(12).fill(0).map((_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - 6 + i);
      return {
        month: date.toLocaleDateString('en-US', { month: 'long' }).substring(0, 3),
        amount: 0,
        isProjection: date > new Date(),
        changeText: ''
      };
    });
  }
  
  const data = []
  const today = new Date()
  const currentYear = today.getFullYear()
  
  // Calculate current total monthly spending
  const currentMonthlyTotal = subscriptions.reduce((total, sub) => {
    if (sub.billingCycle === "Yearly") {
      return total + (sub.price / 12);
    } else if (sub.billingCycle === "Monthly") {
      return total + sub.price;
    } else if (sub.billingCycle === "Weekly") {
      return total + (sub.price * 4.33); // Average weeks in a month
    } else if (sub.billingCycle === "Quarterly") {
      return total + (sub.price / 3);
    } else if (sub.billingCycle === "Biweekly") {
      return total + (sub.price * 2.17); // Average biweekly periods in a month
    }
    return total + sub.price;
  }, 0)

  // Always show Jan-Dec of current year
  for (let month = 0; month < 12; month++) {
    const date = new Date(currentYear, month, 1)
    const monthKey = date.toLocaleDateString('en-US', { month: 'long'}).substring(0, 3)
    const isPast = date <= today
    const isProjection = !isPast
    
    data.push({
      month: monthKey,
      amount: parseFloat(currentMonthlyTotal.toFixed(2)),
      isProjection,
      changeText: ''
    })
  }
  
  return data
}

export function SpendingGraph({ refreshTrigger = 0 }) {
  const { theme, systemTheme } = useTheme()
  const { toast } = useToast()
  const [openDialog, setOpenDialog] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<CategoryDetails | null>(null)
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null)
  const [timeRange] = useState("12")
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch subscriptions from API
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
          // Convert API subscriptions to local format
          const convertedSubscriptions: Subscription[] = (data.subscriptions || []).map((sub: ApiSubscription) => ({
            id: sub._id,
            name: sub.name,
            price: parseFloat(sub.price),
            billingCycle: sub.billingCycle,
            nextPayment: sub.nextPayment,
            category: sub.category,
          }));
          
          setSubscriptions(convertedSubscriptions);
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
  }, [toast, refreshTrigger]);

  const isDark = theme === 'dark' || (theme === 'system' && systemTheme === 'dark')
  const colors = isDark ? COLORS.dark : COLORS.light

  // Calculate spending by category from current subscriptions
  const spendingByCategory = subscriptions.reduce((acc, sub) => {
    const monthlyPrice = sub.billingCycle === "Yearly" ? Math.round((sub.price / 12) * 100) / 100 : sub.price
    acc[sub.category] = (acc[sub.category] || 0) + monthlyPrice
    return acc
  }, {} as Record<string, number>)

  const data = Object.entries(spendingByCategory).map(([name, value]) => ({
    name,
    value: parseFloat(value.toFixed(2))
  }))

  const timeData = generateTimeData(subscriptions, parseInt(timeRange))
  const currentTotal = timeData.find(d => !d.isProjection)?.amount || 0

  const handleClick = (category: string) => {
    const catSubscriptions = subscriptions.filter(sub => sub.category === category);
    const total = catSubscriptions.reduce((sum, sub) => {
      if (sub.billingCycle === "Yearly") {
        return sum + (sub.price / 12);
      } else if (sub.billingCycle === "Monthly") {
        return sum + sub.price;
      } else if (sub.billingCycle === "Weekly") {
        return sum + (sub.price * 4.33);
      } else if (sub.billingCycle === "Quarterly") {
        return sum + (sub.price / 3);
      } else if (sub.billingCycle === "Biweekly") {
        return sum + (sub.price * 2.17);
      }
      return sum + sub.price;
    }, 0);
    
    setSelectedCategory({
      name: category,
      total: parseFloat(total.toFixed(2)),
      subscriptions: catSubscriptions
    });
    setOpenDialog(true);
  }

  const categorySubscriptions = selectedCategory
    ? subscriptions.filter(sub => sub.category === selectedCategory.name)
    : []

  const totalSpending = data.reduce((sum, item) => sum + item.value, 0)

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-sm font-medium">Loading...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" role="status">
              <span className="!absolute !-m-px !h-px !w-px !overflow-hidden !whitespace-nowrap !border-0 !p-0 ![clip:rect(0,0,0,0)]">Loading...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
                  data={data.length > 0 ? data : generateEmptyData()}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {data.length > 0 ? (
                    data.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={colors[CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS] || 7]} 
                        opacity={isDark ? 0.8 : 0.7}
                      />
                    ))
                  ) : (
                    <Cell fill={colors[0]} opacity={0.3} />
                  )}
                </Pie>
                <Tooltip
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Monthly']}
                  contentStyle={{ 
                    backgroundColor: isDark ? 'hsl(var(--popover))' : 'white',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '0.5rem',
                    color: isDark ? 'hsl(var(--popover-foreground))' : 'hsl(var(--foreground))'
                  }}
                  itemStyle={{
                    color: isDark ? 'hsl(var(--popover-foreground))' : 'hsl(var(--foreground))'
                  }}
                  labelStyle={{ 
                    color: isDark ? 'hsl(var(--popover-foreground))' : 'hsl(var(--foreground))' 
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <div className="text-sm font-medium">Total Monthly Spending</div>
            <div className="text-2xl font-bold">${totalSpending.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Click for details</div>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full cursor-pointer transition-all hover:shadow-md" onClick={() => setOpenDialog(true)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Spending Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={timeData}
                margin={{
                  top: 20,
                  right: 20,
                  left: 20,
                  bottom: 20,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="month" 
                  tickLine={false} 
                  axisLine={false}
                  tick={{ fontSize: 12 }}
                  tickMargin={8}
                  angle={-45}
                  textAnchor="end"
                  interval={0}
                  height={60}
                />
                <YAxis 
                  tickFormatter={value => `$${value}`} 
                  tickLine={false} 
                  axisLine={false} 
                  domain={[0, 'auto']}
                />
                <Tooltip
                  formatter={(value: number) => [`$${value.toFixed(2)}`, 'Monthly']}
                  contentStyle={{ 
                    backgroundColor: isDark ? 'hsl(var(--popover))' : 'white',
                    borderColor: 'hsl(var(--border))',
                    borderRadius: '0.5rem',
                    color: isDark ? 'hsl(var(--popover-foreground))' : 'hsl(var(--foreground))'
                  }}
                  itemStyle={{
                    color: isDark ? 'hsl(var(--popover-foreground))' : 'hsl(var(--foreground))'
                  }}
                  labelStyle={{ 
                    color: isDark ? 'hsl(var(--popover-foreground))' : 'hsl(var(--foreground))'
                  }}
                />
                <Bar 
                  dataKey="amount" 
                  fill={colors[0]}
                  opacity={0.7}
                  barSize={30}
                  radius={[4, 4, 0, 0]}
                >
                  {timeData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.isProjection ? colors[1] : colors[0]} 
                      opacity={isDark ? 0.8 : 0.7}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center">
            <div className="text-sm font-medium">Annual Cost</div>
            <div className="text-2xl font-bold">${(currentTotal * 12).toFixed(2)}</div>
            <div className="text-xs text-muted-foreground">Click for details</div>
          </div>
        </CardContent>
      </Card>

      {/* Category Spending Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Spending Breakdown
            </DialogTitle>
            <DialogDescription>Details of your subscription spending.</DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {subscriptions.length === 0 ? (
              <div className="py-10 text-center">
                <p className="text-muted-foreground">You don't have any subscriptions yet to analyze.</p>
                <Button
                  variant="outline"
                  className="mt-4"
                  onClick={() => {
                    setOpenDialog(false);
                    window.location.href = "/dashboard/subscriptions";
                  }}
                >
                  Add Your First Subscription
                </Button>
              </div>
            ) : selectedCategory ? (
              // Show selected category details
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setSelectedCategory(null)}
                  >
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <div>
                    <h3 className="font-semibold text-xl">{selectedCategory.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      ${selectedCategory.total.toFixed(2)}/month • {categorySubscriptions.length} subscriptions
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {categorySubscriptions.map((sub, index) => (
                    <motion.div
                      key={sub.id}
                      variants={dialogItemVariants}
                      initial="hidden"
                      animate="show"
                      whileHover="hover"
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between rounded-lg border p-3 cursor-pointer"
                      onClick={() => setSelectedSubscription(sub)}
                    >
                      <div>
                        <div className="font-medium">{sub.name}</div>
                        <div className="text-xs text-muted-foreground">{sub.billingCycle}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">
                          ${sub.billingCycle === "Monthly" 
                            ? sub.price.toFixed(2) 
                            : sub.billingCycle === "Yearly" 
                              ? (sub.price / 12).toFixed(2)
                              : sub.billingCycle === "Weekly"
                                ? (sub.price * 4.33).toFixed(2)
                                : sub.billingCycle === "Quarterly"
                                  ? (sub.price / 3).toFixed(2)
                                  : sub.billingCycle === "Biweekly"
                                    ? (sub.price * 2.17).toFixed(2)
                                    : sub.price.toFixed(2)
                          }/mo
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ${sub.price.toFixed(2)}/{sub.billingCycle.toLowerCase().replace('ly', '')}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ) : (
              // Show all categories
              <div className="space-y-4">
                <h3 className="font-semibold text-lg mb-4">Categories</h3>
                {data.length > 0 ? (
                  data
                    .sort((a, b) => b.value - a.value)
                    .map((category, index) => (
                      <motion.div
                        key={category.name}
                        variants={dialogItemVariants}
                        initial="hidden"
                        animate="show"
                        whileHover="hover"
                        transition={{ delay: index * 0.05 }}
                        className="flex items-center justify-between rounded-lg border p-3 cursor-pointer"
                        onClick={() => handleClick(category.name)}
                      >
                        <div className="flex items-center gap-2">
                          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: colors[CATEGORY_COLORS[category.name as keyof typeof CATEGORY_COLORS] || 7] }}></div>
                          <div className="font-medium">{category.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">${category.value.toFixed(2)}/mo</div>
                          <div className="text-xs text-muted-foreground">
                            {((category.value / totalSpending) * 100).toFixed(0)}% of total
                          </div>
                        </div>
                      </motion.div>
                    ))
                ) : (
                  <div className="py-4 text-center">
                    <p className="text-muted-foreground">No categories found</p>
                  </div>
                )}

                <div className="mt-6 pt-4 border-t">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">Total Monthly</span>
                    <span className="font-bold">${totalSpending.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-sm text-muted-foreground">Annual Cost</span>
                    <span className="text-sm">${(totalSpending * 12).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
          <Button variant="outline" onClick={() => {
            setOpenDialog(false)
            setSelectedCategory(null)
            setSelectedSubscription(null)
          }}>
            Close
          </Button>
        </DialogContent>
      </Dialog>

      {/* Subscription Detail Dialog */}
      <Dialog open={!!selectedSubscription} onOpenChange={(open) => !open && setSelectedSubscription(null)}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setSelectedSubscription(null)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <DialogTitle>{selectedSubscription?.name}</DialogTitle>
            </div>
            <DialogDescription>{selectedSubscription?.category}</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-bold">${selectedSubscription?.price.toFixed(2)}</h3>
                <p className="text-sm text-muted-foreground">per {selectedSubscription?.billingCycle.toLowerCase().replace('ly', '')}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">Monthly equivalent</p>
                <p className="text-lg">
                  ${selectedSubscription?.billingCycle === "Monthly" 
                    ? selectedSubscription?.price.toFixed(2) 
                    : selectedSubscription?.billingCycle === "Yearly" 
                      ? (selectedSubscription?.price / 12).toFixed(2)
                      : selectedSubscription?.billingCycle === "Weekly"
                        ? (selectedSubscription?.price * 4.33).toFixed(2)
                        : selectedSubscription?.billingCycle === "Quarterly"
                          ? (selectedSubscription?.price / 3).toFixed(2)
                          : selectedSubscription?.billingCycle === "Biweekly"
                            ? (selectedSubscription?.price * 2.17).toFixed(2)
                            : selectedSubscription?.price.toFixed(2)
                  }
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Next Payment</h4>
                <p className="text-base">
                  {selectedSubscription?.nextPayment 
                    ? new Date(selectedSubscription.nextPayment).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })
                    : "Not available"}
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Billing Cycle</h4>
                <p className="text-base">{selectedSubscription?.billingCycle}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Annual Cost</h4>
                <p className="text-base">
                  ${selectedSubscription?.billingCycle === "Monthly" 
                    ? (selectedSubscription?.price * 12).toFixed(2) 
                    : selectedSubscription?.billingCycle === "Yearly" 
                      ? selectedSubscription?.price.toFixed(2)
                      : selectedSubscription?.billingCycle === "Weekly"
                        ? (selectedSubscription?.price * 52).toFixed(2)
                        : selectedSubscription?.billingCycle === "Quarterly"
                          ? (selectedSubscription?.price * 4).toFixed(2)
                          : selectedSubscription?.billingCycle === "Biweekly"
                            ? (selectedSubscription?.price * 26).toFixed(2)
                            : (selectedSubscription?.price * 12).toFixed(2)
                  }
                </p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
                <p className="text-base">{selectedSubscription?.category}</p>
              </div>
            </div>
          </div>
          
          <div>
            <Button 
              className="w-full" 
              onClick={() => {
                setSelectedSubscription(null);
                setSelectedCategory(null);
                setOpenDialog(false);
                window.location.href = `/dashboard/subscriptions/${selectedSubscription?.id}`;
              }}
            >
              Edit Subscription
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 