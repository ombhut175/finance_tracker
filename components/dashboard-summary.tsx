"use client"

import { useMemo } from "react"
import type { Transaction, Budget } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MonthPicker } from "@/components/month-picker"
import { AlertCircle } from "lucide-react"

interface DashboardSummaryProps {
  transactions: Transaction[]
  budgets: Budget[]
  selectedMonth: string
  onMonthChange: (month: string) => void
}

export function DashboardSummary({ transactions, budgets, selectedMonth, onMonthChange }: DashboardSummaryProps) {
  const summary = useMemo(() => {
    // Calculate total expenses
    const totalExpenses = transactions.reduce((sum, transaction) => sum + transaction.amount, 0)

    // Calculate total budget
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0)

    // Get category breakdown
    const categoryBreakdown: Record<string, number> = {}
    transactions.forEach((transaction) => {
      const category = transaction.category || "Other"
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + transaction.amount
    })

    // Sort categories by amount (descending)
    const sortedCategories = Object.entries(categoryBreakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3) // Top 3 categories

    // Get most recent transactions
    const recentTransactions = [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3) // Top 3 recent transactions

    // Calculate budget progress
    const budgetProgress = totalBudget > 0 ? Math.min((totalExpenses / totalBudget) * 100, 100) : 0
    const isOverBudget = totalExpenses > totalBudget && totalBudget > 0

    return {
      totalExpenses,
      totalBudget,
      budgetProgress,
      isOverBudget,
      sortedCategories,
      recentTransactions,
    }
  }, [transactions, budgets])

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Monthly Overview</h2>
        <div className="w-[200px]">
          <MonthPicker value={selectedMonth} onChange={onMonthChange} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className={summary.isOverBudget ? "border-red-500" : ""}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
            {summary.isOverBudget && <AlertCircle className="h-4 w-4 text-red-500" />}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(summary.totalExpenses)} / {formatCurrency(summary.totalBudget)}
            </div>
            <div className="mt-2">
              <Progress
                value={summary.budgetProgress}
                className={summary.isOverBudget ? "bg-red-200" : ""}
                indicatorClassName={summary.isOverBudget ? "bg-red-500" : ""}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {summary.isOverBudget
                  ? `Over budget by ${formatCurrency(summary.totalExpenses - summary.totalBudget)}`
                  : `${formatCurrency(summary.totalBudget - summary.totalExpenses)} remaining`}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(summary.totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              {transactions.length} transaction{transactions.length !== 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>

        <Card className="md:col-span-1 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Categories</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.sortedCategories.length > 0 ? (
              <div className="space-y-2">
                {summary.sortedCategories.map(([category, amount]) => (
                  <div key={category} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Badge variant="outline" className="mr-2">
                        {category}
                      </Badge>
                    </div>
                    <div className="font-medium">{formatCurrency(amount)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No categories yet</p>
            )}
          </CardContent>
        </Card>

        <Card className="md:col-span-1 lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            {summary.recentTransactions.length > 0 ? (
              <div className="space-y-3">
                {summary.recentTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex flex-col">
                    <div className="flex justify-between">
                      <span className="font-medium truncate max-w-[150px]">{transaction.description}</span>
                      <span>{formatCurrency(transaction.amount)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <Badge variant="outline" className="text-xs">
                        {transaction.category || "Other"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No transactions yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
