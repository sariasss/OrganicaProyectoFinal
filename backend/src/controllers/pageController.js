import Page from '../models/Pages.js'; // Asegúrate que la importación sea correcta (Pages.js o Page.js)
import Block from '../models/Content.js';
import Permission from '../models/Permission.js';
import Project from '../models/Project.js';
import User from '../models/User.js'; // Necesitas importar tu modelo de usuario para poblar el 'username'

const createPage = async (req, res) => {
    try {
        const { projectId, title } = req.body;
        const permission = await Permission.findOne({
            projectId,
            userId: req.userId,
            rol: { $in: ['owner', 'editor'] }
        });

        if (!permission) {
            return res.status(403).json({ message: 'No tienes permisos para crear páginas en este proyecto' });
        }

        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }

        const lastPage = await Page.findOne({ projectId }).sort('-order');
        const initialOrder = lastPage ? lastPage.order + 1 : 0;

        const page = new Page({ projectId, title, order: initialOrder });

        await page.save();

        res.status(201).json({
            message: 'Página creada correctamente',
            page
        });
    } catch (error) {
        console.error('Error al crear la página:', error);
        res.status(500).json({ message: 'Error al crear la página' });
    }
};

const getPage = async (req, res) => {
    try {
        // Modificado: Popular 'editingUser' para obtener su username
        const page = await Page.findById(req.params.id)
                               .populate('editingUser', 'username'); // Importante para ver quién la edita

        if (!page) {
            return res.status(404).json({ message: 'Página no encontrada' });
        }

        const permission = await Permission.findOne({
            projectId: page.projectId,
            userId: req.userId
        });

        if (!permission) {
            return res.status(403).json({ message: 'No tienes permisos para ver esta página' });
        }

        const blocks = await Block.find({ pageId: page._id }).sort('order');

        res.json({
            page,
            blocks
        });
    } catch (error) {
        console.error('Error al obtener la página:', error);
        res.status(500).json({ message: 'Error al obtener la página' });
    }
};

