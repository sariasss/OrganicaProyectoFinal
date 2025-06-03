import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String },
    coverImage: { type: String, default: null },
}, { timestamps: true });

export default mongoose.model("Project", projectSchema);
