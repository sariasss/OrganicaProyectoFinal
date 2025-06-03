import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename); // Esto será /app/src/middleware dentro del contenedor


const uploadsFolder = path.join(__dirname, '../../uploads/img');

if (!fs.existsSync(uploadsFolder)) {
    try {
        fs.mkdirSync(uploadsFolder, { recursive: true });
        console.log(`Carpeta creada exitosamente: ${uploadsFolder}`);
    } catch (error) {
        console.error('Error al crear la carpeta:', error);
    }
}

export const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('Intentando guardar en:', uploadsFolder);
        try {
            fs.accessSync(uploadsFolder, fs.constants.W_OK);
            console.log('Tenemos permisos de escritura');
            cb(null, uploadsFolder);
        } catch (error) {
            console.error('Error de permisos:', error);
            cb(error);
        }
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = 'project-' + uniqueSuffix + path.extname(file.originalname);
        console.log('Generando nombre de archivo:', filename);
        cb(null, filename);
    }
});

export const imageUpload = multer({
    storage: imageStorage,
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|gif|webp|avif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Solo se permiten imágenes (jpeg, jpg, png, gif, webp, avif)'), false);
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB límite
    }
});