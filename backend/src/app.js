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
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173', // Tu servidor de desarrollo React
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

// Servir archivos estáticos para uploads (si tienes esta funcionalidad)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

connectDB();

// --- Rutas de la API (DEBEN IR ANTES de servir los archivos estáticos del frontend) ---
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/projects", projectRoutes);
app.use("/pages", pageRoutes);
app.use("/blocks", contentRoutes);
app.use("/permissions", permissionRoutes);
app.use("/search", searchRoutes);
app.use("/invitations", invitationRoutes);

// Puedes eliminar esta ruta de prueba si quieres, ya que el frontend se encargará de '/'
// app.get("/", (req, res) => {
//     res.json({ message: "API funcionando" });
// });

// --- ¡IMPORTANTE! Servir los archivos estáticos del Frontend de React ---
// 1. Define la ruta ABSOLUTA a tu carpeta `dist` de React.
//    Ajusta `../../frontend/dist` según la ubicación real de tu carpeta `dist`
//    relativa a tu archivo `app.js`.
//    Si `app.js` está en `backend/` y `dist` está en `frontend/dist`,
//    entonces `path.join(__dirname, '../../frontend/dist')` es correcto.
const REACT_BUILD_PATH = path.join(__dirname, '../../frontend/dist'); // <-- ¡AJUSTA ESTO!

// 2. Middleware para servir los archivos estáticos desde la carpeta de build de React
//    Esto sirve archivos como `index-tlYGdqV0.js`, `style.css`, imágenes, etc.
app.use(express.static(REACT_BUILD_PATH));

// 3. Ruta comodín (catch-all) para React Router
//    Esta ruta DEBE ser la ÚLTIMA en definirse, después de todas tus rutas de API
//    y después de `express.static`.
//    Captura cualquier solicitud que no haya coincidido con una ruta de API o un archivo estático,
//    y siempre devuelve el `index.html` de tu aplicación React.
app.get('*', (req, res) => {
    res.sendFile(path.join(REACT_BUILD_PATH, 'index.html'));
});

// Manejador de errores (deja esto al final)
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Algo salió mal!' });
});

export default app;