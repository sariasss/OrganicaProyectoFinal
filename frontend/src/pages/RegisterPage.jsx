import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../services/firebase";

const RegisterPage = () => {
  const { register, setError } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    try {
      const success = await register(formData);
      if (success) {
        navigate("/login");
      }
    } catch (error) {
      setError(error.message);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      const success = await register({
        username: user.displayName,
        email: user.email,
        googleId: user.uid,
        provider: 'google'
      });

      if (success) {
        navigate("/home");
      }
    } catch (error) {
      setError("Error al registrarse con Google: " + error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#212121] px-4 text-white">
      <div className="w-full max-w-md space-y-8">
        <h2 className="text-center text-xl font-light tracking-wide">
          CREA TU CUENTA
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="username"
            placeholder="Nombre de usuario"
            value={formData.username}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#464646] rounded-md placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-white/10"
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#464646] rounded-md placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-white/10"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#464646] rounded-md placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-white/10"
            required
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirmar contraseña"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-[#464646] rounded-md placeholder-gray-400 text-white focus:outline-none focus:ring-2 focus:ring-white/10"
            required
          />
          <button
            type="submit"
            className="w-full py-3 bg-white text-[#212121] rounded-md font-semibold hover:bg-gray-100 transition"
          >
            Registrarse
          </button>
        </form>

        <button
          onClick={handleGoogleRegister}
          className="w-full py-3 border border-white text-white rounded-md flex items-center justify-center gap-2 hover:bg-white/10 transition"
        >
          <img
            src="/imagenes/google.png"
            alt="Google"
            className="w-5 h-5"
          />
          Continuar con Google
        </button>

        <p className="text-center text-sm text-gray-400">
          ¿Ya tienes cuenta?{" "}
          <Link
            to="/login"
            className="text-white underline hover:text-gray-200"
          >
            Inicia sesión
          </Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;