import mongoose, {Schema, Document, Types} from 'mongoose';


export interface TransactionInterface extends Document{
    _id: Types.ObjectId
    amount: number
    date: string
    description: string
    category: string
}


const TransactionSchema: Schema<TransactionInterface> = new mongoose.Schema({
    amount: {type: Number, required: true},
    date: {type: String, required: true},
    description: {type: String, required: true},
    category: {type: String, required: true},
});

const TransactionModel =
    (mongoose.models.MatrimonyUsers as mongoose.Model<TransactionInterface>) ||
    mongoose.model<TransactionInterface>('Transactions', TransactionSchema);

export default TransactionModel;
