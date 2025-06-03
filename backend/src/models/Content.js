import mongoose from "mongoose";

const blockSchema = new mongoose.Schema({
    pageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Page', required: true },
    type: { type: String, required: true, enum: ['text', 'image', 'video', 'code', 'link']},
    content: { type: mongoose.Schema.Types.Mixed, required: true },
    order: { type: Number, required: true }
});

export default mongoose.model("Block", blockSchema);
