import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../services/firebase";

const LoginPage = () => {
  const { login, error, setError, googleLogin } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ username: "", password: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevValue) => ({
      ...prevValue,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const success = await login(formData);
      if (success) {
        navigate("/home");
      }
    } catch (error) {
      console.error("Error en login:", error);
    }
  };

  const handleGoogleLogin = async () => {
    const success = await googleLogin();
    if (success) {
      navigate("/home");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#212121] px-4 text-white">
      <div className="w-full max-w-md space-y-8">
        <h2 className="text-center text-xl font-light tracking-wide">
          SIGUE DONDE LO DEJASTE
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Usuario"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#464646] rounded-md placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-white/10"
          />
          <input
            type="password"
            name="password"
            placeholder="*********"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#464646] rounded-md placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-white/10"
          />
          <button
            type="submit"
            className="w-full py-3 bg-white text-[#212121] rounded-md font-semibold hover:bg-gray-100 transition"
          >
            Iniciar Sesión
          </button>
        </form>

        <div>
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full py-3 border border-white text-white rounded-md flex items-center justify-center gap-2 hover:bg-white/10 transition"
          >
            <img
              src="/imagenes/google.png"
              alt="Google"
              className="w-5 h-5"
            />
            Continuar con Google
          </button>
        </div>

        <p className="text-center text-sm text-gray-400">
          ¿No tienes cuenta?{" "}
          <Link
            to="/register"
            className="text-white underline hover:text-gray-200"
          >
            Regístrate
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
