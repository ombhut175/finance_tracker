"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"
import { MonthPicker } from "@/components/month-picker"
import type { Budget } from "@/lib/types"
import { postRequest, putRequest } from "@/helpers/ui/handlers"
import { ApiRouteConstants } from "@/helpers/string_const"

interface BudgetFormProps {
  onSubmit: (budget: Budget) => void
  initialData?: Budget | null
  onCancel: () => void
  categories: string[]
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
  const [category, setCategory] = useState(initialData?.category || "")
  const [amount, setAmount] = useState<string>(initialData?.amount?.toString() || "")
  const [month, setMonth] = useState(initialData?.month || selectedMonth)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isMutating, setIsMutating] = useState(false)

  useEffect(() => {
    if (!initialData) {
      setMonth(selectedMonth)
    }
  }, [selectedMonth, initialData])

  const handleMonthChange = (value: string) => {
    setMonth(value)
    onMonthChange(value)
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!category) newErrors.category = "Category is required"
    if (!amount) newErrors.amount = "Amount is required"
    if (amount && parseFloat(amount) <= 0) newErrors.amount = "Amount must be greater than 0"
    if (!month) newErrors.month = "Month is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) return

    setIsMutating(true)

    try {
      const budgetData = {
        category,
        amount: parseFloat(amount),
        month,
      }

      if (initialData) {
        await putRequest(
          `${ApiRouteConstants.EDIT_BUDGET}?id=${initialData._id}`, 
          budgetData
        )
        onSubmit({ ...budgetData, _id: initialData._id })
      } else {
        const response = await postRequest(ApiRouteConstants.ADD_BUDGET, budgetData)
        onSubmit({ ...budgetData, _id: response.body._id })
      }
    } catch (error) {
      console.error("Error submitting budget:", error)
    } finally {
      setIsMutating(false)
    }
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="month">Month</Label>
            <MonthPicker value={month} onChange={handleMonthChange} />
            {errors.month && (
              <Alert variant="destructive" className="py-2 animate-fadeIn">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.month}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger 
                className={`transition-all duration-200 focus:scale-[1.01] ${errors.category ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat} className="cursor-pointer transition-colors hover:bg-accent">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <Alert variant="destructive" className="py-2 animate-fadeIn">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.category}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Budget Amount ($)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className={`pl-8 transition-all duration-200 focus:scale-[1.01] ${errors.amount ? "border-red-500" : ""}`}
              />
            </div>
            {errors.amount && (
              <Alert variant="destructive" className="py-2 animate-fadeIn">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.amount}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            {initialData && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isMutating}
                className="transition-colors duration-200 hover:bg-destructive/10 hover:text-destructive"
              >
                Cancel
              </Button>
            )}
            <Button 
              type="submit" 
              disabled={isMutating}
              className="relative overflow-hidden group"
            >
              {isMutating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {initialData ? "Updating..." : "Adding..."}
                </>
              ) : (
                `${initialData ? "Update" : "Set"} Budget`
              )}
              <span className="absolute inset-0 w-full h-full bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

