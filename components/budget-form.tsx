"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Budget } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MonthPicker } from "@/components/month-picker"

interface BudgetFormProps {
  onSubmit: (budget: Budget) => void
  initialData?: Budget | null
  onCancel?: () => void
  categories: readonly string[]
  selectedMonth: string
  onMonthChange: (month: string) => void
}

export function BudgetForm({
  onSubmit,
  initialData,
  onCancel,
  categories,
  selectedMonth,
  onMonthChange,
}: BudgetFormProps) {
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState<string>(categories[0])
  const [month, setMonth] = useState(selectedMonth)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount.toString())
      setCategory(initialData.category)
      setMonth(initialData.month)
    } else {
      setMonth(selectedMonth)
    }
  }, [initialData, selectedMonth])

  // Update the parent's selected month when this component changes it
  useEffect(() => {
    if (month !== selectedMonth) {
      onMonthChange(month)
    }
  }, [month, selectedMonth, onMonthChange])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = "Please enter a valid positive amount"
    }

    if (!category) {
      newErrors.category = "Please select a category"
    }

    if (!month) {
      newErrors.month = "Please select a month"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    const budget: Budget = {
      id: initialData?.id || "",
      amount: Number(amount),
      category,
      month,
    }

    onSubmit(budget)

    if (!initialData) {
      // Clear form if adding new budget
      setAmount("")
      // Keep the category and month selected for convenience
    }
  }

  const handleMonthChange = (newMonth: string) => {
    setMonth(newMonth)
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <MonthPicker value={month} onChange={handleMonthChange} />
            {errors.month && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.month}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className={errors.category ? "border-red-500" : ""}>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.category}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Budget Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={errors.amount ? "border-red-500" : ""}
            />
            {errors.amount && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.amount}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              {initialData ? "Update" : "Set"} Budget
            </Button>
            {initialData && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
