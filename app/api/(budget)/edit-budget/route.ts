import { dbConnect } from "@/lib/dbConnect"
import Budget from "@/model/Budget"
import { responseBadRequest, responseSuccessfulWithData, responseNotFound } from "@/helpers/responseHelpers"
import { BudgetConstants } from "@/helpers/string_const"

export async function PATCH(request: Request) {
    await dbConnect()

    console.log("::: edit budget :::")
    try {
        const body = await request.json()

        // Validate required fields
        if (!body.id) {
            return responseBadRequest("Budget ID is required")
        }

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

        // Find the budget to update
        const existingBudget = await Budget.findById(body.id)
        if (!existingBudget) {
            return responseNotFound("Budget not found")
        }

        // Check if another budget exists for the same category and month
        const duplicateBudget = await Budget.findOne({
            _id: { $ne: body.id }, // Exclude current budget
            [BudgetConstants.CATEGORY]: body[BudgetConstants.CATEGORY],
            [BudgetConstants.MONTH]: body[BudgetConstants.MONTH]
        })

        if (duplicateBudget) {
            return responseBadRequest("Another budget already exists for this category and month")
        }

        // Update the budget
        const updatedBudget = await Budget.findByIdAndUpdate(
            body.id,
            {
                [BudgetConstants.AMOUNT]: body[BudgetConstants.AMOUNT],
                [BudgetConstants.CATEGORY]: body[BudgetConstants.CATEGORY],
                [BudgetConstants.MONTH]: body[BudgetConstants.MONTH]
            },
            { new: true }
        )
    

        return responseSuccessfulWithData({
            message: "Budget updated successfully",
            body: updatedBudget || {}
        })

    } catch (error) {
        console.error("Error updating budget:", error)
        return responseBadRequest("Error in updating budget")
    }
}
