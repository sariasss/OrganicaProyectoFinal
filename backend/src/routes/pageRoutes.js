import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { createPage, getPage, updatePage, deletePage } from '../controllers/pageController.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', createPage);
router.get('/:id', getPage);
router.patch('/:id', updatePage);
router.delete('/:id', deletePage);

export default router;