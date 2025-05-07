"use client"

import { useMemo } from "react"
import type { SpendingInsight, Transaction, Budget } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, AlertTriangle, CheckCircle, Info, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import useSWR from "swr"
import { getRequest } from "@/helpers/ui/handlers"
import { ApiRouteConstants } from "@/helpers/string_const"
import { formatCurrency } from "@/lib/utils"

interface ApiResponse<T> {
  success: boolean
  message: string
  body: T[]
}

const fetcher = async (url: string) => {
  const response = await getRequest(url)
  return response
}

export function SpendingInsights() {
  // Fetch transactions and budgets
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

  const isLoading = isLoadingTransactions || isLoadingBudgets
  const error = transactionsError || budgetsError

  // Calculate insights based on transaction and budget data
  const insights = useMemo(() => {
    const insights: SpendingInsight[] = []
    
    if (!transactionsData?.body || !budgetsData?.body) {
      return insights
    }

    const transactions = transactionsData.body
    const budgets = budgetsData.body

    // Group transactions by category
    const categorySpending: Record<string, number> = {}
    transactions.forEach((transaction) => {
      const category = transaction.category || "Other"
      categorySpending[category] = (categorySpending[category] || 0) + transaction.amount
    })

    // Calculate total spending
    const totalSpending = Object.values(categorySpending).reduce((sum, amount) => sum + amount, 0)

    // Check budget status for each category
    budgets.forEach((budget) => {
      const spent = categorySpending[budget.category] || 0
      const percentSpent = (spent / budget.amount) * 100
      
      if (percentSpent >= 100) {
        insights.push({
          type: "danger",
          category: budget.category,
          message: `You've spent ${formatCurrency(spent)} on ${budget.category}, which is ${formatCurrency(spent - budget.amount)} over your budget of ${formatCurrency(budget.amount)}.`
        })
      } else if (percentSpent >= 80) {
        insights.push({
          type: "warning",
          category: budget.category,
          message: `You've spent ${formatCurrency(spent)} on ${budget.category}, which is ${Math.round(percentSpent)}% of your ${formatCurrency(budget.amount)} budget.`
        })
      } else if (percentSpent <= 20 && spent > 0) {
        insights.push({
          type: "success",
          category: budget.category,
          message: `You've only spent ${formatCurrency(spent)} on ${budget.category}, which is ${Math.round(percentSpent)}% of your ${formatCurrency(budget.amount)} budget.`
        })
      }
    })

    // Add insights about categories with spending but no budget
    Object.entries(categorySpending).forEach(([category, amount]) => {
      if (amount > 0 && !budgets.some(budget => budget.category === category)) {
        insights.push({
          type: "info",
          category: category,
          message: `You've spent ${formatCurrency(amount)} on ${category}, but you don't have a budget for this category.`
        })
      }
    })

    // Add insight about top spending category
    if (Object.keys(categorySpending).length > 0) {
      const topCategory = Object.entries(categorySpending)
        .sort((a, b) => b[1] - a[1])[0]
      
      if (topCategory && topCategory[1] > 0) {
        const [category, amount] = topCategory
        const percentOfTotal = (amount / totalSpending) * 100
        
        insights.push({
          type: "info",
          category: category,
          message: `Your highest spending is in ${category} at ${formatCurrency(amount)}, which is ${Math.round(percentOfTotal)}% of your total spending.`
        })
      }
    }

    // Add insight about zero spending categories with budget
    budgets.forEach((budget) => {
      const spent = categorySpending[budget.category] || 0
      if (spent === 0) {
        insights.push({
          type: "success",
          category: budget.category,
          message: `You haven't spent anything on ${budget.category} yet, though you've budgeted ${formatCurrency(budget.amount)}.`
        })
      }
    })

    return insights
  }, [transactionsData, budgetsData])

  if (isLoading) {
    return (
      <Card className="p-6 text-center h-[300px] flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
        <p className="text-muted-foreground">Analyzing your spending patterns...</p>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-6 text-center text-red-500 h-[300px] flex items-center justify-center">
        Error loading spending insights. Please try again.
      </Card>
    )
  }

  if (insights.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        No insights available. Add transactions and set budgets to see spending insights.
      </Card>
    )
  }

  return (
    <div className="grid gap-4">
      {insights.map((insight, index) => (
        <Card key={index}>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              {insight.type === "success" && <CheckCircle className="h-5 w-5 text-green-500" />}
              {insight.type === "warning" && <AlertTriangle className="h-5 w-5 text-amber-500" />}
              {insight.type === "danger" && <AlertCircle className="h-5 w-5 text-red-500" />}
              {insight.type === "info" && <Info className="h-5 w-5 text-blue-500" />}
              <CardTitle className="text-base">
                {insight.category && (
                  <Badge variant="outline" className="mr-2">
                    {insight.category}
                  </Badge>
                )}
                {getInsightTitle(insight.type)}
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-sm text-foreground">{insight.message}</CardDescription>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function getInsightTitle(type: SpendingInsight["type"]): string {
  switch (type) {
    case "success":
      return "Good job!"
    case "warning":
      return "Attention needed"
    case "danger":
      return "Budget alert"
    case "info":
      return "Spending insight"
    default:
      return "Insight"
  }
}
