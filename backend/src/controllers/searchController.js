import Project from '../models/Project.js';
import Page from '../models/Pages.js';
import Block from '../models/Content.js';
import Permission from '../models/Permission.js';

export const searchContent = async (req, res) => {
    try {
        const { query } = req.query;
        const userId = req.userId;

        if (!query) {
            return res.status(400).json({ message: 'Se requiere un término de búsqueda' });
        }

        const userPermissions = await Permission.find({ userId });
        const projectIds = userPermissions.map(p => p.projectId);

        const projects = await Project.find({
            _id: { $in: projectIds },
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } }
            ]
        }).select('title description createdAt');

        const pages = await Page.find({
            projectId: { $in: projectIds },
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { content: { $regex: query, $options: 'i' } }
            ]
        }).select('title content projectId createdAt');

        const blocks = await Block.find({
            pageId: { $in: pages.map(p => p._id) },
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { content: { $regex: query, $options: 'i' } }
            ]
        }).select('title content pageId createdAt');

        res.json({
            projects,
            pages,
            blocks
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}; 