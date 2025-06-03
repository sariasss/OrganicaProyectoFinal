import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rol: { type: String, enum: ['owner', 'editor', 'viewer'], required: true }
});

export default mongoose.model("Permission", permissionSchema);