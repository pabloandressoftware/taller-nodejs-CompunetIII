import { Router } from "express";
import { userController } from "../controllers/user.controller";
import { auth, authorizeRoles } from "../middlewares/auth.middleware";

export const userRouter = Router();

// Ruta para obtener todos los usuarios
userRouter.get('/', auth, authorizeRoles(['admin']), userController.getAllUsers);

// Ruta para crear un nuevo usuario
userRouter.post('/',auth, authorizeRoles(['admin']),userController.createUser); // El taller dice que solo los superadmin pueden crear usuarios
// pero no deberia tambien crear un usario normal?

// Ruta para login
userRouter.post('/login', userController.login);

// Ruta para obtener usuario por email (usando POST para enviar el email en el body)
userRouter.post('/email', userController.getByEmail);

// Ruta para obtener el perfil de un usuario por email
userRouter.get('/:email', userController.getUserProfile);

// Ruta para actualizar un usuario por email
userRouter.put('/:email', auth, authorizeRoles(['admin']), userController.updateUser);

// Ruta para eliminar un usuario por email
userRouter.delete('/:email', auth, authorizeRoles(['admin']), userController.deleteUser);
