import { useTheme } from '../contexts/ThemeContext';

const ThemeLayout = ({ children }) => {
  const { getBaseColors } = useTheme();
  const { bgColor, textColor } = getBaseColors();

  return (
    <div className={`min-h-screen ${bgColor} ${textColor}`}>
      {children}
    </div>
  );
};

export default ThemeLayout;