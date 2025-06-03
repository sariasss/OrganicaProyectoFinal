import express from 'express';
import { checkAuth, deleteUser, googleLogin, login, logout, register } from '../controllers/authController.js';
import authMiddleware from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', login);
router.post('/register', register);
router.post('/logout', logout);
router.get('/check', authMiddleware, checkAuth);
router.delete('/delete', deleteUser);
router.post("/google-login", googleLogin);


export default router;