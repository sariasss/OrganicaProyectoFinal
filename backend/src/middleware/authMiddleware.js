import jwt from "jsonwebtoken";
// middleware para verificar el token 

const authMiddleware = async (req, res, next) => {
    try {
        const token = req.cookies.token;
        if(!token){
            return res.status(401).json({ mensaje: 'No se proporcionó token' });
        }
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        // Asignar user como objeto con id para compatibilidad con controladores
        req.userId = verified.id;
        next();
    } catch (error) {
        res.status(400).json({ mensaje: "Token no válido o expirado" });
    }
}

export default authMiddleware;