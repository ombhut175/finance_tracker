import mongoose, {Schema, Document, Types} from 'mongoose';


export interface BudgetInterface extends Document{
    _id: Types.ObjectId
    category: string
    amount: number
    month: string
}


const BudgetSchema: Schema<BudgetInterface> = new mongoose.Schema({
    amount: {type: Number, required: true},
    category: {type: String, required: true},
    month: {type: String, required: true},
});

const BudgetModel =
    (mongoose.models.Budgets as mongoose.Model<BudgetInterface>) ||
    mongoose.model<BudgetInterface>('Budgets', BudgetSchema);

export default BudgetModel;
