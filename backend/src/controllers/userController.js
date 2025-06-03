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

    console.log('*** INICIANDO UPDATEUSER ***');
    console.log('ID de usuario de la URL:', id);
    console.log('ID de usuario autenticado (req.userId):', req.userId.toString());

    if (id !== req.userId.toString()) {
      console.error('Error 403: Intento de actualizar usuario no autorizado.');
      return res.status(403).json({ error: 'No tienes permiso para actualizar este usuario' });
    }

    const user = await User.findById(id);
    if (!user) {
      console.error('Error 404: Usuario no encontrado.');
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    // Log para campos del body (si los hay y no son FormData)
    if (req.body.username) user.username = req.body.username;
    if (req.body.email) user.email = req.body.email;
    if (req.body.theme) user.theme = req.body.theme;
    if (req.body.highlightColor) user.highlightColor = req.body.highlightColor;
    console.log('Datos del body recibidos (sin archivos):', req.body);

    // --- SECCIÓN CLAVE PARA EL DEBUG DEL AVATAR ---
    console.log('Estado de req.file (proporcionado por Multer):', req.file);
    if (req.file) {
      console.log('Nuevo archivo de avatar detectado. Nombre de archivo:', req.file.filename);

      if (user.avatar && user.avatar.startsWith('avatar-')) {
        const oldAvatarPath = path.join(AVATARS_DIR, user.avatar);
        console.log('Intentando eliminar avatar antiguo en la ruta:', oldAvatarPath);
        try {
            if (fs.existsSync(oldAvatarPath)) {
                fs.unlinkSync(oldAvatarPath);
                console.log('Avatar antiguo eliminado con éxito.');
            } else {
                console.warn('Advertencia: El archivo de avatar antiguo no se encontró en la ruta:', oldAvatarPath);
            }
        } catch (unlinkError) {
            console.error('*** ERROR AL ELIMINAR EL AVATAR ANTIGUO:', unlinkError);
            // Si la eliminación falla, el proceso debe continuar si no es crítico.
            // Sin embargo, si es un problema de permisos, user.save() también podría fallar.
        }
      }
      user.avatar = req.file.filename;
      console.log('Nuevo nombre de avatar asignado al usuario:', user.avatar);
    } else {
      console.log('No se detectó un archivo de avatar en la solicitud (req.file es undefined o nulo).');
    }
    // --- FIN SECCIÓN CLAVE ---

    const updatedUser = await user.save();
    console.log('Usuario guardado en la base de datos con éxito. ID:', updatedUser._id);

    const userResponse = {
      _id: updatedUser._id,
      username: updatedUser.username,
      email: updatedUser.email,
      avatar: updatedUser.avatar,
      theme: updatedUser.theme,
      highlightColor: updatedUser.highlightColor,
    };

    console.log('Respuesta de usuario enviada:', userResponse);
    res.json({ user: userResponse });

  } catch (error) {
    console.error('*** ERROR GENERAL EN UPDATEUSER CATCH BLOCK: ***', error);
    // console.error('Stack Trace:', error.stack); // Esto es útil para errores de código
    res.status(500).json({ error: 'Error al actualizar el usuario' });
  }
};


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
    