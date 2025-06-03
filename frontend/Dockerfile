# --- Etapa 1: Construcción de la aplicación React (Vite) ---
FROM node:18-alpine AS build

WORKDIR /app

# Copia los archivos de configuración de dependencias
COPY package.json package-lock.json ./

# Instala las dependencias de producción y desarrollo
RUN npm ci

# --- ¡MUY IMPORTANTE! AÑADE ESTAS LÍNEAS PARA DEPURAR ---
# Imprime todas las variables de entorno que empiezan con VITE_
RUN echo "--- Verificando variables VITE_ durante la construcción ---" && env | grep VITE_ || echo "No se encontraron variables VITE_."
# --- FIN DE LAS LÍNEAS DE DEPURACIÓN ---

# Copia todo el código fuente de la aplicación
COPY . .

# Construye la aplicación React para producción
RUN npm run build

# --- Etapa 2: Servir la aplicación con Nginx ---
FROM nginx:alpine

# Copia la configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia los archivos estáticos construidos desde la etapa 'build'
COPY --from=build /app/dist /usr/share/nginx/html

# Expone el puerto 80, que es el puerto predeterminado de Nginx
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]