import { dbConnect } from "@/lib/dbConnect"
import Transaction from "@/model/Transaction"
import { responseBadRequest, responseSuccessfulWithData } from "@/helpers/responseHelpers"

export async function POST(request: Request) {
    await dbConnect()

    console.log("::: edit transaction :::")
    try {
        const body = await request.json()
        const { _id, ...updateData } = body

        if (!_id) {
            return responseBadRequest("Transaction ID is required")
        }

        // Validate required fields
        if (!updateData.amount || !updateData.date || !updateData.description || !updateData.category) {
            return responseBadRequest("All fields are required")
        }

        // Validate amount is positive
        if (updateData.amount <= 0) {
            return responseBadRequest("Amount must be greater than 0")
        }

        // Find and update the transaction
        const updatedTransaction = await Transaction.findByIdAndUpdate(
            _id,
            updateData,
            { new: true, runValidators: true }
        )

        if (!updatedTransaction) {
            return responseBadRequest("Transaction not found")
        }

        return responseSuccessfulWithData({
            message: "Transaction updated successfully",
            body: updatedTransaction
        })

    } catch (error) {
        console.error("Error updating transaction:", error)
        return responseBadRequest("Error in updating transaction")
    }
}
