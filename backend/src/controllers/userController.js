import User from '../models/User.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const AVATARS_DIR = path.join(__dirname, '../../uploads/avatars');

const updateUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id !== req.userId.toString()) {
      return res.status(403).json({ error: 'No tienes permiso para actualizar este usuario' });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (req.body.username) user.username = req.body.username;
    if (req.body.email) user.email = req.body.email;
    if (req.body.theme) user.theme = req.body.theme; // <-- Añadido
    if (req.body.highlightColor) user.highlightColor = req.body.highlightColor; // <-- Añadido

    if (req.file) {
      if (user.avatar && user.avatar.startsWith('avatar-')) {
        const oldAvatarPath = path.join(AVATARS_DIR, user.avatar);
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }

      user.avatar = req.file.filename;
    }

    const updatedUser = await user.save();

    const userResponse = {
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      theme: updatedUser.theme, // <-- Añadido
      highlightColor: updatedUser.highlightColor, // <-- Añadido
    
    };

    res.json({ user: userResponse }); // Recomiendo envolverlo en un objeto 'user'
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
};

export default updateUser; 

const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }
        res.json(user);
    } catch (error) {
        res.status(400).json({ message: 'Error al obtener el perfil del usuario' });
    }
};

const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        res.json(user);
    } catch (error) {
        res.status(400).json({ message: 'Error al obtener el usuario' });
    }
};


export { getUserProfile, updateUser, getUserById };
    