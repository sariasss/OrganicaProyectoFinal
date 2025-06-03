import Block from '../models/Content.js';
import Page from '../models/Pages.js';
import Permission from '../models/Permission.js';

// Crear un nuevo bloque
const createBlock = async (req, res) => {
    try {
        const { pageId, type, content, order } = req.body;
        let finalContent = content; // This will be '' or 'placeholder_name' for images initially

        const page = await Page.findById(pageId);
        if (!page) {
            return res.status(404).json({ message: 'Página no encontrada' });
        }

        const permission = await Permission.findOne({
            projectId: page.projectId,
            userId: req.userId,
            rol: { $in: ['owner', 'editor'] }
        });

        if (!permission) {
            return res.status(403).json({ message: 'No tienes permisos para crear bloques en esta página' });
        }

        let finalOrder = order;
        if (finalOrder === undefined || finalOrder === null) {
            const lastBlock = await Block.findOne({ pageId }).sort('-order');
            finalOrder = lastBlock ? lastBlock.order + 1 : 0;
        }

        const block = new Block({
            pageId,
            type,
            content: finalContent, // Will be empty or placeholder for new images
            order: finalOrder
        });

        await block.save();

        res.status(201).json({
            message: 'Bloque creado correctamente',
            block
        });
    } catch (error) {
        console.error('Error al crear el bloque:', error);
        res.status(500).json({ message: 'Error al crear el bloque' });
    }
};

const getBlock = async (req, res) => {
    try {
        const block = await Block.findById(req.params.id);
        if (!block) {
            return res.status(404).json({ message: 'Bloque no encontrado' });
        }

        const page = await Page.findById(block.pageId);
        if (!page) {
            return res.status(404).json({ message: 'Página no encontrada' });
        }

        const permission = await Permission.findOne({
            projectId: page.projectId,
            userId: req.userId
        });

        if (!permission) {
            return res.status(403).json({ message: 'No tienes permisos para ver este bloque' });
        }

        res.json(block);
    } catch (error) {
        console.error('Error al obtener el bloque:', error);
        res.status(500).json({ message: 'Error al obtener el bloque' });
    }
};

const updateBlock = async (req, res) => {
    try {
        console.log('[updateBlock] ID del bloque:', req.params.id);
        console.log('[updateBlock] Cuerpo de la solicitud (req.body):', req.body);
        console.log('[updateBlock] Archivo recibido (req.file):', req.file);

        const block = await Block.findById(req.params.id);
        if (!block) {
            return res.status(404).json({ message: 'Bloque no encontrado' });
        }
        console.log('[updateBlock] Bloque encontrado:', block);

        const page = await Page.findById(block.pageId);
        if (!page) {
            return res.status(404).json({ message: 'Página no encontrada' });
        }

        const permission = await Permission.findOne({
            projectId: page.projectId,
            userId: req.userId,
            rol: { $in: ['owner', 'editor'] }
        });

        if (!permission) {
            return res.status(403).json({ message: 'No tienes permisos para editar este bloque' });
        }

        if (block.type === 'image' && req.file) {
            console.log('[updateBlock] Se ha recibido un nuevo archivo de imagen');

            if (block.content) {
                const oldImagePath = path.join(uploadsFolder, block.content);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                    console.log('[updateBlock] Imagen anterior eliminada:', block.content);
                }
            }

            block.content = req.file.filename;
            console.log('[updateBlock] Nuevo contenido de imagen:', block.content);
        }

        if (req.body.content !== undefined) {
            block.content = req.body.content;
            console.log('[updateBlock] Contenido actualizado:', block.content);
        }

        if (req.body.order !== undefined) {
            const oldOrder = block.order;
            const newOrder = parseInt(req.body.order, 10);

            if (!isNaN(newOrder) && oldOrder !== newOrder) {
                console.log(`[updateBlock] Cambiando orden de ${oldOrder} a ${newOrder}`);

                if (newOrder > oldOrder) {
                    await Block.updateMany(
                        {
                            pageId: block.pageId,
                            order: { $gt: oldOrder, $lte: newOrder }
                        },
                        { $inc: { order: -1 } }
                    );
                } else {
                    await Block.updateMany(
                        {
                            pageId: block.pageId,
                            order: { $gte: newOrder, $lt: oldOrder }
                        },
                        { $inc: { order: 1 } }
                    );
                }

                block.order = newOrder;
            }
        }

        console.log('[updateBlock] Guardando bloque...');
        await block.save();

        res.json({
            message: 'Bloque actualizado correctamente',
            block
        });
    } catch (error) {
        console.error('[updateBlock ERROR] Error al actualizar el bloque:', error);
        res.status(500).json({ message: 'Error al actualizar el bloque' });
    }
};


const deleteBlock = async (req, res) => {
    try {
        const block = await Block.findById(req.params.id);
        if (!block) {
            return res.status(404).json({ message: 'Bloque no encontrado' });
        }

        const page = await Page.findById(block.pageId);
        if (!page) {
            return res.status(404).json({ message: 'Página no encontrada' });
        }

        const permission = await Permission.findOne({
            projectId: page.projectId,
            userId: req.userId,
            rol: { $in: ['owner', 'editor'] }
        });

        if (!permission) {
            return res.status(403).json({ message: 'No tienes permisos para eliminar este bloque' });
        }


        if (block.type === 'image' && block.content) {
            const imagePath = path.join(__dirname, '../uploads/content_images', block.content); // Adjust path
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await Block.updateMany(
            {
                pageId: block.pageId,
                order: { $gt: block.order }
            },
            { $inc: { order: -1 } }
        );

        await block.deleteOne();

        res.json({ message: 'Bloque eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar el bloque:', error);
        res.status(500).json({ message: 'Error al eliminar el bloque' });
    }
};

const uploadMedia = async (req, res) => {
    try {
        if (!req.file) { // <-- Si Multer no procesa el archivo, req.file será undefined
            return res.status(400).json({
                success: false,
                message: 'No se proporcionó ningún archivo'
            });
        }

        res.status(200).json({
            success: true,
            filename: req.file.filename,
            url: `/blocks/uploads/content_media/${req.file.filename}` // Esta URL no la usa el frontend
        });
    } catch (error) {
        console.error('Error al subir archivo:', error); // Este catch solo atrapa errores en tu función uploadMedia
        res.status(500).json({
            success: false,
            message: 'Error al subir archivo'
        });
    }
};

export { createBlock, getBlock, updateBlock, deleteBlock, uploadMedia}; 