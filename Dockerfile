# Usa la imagen oficial de Node.js
FROM node:14-alpine AS build

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia los archivos package.json y package-lock.json
COPY package*.json ./

# Instala las dependencias de la aplicación
RUN npm install

# Copia el resto de los archivos de la aplicación
COPY . .

#
RUN npm install @vuepic/vue-datepicker

# Construye la aplicación para producción
RUN npm run build

# Usa una imagen de servidor para servir la aplicación
FROM nginx:alpine

# Copia el archivo de configuración de nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Copia los archivos construidos de la aplicación
COPY --from=build /app/dist /usr/share/nginx/html

# Expon el puerto que usará la aplicación
EXPOSE 3000

# Comando para correr el servidor Nginx
CMD ["nginx", "-g", "daemon off;"]