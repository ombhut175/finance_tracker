"use client"

import { useMemo } from "react"
import type { Budget, Transaction } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Bar, BarChart, Legend, XAxis, YAxis } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface BudgetComparisonChartProps {
  budgets: Budget[]
  transactions: Transaction[]
}

export function BudgetComparisonChart({ budgets, transactions }: BudgetComparisonChartProps) {
  const chartData = useMemo(() => {
    if (budgets.length === 0) return []

    // Calculate spending by category
    const categorySpending: Record<string, number> = {}
    transactions.forEach((transaction) => {
      const category = transaction.category
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
  }, [budgets, transactions])

  if (budgets.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground h-[300px] flex items-center justify-center">
        No budget data to display. Set budgets to see comparison.
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <ChartContainer
        config={{
          budget: {
            label: "Budget",
            color: "hsl(var(--chart-1))",
          },
          spent: {
            label: "Spent",
            color: "hsl(var(--chart-2))",
          },
        }}
        className="h-[400px]"
      >
        <BarChart data={chartData} margin={{ top: 20, right: 30, bottom: 60, left: 20 }}>
          <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} tickMargin={10} />
          <YAxis tickFormatter={(value) => `$${value}`} />
          <Bar dataKey="budget" name="budget" fill="var(--color-budget)" radius={[4, 4, 0, 0]} />
          <Bar dataKey="spent" name="spent" fill="var(--color-spent)" radius={[4, 4, 0, 0]} />
          <Legend verticalAlign="top" height={36} />
          <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
        </BarChart>
      </ChartContainer>
    </Card>
  )
}
