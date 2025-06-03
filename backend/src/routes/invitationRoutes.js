import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { createInvitation, deleteInvitation, getInvitations } from '../controllers/invitationController.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', createInvitation);
router.get('/', getInvitations);
router.delete('/:id', deleteInvitation);

export default router; 