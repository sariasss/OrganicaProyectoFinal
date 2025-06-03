import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { createPermission, getProjectPermissions, deletePermission, updatePermission } from '../controllers/permissionController.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', createPermission);
router.get('/:projectId', getProjectPermissions);
router.patch('/:id', updatePermission); // <- NUEVO
router.delete('/:id', deletePermission);

export default router; 