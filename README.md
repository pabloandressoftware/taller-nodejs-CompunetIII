### Proyecto desplegado: 
https://taller-nodejs-pabloguzman.vercel.app/

# API RESTful de Gestión de Películas y Reseñas

##  Descripción del Proyecto

API RESTful desarrollada con Node.js, Express y MongoDB que implementa un sistema de gestión de películas y reseñas con autenticación y autorización de usuarios. El proyecto cumple con los requisitos de tener dos módulos interrelacionados:

- **Módulo 1 - Gestión de Películas**: Los administradores pueden crear películas. Todos los usuarios pueden visualizar películas públicamente. Los propietarios y administradores pueden modificar y eliminar películas.
- **Módulo 2 - Gestión de Reseñas**: Los usuarios autenticados pueden crear, visualizar, modificar y eliminar reseñas asociadas a películas específicas.

### Características Principales

 **Autenticación y Autorización**
- Registro e inicio de sesión de usuarios
- Autenticación mediante JWT (JSON Web Tokens)
- Middleware de autenticación para proteger rutas

 **Gestión de Películas (CRUD Completo)**
- Crear películas (solo administradores)
- Listar todas las películas (público)
- Buscar películas por ID, título o género (público)
- Actualizar películas (solo propietario o administrador)
- Eliminar películas (solo propietario o administrador)

 **Gestión de Reseñas (CRUD Completo)**
- Crear reseñas para películas existentes (requiere autenticación)
- Validación de existencia de película y usuario
- Listar todas las reseñas (requiere autenticación)
- Obtener reseña por ID (requiere autenticación)
- Actualizar reseñas (solo propietario o administrador)
- Eliminar reseñas (solo propietario o administrador)
- Relación bidireccional con películas

 **Interrelación entre Módulos**
- Las películas mantienen un array de referencias a sus reseñas
- Las reseñas están vinculadas a una película específica mediante `movieId`
- Al crear una reseña, se actualiza automáticamente la película correspondiente
- Uso de `ObjectId` de MongoDB para referencias entre colecciones

---

##  Tecnologías Utilizadas

- **Runtime**: Bun v1.2.21
- **Framework**: Express.js v5.1.0
- **Base de Datos**: MongoDB v6.20.0 con Mongoose v8.18.2
- **Autenticación**: JWT (jsonwebtoken v9.0.2) + Bcrypt v6.0.0
- **Lenguaje**: TypeScript v5
- **Testing**: Jest v30.2.0
- **Variables de Entorno**: dotenv v17.2.2

---

##  Estructura del Proyecto

```
taller-nodejs-CompunetIII/
├── src/
│   ├── controllers/       # Controladores de rutas
│   │   ├── movie.controller.ts
│   │   ├── review.controller.ts
│   │   └── user.controller.ts
│   ├── models/           # Modelos de Mongoose
│   │   ├── movie.model.ts
│   │   ├── review.model.ts
│   │   └── user.model.ts
│   ├── services/         # Lógica de negocio
│   │   ├── movie.service.ts
│   │   ├── review.service.ts
│   │   └── user.service.ts
│   ├── routes/           # Definición de rutas
│   │   ├── movie.routes.ts
│   │   ├── review.routes.ts
│   │   └── user.routes.ts
│   ├── middlewares/      # Middlewares personalizados
│   │   └── auth.middleware.ts
│   ├── interfaces/       # Interfaces TypeScript
│   │   ├── movies.interface.ts
│   │   └── reviews.interface.ts
│   │   └── users.interface.ts
│   └── lib/              # Utilidades
│       └── db.ts         # Conexión a MongoDB
├── tests/                # Tests unitarios
├── index.ts              # Punto de entrada
├── package.json
├── tsconfig.json
└── README.md
```

---

##  Configuración del Proyecto

### Prerrequisitos

- [Bun](https://bun.sh/) v1.2.21 o superior
- MongoDB Atlas o instancia local de MongoDB
- Node.js v18+ (opcional, si no usas Bun)

### Instalación

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd taller-nodejs-CompunetIII
```

2. **Instalar dependencias**
```bash
bun install
```

3. **Configurar variables de entorno**

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# Base de datos
DATABASE_URL=mongodb+srv://usuario:password@cluster.mongodb.net/nombre-db?retryWrites=true&w=majority
```

4. **Compilar TypeScript**
```bash
bun run dev
```

---

##  Ejecución del Proyecto

### Modo Desarrollo
```bash
bun run dev
```

El servidor estará disponible en: `http://localhost:8080`

### Ejecutar Tests
```bash
# Ejecutar todos los tests
bun test

# Ejecutar tests en modo watch
bun test:watch

# Generar reporte de cobertura
bun test:coverage
```

---

##  Endpoints de la API

### **Flujo de Trabajo Completo**

A continuación se presenta el flujo completo de trabajo de la API con ejemplos prácticos de uso:

---

## **1. Autenticación y Gestión de Usuarios**

### **Login Admin** - `POST /api/v1/user/login`
- **Propósito**: El administrador se autentica para obtener permisos completos
- **Resultado**: Token JWT con role "admin"

### **Create User** - `POST /api/v1/user/`
- **Propósito**: Admin crea usuario que trabajará con reviews
- **Permisos**: Solo admin puede crear usuarios

### **Create User Alternative** - `POST /api/v1/user/`
- **Propósito**: Admin crea segundo usuario para verificar autorización
- **Uso**: Demostrar que usuarios no pueden editar/eliminar reviews ajenas

### **Login User** - `POST /api/v1/user/login`
- **Propósito**: Usuario principal obtiene su token JWT

### **Login User Alternative** - `POST /api/v1/user/login`

- **Propósito**: Usuario alternativo obtiene su token JWT

---

## **2. Gestión de Películas**

### **Create Movie** - `POST /api/v1/movies/`
- **Propósito**: Admin crea película de Avengers para las demos
- **Token**: Admin token requerido

### **Get All Movies** - `GET /api/v1/movies/`
- **Propósito**: Obtiene todas las películas disponibles
- **Permisos**: Público (sin autenticación)
- **Incluye**: Información del usuario creador y reseñas

### **Search Movie by Name** - `GET /api/v1/movies/search/title?title=avengers`
- **Propósito**: Busca películas por título (case-insensitive)
- **Resultado**: Encuentra la película "Avengers" creada anteriormente
- **Permisos**: Público

### **Search Movie by Genre** - `GET /api/v1/movies/search/genre?genre=action`
- **Propósito**: Muestra todas las películas del género "Action"
- **Resultado**: Lista todas las películas de acción incluyendo Avengers
- **Permisos**: Público

---

## **3. Gestión de Reseñas**

### **Create Review** - `POST /api/v1/review/`
- **Propósito**: Usuario crea reseña sobre Avengers
- **Token**: Usuario token requerido
- **Validación**: Verifica que la película existe

### **List Reviews** - `GET /api/v1/review/`
- **Propósito**: Muestra todas las reseñas de Avengers y otras películas
- **Permisos**: Requiere autenticación
- **Incluye**: Información del usuario y película asociada

### **Get Review by ID** - `GET /api/v1/review/:id`
- **Propósito**: Obtiene una reseña específica por su ID
- **Permisos**: Requiere autenticación
- **Incluye**: Detalles completos de la reseña

---

## **4. Gestión de Perfiles**

### **Get Profile** - `GET /api/v1/user/profile/:email`
- **Propósito**: Obtiene el perfil del usuario
- **Ejemplo**: `/api/v1/user/profile/usuarioDelete22@ejemplo.com`
- **Permisos**: Propietario del perfil o admin

---

## **5. Operaciones de Actualización**

### **Update User** - `PUT /api/v1/user/:email`
- **Propósito**: Admin modifica información del usuario
- **Token**: Admin token requerido

### **Update Movie Admin** - `PUT /api/v1/movies/:id`
- **Propósito**: Admin cambia título de la película
- **Resultado**: Exitoso - Admin tiene permisos

### **Update Movie User** - `PUT /api/v1/movies/:id`
- **Propósito**: Usuario intenta cambiar título
- **Resultado**: 403 Forbidden - Usuario no tiene permisos

### **Update Review User** - `PUT /api/v1/review/:id`
- **Propósito**: Usuario modifica su propia reseña
- **Token**: Usuario propietario token
- **Resultado**: Exitoso

### **Update Review Admin** - `PUT /api/v1/review/:id`
- **Propósito**: Admin modifica cualquier reseña
- **Token**: Admin token
- **Resultado**: Exitoso - Admin tiene permisos globales

### **Update Review Alternative User** - `PUT /api/v1/review/:id`

- **Propósito**: Usuario no autor intenta editar reseña
- **Token**: Usuario alternativo token
- **Resultado**: 403 Forbidden - No es propietario

---

## **6. Operaciones de Eliminación**

### **Delete Review Alternative User** - `DELETE /api/v1/review/:id`
- **Propósito**: Usuario intenta eliminar reseña ajena
- **Token**: Usuario alternativo token
- **Resultado**: 403 Forbidden - No es propietario

### **Delete Review Admin** - `DELETE /api/v1/review/:id`
- **Propósito**: Admin elimina una reseña
- **Token**: Admin token
- **Resultado**: Exitoso - Admin puede eliminar cualquier reseña

### **Delete Review User** - `DELETE /api/v1/review/:id`
- **Propósito**: Usuario intenta eliminar su reseña ya eliminada
- **Token**: Usuario propietario token
- **Resultado**: 404 Not Found - Reseña ya fue eliminada previamente

### **Delete Movie User** - `DELETE /api/v1/movies/:id`
- **Propósito**: Usuario intenta eliminar película
- **Token**: Usuario token
- **Resultado**: 403 Forbidden - Solo admin puede eliminar películas

### **Delete Movie Admin** - `DELETE /api/v1/movies/:id`
- **Propósito**: Admin elimina la película
- **Token**: Admin token
- **Resultado**: Exitoso - Película eliminada

### **Delete User** - `DELETE /api/v1/user/:email`
- **Propósito**: Admin elimina un usuario
- **Ejemplo**: `DELETE /api/v1/user/usuarioDelete22@ejemplo.com`
- **Token**: Admin token
- **Resultado**: Usuario eliminado del sistema

---

### Hay dos archivos de Postman, uno para la colección y el otro para el Environment con las variables utilizadas
### Tener en cuenta, que si falla un ruta puede ser por varias causas:
- Que el token no sea válido
- Que el usuario no tenga permisos para realizar la operación
- Que el usuario no exista
- Que la película no exista
- Que la reseña no exista

**Validaciones:**
- El `movieId` debe existir en la base de datos
- El `userId` se obtiene automáticamente del token JWT
- El sistema valida que tanto la película como el usuario existan antes de crear la reseña


##  Interrelación entre Módulos

### Relación Películas ↔ Reseñas

1. **De Películas a Reseñas**: Cada película mantiene un array de `ObjectId` que referencian a sus reseñas.
   ```typescript
   reviews: [{ 
     type: mongoose.Schema.Types.ObjectId, 
     ref: 'Review' 
   }]
   ```

2. **De Reseñas a Películas**: Cada reseña tiene un campo `movieId` que referencia a la película.
   ```typescript
   movieId: { 
     type: mongoose.Schema.Types.ObjectId, 
     ref: 'Movie',
     required: true 
   }
   ```

3. **Actualización Automática**: Al crear una reseña, el sistema automáticamente:
   - Valida que la película existe
   - Crea la reseña
   - Actualiza el array de reseñas de la película

---

##  Testing

El proyecto incluye **pruebas unitarias completas** desarrolladas con **Jest** para garantizar la calidad del código.

###  Cobertura de Tests

| Módulo | Componentes | Tests | Estado |
|--------|-------------|-------|--------|
| **Movies** | Controlador, Servicio, Modelo | 50+ | ✅ |
| **Reviews** | Controlador, Servicio, Modelo | 49 | ✅ |
| **Users** | Controlador, Servicio, Modelo | 40+ | ✅ |
| **Middlewares** | Auth | 10+ | ✅ |

###  Tests del Módulo Review (Recién Implementados)

Se han desarrollado **49 pruebas unitarias** completas para el módulo de Review:

- **Controlador** (`review.controller.test.ts`): 24 tests
  - Validación de autenticación y permisos
  - CRUD completo con casos edge
  - Manejo de errores específicos

- **Servicio** (`review.service.test.ts`): 14 tests
  - Validación de existencia de Movie y User
  - Operaciones de base de datos
  - Manejo de errores

- **Modelo** (`review.model.test.ts`): 11 tests
  - Validación de schema
  - Tipos y referencias
  - Validaciones de negocio

###  Comandos de Testing

```bash
# Ejecutar todos los tests
bun test

# Ejecutar solo tests de review
bun test -- --testPathPattern=review

# Ver cobertura completa
bun test:coverage

# Modo watch (desarrollo)
bun test:watch
```
## Dificultades Encontradas

### Dificultades Encontradas

1. **Manejo de Referencias con ObjectId**
   - Inicialmente se usaban strings para las referencias, lo que causaba problemas con `populate()`
   - Solución: Migrar todos los campos de referencia a `mongoose.Schema.Types.ObjectId`

2. **Sincronización entre Colecciones**
   - Mantener sincronizadas las reseñas en la colección de películas requirió lógica adicional
   - Se implementó un sistema de actualización automática al crear reseñas

##  Notas Adicionales

- El proyecto usa **Bun** como runtime, pero puede ejecutarse con Node.js si es necesario
- La base de datos está alojada en **MongoDB Atlas**
- Las contraseñas se hashean con **bcrypt** antes de almacenarse
- Todos los timestamps (`createdAt`, `updatedAt`) se generan automáticamente

---

##  Autores

- Juan Pablo Parra
- Thomas Brueck
- Daniel Gonzalez
- Pablo Guzman

---