import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { createProject, getProjects, getProject, updateProject, deleteProject } from '../controllers/projectController.js';
import { imageUpload } from '../middleware/imageMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', imageUpload.single('coverImage'), createProject);
router.get('/', getProjects);
router.get('/:id', getProject);
router.patch('/:id', imageUpload.single('coverImage'), updateProject);
router.delete('/:id', deleteProject);

export default router; 