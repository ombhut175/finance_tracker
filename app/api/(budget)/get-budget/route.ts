import { dbConnect } from "@/lib/dbConnect"
import Budget from "@/model/Budget"
import { responseInternalServerError, responseSuccessfulWithData } from "@/helpers/responseHelpers"

export async function GET() {
    await dbConnect()

    console.log("::: get budgets :::")
    try {
        const budgets = await Budget.find({}).sort({ month: -1, category: 1 })

        return responseSuccessfulWithData({
            message: "Budgets fetched successfully",
            body: budgets
        })

    } catch (error) {
        console.error("Error fetching budgets:", error)
        return responseInternalServerError("Error in fetching budgets")
    }
}
