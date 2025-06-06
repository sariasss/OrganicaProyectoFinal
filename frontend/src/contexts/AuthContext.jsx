import { signInWithPopup } from "firebase/auth";
import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { auth, provider } from "../services/firebase";
import { updateUserService } from "../services/userService";

const VITE_BASE_URL = import.meta.env.VITE_BASE_URL;
export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(`${VITE_BASE_URL}/auth/check`, {
          credentials: "include",
        });

        if (!res.ok) throw new Error("No autenticado");

        const data = await res.json();
        setUser(data.user); // Asegúrate de que 'data.user' contenga 'theme' y 'highlightColor'
        setIsAuthenticated(true);
      } catch (err) {
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async ({ username, password }) => {
    try {
      setError(null);
      const res = await fetch(`${VITE_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        if (res.status === 401) {
          setError("Credenciales incorrectas");
          toast.error("Credenciales incorrectas. Intenta de nuevo.", {
            style: { background: "red", color: "white" },
          });
        } else {
          setError("Error al iniciar sesión");
          toast.error("Hubo un problema al iniciar sesión", {
            style: { background: "red", color: "white" },
          });
        }
        return false;
      }

      const data = await res.json();
      setUser(data.user); // Asegúrate de que 'data.user' contenga 'theme' y 'highlightColor'
      setIsAuthenticated(true);
      toast.success("Inicio de sesión exitoso 🎉", {
        style: { background: "green", color: "white" },
      });
      return true;
    } catch (err) {
      setError("Error de red o del servidor");
      return false;
    }
  };

  const googleLogin = async () => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const res = await fetch(`${VITE_BASE_URL}/auth/google-login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email: user.email,
          googleId: user.uid,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error al iniciar sesión con Google");
        toast.error(data.message || "Error con Google", {
          style: { background: "red", color: "white" },
        });
        return false;
      }

      setUser(data.user); // Asegúrate de que 'data.user' contenga 'theme' y 'highlightColor'
      setIsAuthenticated(true);
      toast.success("Inicio de sesión con Google 🎉", {
        style: { background: "green", color: "white" },
      });
      return true;
    } catch (error) {
      console.error("Google login error:", error);
      setError("Error al iniciar sesión con Google: " + error.message);
      toast.error("Error al iniciar sesión con Google", {
        style: { background: "red", color: "white" },
      });
      return false;
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      const res = await fetch(`${VITE_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Error al registrarse");
        toast.error(data.message || "Error al registrarse", {
          style: { background: "red", color: "white" },
        });
        return false;
      }

      toast.success("Registro exitoso 🎉", {
        style: { background: "green", color: "white" },
      });
      return true;
    } catch (err) {
      setError("Error al registrar usuario");
      toast.error("No se pudo registrar", {
        style: { background: "red", color: "white" },
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      await fetch(`${VITE_BASE_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Error cerrando sesión", err);
    }

    setUser(null);
    setIsAuthenticated(false);
    toast.success("Sesión cerrada correctamente", {
      style: { background: "#333", color: "white" },
    });
  };

  const updateCurrentUser = async (userData) => {
    if (!user?._id) {
      console.error("No se pudo actualizar el usuario: ID de usuario no disponible.");
      toast.error("Error: ID de usuario no disponible.", {
        style: { background: "red", color: "white" },
      });
      return null;
    }
    try {
      // Llama a la función de servicio que se comunica con tu API
      // Asegúrate de que updateUserService maneje correctamente FormData para avatars
      const updatedData = await updateUserService(user._id, userData);

      // Actualiza el estado 'user' en el contexto con la nueva información
      if (updatedData) {
        setUser(updatedData); // Esto es clave para la actualización instantánea
        toast.success("Perfil actualizado con éxito 🎉", {
          style: { background: "green", color: "white" },
        });
        return updatedData;
      }
      return null;
    } catch (err) {
      console.error("Error al actualizar el usuario desde AuthContext:", err);
      toast.error("Error al actualizar el perfil", {
        style: { background: "red", color: "white" },
      });
      throw err; // Re-lanza el error para que los componentes puedan manejarlo si es necesario
    }
  };

  const value = {
    user,
    isAuthenticated,
    loading,
    error,
    setError,
    login,
    googleLogin,
    register,
    logout,
    setUser,
    updateCurrentUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};