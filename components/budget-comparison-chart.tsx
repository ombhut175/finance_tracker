"use client"

import { useMemo, useRef } from "react"
import type { Budget, Transaction } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Bar, BarChart, Legend, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import useSWR from "swr"
import { getRequest } from "@/helpers/ui/handlers"
import { ApiRouteConstants } from "@/helpers/string_const"
import { Loader2 } from "lucide-react"

interface ApiResponse<T> {
  success: boolean
  message: string
  body: T[]
}

const fetcher = async (url: string) => {
  const response = await getRequest(url)
  return response
}

export function BudgetComparisonChart() {
  const chartRef = useRef<HTMLDivElement>(null)
  
  // Fetch budgets
  const { data: budgetsData, error: budgetsError, isLoading: isLoadingBudgets } = useSWR<ApiResponse<Budget>>(
    ApiRouteConstants.GET_BUDGET,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 0,
      dedupingInterval: 2000,
    }
  )

  // Fetch transactions
  const { data: transactionsData, error: transactionsError, isLoading: isLoadingTransactions } = useSWR<ApiResponse<Transaction>>(
    ApiRouteConstants.GET_TRANSACTION,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 0,
      dedupingInterval: 2000,
    }
  )

  const chartData = useMemo(() => {
    const budgets = budgetsData?.body || []
    const transactions = transactionsData?.body || []

    if (budgets.length === 0) return []

    // Calculate spending by category
    const categorySpending: Record<string, number> = {}
    transactions.forEach((transaction) => {
      const category = transaction.category || "Other"
      categorySpending[category] = (categorySpending[category] || 0) + transaction.amount
    })

    // Create data for the chart
    return budgets.map((budget) => {
      const spent = categorySpending[budget.category] || 0
      return {
        category: budget.category,
        budget: budget.amount,
        spent: spent,
      }
    })
  }, [budgetsData, transactionsData])

  // Get responsive settings based on screen size
  const getResponsiveSettings = () => {
    if (typeof window === 'undefined') return { fontSize: 12, barSize: 20, angleText: -45, labelEnabled: true }
    
    const width = window.innerWidth
    if (width < 640) {
      // Mobile
      return {
        fontSize: 10,
        barSize: 10,
        angleText: -60,
        legendPosition: 'bottom',
        labelEnabled: false
      }
    } else if (width < 1024) {
      // Tablet
      return {
        fontSize: 11,
        barSize: 15,
        angleText: -45,
        legendPosition: 'top',
        labelEnabled: true
      }
    } else {
      // Desktop
      return {
        fontSize: 12,
        barSize: 30,
        angleText: -30,
        legendPosition: 'top',
        labelEnabled: true
      }
    }
  }

  const responsiveSettings = typeof window !== 'undefined' 
    ? getResponsiveSettings() 
    : { fontSize: 12, barSize: 20, angleText: -45, legendPosition: 'top', labelEnabled: true }

  const isLoading = isLoadingBudgets || isLoadingTransactions
  const error = budgetsError || transactionsError

  if (isLoading) {
    return (
      <Card className="p-6 text-center h-[300px] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
        <p className="text-muted-foreground">Loading chart data...</p>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6 text-center text-red-500 h-[300px] flex items-center justify-center">
        Error loading chart data. Please try again.
      </Card>
    )
  }

  if (!budgetsData?.body || budgetsData.body.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground h-[300px] flex items-center justify-center">
        No budget data to display. Set budgets to see comparison.
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium mb-4">Budget vs. Spending</h3>
      <div ref={chartRef} className="w-full h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            margin={{ 
              top: 20, 
              right: 20, 
              bottom: responsiveSettings.angleText !== 0 ? 80 : 40, 
              left: 20 
            }}
          >
            <XAxis 
              dataKey="category" 
              angle={responsiveSettings.angleText} 
              textAnchor="end" 
              height={responsiveSettings.angleText !== 0 ? 80 : 40} 
              tickMargin={10}
              stroke="hsl(0, 0%, 80%)"
              tick={{ fontSize: responsiveSettings.fontSize }}
            />
            <YAxis 
              tickFormatter={(value) => `$${value}`}
              stroke="hsl(0, 0%, 80%)"
              tick={{ fontSize: responsiveSettings.fontSize }}
              width={50}
            />
            <Legend 
              verticalAlign={responsiveSettings.legendPosition === 'bottom' ? 'bottom' : 'top'} 
              height={36}
              wrapperStyle={{ fontSize: responsiveSettings.fontSize }}
            />
            <Tooltip 
              formatter={(value) => formatCurrency(Number(value))}
              labelFormatter={(label) => `Category: ${label}`}
            />
            <Bar 
              dataKey="budget" 
              name="Budget" 
              fill="hsl(120, 100%, 50%)"
              radius={[4, 4, 0, 0]} 
              barSize={responsiveSettings.barSize}
            />
            <Bar 
              dataKey="spent" 
              name="Spent" 
              fill="hsl(0, 100%, 60%)"
              radius={[4, 4, 0, 0]} 
              barSize={responsiveSettings.barSize}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
