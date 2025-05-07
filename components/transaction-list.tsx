"use client"

import type { Transaction } from "@/lib/types"
import { formatCurrency, formatDate } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Edit, Trash2, Loader2 } from "lucide-react"
import { MonthPicker } from "@/components/month-picker"
import useSWR, { mutate } from "swr"
import { Skeleton } from "@/components/ui/skeleton"
import { getRequest } from "@/helpers/ui/handlers"
import { useEffect, useState } from "react"
import { ApiRouteConstants, Constants } from "@/helpers/string_const"
import { toast } from "react-toastify"

interface TransactionListProps {
  onEdit: (transaction: Transaction) => void
  onDelete: (id: string) => void
  selectedMonth: string
  onMonthChange: (month: string) => void
}

interface ApiResponse {
  success: boolean
  message: string
  body: Transaction[]
}

const fetcher = async (url: string) => {
  const response = await getRequest(url)
  console.log("API Response:", response)
  return response
}

export function TransactionList({
  onEdit,
  onDelete,
  selectedMonth,
  onMonthChange,
}: TransactionListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { data, error, isLoading } = useSWR<ApiResponse>(ApiRouteConstants.GET_TRANSACTION, fetcher)

  useEffect(() => {
    console.log("Selected Month:", selectedMonth)
    console.log("API Response Data:", data)
  }, [data, selectedMonth])

  // Filter transactions for the selected month
  const filteredTransactions = data?.body?.filter((t) => {
    const transactionMonth = new Date(t.date).toISOString().substring(0, 7) // YYYY-MM
    console.log("Transaction Date:", t.date, "Transaction Month:", transactionMonth)
    return transactionMonth === selectedMonth
  }) || []

  console.log("Filtered Transactions:", filteredTransactions)

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id)
      const response = await fetch(`${ApiRouteConstants.DELETE_TRANSACTION}?${Constants.ID}=${id}`, {
        method: "DELETE",
      })
      const data = await response.json()

      if (!data.success) {
        throw new Error(data.message || "Failed to delete transaction")
      }

      // Refresh the transaction list
      await mutate(ApiRouteConstants.GET_TRANSACTION)
      toast.success("Transaction deleted successfully")
      onDelete(id)
    } catch (error) {
      console.error("Error deleting transaction:", error)
      toast.error(error instanceof Error ? error.message : "Failed to delete transaction")
    } finally {
      setDeletingId(null)
    }
  }

  if (error) {
    console.error("Error fetching transactions:", error)
    return (
      <Card>
        <CardContent className="py-6">
          <div className="text-center text-red-500">
            Failed to load transactions. Please try again later.
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Transactions for</CardTitle>
          <div className="w-[200px]">
            <MonthPicker value={selectedMonth} onChange={onMonthChange} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-12 w-full" />
              </div>
            ))}
          </div>
        ) : !data?.body ? (
          <div className="text-center text-muted-foreground py-6">
            No data available. Please try again later.
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="text-center text-muted-foreground py-6">
            No transactions for this month. Add your first transaction using the form.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((transaction) => (
                    <TableRow key={transaction._id}>
                      <TableCell>{formatDate(transaction.date)}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{transaction.category || "Other"}</Badge>
                      </TableCell>
                      <TableCell>{transaction.description}</TableCell>
                      <TableCell className="text-right">{formatCurrency(transaction.amount)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onEdit(transaction)}
                            aria-label="Edit transaction"
                            disabled={deletingId === transaction._id}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(transaction._id!)}
                            aria-label="Delete transaction"
                            disabled={deletingId === transaction._id}
                          >
                            {deletingId === transaction._id ? (
                              <Loader2 className="h-4 w-4 animate-spin text-red-500" />
                            ) : (
                              <Trash2 className="h-4 w-4 text-red-500" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
