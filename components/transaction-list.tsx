"use client"

import { useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Pencil, Trash, Calendar, AlertTriangle, FileX, Loader2 } from "lucide-react"
import { MonthPicker } from "@/components/month-picker"
import useSWR from "swr"
import { getRequest, deleteRequest } from "@/helpers/ui/handlers"
import { ApiRouteConstants } from "@/helpers/string_const"
import { formatCurrency } from "@/lib/utils"
import type { Transaction } from "@/lib/types"
import { ShoppingBag, Home, Car, Film, Zap, Coffee, Utensils, Briefcase, HeartPulse, Plane, GraduationCap, Gift } from "lucide-react"

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

// Format month from YYYY-MM to Month YYYY
function formatMonth(monthStr: string): string {
  const [year, month] = monthStr.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

export function TransactionList({
  onEdit,
  onDelete,
  selectedMonth,
  onMonthChange,
}: TransactionListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data, error, isLoading, mutate } = useSWR<ApiResponse>(
    ApiRouteConstants.GET_TRANSACTION,
    getRequest
  );

  const transactions = data?.body || [];
  const filteredTransactions = transactions.filter(t => t.date.startsWith(selectedMonth));

  const handleEdit = (transaction: Transaction) => {
    onEdit(transaction);
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    
    try {
      setDeletingId(id);
      await deleteRequest(`${ApiRouteConstants.DELETE_TRANSACTION}?_id=${id}`);
      await mutate();
      onDelete(id);
    } catch (error) {
      console.error("Error deleting transaction:", error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle>Transactions</CardTitle>
          <MonthPicker value={selectedMonth} onChange={onMonthChange} />
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
            <p className="text-sm text-muted-foreground">Loading transactions...</p>
          </div>
        ) : error ? (
          <div className="py-8 text-center text-red-500">
            <AlertTriangle className="h-8 w-8 mx-auto mb-2" />
            <p>Error loading transactions. Please try again.</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            <FileX className="h-8 w-8 mx-auto mb-2" />
            <p>No transactions found for {formatMonth(selectedMonth)}.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTransactions.map((transaction) => (
              <div
                key={transaction._id}
                className="flex items-center justify-between p-3 border rounded-md hover:bg-accent/10 transition-all duration-200 group"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full bg-${getCategoryColor(transaction.category)}/20`}>
                    {getCategoryIcon(transaction.category)}
                  </div>
                  <div>
                    <div className="font-medium group-hover:text-primary transition-colors duration-200">
                      {transaction.description}
                    </div>
                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(transaction.date).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="font-medium">{formatCurrency(transaction.amount)}</div>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(transaction)}
                      className="h-8 w-8 rounded-full hover:bg-blue-500/20 hover:text-blue-600 transition-colors duration-200"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    {transaction._id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(transaction._id as string)}
                        className="h-8 w-8 rounded-full hover:bg-red-500/20 hover:text-red-600 transition-colors duration-200"
                      >
                        {deletingId === transaction._id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "Food & Dining":
      return <Utensils className="h-4 w-4 text-orange-600" />;
    case "Transportation":
      return <Car className="h-4 w-4 text-blue-600" />;
    case "Housing":
      return <Home className="h-4 w-4 text-green-600" />;
    case "Entertainment":
      return <Film className="h-4 w-4 text-purple-600" />;
    case "Utilities":
      return <Zap className="h-4 w-4 text-yellow-600" />;
    case "Healthcare":
      return <HeartPulse className="h-4 w-4 text-red-600" />;
    case "Travel":
      return <Plane className="h-4 w-4 text-cyan-600" />;
    case "Education":
      return <GraduationCap className="h-4 w-4 text-indigo-600" />;
    case "Shopping":
      return <ShoppingBag className="h-4 w-4 text-pink-600" />;
    case "Work":
      return <Briefcase className="h-4 w-4 text-gray-600" />;
    default:
      return <Gift className="h-4 w-4 text-gray-600" />;
  }
}

function getCategoryColor(category: string) {
  switch (category) {
    case "Food & Dining": return "orange";
    case "Transportation": return "blue";
    case "Housing": return "green";
    case "Entertainment": return "purple";
    case "Utilities": return "yellow";
    case "Healthcare": return "red";
    case "Travel": return "cyan";
    case "Education": return "indigo";
    case "Shopping": return "pink";
    case "Work": return "gray";
    default: return "gray";
  }
}
