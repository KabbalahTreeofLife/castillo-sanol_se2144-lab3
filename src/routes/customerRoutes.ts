import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { Customer } from '../types';

const router = Router();

// GET ALL customers
router.get('/', async (_req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM customer');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// GET customer by ID
router.get("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await pool.query<Customer>('SELECT * FROM customer WHERE customer_id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Customer not found' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

// POST a new customer
router.post('/', async (req: Request, res: Response) => {
    const { customer_id, customer_name, city, membership_level }: Customer = req.body;

    try {
        const result = await pool.query<Customer>(`INSERT INTO customer (customer_id, customer_name, city, membership_level) VALUES ($1, $2, $3, $4) RETURNING *`, [customer_id, customer_name, city, membership_level]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// PUT (update) a customer by ID
router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { city, membership_level }: Customer = req.body;

    try {
        const result = await pool.query<Customer>(`UPDATE customer SET city = $1, membership_level = $2 WHERE customer_id = $3 RETURNING *`, [city, membership_level, id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// DELETE a customer by ID
router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await pool.query(`DELETE FROM customer WHERE customer_id = $1 RETURNING *`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;