import mongoose from 'mongoose';

const ridesSchema = new mongoose.Schema({
    title: { type: String, required:true },
    from: { type: String, required:true },
    to: { type: String, required: true },
    date: {type: Date, required: true },
    duration: { type: String, required: true },
    description: {type: String, required: true},
    contact: {type:String, required: true},
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    riders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
},{minimize:false})

const ridesModel = mongoose.models.rides || mongoose.model("rides", ridesSchema);

export default ridesModel;