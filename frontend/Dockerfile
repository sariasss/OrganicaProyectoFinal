# --- Etapa 1: Construcción de la aplicación React (Vite) ---
FROM node:18-alpine AS build

WORKDIR /app

# Define los argumentos de construcción para las variables de entorno de Vite
# Estos valores serán pasados desde Railway. Es CRUCIAL que los nombres coincidan
# EXACTAMENTE con los que tienes en Railway.
ARG VITE_API_KEY
ARG VITE_AUTH_DOMAIN
ARG VITE_IDPROJECT
ARG VITE_STORAGE_BUCKET
ARG VITE_MESSAGING_SENDER_ID
ARG VITE_APP_ID
ARG VITE_BASE_URL
ARG VITE_BASE_URL_IMAGE

# Establece estas variables como variables de entorno dentro del contenedor
# para que 'npm run build' pueda acceder a ellas.
# Esto es esencial para que Vite las incruste en el código compilado.
ENV VITE_API_KEY=${VITE_API_KEY}
ENV VITE_AUTH_DOMAIN=${VITE_AUTH_DOMAIN}
ENV VITE_IDPROJECT=${VITE_IDPROJECT}
ENV VITE_STORAGE_BUCKET=${VITE_STORAGE_BUCKET}
ENV VITE_MESSAGING_SENDER_ID=${VITE_MESSAGING_SENDER_ID}
ENV VITE_APP_ID=${VITE_APP_ID}
ENV VITE_BASE_URL=${VITE_BASE_URL}
ENV VITE_BASE_URL_IMAGE=${VITE_BASE_URL_IMAGE}

# --- Línea de depuración CRÍTICA (NO LA ELIMINES TODAVÍA) ---
# Imprime todas las variables de entorno que empiezan con VITE_.
# Esta salida en los logs de Railway nos dirá si las variables están llegando.
# Añadimos 'date' para asegurar que esta capa no se cachee y se re-evalúe.
RUN echo "--- Verificando variables VITE_ durante la construcción (con ARG/ENV) ---" && env | grep VITE_ || echo "No se encontraron variables VITE_." && date
# --- Fin de la línea de depuración ---

# Copia los archivos de configuración de dependencias
COPY package.json package-lock.json ./

# Instala las dependencias de producción y desarrollo
# npm ci es preferible para builds consistentes en CI/CD
RUN npm ci

# Copia todo el código fuente de la aplicación
COPY . .

# Construye la aplicación React para producción
# Vite por defecto genera la salida en la carpeta 'dist'
# Confiamos en que las variables ENV definidas arriba son suficientes para Vite.
RUN npm run build

# --- Etapa 2: Servir la aplicación con Nginx ---
FROM nginx:alpine

# Copia la configuración personalizada de Nginx
# Asegúrate de que 'nginx.conf' está en la misma carpeta que este Dockerfile
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia los archivos estáticos construidos desde la etapa 'build'
# Confirma que 'npm run build' de Vite genera a la carpeta 'dist'
COPY --from=build /app/dist /usr/share/nginx/html

# Expone el puerto 80, que es el puerto predeterminado de Nginx
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]