import Invitation from '../models/Invitation.js';
import Project from '../models/Project.js';
import Permission from '../models/Permission.js';
import User from '../models/User.js';

const createInvitation = async (req, res) => {
    try {
        const { email, projectId, rol } = req.body;
        console.log("Email recibido en el backend para invitar:", email);
        console.log("ProjectId:", projectId);
        console.log("Rol:", rol);
        console.log("Usuario autenticado:", req.user || req.userId);

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Proyecto no encontrado.' });
        }

        const recipientUser = await User.findOne({ email: email });
        if (!recipientUser) {
            return res.status(404).json({ message: 'El usuario con ese correo electrónico no fue encontrado.' });
        }

        const inviterId = req.userId || req.user?._id;
        if (!inviterId) {
            return res.status(401).json({ message: 'Usuario no autenticado o ID de invitador no disponible.' });
        }

        const existingInvitation = await Invitation.findOne({
            projectId: projectId,
            recipientEmail: email, // Usar recipientEmail como está en el schema
            status: 'pending'
        });
        if (existingInvitation) {
            return res.status(400).json({ message: 'Ya existe una invitación pendiente para este usuario en este proyecto.' });
        }

        const existingPermission = await Permission.findOne({
            projectId: projectId,
            userId: recipientUser._id
        });
        if (existingPermission) {
            return res.status(400).json({ message: 'El usuario ya es miembro de este proyecto.' });
        }

        const newInvitation = new Invitation({
            projectId,
            recipientEmail: email,
            inviter: inviterId,
            rol,
            status: 'pending'
        });

        await newInvitation.save();

        const populatedInvitation = await Invitation.findById(newInvitation._id)
            .populate('inviter', 'username email');

        res.status(201).json(populatedInvitation);
    } catch (error) {
        console.error("Error al crear invitación en el backend:", error);
        console.error("Stack completo:", error.stack);
        res.status(500).json({
            message: error.message || 'Error interno del servidor al crear la invitación.',
            error: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
const getInvitations = async (req, res) => {
    try {
        const { projectId, email } = req.query; // Extract query parameters

        let query = {};
        if (projectId) {
            query.projectId = projectId;
        }
        if (email) {
            query.recipientEmail = email; // Or recipientUser if you store user IDs
        }

        const invitations = await Invitation.find(query)
            .populate('inviter', 'username email') // If you want inviter details
            .select('-__v');

        res.status(200).json(invitations);
    } catch (error) {
        console.error("Error fetching invitations in backend:", error);
        res.status(500).json({ message: error.message || 'Error interno del servidor al obtener invitaciones' });
    }
};

const deleteInvitation = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.userId;

        const invitation = await Invitation.findById(id);
        if (!invitation) {
            return res.status(404).json({ message: 'Invitación no encontrada.' });
        }

        const project = await Project.findById(invitation.projectId);
        if (!project) {
            return res.status(404).json({ message: 'Proyecto asociado a la invitación no encontrado.' });
        }

        await Invitation.findByIdAndDelete(id);

        res.status(200).json({ message: 'Invitación eliminada correctamente.' });

    } catch (error) {
        console.error("Error al eliminar invitación:", error);
        res.status(500).json({ message: error.message || 'Error interno del servidor al eliminar la invitación.' });
    }
};
export { createInvitation, getInvitations, deleteInvitation };  