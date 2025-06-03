import Page from '../models/Pages.js';
import Block from '../models/Content.js';
import Permission from '../models/Permission.js';
import Project from '../models/Project.js';

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

        const page = new Page({ projectId, title, order: initialOrder }); // Assign initial order

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
        const page = await Page.findById(req.params.id);
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
    try {
        const page = await Page.findById(req.params.id);
        if (!page) {
            return res.status(404).json({ message: 'Página no encontrada' });
        }

        const permission = await Permission.findOne({
            projectId: page.projectId,
            userId: req.userId,
            rol: { $in: ['owner', 'editor'] }
        });

        if (!permission) {
            return res.status(403).json({ message: 'No tienes permisos para editar esta página' });
        }

        if (req.body.title !== undefined) { // Use !== undefined to allow empty string
            page.title = req.body.title;
        }

        if (req.body.order !== undefined) {
            const oldOrder = page.order;
            const newOrder = req.body.order;

            if (oldOrder !== newOrder) {
                if (newOrder > oldOrder) {
                    await Page.updateMany(
                        {
                            projectId: page.projectId,
                            order: { $gt: oldOrder, $lte: newOrder }
                        },
                        { $inc: { order: -1 } }
                    );
                } else {
                    await Page.updateMany(
                        {
                            projectId: page.projectId, 
                            order: { $gte: newOrder, $lt: oldOrder }
                        },
                        { $inc: { order: 1 } }
                    );
                }
                page.order = newOrder;
            }
        }
        await page.save();

        res.json({
            message: 'Página actualizada correctamente',
            page
        });
    } catch (error) {
        console.error('Error al actualizar la página:', error);
        res.status(500).json({ message: 'Error al actualizar la página' });
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
            rol: { $in: ['owner', 'editor'] }
        });

        if (!permission) {
            return res.status(403).json({ message: 'No tienes permisos para eliminar esta página' });
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