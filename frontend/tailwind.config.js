/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: [
    // Colores de fondo para todos los colores y tonalidades
    'bg-pink-100', 'bg-pink-200', 'bg-pink-300', 'bg-pink-400', 'bg-pink-500', 'bg-pink-600', 'bg-pink-700', 'bg-pink-800', 'bg-pink-900',
    'bg-blue-100', 'bg-blue-200', 'bg-blue-300', 'bg-blue-400', 'bg-blue-500', 'bg-blue-600', 'bg-blue-700', 'bg-blue-800', 'bg-blue-900',
    'bg-green-100', 'bg-green-200', 'bg-green-300', 'bg-green-400', 'bg-green-500', 'bg-green-600', 'bg-green-700', 'bg-green-800', 'bg-green-900',
    'bg-purple-100', 'bg-purple-200', 'bg-purple-300', 'bg-purple-400', 'bg-purple-500', 'bg-purple-600', 'bg-purple-700', 'bg-purple-800', 'bg-purple-900',

    // Colores de texto para todos los colores y tonalidades
    'text-pink-100', 'text-pink-200', 'text-pink-300', 'text-pink-400', 'text-pink-500', 'text-pink-600', 'text-pink-700', 'text-pink-800', 'text-pink-900',
    'text-blue-100', 'text-blue-200', 'text-blue-300', 'text-blue-400', 'text-blue-500', 'text-blue-600', 'text-blue-700', 'text-blue-800', 'text-blue-900',
    'text-green-100', 'text-green-200', 'text-green-300', 'text-green-400', 'text-green-500', 'text-green-600', 'text-green-700', 'text-green-800', 'text-green-900',
    'text-purple-100', 'text-purple-200', 'text-purple-300', 'text-purple-400', 'text-purple-500', 'text-purple-600', 'text-purple-700', 'text-purple-800', 'text-purple-900',

    // Colores de borde para todos los colores y tonalidades
    'border-pink-100', 'border-pink-200', 'border-pink-300', 'border-pink-400', 'border-pink-500', 'border-pink-600', 'border-pink-700', 'border-pink-800', 'border-pink-900',
    'border-blue-100', 'border-blue-200', 'border-blue-300', 'border-blue-400', 'border-blue-500', 'border-blue-600', 'border-blue-700', 'border-blue-800', 'border-blue-900',
    'border-green-100', 'border-green-200', 'border-green-300', 'border-green-400', 'border-green-500', 'border-green-600', 'border-green-700', 'border-green-800', 'border-green-900',
    'border-purple-100', 'border-purple-200', 'border-purple-300', 'border-purple-400', 'border-purple-500', 'border-purple-600', 'border-purple-700', 'border-purple-800', 'border-purple-900',

    // Colores de ring para todos los colores y tonalidades
    'ring-pink-100', 'ring-pink-200', 'ring-pink-300', 'ring-pink-400', 'ring-pink-500', 'ring-pink-600', 'ring-pink-700', 'ring-pink-800', 'ring-pink-900',
    'ring-blue-100', 'ring-blue-200', 'ring-blue-300', 'ring-blue-400', 'ring-blue-500', 'ring-blue-600', 'ring-blue-700', 'ring-blue-800', 'ring-blue-900',
    'ring-green-100', 'ring-green-200', 'ring-green-300', 'ring-green-400', 'ring-green-500', 'ring-green-600', 'ring-green-700', 'ring-green-800', 'ring-green-900',
    'ring-purple-100', 'ring-purple-200', 'ring-purple-300', 'ring-purple-400', 'ring-purple-500', 'ring-purple-600', 'ring-purple-700', 'ring-purple-800', 'ring-purple-900',

    // Clases 'from-' para todos los colores y tonalidades relevantes
    'from-pink-100', 'from-pink-200', 'from-pink-300', 'from-pink-400', 'from-pink-500', 'from-pink-600', 'from-pink-700', 'from-pink-800', 'from-pink-900',
    'from-blue-100', 'from-blue-200', 'from-blue-300', 'from-blue-400', 'from-blue-500', 'from-blue-600', 'from-blue-700', 'from-blue-800', 'from-blue-900',
    'from-green-100', 'from-green-200', 'from-green-300', 'from-green-400', 'from-green-500', 'from-green-600', 'from-green-700', 'from-green-800', 'from-green-900',
    'from-purple-100', 'from-purple-200', 'from-purple-300', 'from-purple-400', 'from-purple-500', 'from-purple-600', 'from-purple-700', 'from-purple-800', 'from-purple-900',

    // --- ¡NUEVAS CLASES AÑADIDAS PARA EL DEGRADADO FINAL! ---
    'to-primary-dark', // Asegúrate de que Tailwind genere esta clase
    'to-primary-light', // Asegúrate de que Tailwind genere esta clase para el modo claro si decides usarlo así
    // --- FIN DE LAS CLASES AÑADIDAS ---

    // Variantes hover
    'hover:bg-pink-300', 'hover:bg-pink-700', 'hover:bg-blue-300', 'hover:bg-blue-700',
    'hover:bg-green-300', 'hover:bg-green-700', 'hover:bg-purple-300', 'hover:bg-purple-700',

    // Clases base del tema que no son dinámicas
    'bg-primary-dark',
    'bg-secondary-dark',
    'bg-primary-light',
    'bg-secondary-light',
    'text-gray-100',
    'text-gray-900',
    'text-gray-400',
    'text-gray-600',
    'border-gray-700',
    'border-gray-200',
  ],
  theme: {
    extend: {
      colors: {
        'primary-dark': '#212121', // Asegúrate de que este color sea el deseado
        'secondary-dark': '#464646',
        'primary-light': '#D9D9D9', // Asegúrate de que este color sea el deseado
        'secondary-light': '#A6A6A6',
      },
    },
  },
  plugins: [],
}