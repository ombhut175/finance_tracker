"use client"

import type { Budget, Transaction } from "@/lib/types"
import { formatCurrency } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2 } from "lucide-react"
import { Progress } from "@/components/ui/progress"

interface BudgetListProps {
  budgets: Budget[]
  transactions: Transaction[]
  onEdit: (budget: Budget) => void
  onDelete: (id: string) => void
}

export function BudgetList({ budgets, transactions, onEdit, onDelete }: BudgetListProps) {
  if (budgets.length === 0) {
    return (
      <Card className="p-6 text-center text-muted-foreground">
        No budgets set for this month. Use the form to set your first budget.
      </Card>
    )
  }

  // Calculate spending by category
  const categorySpending: Record<string, number> = {}
  transactions.forEach((transaction) => {
    const category = transaction.category
    categorySpending[category] = (categorySpending[category] || 0) + transaction.amount
  })

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
            {budgets.map((budget) => {
              const spent = categorySpending[budget.category] || 0
              const remaining = Math.max(budget.amount - spent, 0)
              const progress = budget.amount > 0 ? Math.min((spent / budget.amount) * 100, 100) : 0
              const isOverBudget = spent > budget.amount

              return (
                <TableRow key={budget.id}>
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
                        onClick={() => onDelete(budget.id)}
                        aria-label="Delete budget"
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
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
