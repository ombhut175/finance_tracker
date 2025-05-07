"use client"

import { useMemo } from "react"
import type { Transaction, Budget } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MonthPicker } from "@/components/month-picker"
import { AlertCircle, Loader2 } from "lucide-react"
import useSWR from "swr"
import { getRequest } from "@/helpers/ui/handlers"
import { ApiRouteConstants } from "@/helpers/string_const"

interface DashboardSummaryProps {
  selectedMonth: string
  onMonthChange: (month: string) => void
}

interface ApiResponse {
  success: boolean
  message: string
  body: Transaction[] | Budget[]
}

export function DashboardSummary({ selectedMonth, onMonthChange }: DashboardSummaryProps) {
  // Fetch transactions
  const { data: transactionsData, error: transactionsError, isLoading: isLoadingTransactions } = useSWR<ApiResponse>(
    ApiRouteConstants.GET_TRANSACTION,
    async (url: string) => {
      const response = await getRequest(url)
      return response
    }
  )

  // Fetch budgets
  const { data: budgetsData, error: budgetsError, isLoading: isLoadingBudgets } = useSWR<ApiResponse>(
    ApiRouteConstants.GET_BUDGET,
    async (url: string) => {
      const response = await getRequest(url)
      return response
    }
  )

  const summary = useMemo(() => {
    const transactions = transactionsData?.body as Transaction[] || []
    const budgets = budgetsData?.body as Budget[] || []

    // Filter transactions for the selected month
    const filteredTransactions = transactions.filter((t) => {
      const transactionMonth = new Date(t.date).toISOString().substring(0, 7) // YYYY-MM
      return transactionMonth === selectedMonth
    })

    // Filter budgets for the selected month
    const filteredBudgets = budgets.filter((b) => b.month === selectedMonth)

    // Calculate total expenses
    const totalExpenses = filteredTransactions.reduce((sum, transaction) => sum + transaction.amount, 0)

    // Calculate total budget
    const totalBudget = filteredBudgets.reduce((sum, budget) => sum + budget.amount, 0)

    // Get category breakdown
    const categoryBreakdown: Record<string, number> = {}
    filteredTransactions.forEach((transaction) => {
      const category = transaction.category || "Other"
      categoryBreakdown[category] = (categoryBreakdown[category] || 0) + transaction.amount
    })

    // Sort categories by amount (descending)
    const sortedCategories = Object.entries(categoryBreakdown)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3) // Top 3 categories

    // Get most recent transactions
    const recentTransactions = [...filteredTransactions]
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
  }, [transactionsData, budgetsData, selectedMonth])

  const isLoading = isLoadingTransactions || isLoadingBudgets
  const hasError = transactionsError || budgetsError

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-48">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (hasError) {
    return (
      <div className="text-center text-red-500">
        Failed to load dashboard data. Please try again later.
      </div>
    )
  }

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
              {(transactionsData?.body as Transaction[] || []).length} transaction{(transactionsData?.body as Transaction[] || []).length !== 1 ? "s" : ""}
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
                  <div key={transaction._id} className="flex flex-col">
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
