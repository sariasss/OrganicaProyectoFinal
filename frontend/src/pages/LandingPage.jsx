import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";

const LandingPage = () => {
  const { login , setError, googleLogin } = useAuth();

  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username:"", password: "" });

  const handleChange = (e) =>{
      const { name, value } = e.target;
      setFormData(prevalue => (
          {
              ...prevalue,
              [name]: value
          }
      ));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
        const successs = await login(formData);
        if (successs) {
            navigate("/home");
        }
    } catch (error) {
        setError(error);
    }
  };

  
  const handleGoogleLogin = async () => {
    const success = await googleLogin();
    if (success) {
      navigate("/home");
    }
  };

  return (
    <div className="bg-[#212121] text-white w-full relative overflow-hidden min-h-screen">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/5 animate-pulse"
            style={{
              width: `${Math.random() * 300 + 50}px`,
              height: `${Math.random() * 300 + 50}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.3,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${Math.random() * 10 + 10}s`,
            }}
          />
        ))}
      </div>

      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white/10 to-transparent z-10" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white/10 to-transparent z-10" />

      <nav className="fixed top-0 left-0 w-full z-50 transition-all duration-300 mt-4">
          <div className="container mx-auto flex justify-between items-center px-4">
              <img 
                  src="/imagenes/logo/light-name.png" 
                  alt="Orgánica Logo" 
                  className="h-8"
              />
              <div className="flex items-center space-x-4">
                  <Link
                      to="/login"
                      className="text-sm text-white hover:text-gray-200 px-4 py-2 rounded-md transition-all duration-200 ease-in-out"
                  >
                      Iniciar Sesión
                  </Link>
                  <Link
                      to="/register"
                      className="text-sm bg-white text-[#212121] hover:bg-gray-200 px-6 py-2 rounded-md transition-all duration-200 ease-in-out font-medium"
                  >
                      Regístrate
                  </Link>
              </div>
          </div>
      </nav>

      <section className="min-h-screen flex flex-col justify-center items-center text-center relative -mt-20">
        <div className={`transition-all duration-1000 transform`}>
          <img
            src="/imagenes/logo/light-name.png"
            alt="Orgánica"
            className="w-180 -mb-9"
          />
          <h1 className="text-xl md:text-2xl font-light mb-6">
            Tu espacio natural para pensar,<br />
            escribir y organizar.
          </h1>
          <p className="text-gray-300 max-w-md mx-auto">
            Libera tu creatividad en un entorno diseñado para inspirar tus mejores ideas.
          </p>
        </div>
        <a 
          href="#login"
          className="absolute bottom-12 animate-bounce"
        >
          <div className="w-10 h-10 flex items-center justify-center">
            <img
              src="/imagenes/triangulo_blanco.png"
              alt="Scroll down"
              className="w-6 h-6 transform rotate-180"
            />
          </div>
        </a>
      </section>

      <section 
        className="min-h-screen flex flex-col lg:flex-row items-center justify-center gap-16 px-4 py-16 lg:px-20 relative" 
        id="login"
      >
        <div className="w-full max-w-lg transform transition-all duration-700 hover:scale-105">
          <img
            src="/imagenes/ordenador.png"
            alt="Ordenador"
            className="w-full drop-shadow-2xl"
          />
        </div>
        <div className="w-full max-w-md space-y-8 bg-[#464646]/80 p-8 rounded-lg shadow-lg">
          <div className="text-center">
            <h2 className="text-sm text-gray-300 uppercase tracking-wider mb-2">SIGUE DONDE LO DEJASTE</h2>
          </div>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="relative">
              <input
                type="text"
                placeholder="Usuario"
                className="w-full px-4 py-3 bg-[#464646] rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
              />
            </div>
            <div className="relative">
              <input
                type="password"
                className="w-full px-4 py-3 bg-[#464646] rounded text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50 transition"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="*********"
              />
            </div>
            <div className="text-right">
            </div>
            <button className="w-full py-3 bg-white text-[#212121] rounded font-medium hover:bg-gray-200 transition">
              Iniciar Sesión
            </button>
            <button type="button" onClick={handleGoogleLogin} className="w-full py-3 rounded flex items-center justify-center gap-2 bg-gradient-to-r from-white to-gray-200 text-[#212121] font-medium hover:from-gray-100 hover:to-white transition">
              <img
                src="/imagenes/google.png"
                alt="Google"
                className="w-5 h-5"
              />
              Continuar con Google
            </button>
          </form>
          <p className="text-center text-gray-300">
            ¿No tienes cuenta?{" "}
            <Link to="/register" className="underline hover:text-white transition">
              Regístrate
            </Link>
          </p>
        </div>
      </section>

      <section className="py-20 px-4 relative">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <img
            src="/imagenes/logo/logo_light.png"
            alt="Logo decorativo"
            className="w-50 mx-auto mb-2"
          />
          <h2 className="text-2xl font-light mb-6">TU MENTE, PERO DIGITAL</h2>
        </div>

        <div className="max-w-4xl mx-auto">          
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <div className="group w-40 h-20 bg-white/10 rounded-2xl transition hover:bg-gray-300 flex items-center justify-center">
              <div className="w-20 h-8 rounded-full bg-pink-400 transition group-hover:bg-pink-900" />
            </div>

            <div className="group w-40 h-20 bg-white/10 rounded-2xl transition hover:bg-gray-300 flex items-center justify-center">
              <div className="w-20 h-8 rounded-full bg-purple-500 transition group-hover:bg-purple-950" />
            </div>

            <div className="group w-40 h-20 bg-white/10 rounded-2xl transition hover:bg-gray-300 flex items-center justify-center">
              <div className="w-20 h-8 rounded-full bg-green-400 transition group-hover:bg-green-900" />
            </div>

            <div className="group w-40 h-20 bg-white/10 rounded-2xl transition hover:bg-gray-300 flex items-center justify-center">
              <div className="w-20 h-8 rounded-full bg-blue-400 transition group-hover:bg-blue-900" />
            </div>
          </div>
          
          <p className="text-xs text-gray-400 text-center">
            Prueba todos nuestros temas
          </p>
        </div>
      </section>

      <section className="py-16 px-4 bg-black/30">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-medium mb-6">
            Listo para organizar tus ideas
          </h2>
          <p className="text-lg text-gray-300 mb-8">
            Únete a miles de personas que ya están potenciando su creatividad con Orgánica
          </p>
          <Link
            to="/register"
            className="inline-block px-8 py-4 bg-white text-[#212121] rounded-4xl font-medium hover:bg-gray-200 transition transform hover:scale-105"
          >
            Crear cuenta gratis
          </Link>
        </div>
      </section>

      <footer className="py-8 px-4 bg-black/20">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <img
            src="/imagenes/logo/light-name.png"
            alt="Orgánica"
            className="h-6 mb-4 md:mb-0"
          />
          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition">Términos</a>
            <a href="#" className="hover:text-white transition">Privacidad</a>
            <a href="#" className="hover:text-white transition">Contacto</a>
            <a href="#" className="hover:text-white transition">Ayuda</a>
          </div>
        </div>
        <div className="max-w-6xl mx-auto mt-6 pt-6 border-t border-gray-800 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} Orgánica. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;