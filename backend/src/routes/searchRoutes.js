import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { searchContent } from '../controllers/searchController.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', searchContent);

export default router; 