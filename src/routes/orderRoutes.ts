import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { Order } from '../types';

const router = Router();

// GET all orders
router.get('/', async (_req: Request, res: Response) => {
    try {
        const result = await pool.query('SELECT * FROM orders');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// GET all orders for a specific customer (no JOIN)
router.get('/customer/:customerId', async (req: Request, res: Response) => {
    const { customerId } = req.params;

    try {
        const result = await pool.query<Order>('SELECT * FROM orders WHERE customer_id = $1', [customerId]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// POST a new order
router.post('/', async (req: Request, res: Response) => {
    const { order_id, customer_id, order_date, shipping_city }: Order = req.body;

    try {
        const result = await pool.query<Order>(
            'INSERT INTO orders (order_id, customer_id, order_date, shipping_city) VALUES ($1, $2, $3, $4) RETURNING *',
            [order_id, customer_id, order_date, shipping_city]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        const code = (error as { code?: string }).code;
        if (code === '23505') {
            return res.status(400).json({ error: 'Order ID already exists' });
        }
        if (code === '23503') {
            return res.status(400).json({ error: 'Customer not found' });
        }
        res.status(500).json({ error: (error as Error).message });
    }
});

// DELETE an order by ID
router.delete('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM orders WHERE order_id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json({ message: 'Order deleted successfully' });
    } catch (error) {
        if ((error as { code?: string }).code === '23503') {
            return res.status(400).json({ error: 'Order has line items and cannot be deleted' });
        }
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;
