import mongoose from "mongoose";

const pageSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    title: { type: String, required: true },
    creationDate: { type: Date, default: Date.now},
    order: { type: Number, required: true }
});

export default mongoose.model("Page", pageSchema);
