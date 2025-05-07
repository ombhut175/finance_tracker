import { dbConnect } from "@/lib/dbConnect"
import Budget from "@/model/Budget"
import { responseBadRequest, responseSuccessfulForPost } from "@/helpers/responseHelpers"
import { BudgetConstants } from "@/helpers/string_const"

export async function POST(request: Request) {
    await dbConnect()

    console.log("::: add budget :::")
    try {
        const body = await request.json()

        // Validate required fields
        if (!body[BudgetConstants.AMOUNT] || !body[BudgetConstants.CATEGORY] || !body[BudgetConstants.MONTH]) {
            return responseBadRequest("All fields (amount, category, month) are required")
        }

        // Validate amount is positive
        if (body[BudgetConstants.AMOUNT] <= 0) {
            return responseBadRequest("Amount must be greater than 0")
        }

        // Validate month format (YYYY-MM)
        const monthRegex = /^\d{4}-\d{2}$/
        if (!monthRegex.test(body[BudgetConstants.MONTH])) {
            return responseBadRequest("Month must be in YYYY-MM format")
        }

        // Check if budget already exists for this category and month
        const existingBudget = await Budget.findOne({
            [BudgetConstants.CATEGORY]: body[BudgetConstants.CATEGORY],
            [BudgetConstants.MONTH]: body[BudgetConstants.MONTH]
        })

        if (existingBudget) {
            return responseBadRequest("Budget already exists for this category and month")
        }

        // Create and save the budget
        const budget = new Budget(body)
        await budget.save()

        return responseSuccessfulForPost("Budget added successfully")

    } catch (error) {
        console.error("Error adding budget:", error)
        return responseBadRequest("Error in adding budget")
    }
}
