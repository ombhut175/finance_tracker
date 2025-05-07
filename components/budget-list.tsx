"use client"

import type { Budget, Transaction } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Loader2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { ApiRouteConstants, Constants } from "@/helpers/string_const"
import { getRequest, deleteRequest, handleError } from "@/helpers/ui/handlers"
import useSWR from "swr"
import useSWRMutation from "swr/mutation"
import { toast } from "sonner"

interface BudgetListProps {
  onEdit: (budget: Budget) => void
  onDelete: (id: string) => void
  selectedMonth: string
  onMonthChange: (month: string) => void
}

interface ApiResponse {
  success: boolean
  message: string
  body: Budget[]
}

const fetcher = async (url: string) => {
  const response = await getRequest(url)
  console.log("Budget API Response:", response) // Debug log
  return response
}

export function BudgetList({ onEdit, onDelete, selectedMonth, onMonthChange }: BudgetListProps) {
  // Fetch budgets with proper configuration
  const { data, error, isLoading, mutate } = useSWR<ApiResponse>(
    ApiRouteConstants.GET_BUDGET,
    fetcher,
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      refreshInterval: 0,
      dedupingInterval: 2000,
    }
  )

  // Fetch transactions for spending calculation
  const { data: transactionsData } = useSWR<{ success: boolean; message: string; body: Transaction[] }>(
    ApiRouteConstants.GET_TRANSACTION,
    fetcher
  )

  const { trigger: deleteBudget, isMutating: isDeleting } = useSWRMutation(
    ApiRouteConstants.DELETE_BUDGET,
    async (url: string, { arg }: { arg: string }) => {
      return deleteRequest(`${url}?${Constants.ID}=${arg}`)
    }
  )

  const handleDelete = async (id: string) => {
    try {
      await deleteBudget(id)
      toast.success("Budget deleted successfully")
      await mutate()
      onDelete(id)
    } catch (error) {
      console.error("Error deleting budget:", error)
      handleError(error)
    }
  }

  if (isLoading) {
    return (
      <Card className="p-6 text-center">
        <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
        <p className="text-muted-foreground">Loading budgets...</p>
      </Card>
    )
  }

  if (error) {
    console.error("Budget fetch error:", error) // Debug log
    return (
      <Card className="p-6 text-center text-red-500">
        Error loading budgets. Please try again.
      </Card>
    )
  }

  // Debug logs
  console.log("Raw data:", data)
  console.log("Selected month:", selectedMonth)

  // Ensure budgets is always an array and filter by selected month
  const budgets = data?.body || []
  console.log("All budgets:", budgets) // Debug log

  const filteredBudgets = budgets.filter((budget) => {
    console.log("Budget month:", budget.month, "Selected month:", selectedMonth) // Debug log
    return budget.month === selectedMonth
  })
  console.log("Filtered budgets:", filteredBudgets) // Debug log

  // Calculate spending by category
  const categorySpending: Record<string, number> = {}
  const transactions = transactionsData?.body || []
  
  // Filter transactions for the selected month and calculate spending
  transactions
    .filter(t => {
      const transactionMonth = new Date(t.date).toISOString().substring(0, 7)
      return transactionMonth === selectedMonth
    })
    .forEach((transaction) => {
      const category = transaction.category || "Other"
      categorySpending[category] = (categorySpending[category] || 0) + transaction.amount
    })

  if (filteredBudgets.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        No budgets set for {selectedMonth}. Use the form to set your first budget.
      </Card>
    )
  }

  return (
    <Card>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Budget</TableHead>
              <TableHead className="text-right">Spent</TableHead>
              <TableHead className="text-right">Remaining</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBudgets.map((budget) => {
              const spent = categorySpending[budget.category] || 0
              const remaining = Math.max(budget.amount - spent, 0)
              const progress = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0
              const isOverBudget = spent > budget.amount

              return (
                <TableRow key={budget._id}>
                  <TableCell>
                    <Badge variant="outline">{budget.category}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(budget.amount)}</TableCell>
                  <TableCell className="text-right">
                    <span className={isOverBudget ? "text-red-500 font-medium" : ""}>{formatCurrency(spent)}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    {isOverBudget ? (
                      <span className="text-red-500 font-medium">-{formatCurrency(spent - budget.amount)}</span>
                    ) : (
                      formatCurrency(remaining)
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Progress
                        value={progress}
                        className={isOverBudget ? "bg-red-200" : ""}
                        indicatorClassName={isOverBudget ? "bg-red-500" : ""}
                      />
                      <span className="text-xs w-12">{Math.round(progress)}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => onEdit(budget)} aria-label="Edit budget">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => budget._id && handleDelete(budget._id)}
                        disabled={isDeleting}
                        aria-label="Delete budget"
                      >
                        {isDeleting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4 text-red-500" />
                        )}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>
    </Card>
  )
}
