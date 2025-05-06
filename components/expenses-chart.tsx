"use client"

import { useMemo } from "react"
import type { Transaction } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Bar, BarChart, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface ExpensesChartProps {
  transactions: Transaction[]
}

export function ExpensesChart({ transactions }: ExpensesChartProps) {
  const chartData = useMemo(() => {
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
  }, [transactions])

  if (transactions.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground h-[300px] flex items-center justify-center">
        No transaction data to display
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <ChartContainer
        config={{
          expenses: {
            label: "Expenses",
            color: "hsl(var(--chart-1))",
          },
        }}
        className="h-[300px]"
      >
        <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
          <XAxis
            dataKey="month"
            tickFormatter={(value) => {
              const [year, month] = value.split("-")
              return `${month}/${year.slice(2)}`
            }}
          />
          <YAxis tickFormatter={(value) => `$${value}`} />
          <Bar dataKey="amount" name="expenses" fill="var(--color-expenses)" radius={[4, 4, 0, 0]} />
          <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
        </BarChart>
      </ChartContainer>
    </Card>
  )
}
