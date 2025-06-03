import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { avatarUpload } from '../middleware/avatarMiddleware.js';
import { getUserProfile, updateUser, getUserById } from '../controllers/userController.js';

const router = express.Router();

router.get('/me', authMiddleware, getUserProfile);
router.patch('/:id', authMiddleware, avatarUpload.single('avatar'), updateUser);
router.get('/:id', getUserById);
export default router;