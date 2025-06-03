import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { createBlock, deleteBlock, getBlock, updateBlock, uploadMedia } from '../controllers/contentController.js';
import { mediaUpload } from '../middleware/mediaUploadMiddleware.js';

const router = express.Router();

router.use(authMiddleware);

router.post('/', createBlock);
router.get('/:id', getBlock);
router.patch('/:id', updateBlock);
router.delete('/:id', deleteBlock);
router.post('/upload-media', mediaUpload.single('file'), uploadMedia);

export default router;