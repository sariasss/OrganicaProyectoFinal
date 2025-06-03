// NewPage.jsx (or whatever your component is named)
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom"; // Import useParams
import { createPage } from "../services/pageService";
import { useTheme } from "../contexts/ThemeContext";

const NewPage = () => { // Renamed from NewPageForm for route consistency
  const navigate = useNavigate();
  const { id: projectId } = useParams(); // Extract 'id' from URL params and alias it as 'projectId'
  const [error, setError] = useState(null);
  const [title, setTitle] = useState("");

  const {
    getHighlightTextColor,
    getBgColor,
    getBaseColors,
    theme
  } = useTheme();

  const { bgColor, textColor, secondaryBg } = getBaseColors();

  const handleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // It's good to still check if projectId is available, though useParams usually ensures it for this route structure.
    if (!projectId) {
      setError("Project ID is missing. Cannot create page.");
      return;
    }

    try {
      const response = await createPage(projectId, title);

      if (response.page) {
        // Navigate to the newly created page or back to the project detail page
        navigate(`/project/${projectId}/page/${response.page._id}`); // Example: navigate to the new page
        // Or navigate(`/project/${projectId}`); // Example: navigate back to the project page
      } else {
        setError(response.message || "Error al crear la página");
      }
    } catch (error) {
      console.error("Error detailed:", error);
      setError(error.message || "Error al crear la página");
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${bgColor} px-4 ${textColor}`}>
      <div className="w-full max-w-md space-y-8">
        <h2 className={`text-center text-xl font-light tracking-wide ${textColor}`}>
          CREAR NUEVA PÁGINA
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
            placeholder="Título de la página"
            value={title}
            onChange={handleChange}
            required
            className={`w-full px-4 py-3 ${secondaryBg} rounded-md ${theme === 'dark' ? 'placeholder-gray-400' : 'placeholder-gray-600'} ${textColor} focus:outline-none focus:ring-2 focus:ring-white/10`}
          />

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
              Crear Página
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewPage;