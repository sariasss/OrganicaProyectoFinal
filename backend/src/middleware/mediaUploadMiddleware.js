import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // <-- Esto es el directorio de mediaUploadMiddleware.js

// Ruta absoluta donde Multer intentará guardar los archivos
const uploadsFolder = path.join(__dirname, '../../uploads/content_media'); // <-- Esta es la ruta crítica

// Crea la carpeta si no existe
if (!fs.existsSync(uploadsFolder)) {
    fs.mkdirSync(uploadsFolder, { recursive: true }); // <-- Esto asegura que la carpeta exista
}

const mediaStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsFolder); // Multer intentará guardar aquí
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const filename = 'media-' + uniqueSuffix + path.extname(file.originalname);
        cb(null, filename);
    }
});

const mediaFileFilter = (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|avif|mp4|webm|ogg/;
    const mimetype = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
        return cb(null, true);
    }

    cb(new Error('Solo se permiten imágenes o videos')); // <-- Este error sería capturado por Multer
};

export const mediaUpload = multer({
    storage: mediaStorage,
    fileFilter: mediaFileFilter, // <-- Aquí se aplica el filtro
    limits: {
        fileSize: 50 * 1024 * 1024 // Hasta 50MB <-- Aquí se aplica el límite de tamaño
    }
});