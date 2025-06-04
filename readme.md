# Orgánica – Documentación de Endpoints y Despliegue

Este documento incluye los principales endpoints de la aplicación **Orgánica**, así como instrucciones detalladas para desplegar el proyecto utilizando Docker Compose.

---

## Instrucciones de Despliegue con Docker Compose

### Requisitos Previos

- Tener instalado [Docker](https://www.docker.com/)
- Tener instalado [Docker Compose](https://docs.docker.com/compose/)

### 1. Clonar el Repositorio

```bash
git clone https://github.com/tu-usuario/organica.git
cd organica
```

### 2. Seleccionar la Rama

- `local`: desarrollo local.
- `develop`: despliegue en entorno de pruebas o producción.
- `main`: validación general y pruebas.

Ejemplo:
```bash
git checkout local
```

### 3. Iniciar los Servicios

```bash
docker-compose up --build
```

Servicios que se levantarán:

- MongoDB (Base de datos)
- Mongo Express (Interfaz de administración de MongoDB)
- Backend (API REST en Node.js)
- Frontend (Aplicación React)
- Script de carga inicial (seed_db)

### 4. Acceder a la Aplicación

- Frontend: http://localhost:5173
- Backend (API): http://localhost:3000
- Mongo Express: http://localhost:8081

---

## Endpoints de la Aplicación

### Autenticación

```
POST   /login              → Iniciar sesión con JWT
POST   /register           → Registrar nuevo usuario
POST   /logout             → Cerrar sesión
GET    /check              → Verificar autenticación (requiere token)
POST   /google-login       → Iniciar sesión con Google Firebase
DELETE /delete             → Eliminar cuenta de usuario
```

### Bloques de Contenido

(Protegido por autenticación)

```
POST   /                  → Crear bloque
GET    /:id               → Obtener bloque por ID
PATCH  /:id               → Actualizar bloque
DELETE /:id               → Eliminar bloque
POST   /upload-media      → Subir archivo multimedia
```

### Invitaciones

```
POST   /                  → Crear invitación
GET    /                  → Obtener todas las invitaciones del usuario
DELETE /:id               → Eliminar invitación
```

### Páginas

```
POST   /                  → Crear página
GET    /:id               → Obtener página por ID
PATCH  /:id               → Editar página
DELETE /:id               → Eliminar página
```

### Permisos

```
POST   /                  → Asignar permiso a usuario
GET    /:projectId        → Obtener permisos de un proyecto
PATCH  /:id               → Actualizar permiso
DELETE /:id               → Eliminar permiso
```

### Proyectos

```
POST   /                      → Crear proyecto (con imagen)
GET    /                      → Obtener todos los proyectos
GET    /:id                   → Obtener un proyecto por ID
PATCH  /:id                   → Editar proyecto (con imagen)
DELETE /:id                   → Eliminar proyecto
```

### Búsqueda

```
GET    /                     → Buscar contenido
```

### Usuarios

```
GET    /me                   → Obtener perfil del usuario autenticado
PATCH  /:id                  → Editar usuario (con avatar)
GET    /:id                  → Obtener usuario por ID
```

---

Notas:

- Todas las rutas excepto login y register requieren token JWT.
- Las rutas con subida de archivos usan `multer`.
- Las variables de entorno están preconfiguradas en `docker-compose.yml`, con soporte para `.env`.



---

## Inicialización de la Base de Datos

Se incluye un servicio especial llamado `seed_db`, encargado de ejecutar un script de inicialización que carga datos básicos en la base de datos. Este servicio solo debe ejecutarse una vez:

```bash
docker-compose run seed_db
```

Este script crea usuarios de prueba y otros datos necesarios para comenzar a utilizar la aplicación de inmediato.

### Usuarios de prueba

Puedes iniciar sesión en la aplicación con cualquiera de los siguientes usuarios:

- Usuario: AliceSmith  
- Usuario: BobJohnson  
- Usuario: CarolWhite  

**Contraseña para todos:** `123456`

### Acceso a Mongo Express

Credenciales por defecto para Mongo Express:

- Usuario: `admin`  
- Contraseña: `123456`

---

