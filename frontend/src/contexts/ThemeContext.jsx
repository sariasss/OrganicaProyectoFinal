// src/contexts/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext'; // Import useAuth
import { updateUserService } from '../services/userService'; // Import with alias

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Destructure setUser from useAuth to update the global user state
  const { user, setUser } = useAuth(); 

  const [theme, setTheme] = useState(user?.theme || 'dark');
  const [highlightColor, setHighlightColor] = useState(user?.highlightColor || 'pink');

  // This useEffect ensures theme and highlightColor states are synced with the user from AuthContext
  useEffect(() => {
    if (user) {
      setTheme(user.theme || 'dark');
      setHighlightColor(user.highlightColor || 'pink');
    }
  }, [user]); // Depend on 'user' object, so it runs when user data changes

  const toggleTheme = async () => { // Removed userId param since we get it from `user`
    if (!user?._id) {
        console.error('No se pudo alternar el tema: ID de usuario no disponible.');
        return;
    }
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    try {
      // Use the imported service function, passing the user's ID and the data to update
      const updatedUser = await updateUserService(user._id, { theme: newTheme });
      setTheme(newTheme); // Update local theme state
      setUser(updatedUser); // Update global user state in AuthContext
      console.log('Tema actualizado en DB y contexto:', updatedUser.theme);
    } catch (error) {
      console.error('Error al cambiar el tema:', error);
    }
  };

  const changeHighlightColor = async (color) => { // Removed userId param since we get it from `user`
    if (!user?._id) {
        console.error('No se pudo cambiar el color de resaltado: ID de usuario no disponible.');
        return;
    }
    try {
      if (!color) {
        console.warn("No se proporcionó un color válido para actualizar el resaltado.");
        return;
      }
      // Use the imported service function, passing the user's ID and the data to update
      const updatedUser = await updateUserService(user._id, { highlightColor: color });
      setHighlightColor(color); // Update local highlightColor state
      setUser(updatedUser); // Update global user state in AuthContext
      console.log('Color de resaltado actualizado en DB y contexto:', updatedUser.highlightColor);
    } catch (error) {
      console.error('Error al cambiar el color de resaltado:', error);
    }
  };

  const getHighlightTextColor = () => {
    const shade = theme === 'dark' ? '300' : '900';
    return `text-${highlightColor}-${shade}`;
  };

  const getBorderColor = () => {
    const shade = theme === 'dark' ? '400' : '900';
    return `border-${highlightColor}-${shade}`;
  };

  const getRingColor = () => {
    const shade = theme === 'dark' ? '400' : '900';
    return `ring-${highlightColor}-${shade}`;
  };

  /**
   * Obtiene la clase CSS para el color de fondo de un elemento.
   * Ahora siempre usará la misma tonalidad que el texto de resaltado.
   * @param {string} [color=highlightColor] El color base a usar.
   * @returns {string} Clase CSS de Tailwind.
   */
  const getBgColor = (color = highlightColor) => {
    const shade = theme === 'dark' ? '300' : '900';
    return `bg-${color}-${shade}`;
  };

  const getBaseColors = () => {
    if (theme === 'dark') {
      return {
        bgColor: 'bg-primary-dark',
        textColor: 'text-gray-100',
        secondaryBg: 'bg-secondary-dark',
        secondaryText: 'text-gray-400',
        dividerColor: 'border-gray-700',
      };
    } else { // light theme
      return {
        bgColor: 'bg-primary-light',
        textColor: 'text-gray-900',
        secondaryBg: 'bg-secondary-light',
        secondaryText: 'text-gray-600',
        dividerColor: 'border-gray-200',
      };
    }
  };

  const value = {
    theme,
    highlightColor,
    toggleTheme,
    changeHighlightColor,
    getHighlightTextColor,
    getBorderColor,
    getBgColor,
    getRingColor,
    getBaseColors,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};