"use client"

import type React from "react"

import { useState, useEffect } from "react"
import type { Transaction } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {handleError, postRequest} from "@/helpers/ui/handlers";
import useSWRMutation from "swr/mutation";
import {ApiRouteConstants} from "@/helpers/string_const";
import { mutate } from "swr"

const addTransactionFetcher = async (url: string, {arg}: { arg: { transaction: Transaction } }) => {
  return await postRequest(url, arg.transaction);
}

const editTransactionFetcher = async (url: string, { arg }: { arg: { transaction: Transaction } }) => {
  return await postRequest(url, arg.transaction);
}

interface TransactionFormProps {
  onSubmit: (transaction: Transaction) => void
  initialData?: Transaction | null
  onCancel?: () => void
  categories: readonly string[]
}

const {
  ADD_TRANSACTION,
  EDIT_TRANSACTION
} = ApiRouteConstants;

export function TransactionForm({ onSubmit, initialData, onCancel, categories }: TransactionFormProps) {
  const [amount, setAmount] = useState("")
  const [date, setDate] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState<string>(categories[0])
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string>("")

  const {
    trigger: addTrigger,
    error: addError,
    isMutating: isAdding,
  } = useSWRMutation(ADD_TRANSACTION, addTransactionFetcher);

  const {
    trigger: editTrigger,
    error: editError,
    isMutating: isEditing,
  } = useSWRMutation(EDIT_TRANSACTION, editTransactionFetcher);

  const isMutating = isAdding || isEditing;

  useEffect(() => {
    if (initialData) {
      setAmount(initialData.amount.toString())
      setDate(initialData.date)
      setDescription(initialData.description)
      setCategory(initialData.category || categories[0])
    }
  }, [initialData, categories])

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      newErrors.amount = "Please enter a valid positive amount"
    }

    if (!date) {
      newErrors.date = "Please select a date"
    }

    if (!description.trim()) {
      newErrors.description = "Please enter a description"
    }

    if (!category) {
      newErrors.category = "Please select a category"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit =async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError("") // Clear any previous errors

    console.log("::: transaction form handle submit :::");

    if (!validate()) return;

    const transaction: Transaction = {
      ...(initialData?._id && { _id: initialData._id }),
      amount: Number(amount),
      date,
      description,
      category,
    }

    try {
      if (initialData?._id) {
        await editTrigger({ transaction })
      } else {
        await addTrigger({ transaction })
      }
      await mutate("/api/get-transaction")
      onSubmit(transaction)

      // Reset form fields in all cases, not just for new transactions
      setAmount("")
      setDate("")
      setDescription("")
      setCategory(categories[0])
      setErrors({})
    }catch (error) {
      console.error("Transaction submission error:", error)
      setSubmitError(error instanceof Error ? error.message : "Failed to save transaction. Please try again.")
      handleError(error);
    }
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          {submitError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{submitError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="amount">Amount ($)</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className={errors.amount ? "border-red-500" : ""}
              disabled={isMutating}
            />
            {errors.amount && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.amount}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={errors.date ? "border-red-500" : ""}
              disabled={isMutating}
            />
            {errors.date && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.date}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select value={category} onValueChange={setCategory} disabled={isMutating}>
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
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter transaction details"
              className={errors.description ? "border-red-500" : ""}
              disabled={isMutating}
            />
            {errors.description && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{errors.description}</AlertDescription>
              </Alert>
            )}
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1" disabled={isMutating}>
              {isMutating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {initialData ? "Updating..." : "Adding..."}
                </>
              ) : (
                `${initialData ? "Update" : "Add"} Transaction`
              )}
            </Button>
            {initialData && (
              <Button type="button" variant="outline" onClick={onCancel} disabled={isMutating}>
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
