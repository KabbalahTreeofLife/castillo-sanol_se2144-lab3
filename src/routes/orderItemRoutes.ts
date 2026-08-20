import { Router, Request, Response } from "express";
import { pool } from "../db";
import { Order } from "../types";

const router = Router();

//GET customers orders
router.get("/customers/:id/orders", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const query = "SELECT * FROM orders WHERE customer_id = $1";
    const result = await pool.query(query, [id]);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});
