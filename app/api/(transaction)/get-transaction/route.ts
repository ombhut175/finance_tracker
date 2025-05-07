import { dbConnect } from "@/lib/dbConnect";
import Transaction from "@/model/Transaction";
import { responseBadRequest, responseSuccessfulWithData } from "@/helpers/responseHelpers";

export async function GET() {
    await dbConnect();

    try {
        const transactions = await Transaction.find({}).sort({ createdAt: -1 });
        return responseSuccessfulWithData({
            message: "Transactions fetched successfully",
            body: transactions,
        });
    } catch (error) {
        console.error(error);
        return responseBadRequest("Error in fetching transactions");
    }
}
