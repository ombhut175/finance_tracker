"use client"

import { useState, useMemo, useEffect } from "react"
import { TransactionForm } from "@/components/transaction-form"
import { TransactionList } from "@/components/transaction-list"
import { ExpensesChart } from "@/components/expenses-chart"
import { CategoryChart } from "@/components/category-chart"
import { BudgetForm } from "@/components/budget-form"
import { BudgetList } from "@/components/budget-list"
import { BudgetComparisonChart } from "@/components/budget-comparison-chart"
import { SpendingInsights } from "@/components/spending-insights"
import { DashboardSummary } from "@/components/dashboard-summary"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CATEGORIES, type Transaction, type Budget } from "@/lib/types"
import { generateInsights } from "@/lib/insights"
import { Loader2, LineChart, DollarSign, BarChart4 } from 'lucide-react'
// import { ToastDemo } from "@/components/toast-demo" // Commented out after testing
import { toastSuccess } from "@/lib/toast"

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, "0")
    return `${year}-${month}`
  })

  const [isLoading, setIsLoading] = useState(true);

  useEffect(()=>{
    // Simulate loading for at least 800ms for better UX
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 800);
    
    return () => clearTimeout(timer);
  },[]);

  // Filter transactions for the selected month
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const transactionMonth = t.date.substring(0, 7) // YYYY-MM
      return transactionMonth === selectedMonth
    })
  }, [transactions, selectedMonth])

  // Generate insights based on transactions and budgets
  const insights = useMemo(() => {
    return generateInsights(filteredTransactions, budgets, selectedMonth)
  }, [filteredTransactions, budgets, selectedMonth])

  const addTransaction = (transaction: Transaction) => {
    setTransactions([...transactions, { ...transaction }])
  }

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(transactions.map((t) => (t._id === updatedTransaction._id ? updatedTransaction : t)))
    setEditingTransaction(null)
  }

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t._id !== id))
  }

  const startEditingTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
  }

  const cancelEditingTransaction = () => {
    setEditingTransaction(null)
  }

  const addBudget = (budget: Budget) => {
    // Check if budget for this category and month already exists
    const existingIndex = budgets.findIndex((b) => b.category === budget.category && b.month === budget.month)

    if (existingIndex >= 0) {
      // Update existing budget
      const updatedBudgets = [...budgets]
      updatedBudgets[existingIndex] = { ...budget, _id: budgets[existingIndex]._id }
      setBudgets(updatedBudgets)
    } else {
      // Add new budget
      setBudgets([...budgets, { ...budget, _id: Date.now().toString() }])
    }
  }

  const updateBudget = (updatedBudget: Budget) => {
    setBudgets(budgets.map((b) => (b._id === updatedBudget._id ? updatedBudget : b)))
    setEditingBudget(null)
  }

  const deleteBudget = (id: string) => {
    setBudgets(budgets.filter((b) => b._id !== id))
  }

  const startEditingBudget = (budget: Budget) => {
    setEditingBudget(budget)
  }

  const cancelEditingBudget = () => {
    setEditingBudget(null)
  }

  // Get budgets for the selected month
  const currentMonthBudgets = useMemo(() => {
    return budgets.filter((b) => b.month === selectedMonth)
  }, [budgets, selectedMonth])

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction)
  }

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget)
  }

  const handleDeleteTransaction = (id: string) => {
    setEditingTransaction(null)
  }

  const handleDeleteBudget = (id: string) => {
    setEditingBudget(null)
  }

  const handleTransactionSubmit = (transaction: Transaction) => {
    setEditingTransaction(null)
  }

  const handleBudgetSubmit = (budget: Budget) => {
    setEditingBudget(null)
  }

  const handleMonthChange = (month: string) => {
    console.log("Month changed to:", month) // Debug log
    setSelectedMonth(month)
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4 max-w-md text-center">
          <div className="relative">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
            <DollarSign className="h-6 w-6 text-primary absolute inset-0 m-auto" />
          </div>
          
          <h1 className="text-2xl font-bold mt-6">Finance Tracker</h1>
          <p className="text-muted-foreground">Loading your financial dashboard...</p>
          
          <div className="w-64 h-2 bg-muted rounded-full mt-4 overflow-hidden">
            <div className="h-full bg-primary rounded-full animate-pulse" style={{ width: '70%' }} />
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="flex flex-col items-center p-3 bg-card rounded-lg shadow-sm">
              <LineChart className="h-6 w-6 text-primary mb-2" />
              <span className="text-xs text-muted-foreground">Transactions</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-card rounded-lg shadow-sm">
              <BarChart4 className="h-6 w-6 text-primary mb-2" />
              <span className="text-xs text-muted-foreground">Analytics</span>
            </div>
            <div className="flex flex-col items-center p-3 bg-card rounded-lg shadow-sm">
              <DollarSign className="h-6 w-6 text-primary mb-2" />
              <span className="text-xs text-muted-foreground">Budgets</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Personal Finance Visualizer</h1>

      {/* Toast Demo component removed after testing */}
      {/* <div className="mb-8 p-4 border rounded-lg bg-card">
        <ToastDemo />
      </div> */}

      <DashboardSummary
        selectedMonth={selectedMonth}
        onMonthChange={handleMonthChange}
      />

      <Tabs defaultValue="transactions" className="mt-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <h2 className="text-xl font-semibold mb-4">
                {editingTransaction ? "Edit Transaction" : "Add Transaction"}
              </h2>
              <TransactionForm
                onSubmit={handleTransactionSubmit}
                initialData={editingTransaction}
                onCancel={cancelEditingTransaction}
                categories={CATEGORIES}
              />
            </div>
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
              <TransactionList
                onEdit={handleEditTransaction}
                onDelete={handleDeleteTransaction}
                selectedMonth={selectedMonth}
                onMonthChange={handleMonthChange}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="budgets" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <h2 className="text-xl font-semibold mb-4">{editingBudget ? "Edit Budget" : "Set Budget"}</h2>
              <BudgetForm
                onSubmit={handleBudgetSubmit}
                initialData={editingBudget}
                onCancel={cancelEditingBudget}
                categories={CATEGORIES}
                selectedMonth={selectedMonth}
                onMonthChange={handleMonthChange}
              />
            </div>
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Budget Overview</h2>
              <BudgetList
                onEdit={handleEditBudget}
                onDelete={handleDeleteBudget}
                selectedMonth={selectedMonth}
                onMonthChange={handleMonthChange}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="charts" className="mt-4">
          <div className="grid grid-cols-1 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Budget vs. Actual</h2>
              <BudgetComparisonChart />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Monthly Expenses</h2>
                <ExpensesChart />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Expenses by Category</h2>
                <CategoryChart />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="mt-4">
          <div>
            <h2 className="text-xl font-semibold mb-4">Spending Insights</h2>
            <SpendingInsights />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  )
}
