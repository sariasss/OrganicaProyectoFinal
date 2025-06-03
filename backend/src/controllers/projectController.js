import Project from '../models/Project.js';
import Page from '../models/Pages.js';
import Block from '../models/Content.js';
import Permission from '../models/Permission.js';
import { imageUpload } from '../middleware/imageMiddleware.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const createProject = async (req, res) => {
    try {
        const { title, description } = req.body;

        const project = new Project({
            userId: req.userId,
            title,
            description,
            coverImage: req.file ? req.file.filename : null
        });

        await project.save();

        const permission = new Permission({
            projectId: project._id,
            userId: req.userId,
            rol: 'owner'
        });

        await permission.save();

        res.status(201).json({
            success: true,
            message: 'Proyecto creado correctamente',
            project
        });
    } catch (error) {
        console.error('Error al crear el proyecto:', error);
        res.status(500).json({
            success: false,
            message: 'Error al crear el proyecto',
            error: error.message
        });
    }
};


const getProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id)
            .populate('userId', 'username');

        if (!project) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }

        const allProjectPermissions = await Permission.find({ projectId: project._id })
                                                    .populate('userId'); 

        const pages = await Page.find({ projectId: project._id });

        const pagesWithBlocks = await Promise.all(pages.map(async (page) => {
            const blocks = await Block.find({ pageId: page._id }).sort('order');
            return {
                ...page.toObject(),
                blocks
            };
        }));

        res.json({
            project: {
                ...project.toObject(),
                permissions: allProjectPermissions.map(p => ({
                    userId: p.userId._id.toString(),
                    rol: p.rol
                }))
            },
            pages: pagesWithBlocks
        });

    } catch (error) {
        console.error('Error al obtener el proyecto:', error);
        res.status(500).json({ message: 'Error al obtener el proyecto' });
    }
};

const updateProject = async (req, res) => {
    try {
        const permission = await Permission.findOne({
            projectId: req.params.id,
            userId: req.userId,
            rol: { $in: ['owner', 'editor'] }
        });

        if (!permission) {
            return res.status(403).json({ message: 'No tienes permisos para editar este proyecto' });
        }

        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }

        if (req.body.title) project.title = req.body.title;
        if (req.body.description) project.description = req.body.description;
        if (req.file) {
            if (project.coverImage) {
                const oldImagePath = path.join(__dirname, '../uploads/img', project.coverImage);
                if (fs.existsSync(oldImagePath)) {
                    fs.unlinkSync(oldImagePath);
                }
            }
            project.coverImage = req.file.filename;
        }

        await project.save();
        res.json({
            message: 'Proyecto actualizado correctamente',
            project
        });
    } catch (error) {
        console.error('Error al actualizar el proyecto:', error);
        res.status(500).json({ message: 'Error al actualizar el proyecto' });
    }
};

const deleteProject = async (req, res) => {
    try {
        const permission = await Permission.findOne({
            projectId: req.params.id,
            userId: req.userId,
            rol: 'owner'
        });

        if (!permission) {
            return res.status(403).json({ message: 'No tienes permisos para eliminar este proyecto' });
        }

        const project = await Project.findById(req.params.id);
        if (!project) {
            return res.status(404).json({ message: 'Proyecto no encontrado' });
        }

        const pages = await Page.find({ projectId: project._id });
        const pageIds = pages.map(page => page._id);

        await Block.deleteMany({ pageId: { $in: pageIds } });
        await Page.deleteMany({ projectId: project._id });
        await Permission.deleteMany({ projectId: project._id });

        if (project.coverImage) {
            const imagePath = path.join(__dirname, '../uploads/img', project.coverImage);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        await project.deleteOne();
        res.json({ message: 'Proyecto eliminado correctamente' });
    } catch (error) {
        console.error('Error al eliminar el proyecto:', error);
        res.status(500).json({ message: 'Error al eliminar el proyecto' });
    }
};

const getProjects = async (req, res) => {
    try {
        const userPermissions = await Permission.find({ userId: req.userId });

        const projectIds = userPermissions.map(permission => permission.projectId);

        const projects = await Project.find({
            $or: [
                { userId: req.userId }, // Projects created by the user
                { _id: { $in: projectIds } } // Projects where the user has permissions
            ]
        })
        .sort('-createdAt');

        res.json({
            success: true,
            projects
        });
    } catch (error) {
        console.error('Error al obtener los proyectos:', error);
        res.status(500).json({
            success: false,
            message: 'Error al obtener los proyectos',
            error: error.message
        });
    }
};

export { createProject, getProjects, getProject, updateProject, deleteProject };