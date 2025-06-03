import express from "express";
import cors from "cors";
import cookieParser from 'cookie-parser';
import connectDB from "./data/db.js";
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import pageRoutes from './routes/pageRoutes.js';
import contentRoutes from './routes/contentRoutes.js';
import permissionRoutes from './routes/permissionRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import invitationRoutes from './routes/invitationRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Conectar a la base de datos
connectDB();

// Servir archivos estáticos (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// RUTAS DE API - DEBEN IR ANTES DEL CATCH-ALL
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/projects", projectRoutes);
app.use("/pages", pageRoutes);
app.use("/blocks", contentRoutes);
app.use("/permissions", permissionRoutes);
app.use("/search", searchRoutes);
app.use("/invitations", invitationRoutes);

// Ruta de prueba de API
app.get("/api", (req, res) => {
    res.json({ message: "API funcionando" });
});

// Verificar si existe la carpeta dist antes de servir archivos estáticos
const distPath = path.join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
    // Servir archivos estáticos de la build de React
    app.use(express.static(distPath));
    
    // CATCH-ALL HANDLER para SPA - DEBE IR AL FINAL
    app.get('*', (req, res) => {
        // Solo para rutas que NO son de API
        if (!req.path.startsWith('/api') && !req.path.startsWith('/auth') && 
            !req.path.startsWith('/users') && !req.path.startsWith('/projects') &&
            !req.path.startsWith('/pages') && !req.path.startsWith('/blocks') &&
            !req.path.startsWith('/permissions') && !req.path.startsWith('/search') &&
            !req.path.startsWith('/invitations') && !req.path.startsWith('/uploads')) {
            res.sendFile(path.join(__dirname, 'dist/index.html'));
        } else {
            res.status(404).json({ message: 'Ruta de API no encontrada' });
        }
    });
} else {
    console.log('⚠️  Carpeta dist no encontrada. Ejecutando solo como API.');
    
    // Ruta por defecto cuando no hay frontend build
    app.get('/', (req, res) => {
        res.json({ 
            message: 'API Backend funcionando',
            endpoints: {
                auth: '/auth',
                users: '/users',
                projects: '/projects',
                pages: '/pages',
                blocks: '/blocks',
                permissions: '/permissions',
                search: '/search',
                invitations: '/invitations'
            }
        });
    });
    
    // Catch-all para rutas no encontradas
    app.get('*', (req, res) => {
        res.status(404).json({ message: 'Ruta no encontrada' });
    });
}

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Algo salió mal!' });
});

export default app;