const updatePage = async (req, res) => {
    const { id } = req.params;
    // Extraemos los campos de bloqueo del cuerpo de la solicitud
    const { isEditing, editingUser, editingStartedAt, ...updateData } = req.body;

    try {
        // Necesitamos poblar 'editingUser' para la lógica de bloqueo
        let page = await Page.findById(id).populate('editingUser', 'username');

        if (!page) {
            return res.status(404).json({ message: 'Página no encontrada' });
        }

        // --- Verificación de Permisos de Edición General ---
        const permission = await Permission.findOne({
            projectId: page.projectId,
            userId: req.userId,
            rol: { $in: ['owner', 'editor'] }
        });

        if (!permission) {
            return res.status(403).json({ message: 'No tienes permisos para editar esta página.' });
        }

        // --- Lógica de Bloqueo/Desbloqueo (PRIORIDAD AL PRINCIPIO) ---
        // Solo ejecutamos esta lógica si el frontend está intentando manipular el estado de bloqueo
        if (isEditing !== undefined) {
            const STALE_LOCK_THRESHOLD_MS = 30 * 60 * 1000; // 30 minutos en milisegundos
            const currentTime = new Date();

            if (isEditing === true) { // Intento de BLOQUEAR la página
                // Si la página ya está bloqueada por alguien más
                if (page.isEditing && String(page.editingUser?._id || page.editingUser) !== String(editingUser)) {
                    // Si el bloqueo existente es obsoleto
                    if (page.editingStartedAt && (currentTime.getTime() - page.editingStartedAt.getTime() > STALE_LOCK_THRESHOLD_MS)) {
                        console.log(`Bloqueo obsoleto detectado para la página ${id}. Limpiando bloqueo antiguo.`);
                        // Limpiamos el bloqueo obsoleto y el usuario actual puede adquirirlo
                        page.isEditing = false;
                        page.editingUser = null;
                        page.editingStartedAt = null;
                        // No guardamos aquí, el save final lo hará
                    } else {
                        // La página está activamente bloqueada por otro usuario
                        return res.status(409).json({ // 409 Conflict
                            message: `Esta página ya está siendo editada por ${page.editingUser ? page.editingUser.username : 'otro usuario'}.`,
                            isLocked: true,
                            editingUser: page.editingUser ? page.editingUser.username : 'otro usuario'
                        });
                    }
                }
                // Adquirir el bloqueo para el usuario actual
                page.isEditing = true;
                page.editingUser = editingUser; // El userId que llega del frontend
                page.editingStartedAt = currentTime;
            } else if (isEditing === false) { // Intento de DESBLOQUEAR la página
                // Solo permitimos desbloquear si la página está bloqueada por el usuario actual o si no está bloqueada
                if (page.isEditing && String(page.editingUser?._id || page.editingUser) !== String(editingUser)) {
                    return res.status(403).json({ message: 'No tienes permiso para desbloquear esta página.' });
                }
                // Liberar el bloqueo
                page.isEditing = false;
                page.editingUser = null;
                page.editingStartedAt = null;
            }
        }
        // --- Fin de la Lógica de Bloqueo/Desbloqueo ---

        // Aplicar el resto de las actualizaciones de datos de la página (título, orden, etc.)
        // Solo actualizamos el título si está en updateData y no es una operación de solo bloqueo
        if (updateData.title !== undefined) {
            page.title = updateData.title;
        }

        // Lógica de actualización de orden, tal como la tenías
        if (updateData.order !== undefined) {
            const oldOrder = page.order;
            const newOrder = updateData.order;

            if (oldOrder !== newOrder) {
                if (newOrder > oldOrder) {
                    await Page.updateMany(
                        {
                            projectId: page.projectId,
                            order: { $gt: oldOrder, $lte: newOrder },
                            _id: { $ne: page._id } // Excluir la página actual de la actualización de orden de los demás
                        },
                        { $inc: { order: -1 } }
                    );
                } else {
                    await Page.updateMany(
                        {
                            projectId: page.projectId,
                            order: { $gte: newOrder, $lt: oldOrder },
                            _id: { $ne: page._id } // Excluir la página actual
                        },
                        { $inc: { order: 1 } }
                    );
                }
                page.order = newOrder;
            }
        }

        await page.save();

        // Volvemos a poblar 'editingUser' en la respuesta por si el estado de bloqueo cambió
        // y necesitamos enviar el nombre de usuario actualizado al frontend.
        page = await Page.findById(id).populate('editingUser', 'username');

        res.status(200).json({
            message: 'Página actualizada correctamente',
            page
        });
    } catch (error) {
        console.error('Error al actualizar la página:', error);
        res.status(500).json({ message: 'Error al actualizar la página', error: error.message });
    }
};


const deletePage = async (req, res) => {
    try {
        const page = await Page.findById(req.params.id);
        if (!page) {
            return res.status(404).json({ message: 'Página no encontrada' });
        }

        const permission = await Permission.findOne({
            projectId: page.projectId,
            userId: req.userId,
            rol: { $in: ['owner', 'editor'] } // Asumo que editor también puede eliminar. Si solo owner, cambia a 'owner'
        });

        if (!permission || (permission.rol !== 'owner' && permission.rol !== 'editor')) { // Solo owner/editor pueden eliminar
            return res.status(403).json({ message: 'No tienes permisos suficientes para eliminar esta página' });
        }

        // Modificado: No permitir eliminar si está bloqueada por otro usuario
        if (page.isEditing && String(page.editingUser) !== String(req.userId)) {
             // Opcional: Popular para dar el nombre
             const lockingUser = await User.findById(page.editingUser);
             return res.status(409).json({
                 message: `Esta página está actualmente siendo editada por ${lockingUser ? lockingUser.username : 'otro usuario'}. No se puede eliminar.`,
                 isLocked: true,
                 editingUser: lockingUser ? lockingUser.username : 'otro usuario'
             });
        }


        await Block.deleteMany({ pageId: page._id });

        await page.deleteOne();

        res.json({ message: 'Página eliminada correctamente' });
    } catch (error) {
        console.error('Error al eliminar la página:', error);
        res.status(500).json({ message: 'Error al eliminar la página' });
    }
};

export { createPage, getPage, updatePage, deletePage };