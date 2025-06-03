import mongoose from 'mongoose';

const invitationSchema = new mongoose.Schema({
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    recipientEmail: { type: String, required: true },
    inviter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rol: { type: String, enum: ['viewer', 'editor', 'admin'], default: 'viewer' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, { timestamps: true });

invitationSchema.index({ recipientEmail: 1, projectId: 1, status: 1 });

invitationSchema.index({ projectId: 1, recipientEmail: 1, status: 1 }, { unique: true });

const Invitation = mongoose.model('Invitation', invitationSchema);

export default Invitation;