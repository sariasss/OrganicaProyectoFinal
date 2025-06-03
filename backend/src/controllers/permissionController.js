import Permission from '../models/Permission.js';
import Project from '../models/Project.js';
import User from '../models/User.js';

export const createPermission = async (req, res) => {
    try {
        const { projectId, rol } = req.body; // Ya no necesitamos userId del body

        const userId = req.userId; // <--- ¡Aquí está el cambio clave!

        if (!userId) {
            return res.status(401).json({ message: 'Usuario no autenticado o ID de usuario no disponible.' });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Usuario asociado al token no encontrado en la base de datos.' });
        }

        const existingPermission = await Permission.findOne({ projectId: projectId, userId: userId });
        if (existingPermission) {
            return res.status(400).json({ message: 'El usuario ya tiene permisos en este proyecto' });
        }

        const permission = new Permission({
            projectId: projectId,
            userId: userId,
            rol: rol, 
        });

        await permission.save();
        res.status(201).json(permission);
    } catch (error) {
        console.error("Error en createPermission:", error);
        res.status(500).json({ message: error.message || 'Error interno del servidor.' });
    }
};

export const getProjectPermissions = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }

        const permissions = await Permission.find({ projectId: projectId })
            .populate('userId', 'username')
            .select('-__v');

        res.json(permissions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const deletePermission = async (req, res) => {
    try {
        const { id } = req.params;

        const permission = await Permission.findById(id);
        if (!permission) {
            return res.status(404).json({ message: 'Permiso no encontrado' });
        }

        await permission.deleteOne();
        res.json({ message: 'Permiso eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 

export const updatePermission = async (req, res) => {
    try {
        const { id } = req.params;
        const { rol } = req.body;

        if (!rol) {
            return res.status(400).json({ message: 'El rol es requerido' });
        }

        const permission = await Permission.findById(id);
        if (!permission) {
            return res.status(404).json({ message: 'Permiso no encontrado' });
        }

        permission.rol = rol;
        await permission.save();

        res.status(200).json({ message: 'Permiso actualizado correctamente', permission });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
