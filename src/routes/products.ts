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

// Obtener un producto por ID
router.get("/:id", (async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Obtener producto y sus valoraciones
    const result = await pool.query(
      `SELECT 
        p.*,
        COALESCE(AVG(v.calificacion), 0) as valoracion_promedio,
        COALESCE(COUNT(v.id), 0) as total_valoraciones,
        json_agg(
          json_build_object(
            'id', v.id,
            'usuario', v.usuario,
            'comentario', v.comentario,
            'calificacion', v.calificacion,
            'fecha', v.fecha
          )
        ) FILTER (WHERE v.id IS NOT NULL) as valoraciones
      FROM productos p
      LEFT JOIN valoraciones v ON p.id = v.producto_id
      WHERE p.id = $1
      GROUP BY p.id`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    // Formatear la respuesta
    const producto = result.rows[0];
    const response = {
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      descripcion: producto.descripcion,
      imagen: producto.imagen,
      stock: producto.stock,
      sku: producto.sku,
      categoria: producto.categoria,
      presentaciones: ["Barra x 80g"],
      caracteristicas: [
        "Jabón elaborado a base de componentes naturales",
        "Extracto de aloe vera",
        "Ácido láctico",
        "Ácido glicólico",
        "Vitamina E"
      ],
      valoracion_promedio: parseFloat(producto.valoracion_promedio),
      total_valoraciones: parseInt(producto.total_valoraciones),
      valoraciones: producto.valoraciones || []
    };

    res.json(response);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al obtener el producto" });
  }
}) as RequestHandler);

export default router;
