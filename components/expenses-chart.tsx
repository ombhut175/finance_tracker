"use client"

import { useMemo, useRef, useEffect } from "react"
import type { Transaction } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts"
import useSWR from "swr"
import { getRequest } from "@/helpers/ui/handlers"
import { ApiRouteConstants } from "@/helpers/string_const"
import { Loader2 } from "lucide-react"

interface ApiResponse {
  success: boolean
  message: string
  body: Transaction[]
}

const fetcher = async (url: string) => {
  const response = await getRequest(url)
  return response
}

export function ExpensesChart() {
  const chartRef = useRef<HTMLDivElement>(null)
  
  const { data, error, isLoading } = useSWR<ApiResponse>(
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
    const transactions = data?.body || []

    // Group transactions by month
    const monthlyData: Record<string, number> = {}

    transactions.forEach((transaction) => {
      const date = new Date(transaction.date)
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = 0
      }

      monthlyData[monthYear] += transaction.amount
    })

    // Convert to array and sort by date
    return Object.entries(monthlyData)
      .map(([month, amount]) => ({ month, amount }))
      .sort((a, b) => a.month.localeCompare(b.month))
  }, [data])

  // Get responsive settings based on screen size
  const getResponsiveSettings = () => {
    if (typeof window === 'undefined') return { fontSize: 12, tickRotation: 0, barSize: 20 }
    
    const width = window.innerWidth
    if (width < 640) {
      // Mobile
      return {
        fontSize: 10,
        tickRotation: -45,
        barSize: 15
      }
    } else if (width < 1024) {
      // Tablet
      return {
        fontSize: 11,
        tickRotation: -30,
        barSize: 20
      }
    } else {
      // Desktop
      return {
        fontSize: 12,
        tickRotation: 0,
        barSize: 30
      }
    }
  }

  const responsiveSettings = typeof window !== 'undefined' 
    ? getResponsiveSettings() 
    : { fontSize: 12, tickRotation: 0, barSize: 20 }

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

  if (!data?.body || data.body.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground h-[300px] flex items-center justify-center">
        No transaction data to display
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <h3 className="text-lg font-medium mb-4">Monthly Expenses</h3>
      <div ref={chartRef} className="w-full h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 40, left: 20 }}>
            <XAxis
              dataKey="month"
              tickFormatter={(value) => {
                const [year, month] = value.split("-")
                return `${month}/${year.slice(2)}`
              }}
              stroke="hsl(0, 0%, 80%)"
              angle={responsiveSettings.tickRotation}
              textAnchor={responsiveSettings.tickRotation !== 0 ? "end" : "middle"}
              height={50}
              tick={{ fontSize: responsiveSettings.fontSize }}
            />
            <YAxis 
              tickFormatter={(value) => `$${value}`} 
              stroke="hsl(0, 0%, 80%)" 
              tick={{ fontSize: responsiveSettings.fontSize }}
              width={50}
            />
            <Bar 
              dataKey="amount" 
              name="expenses" 
              fill="hsl(210, 100%, 60%)" 
              radius={[4, 4, 0, 0]} 
              barSize={responsiveSettings.barSize}
            />
            <Tooltip 
              formatter={(value) => formatCurrency(Number(value))}
              labelFormatter={(label) => {
                const [year, month] = label.split("-")
                return `Month: ${month}/${year}`
              }}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  )
}
