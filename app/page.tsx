"use client"

import { useState, useMemo } from "react"
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

export default function Home() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })

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
    setTransactions([...transactions, { ...transaction, id: Date.now().toString() }])
  }

  const updateTransaction = (updatedTransaction: Transaction) => {
    setTransactions(transactions.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t)))
    setEditingTransaction(null)
  }

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id))
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
      updatedBudgets[existingIndex] = { ...budget, id: budgets[existingIndex].id }
      setBudgets(updatedBudgets)
    } else {
      // Add new budget
      setBudgets([...budgets, { ...budget, id: Date.now().toString() }])
    }
  }

  const updateBudget = (updatedBudget: Budget) => {
    setBudgets(budgets.map((b) => (b.id === updatedBudget.id ? updatedBudget : b)))
    setEditingBudget(null)
  }

  const deleteBudget = (id: string) => {
    setBudgets(budgets.filter((b) => b.id !== id))
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

  return (
    <main className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-center">Personal Finance Visualizer</h1>

      <DashboardSummary
        transactions={filteredTransactions}
        budgets={currentMonthBudgets}
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
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
                onSubmit={editingTransaction ? updateTransaction : addTransaction}
                initialData={editingTransaction}
                onCancel={cancelEditingTransaction}
                categories={CATEGORIES}
              />
            </div>
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
              <TransactionList
                transactions={transactions}
                onEdit={startEditingTransaction}
                onDelete={deleteTransaction}
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="budgets" className="mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-1">
              <h2 className="text-xl font-semibold mb-4">{editingBudget ? "Edit Budget" : "Set Budget"}</h2>
              <BudgetForm
                onSubmit={editingBudget ? updateBudget : addBudget}
                initialData={editingBudget}
                onCancel={cancelEditingBudget}
                categories={CATEGORIES}
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
              />
            </div>
            <div className="lg:col-span-2">
              <h2 className="text-xl font-semibold mb-4">Budget Overview</h2>
              <BudgetList
                budgets={currentMonthBudgets}
                transactions={filteredTransactions}
                onEdit={startEditingBudget}
                onDelete={deleteBudget}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="charts" className="mt-4">
          <div className="grid grid-cols-1 gap-8">
            <div>
              <h2 className="text-xl font-semibold mb-4">Budget vs. Actual</h2>
              <BudgetComparisonChart budgets={currentMonthBudgets} transactions={filteredTransactions} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold mb-4">Monthly Expenses</h2>
                <ExpensesChart transactions={transactions} />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-4">Expenses by Category</h2>
                <CategoryChart transactions={filteredTransactions} />
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="mt-4">
          <div>
            <h2 className="text-xl font-semibold mb-4">Spending Insights</h2>
            <SpendingInsights insights={insights} />
          </div>
        </TabsContent>
      </Tabs>
    </main>
  )
}
