import type { Transaction, Budget, SpendingInsight } from "@/lib/types"

export function generateInsights(
  transactions: Transaction[],
  budgets: Budget[],
  selectedMonth: string,
): SpendingInsight[] {
  const insights: SpendingInsight[] = []

  // Calculate spending by category
  const categorySpending: Record<string, number> = {}
  transactions.forEach((transaction) => {
    const category = transaction.category
    categorySpending[category] = (categorySpending[category] || 0) + transaction.amount
  })

  // Get total spending and budget
  const totalSpending = Object.values(categorySpending).reduce((sum, amount) => sum + amount, 0)
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0)

  // Check if there are any budgets set
  if (budgets.length === 0 && transactions.length > 0) {
    insights.push({
      type: "info",
      message: "You haven't set any budgets yet. Setting budgets can help you manage your spending better.",
    })
  }

  // Check overall budget status
  if (totalBudget > 0) {
    const budgetPercentage = (totalSpending / totalBudget) * 100

    if (budgetPercentage > 100) {
      insights.push({
        type: "danger",
        message: `You've exceeded your total monthly budget by ${(((budgetPercentage - 100) / 100) * totalBudget).toFixed(2)}$.`,
      })
    } else if (budgetPercentage >= 90) {
      insights.push({
        type: "warning",
        message: `You're close to your total monthly budget (${budgetPercentage.toFixed(0)}% used).`,
      })
    } else if (budgetPercentage <= 20 && transactions.length > 0) {
      insights.push({
        type: "success",
        message: `Great job! You've only used ${budgetPercentage.toFixed(0)}% of your total monthly budget.`,
      })
    }
  }

  // Check individual category budgets
  budgets.forEach((budget) => {
    const spent = categorySpending[budget.category] || 0
    const percentage = (spent / budget.amount) * 100

    if (percentage > 100) {
      insights.push({
        type: "danger",
        category: budget.category,
        message: `You've exceeded your ${budget.category} budget by ${(((percentage - 100) / 100) * budget.amount).toFixed(2)}$.`,
      })
    } else if (percentage >= 90) {
      insights.push({
        type: "warning",
        category: budget.category,
        message: `You're close to your ${budget.category} budget (${percentage.toFixed(0)}% used).`,
      })
    }
  })

  // Identify categories with high spending but no budget
  Object.entries(categorySpending)
    .filter(([category, amount]) => {
      return amount > 0 && !budgets.some((b) => b.category === category)
    })
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2) // Top 2 unbudgeted categories
    .forEach(([category, amount]) => {
      insights.push({
        type: "info",
        category,
        message: `You spent ${amount.toFixed(2)}$ on ${category} without a budget. Consider setting a budget for this category.`,
      })
    })

  // Identify spending patterns
  if (transactions.length > 0) {
    const sortedCategories = Object.entries(categorySpending)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 1) // Top spending category

    if (sortedCategories.length > 0) {
      const [topCategory, topAmount] = sortedCategories[0]
      const percentOfTotal = (topAmount / totalSpending) * 100

      if (percentOfTotal > 50) {
        insights.push({
          type: "info",
          category: topCategory,
          message: `${topCategory} makes up ${percentOfTotal.toFixed(0)}% of your total spending this month.`,
        })
      }
    }
  }

  return insights
}
