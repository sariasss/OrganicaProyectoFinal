import { Link } from "react-router-dom";
import { useTheme } from '../contexts/ThemeContext';

const ErrorPage = () => {
    const { getBaseColors, getHighlightTextColor, theme } = useTheme(); 
    const { bgColor, textColor } = getBaseColors(); 

    return (
        <div className={`${bgColor} ${textColor} min-h-screen flex flex-col justify-center items-center px-4 relative overflow-hidden`}>

            {/* Círculos de fondo animados */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="absolute rounded-full bg-white/5 animate-pulse"
                        style={{
                            width: `${Math.random() * 200 + 100}px`,
                            height: `${Math.random() * 200 + 100}px`,
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            opacity: Math.random() * 0.2,
                            animationDelay: `${Math.random() * 3}s`,
                            animationDuration: `${Math.random() * 8 + 6}s`,
                        }}
                    />
                ))}
            </div>

            {/* Contenido principal */}
            <img
                src={theme === 'dark' ? "/imagenes/logo/logo_light.png" : "/imagenes/logo/logo_dark.png"}
                alt="Orgánica"
                className="w-32 sm:w-40 mb-6"
            />

            <h1 className={`text-5xl font-bold ${getHighlightTextColor()} mb-4`}>404</h1>
            <p className={`text-xl sm:text-2xl ${textColor} mb-6 text-center max-w-xl`}>
                Vaya... Parece que la página que buscas no existe o se ha perdido en la naturaleza.
            </p>

            <Link
                to="/home"
                className={`
                    ${getHighlightTextColor()} 
                    ${theme === 'light' ? 'text-white' : textColor} 
                    px-6 py-3 rounded-full font-medium 
                    hover:opacity-80 transition-all duration-200 transform hover:scale-105
                `}
            >
                Volver al inicio
            </Link>

            <div className={`absolute bottom-6 text-xs ${textColor} text-center opacity-60`}>
                © {new Date().getFullYear()} Orgánica — Pensamientos que florecen.
            </div>
        </div>
    );
};

export default ErrorPage;