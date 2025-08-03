import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
    name: { type: String, required:true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    ridesData: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Ride' }],
},{minimize:false})

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;