import { dbConnect } from "@/lib/dbConnect"
import Budget from "@/model/Budget"
import { responseBadRequest, responseSuccessful, responseNotFound } from "@/helpers/responseHelpers"
import { Constants } from "@/helpers/string_const"

export async function DELETE(request: Request) {
    await dbConnect()

    console.log("::: delete budget :::")
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get(Constants.ID);

        if (!id) {
            return responseBadRequest("Budget ID is required")
        }

        // Find and delete the budget
        const deletedBudget = await Budget.findByIdAndDelete(id)

        if (!deletedBudget) {
            return responseNotFound("Budget not found")
        }

        return responseSuccessful("Budget deleted successfully")

    } catch (error) {
        console.error("Error deleting budget:", error)
        return responseBadRequest("Error in deleting budget")
    }
}
