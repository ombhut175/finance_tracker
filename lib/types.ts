export interface Transaction {
  _id?: string
  amount: number
  date: string
  description: string
  category: string
}

export interface Budget {
  _id?: string
  category: string
  amount: number
  month: string // Format: YYYY-MM
}

export const CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Housing",
  "Entertainment",
  "Utilities",
  "Shopping",
  "Healthcare",
  "Education",
  "Travel",
  "Other",
] as const

export type Category = (typeof CATEGORIES)[number]

export const CATEGORY_COLORS: Record<Category, string> = {
  "Food & Dining": "var(--color-chart-1)",
  Transportation: "var(--color-chart-2)",
  Housing: "var(--color-chart-3)",
  Entertainment: "var(--color-chart-4)",
  Utilities: "var(--color-chart-5)",
  Shopping: "var(--color-chart-6)",
  Healthcare: "var(--color-chart-7)",
  Education: "var(--color-chart-8)",
  Travel: "var(--color-chart-9)",
  Other: "var(--color-chart-10)",
}

export interface SpendingInsight {
  type: "success" | "warning" | "danger" | "info"
  message: string
  category?: string
}
