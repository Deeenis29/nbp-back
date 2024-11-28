import express, { Application } from "express";
import dotenv from "dotenv";
import productosRouter from "./routes/products";
import cors from 'cors';

dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());
// Rutas
app.use("/api/productos", productosRouter);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
