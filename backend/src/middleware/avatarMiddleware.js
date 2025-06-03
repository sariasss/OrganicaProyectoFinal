import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AVATARS_DIR = path.join(__dirname, '../../uploadsAvatar del usuario: ');

// Crear carpeta si no existe
if (!fs.existsSync(AVATARS_DIR)) {
    try {
        fs.mkdirSync(AVATARS_DIR, { recursive: true });
        console.log(`Carpeta de avatares creada: ${AVATARS_DIR}`);
    } catch (error) {
        console.error('Error al crear carpeta:', error);
    }
}

export const avatarStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('Multer destination:', AVATARS_DIR); // DEBUG
        cb(null, AVATARS_DIR);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = 'avatar-' + uniqueSuffix + path.extname(file.originalname);
        console.log('Multer filename generado:', filename); // DEBUG
        cb(null, filename);
    }
});

export const avatarUpload = multer({
    storage: avatarStorage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|webp|avif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Solo se permiten archivos de imagen'), false);
    },
    limits: {
        fileSize: 2 * 1024 * 1024
    }
});