// src/contexts/ThemeContext.jsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { updateUser } from '../services/userService';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const { user, setUser } = useAuth();

  const [theme, setTheme] = useState(user?.theme || 'dark');
  const [highlightColor, setHighlightColor] = useState(user?.highlightColor || 'pink');

  useEffect(() => {
    if (user) {
      setTheme(user.theme || 'dark');
      setHighlightColor(user.highlightColor || 'pink');
    }
  }, [user]);

  const toggleTheme = async (userId) => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    try {
      const updatedUser = await updateUser(userId, { theme: newTheme });
      setTheme(newTheme);
      setUser(updatedUser);
      console.log('Tema actualizado en DB y contexto:', updatedUser.theme);
    } catch (error) {
      console.error('Error al cambiar el tema:', error);
    }
  };

  const changeHighlightColor = async (color, userId) => {
    try {
      if (!color) {
        console.warn("No se proporcionó un color válido para actualizar el resaltado.");
        return;
      }
      const updatedUser = await updateUser(userId, { highlightColor: color });
      setHighlightColor(color);
      setUser(updatedUser);
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
  const getBgColor = (color = highlightColor) => { // Eliminado isButton
    // Usa la misma lógica de sombra que getHighlightTextColor
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