import { dbConnect } from "@/lib/dbConnect"
import Transaction from "@/model/Transaction"
import { responseBadRequest, responseSuccessful } from "@/helpers/responseHelpers"
import { Constants } from "@/helpers/string_const"

export async function DELETE(request: Request) {
    await dbConnect()

    console.log("::: delete transaction :::")
    try {
        // Get the transaction ID from the URL search params
        const { searchParams } = new URL(request.url)
        const id = searchParams.get(Constants.ID)

        if (!id) {
            return responseBadRequest("Transaction ID is required")
        }

        // Find and delete the transaction
        const deletedTransaction = await Transaction.findByIdAndDelete(id)

        if (!deletedTransaction) {
            return responseBadRequest("Transaction not found")
        }

        return responseSuccessful("Transaction deleted successfully")

    } catch (error) {
        console.error("Error deleting transaction:", error)
        return responseBadRequest("Error in deleting transaction")
    }
}
