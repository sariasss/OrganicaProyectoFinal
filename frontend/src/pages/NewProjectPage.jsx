import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createProject } from "../services/projectService";
import { useTheme } from "../contexts/ThemeContext";

const NewProjectPage = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    coverImage: "../public/imagenes/default-cover.jpg"
  });
  const [imagePreview, setImagePreview] = useState('../public/imagenes/default-cover.jpg');

  const {
    getHighlightTextColor,
    getBgColor,
    getBaseColors,
    theme
  } = useTheme();

  const { bgColor, textColor, secondaryBg } = getBaseColors();

  // Agregar log para depuración
  useEffect(() => {
    console.log('Componente NewProjectPage inicializado');
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'coverImage' && files.length > 0) {
      const file = files[0];
      console.log('Archivo seleccionado:', file.name, file.type, file.size);
      
      setFormData(prev => ({
        ...prev,
        coverImage: file
      }));
      setImagePreview(URL.createObjectURL(file));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
      e.preventDefault();
      setError(null);

      try {
          const formDataToSend = new FormData();
          formDataToSend.append('title', formData.title);
          formDataToSend.append('description', formData.description || '');
          
          if (formData.coverImage) {
              formDataToSend.append('coverImage', formData.coverImage);
          }

          console.log('FormData preparado:', Array.from(formDataToSend.entries()));
          
          const response = await createProject(formDataToSend);
          
          if (response.success) {
              navigate('/home');
          } else {
              setError(response.message || 'Error al crear el proyecto');
          }
      } catch (error) {
          console.error('Error detallado:', error);
          setError('Error al crear el proyecto');
      }
  };
  
  return (
    <div className={`min-h-screen flex items-center justify-center ${bgColor} px-4 ${textColor}`}>
      <div className="w-full max-w-md space-y-8">
        <h2 className={`text-center text-xl font-light tracking-wide ${textColor}`}>
          CREAR NUEVO PROYECTO
        </h2>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-3 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Título del proyecto"
            value={formData.title}
            onChange={handleChange}
            required
            className={`w-full px-4 py-3 ${secondaryBg} rounded-md ${theme === 'dark' ? 'placeholder-gray-400' : 'placeholder-gray-600'} ${textColor} focus:outline-none focus:ring-2 focus:ring-white/10`}
          />
          
          <textarea
            name="description"
            placeholder="Descripción (opcional)"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className={`w-full px-4 py-3 ${secondaryBg} rounded-md ${theme === 'dark' ? 'placeholder-gray-400' : 'placeholder-gray-600'} ${textColor} focus:outline-none focus:ring-2 focus:ring-white/10 resize-none`}
          />

          <div className="space-y-2">
            <label className={`block text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
              Imagen de portada (opcional)
            </label>
            <input
              type="file"
              name="coverImage"
              onChange={handleChange}
              accept="image/*"
              className={`w-full text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium ${theme === 'dark' ? 'file:bg-white/10 file:text-white hover:file:bg-white/20' : 'file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200'}`}
            />
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Vista previa"
                  className="w-full h-32 object-cover rounded-md"
                />
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className={`flex-1 py-3 border ${theme === 'dark' ? 'border-white text-white hover:bg-white/10' : 'border-gray-400 text-gray-700 hover:bg-gray-100'} rounded-md transition`}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className={`flex-1 py-3 ${theme === 'dark' ? 'bg-white text-[#212121] hover:bg-white/90' : 'bg-[#212121] text-white hover:bg-[#212121]/90'} rounded-md font-semibold transition`}
            >
              Crear Proyecto
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewProjectPage;