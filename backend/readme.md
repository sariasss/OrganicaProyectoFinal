# API Documentation - Endpoints & Examples

## 🔐 Autenticación

### Registro de Usuario
```http
POST /api/auth/register
Content-Type: application/json

{
    "username": "usuario123",
    "email": "usuario@email.com",
    "password": "contraseña123"
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/json

{
    "username": "usuario123",
    "password": "contraseña123"
}
```

## 👤 Usuarios

### Obtener Perfil
```http
GET /api/users/me
Authorization: Bearer {token}
```

### Actualizar Perfil
```http
PUT /api/users/me
Authorization: Bearer {token}
Content-Type: application/json

{
    "username": "nuevoNombre",
    "theme": "dark"
}
```

## 📁 Proyectos

### Crear Proyecto
```http
POST /api/projects
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form-Data:
- title: "Mi Proyecto"
- description: "Descripción del proyecto"
- coverImage: [archivo de imagen] (opcional)

{
    "title": "proyecto 1",
    "description": "dark"
}
```

### Obtener Proyectos
```http
GET /api/projects
Authorization: Bearer {token}
```

### Obtener Proyecto Específico
```http
GET /api/projects/{projectId}
Authorization: Bearer {token}
```

### Actualizar Proyecto
```http
PUT /api/projects/{projectId}
Authorization: Bearer {token}
Content-Type: multipart/form-data

Form-Data:
- title: "Nuevo Título"
- description: "Nueva descripción"
- coverImage: [archivo de imagen] (opcional)
```

### Eliminar Proyecto
```http
DELETE /api/projects/{projectId}
Authorization: Bearer {token}
```

## 📄 Páginas

### Crear Página
```http
POST /api/pages
Authorization: Bearer {token}
Content-Type: application/json

{
    "projectId": "project123",
    "title": "Nueva Página"
}
```

### Obtener Páginas
```http
GET /api/pages?projectId=project123
Authorization: Bearer {token}
```

### Actualizar Página
```http
PUT /api/pages/{pageId}
Authorization: Bearer {token}
Content-Type: application/json

{
    "title": "Título Actualizado"
}
```

### Eliminar Página
```http
DELETE /api/pages/{pageId}
Authorization: Bearer {token}
```

## 📝 Contenido

### Crear Bloque
```http
POST /api/content
Authorization: Bearer {token}
Content-Type: application/json

{
    "pageId": "page123",
    "type": "text",
    "content": "Contenido del bloque",
    "order": 1
}
```

### Obtener Bloque
```http
GET /api/content/{blockId}
Authorization: Bearer {token}
```

### Actualizar Bloque
```http
PUT /api/content/{blockId}
Authorization: Bearer {token}
Content-Type: application/json

{
    "content": "Nuevo contenido",
    "order": 2
}
```

### Eliminar Bloque
```http
DELETE /api/content/{blockId}
Authorization: Bearer {token}
```

## 🔑 Permisos

### Crear Permiso
```http
POST /api/permissions
Authorization: Bearer {token}
Content-Type: application/json

{
    "projectId": "project123",
    "userId": "user123",
    "rol": "editor"
}
```

### Obtener Permisos del Proyecto
```http
GET /api/permissions/{projectId}
Authorization: Bearer {token}
```

### Eliminar Permiso
```http
DELETE /api/permissions/{permissionId}
Authorization: Bearer {token}
```

## 🔍 Búsqueda

### Buscar Contenido
```http
GET /api/search?query=término
Authorization: Bearer {token}
```

## ✉️ Invitaciones

### Crear Invitación
```http
POST /api/invitations
Authorization: Bearer {token}
Content-Type: application/json

{
    "email": "invitado@email.com",
    "projectId": "project123",
    "rol": "editor"
}
```

### Aceptar/Rechazar Invitación
```http
PUT /api/invitations/{token}
Content-Type: application/json

{
    "status": "accepted" // o "rejected"
}
```

## Códigos de Respuesta

- `200`: Operación exitosa
- `201`: Recurso creado
- `400`: Error en la solicitud
- `401`: No autorizado
- `403`: Prohibido
- `404`: No encontrado
- `500`: Error del servidor