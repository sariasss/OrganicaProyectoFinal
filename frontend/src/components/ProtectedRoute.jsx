import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({children}) => {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    // Esperar mientras se verifica la autenticación
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#212121] text-white">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white"></div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;