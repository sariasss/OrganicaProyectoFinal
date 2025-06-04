# backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

# Copia los archivos de configuración de npm y instala las dependencias
COPY package*.json ./
RUN npm install --omit=dev

# Copia todo el código fuente de tu backend al contenedor
COPY . .

# Exponer el puerto de tu aplicación backend
EXPOSE 3000

# Comando por defecto para iniciar tu aplicación backend
CMD ["npm", "start"]