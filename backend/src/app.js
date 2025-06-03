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

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

connectDB();

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/pages", pageRoutes);
app.use("/api/blocks", contentRoutes);
app.use("/api/permissions", permissionRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/invitations", invitationRoutes);

app.get("/", (req, res) => {
    res.json({ message: "API funcionando" });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Algo salió mal!' });
});

export default app; 