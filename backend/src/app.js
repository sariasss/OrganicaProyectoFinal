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

// Servir archivos estáticos de la build de React
app.use(express.static('dist'));

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

// CATCH-ALL HANDLER - DEBE IR AL FINAL
// Solo para rutas que NO son de API
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/index.html'));
});

// Middleware de manejo de errores
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Algo salió mal!' });
});

export default app;