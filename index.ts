import express, { Express } from "express";
import dotenv from "dotenv";
import { connectDB } from "./src/lib/db";
import { reviewRouter } from "./src/routes/review.routes";
import { playlistRouter } from "./src/routes/playlist.routes";
import { userRouter } from "./src/routes/user.routes";

// Cargar variables de entorno
dotenv.config();

// Verificar que las variables de entorno se cargaron correctamente
console.log("🔧 Environment variables loaded:");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "✅ Loaded" : "❌ Not found");
console.log("PORT:", process.env.PORT || "8080 (default)");

const app: Express = express();

const port: number = parseInt(process.env.PORT || "8080");

// Middleware
app.use(express.urlencoded({ extended: false}));
app.use(express.json());

// Rutas
app.use('/api/v1/playlist', playlistRouter);
app.use('/api/v1/review', reviewRouter);
app.use('/api/v1/user', userRouter);

// Ruta de prueba
app.get('/', (req, res) => {
    res.json({ 
        message: 'API de Películas funcionando',
        version: '1.0.0',
        endpoints: {
            movies: '/api/v1/playlist',
            reviews: '/api/v1/review',
            users: '/api/v1/user'
        }
    });
});

// Conectar a la base de datos y iniciar servidor
const startServer = async () => {
    try {
        await connectDB();
        app.listen(port, () => {
            console.log(`🚀 Server running on port: ${port}`);
            console.log(`📱 API available at: http://localhost:${port}`);
        });
    } catch (error) {
        console.error('❌ Error starting server:', error);
        process.exit(1);
    }
};

startServer();