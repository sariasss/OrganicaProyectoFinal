import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { updateUserService } from '../services/userService'; // Assuming this service correctly sends the request
import { useTheme } from '../contexts/ThemeContext';

const ConfigPage = () => {
  const navigate = useNavigate();
  const { user, logout, setUser } = useAuth(); // Assuming setUser updates the user context correctly

  const {
    theme,
    highlightColor,
    toggleTheme, // Assuming toggleTheme updates user context with new theme
    changeHighlightColor, // Assuming changeHighlightColor updates user context with new highlightColor
    getHighlightTextColor,
    getBorderColor,
    getBgColor,
    getRingColor,
    getBaseColors
  } = useTheme();

  const { bgColor, textColor, secondaryBg, secondaryText, dividerColor } = getBaseColors();

  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [email, setEmail] = useState(user?.email || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showThemeSelector, setShowThemeSelector] = useState(false);
  const [selectedHighlightColor, setSelectedHighlightColor] = useState(highlightColor);
  // Add a state to force avatar re-render with a timestamp
  const [avatarRefreshTimestamp, setAvatarRefreshTimestamp] = useState(Date.now());

  useEffect(() => {
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
      setSelectedHighlightColor(highlightColor);
      // When user or highlightColor changes, force avatar re-render
      setAvatarRefreshTimestamp(Date.now());
    }
  }, [user, highlightColor]);

  const handleGoBack = () => navigate(-1);

  // Define your base URL for images. Crucial to ensure this is correct in production.
  // In your production environment, make sure VITE_BASE_URL_IMAGE is set correctly.
  // Example: VITE_BASE_URL_IMAGE=https://api.yourdomain.com
  const VITE_BASE_URL_IMAGE = import.meta.env.VITE_BASE_URL_IMAGE || 'http://localhost:3000';
  const DICEBEAR_API_BASE_URL = 'https://api.dicebear.com/5.x/initials/svg?seed='; // Define DiceBear API for default avatars

  // Log VITE_BASE_URL_IMAGE to console (for debugging in production)
  useEffect(() => {
    console.log("VITE_BASE_URL_IMAGE (in ConfigPage):", VITE_BASE_URL_IMAGE);
  }, [VITE_BASE_URL_IMAGE]);


  const handleSaveUsername = async () => {
    try {
      const updatedUser = await updateUserService(user._id, { username });
      setUser(updatedUser);
      setIsEditingUsername(false);
    } catch (err) {
      console.error('Error al guardar el nombre de usuario:', err);
    }
  };

  const handleSaveEmail = async () => {
    try {
      const updatedUser = await updateUserService(user._id, { email });
      setUser(updatedUser);
      setIsEditingEmail(false);
    } catch (err) {
      console.error('Error al guardar el email:', err);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setAvatarFile(file);
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSaveAvatar = async () => {
    try {
      if (!avatarFile) {
        setIsEditingAvatar(false);
        return;
      }

      const formData = new FormData();
      formData.append('avatar', avatarFile);

      console.log('Attempting to upload avatar...');
      const updatedUser = await updateUserService(user._id, formData);
      console.log('Avatar upload response - updatedUser:', updatedUser);

      // IMPORTANT: Ensure updatedUser contains the correct new avatar path from the server
      setUser(updatedUser); // Update user in context with the new data
      setIsEditingAvatar(false);
      setAvatarFile(null);
      setPreviewUrl(null);

      // Force avatar re-render by updating the timestamp
      setAvatarRefreshTimestamp(Date.now());

    } catch (err) {
      console.error('Error al guardar el avatar:', err);
    }
  };

  const handleColorSelection = (color) => {
    setSelectedHighlightColor(color);
  };

  const handleSaveHighlightColor = async () => {
    try {
      if (user?._id) {
        // Assuming changeHighlightColor also updates the user context correctly
        await changeHighlightColor(selectedHighlightColor, user._id);
        setShowThemeSelector(false);
      } else {
        console.error('ID de usuario no disponible para guardar el color de resaltado.');
      }
    } catch (err) {
      console.error('Error al guardar el color de resaltado:', err);
    }
  };

  const toggleGlobalTheme = async () => {
    try {
      if (user?._id) {
        // Assuming toggleTheme also updates the user context correctly
        const newTheme = theme === 'dark' ? 'light' : 'dark';
        await toggleTheme(user._id);
      } else {
        console.error('ID de usuario no disponible para alternar el tema.');
      }
    } catch (err) {
      console.error('Error al alternar el tema:', err);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const colors = ["pink", "blue", "green", "purple"];

  // Helper function to get the correct avatar source
  const getAvatarSrc = () => {
    if (previewUrl) {
      return previewUrl; // Show local preview immediately after file selection
    }

    if (user?.avatar) {
      // If it's an external URL (e.g., Google, social media avatars)
      if (user.avatar.startsWith('http://') || user.avatar.startsWith('https://')) {
        // Append a timestamp to prevent caching.
        return `${user.avatar}?t=${avatarRefreshTimestamp}`;
      }
      // If it's an uploaded avatar on your server (check for path structure)
      // This logic depends on how your server names and stores avatars.
      // Assuming 'avatar-' prefix implies an uploaded avatar.
      if (user.avatar.includes('avatar-')) {
        // Ensure the path is correctly constructed relative to VITE_BASE_URL_IMAGE
        // If user.avatar already contains the full path like '/uploads/avatars/avatar-xxx.jpg'
        // then combine it carefully with VITE_BASE_URL_IMAGE.
        // Example: If VITE_BASE_URL_IMAGE is 'http://example.com/api' and user.avatar is '/uploads/avatars/xyz.jpg'
        // Result should be 'http://example.com/uploads/avatars/xyz.jpg'

        // Let's assume user.avatar directly contains the filename (e.g., 'avatar-123.jpg')
        // and your server serves them from VITE_BASE_URL_IMAGE/uploads/avatars/
        let finalPath = `${VITE_BASE_URL_IMAGE}/uploads/avatars/${user.avatar}`;

        // Add a timestamp to prevent caching
        return `${finalPath}?t=${avatarRefreshTimestamp}`;
      }
    }
    // Fallback to DiceBear if no avatar is set or URL is invalid/not recognized
    return `${DICEBEAR_API_BASE_URL}${user?.username || 'User'}?t=${avatarRefreshTimestamp}`;
  };


  return (
    <div className={`min-h-screen ${bgColor} ${textColor} flex flex-col px-12 py-4`}>
      <div className="flex justify-between items-end p-4">
        <button onClick={handleGoBack} className="p-2 rounded-full hover:text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
        </button>
        <div className="flex items-center space-x-2">
          <button
            onClick={handleLogout}
            className={`${secondaryBg} ${getHighlightTextColor()} px-4 py-2 rounded-full text-sm hover:bg-opacity-80 font-bold transition`}
          >
            Cerrar Sesión
          </button>
          <button
            onClick={toggleGlobalTheme}
            className={`${secondaryBg} ${getHighlightTextColor()} p-2 rounded-full transition`}
          >
            {theme === 'dark' ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="5"></circle>
                <path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4"></path>
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-col items-center mt-8 px-4">
        <div className="mb-6 flex flex-col items-center">
          {isEditingAvatar ? (
            <input
              type="file"
              onChange={handleFileChange}
              className={`${secondaryBg} ${textColor} px-3 py-2 rounded-md w-full`}
              autoFocus
            />
          ) : (
            <img
              key={avatarRefreshTimestamp} // Using timestamp as key for aggressive re-render
              src={getAvatarSrc()}
              alt="Avatar de usuario"
              className={`w-24 h-24 rounded-full border-2 ${getBorderColor()} mb-3`}
              onError={(e) => {
                console.error('Error al cargar la imagen del avatar:', e.target.src);
                // Fallback to DiceBear if the main image fails to load
                e.target.src = `${DICEBEAR_API_BASE_URL}${user?.username || 'User'}`;
              }}
            />
          )}
          <button
            onClick={() => (isEditingAvatar ? handleSaveAvatar() : setIsEditingAvatar(true))}
            className={`${secondaryBg} ${getHighlightTextColor()} px-3 py-1 mt-2 rounded-full text-xs font-bold transition`}
          >
            {isEditingAvatar ? 'Guardar' : 'Editar'}
          </button>
        </div>

        <div className="w-full max-w-md space-y-6">
          {/* Usuario */}
          <div className="flex justify-between items-center">
            <div className="w-3/4">
              <p className={secondaryText}>Usuario</p>
              {isEditingUsername ? (
                <input
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className={`${secondaryBg} ${textColor} px-3 py-2 rounded-md w-full`}
                  autoFocus
                />
              ) : (
                <p className="text-xl">{user?.username}</p>
              )}
            </div>
            <button
              onClick={() => (isEditingUsername ? handleSaveUsername() : setIsEditingUsername(true))}
              className={`${secondaryBg} ${getHighlightTextColor()} px-4 py-2 rounded-full hover:bg-opacity-80 font-bold transition`}
            >
              {isEditingUsername ? 'Guardar' : 'Editar'}
            </button>
          </div>
          <hr className={theme === 'light' ? 'border-gray-800' : dividerColor} />

          {/* Email */}
          <div className="flex justify-between items-center">
            <div className="w-3/4">
              <p className={secondaryText}>Correo Electrónico</p>
              {isEditingEmail ? (
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`${secondaryBg} ${textColor} px-3 py-2 rounded-md w-full`}
                  autoFocus
                />
              ) : (
                <p className="text-xl">{user?.email}</p>
              )}
            </div>
            <button
              onClick={() => (isEditingEmail ? handleSaveEmail() : setIsEditingEmail(true))}
              className={`${secondaryBg} ${getHighlightTextColor()} px-4 py-2 rounded-full hover:bg-opacity-80 font-bold transition`}
            >
              {isEditingEmail ? 'Guardar' : 'Editar'}
            </button>
          </div>
          <hr className={theme === 'light' ? 'border-gray-800' : dividerColor} />

          {/* Selector de Tema */}
          {showThemeSelector ? (
            <div className="mt-6">
              <p className={`${secondaryText} mb-2`}>Selecciona un color de resaltado</p>
              <div className="flex flex-wrap justify-center gap-4 mb-4">
                {colors.map((color) => (
                  <div
                    key={color}
                    className={`w-40 h-20 ${theme === 'dark' ? 'bg-white/10' : 'bg-black/10'} rounded-2xl flex items-center justify-center cursor-pointer ${
                      selectedHighlightColor === color ? `ring-2 ${getRingColor()}` : ''
                    }`}
                    onClick={() => handleColorSelection(color)}
                  >
                    <div className={`${getBgColor(color)} w-20 h-8 rounded-full`} />
                  </div>
                ))}
              </div>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => setShowThemeSelector(false)}
                  className={`${secondaryBg} ${getHighlightTextColor()} px-4 py-2 rounded-full hover:bg-opacity-80 font-bold transition`}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveHighlightColor}
                  className={`${secondaryBg} ${getHighlightTextColor()} px-4 py-2 rounded-full hover:bg-opacity-80 font-bold transition`}
                >
                  Guardar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mt-8">
              <button
                onClick={() => setShowThemeSelector(true)}
                className={`${secondaryBg} ${getHighlightTextColor()} px-6 py-3 rounded-full hover:bg-opacity-80 font-bold transition`}
              >
                Editar color de resaltado
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfigPage;