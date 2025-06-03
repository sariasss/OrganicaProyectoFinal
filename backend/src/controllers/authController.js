import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    if (user.provider === 'google') {
      return res.status(401).json({
        message: "Este usuario fue registrado con Google. Usa 'Continuar con Google'."
      });
    }

    const passwordValid = await bcrypt.compare(password, user.password);
    if (!passwordValid) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 3600000,
      sameSite: "strict"
    });

    res.json({ message: "Inicio de sesión exitoso", user });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Error en el inicio de sesión" });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { email, googleId } = req.body;

    const user = await User.findOne({ email, googleId });

    if (!user) {
      return res.status(401).json({ message: "No se encontró un usuario con Google" });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "1h" });

    res.cookie("token", token, {
      httpOnly: true,
      secure: false,
      maxAge: 3600000,
      sameSite: "strict"
    });

    res.json({ message: "Inicio de sesión con Google exitoso", user });
  } catch (err) {
    console.error("Error en login con Google:", err);
    res.status(500).json({ message: "Error en login con Google" });
  }
};


const register = async (req, res) => {
    const { username, email, password, provider, googleId } = req.body;

    if (!username || !email) {
        return res.status(400).json({
            success: false,
            message: "Username y email son requeridos"
        });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
    return res.status(400).json({ message: 'El nombre de usuario o email ya está en uso.' });
    }
    const user = new User({
            username,
            email,
            password: password || undefined,
            provider: provider || 'local',
            googleId: googleId || undefined,
            avatar:process.env.AVATAR_API + encodeURIComponent(username),
        });

    await user.save();
    res.status(201).json({ message:'Registro exitoso.' });
};

const logout = async (req, res) => {
    res.cookie('token','',{
        httpOnly: true,
        secure: false,
        maxAge: 0, // caducar la cookie inmediatamente
    });
    res.json({ message:'Sesión cerrada con existo.' });
};

const checkAuth = async (req, res) => {
    try {
        const token = req.cookies.token;
        
        if (!token) {
            return res.status(401).json({ message: 'No autorizado. Token no proporcionado.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ message: 'No autorizado. Usuario no encontrado.' });
        }

        res.status(200).json({ message: 'Usuario autenticado', user });
    } catch (error) {
        res.status(401).json({ message: 'Token inválido o expirado.' });
    }
};

const deleteUser = async (req, res) => {
    try {
        const userId = req.userId;
        const user = await User.findByIdAndDelete(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.status(200).json({ message: 'Usuario eliminado con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al eliminar el usuario', error });
    }
}

export { login, googleLogin, register, logout, checkAuth, deleteUser };