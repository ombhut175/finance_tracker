import {dbConnect} from "@/lib/dbConnect";
import Transaction from "@/model/Transaction";
import {responseBadRequest, responseSuccessfulForPost} from "@/helpers/responseHelpers";

export async function POST(request: Request){
    await dbConnect();

    console.log("::: add transaction :::");
    try {
        const body = await request.json();

        console.log(body);
        const transaction = new Transaction(body);

        await transaction.save();
        return responseSuccessfulForPost("Transaction added successfully");
    }catch (error) {
        console.error(error);
        return responseBadRequest("Error in adding transaction");
    }
}