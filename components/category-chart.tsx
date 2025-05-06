"use client"

import { useMemo } from "react"
import type { Transaction } from "@/lib/types"
import { CATEGORIES, CATEGORY_COLORS } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { Card } from "@/components/ui/card"
import { Cell, Pie, PieChart } from "recharts"
import { ChartContainer, ChartLegend, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

interface CategoryChartProps {
  transactions: Transaction[]
}

export function CategoryChart({ transactions }: CategoryChartProps) {
  const chartData = useMemo(() => {
    // Group transactions by category
    const categoryData: Record<string, number> = {}

    // Initialize all categories with 0
    CATEGORIES.forEach((category) => {
      categoryData[category] = 0
    })

    // Sum up amounts by category
    transactions.forEach((transaction) => {
      const category = transaction.category || "Other"
      categoryData[category] = (categoryData[category] || 0) + transaction.amount
    })

    // Convert to array format for the chart
    return Object.entries(categoryData)
      .filter(([_, amount]) => amount > 0) // Only include categories with transactions
      .map(([name, value]) => ({ name, value }))
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
        config={Object.fromEntries(
          CATEGORIES.map((category) => [
            category,
            {
              label: category,
              color: CATEGORY_COLORS[category],
            },
          ]),
        )}
        className="h-[400px]"
      >
        <div className="flex h-full flex-col md:flex-row">
          <PieChart className="mx-auto h-[300px] w-full max-w-[500px]">
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={120}
              innerRadius={60}
              paddingAngle={2}
              label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              labelLine={false}
            >
              {chartData.map((entry) => (
                <Cell key={entry.name} fill={CATEGORY_COLORS[entry.name as keyof typeof CATEGORY_COLORS] || "#ccc"} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent formatter={(value) => formatCurrency(Number(value))} />} />
          </PieChart>
          <ChartLegend className="mx-auto mt-4 md:mt-0" />
        </div>
      </ChartContainer>
    </Card>
  )
}
