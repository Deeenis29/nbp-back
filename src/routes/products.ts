import { Router, Request, Response } from "express";
import { RequestHandler } from 'express';
import pool from "../config/db";

const router = Router();

// Obtener todos los productos
router.get("/", (async (_req: Request, res: Response) => {
  try {
    const result = await pool.query("SELECT * FROM productos");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener productos" });
  }
}) as RequestHandler);

// Crear un producto
router.post("/", (async (req: Request, res: Response) => {
  const { nombre, precio, descripcion, image, stock, sku, categoria  } = req.body;

  if (!nombre || !precio || !descripcion || !image || !stock || !sku || !categoria) {
    return res.status(400).json({ error: "Rellene todo los datos, porque son importantes" });
  }

  try {
    const result = await pool.query(
      "INSERT INTO productos (nombre, precio, descripcion, image, stock, sku, categoria) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *",
      [nombre, precio, descripcion, image, stock, sku, categoria]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Error al crear producto" });
  }
}) as RequestHandler);

// Obtener productos más vendidos/mejor valorados
router.get("/mas-vendidos", (async (_req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT p.*, 
        COALESCE(AVG(v.calificacion), 0) as valoracion_promedio,
        COALESCE(COUNT(v.id), 0) as total_valoraciones
       FROM productos p 
       LEFT JOIN valoraciones v ON p.id = v.producto_id
       GROUP BY p.id, p.nombre, p.precio, p.descripcion, p.imagen, p.stock, p.sku, p.categoria, p.creado_en
       ORDER BY valoracion_promedio DESC, total_valoraciones DESC
       LIMIT 10`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener productos más valorados" });
  }
}) as RequestHandler);

export default router;
