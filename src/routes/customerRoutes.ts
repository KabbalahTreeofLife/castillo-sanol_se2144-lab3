import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { Customer } from '../types';

const router = Router();

// GET /api/v1/customers
router.get('/', async (_req: Request, res: Response) => {

    try {
        const result = await pool.query('SELECT * FROM customer');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// GET /api/v1/customers/:id
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

// POST /api/v1/customers
router.post('/', async (req: Request, res: Response) => {
    const { customer_id, customer_name, city, membership_level }: Customer = req.body;

    if (!customer_id || !customer_name) {
        return res.status(400).json({ error: 'customer_id and customer_name are required' });
    }

    try {
        const result = await pool.query<Customer>(`INSERT INTO customer (customer_id, customer_name, city, membership_level) VALUES ($1, $2, $3, $4) RETURNING *`, [customer_id, customer_name, city, membership_level]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// PUT /api/v1/customers/:id
router.put('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { city, membership_level }: Partial<Customer> = req.body;

    if (city === undefined && membership_level === undefined) {
        return res.status(400).json({ error: 'Provide city and/or membership_level to update' });
    }

    try {
        const result = await pool.query<Customer>(
            `UPDATE customer SET city = COALESCE($1, city), membership_level = COALESCE($2, membership_level) WHERE customer_id = $3 RETURNING *`,
            [city ?? null, membership_level ?? null, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// DELETE /api/v1/customers/:id
router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await pool.query(`DELETE FROM customer WHERE customer_id = $1 RETURNING *`, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Customer not found' });
        }
        res.json({ message: 'Customer deleted successfully' });
    } catch (error) {
        if ((error as { code?: string }).code === '23503') {
            return res.status(400).json({ error: 'Customer has existing orders and cannot be deleted' });
        }
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;