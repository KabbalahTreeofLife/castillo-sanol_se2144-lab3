import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { Product } from '../types';

const router = Router();

// GET all products (optional ?category= filter)
router.get('/', async (req: Request, res: Response) => {
    const category = req.query.category as string | undefined;

    try {
        if (category) {
            const result = await pool.query<Product>('SELECT * FROM product WHERE category = $1', [category]);
            return res.json(result.rows);
        }
        const result = await pool.query('SELECT * FROM product');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// GET product by ID
router.get('/:id', async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        const result = await pool.query<Product>('SELECT * FROM product WHERE product_id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// POST a new product
router.post('/', async (req: Request, res: Response) => {
    const { product_id, product_name, category, unit_price }: Product = req.body;

    try {
        const result = await pool.query<Product>(
            'INSERT INTO product (product_id, product_name, category, unit_price) VALUES ($1, $2, $3, $4) RETURNING *',
            [product_id, product_name, category, unit_price]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        if ((error as { code?: string }).code === '23505') {
            return res.status(400).json({ error: 'Product ID already exists' });
        }
        res.status(500).json({ error: (error as Error).message });
    }
});

// PATCH (update) a product's price by ID
router.patch('/:id/price', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { unit_price }: Product = req.body;

    if (typeof unit_price !== 'number') {
        return res.status(400).json({ error: 'unit_price must be a number' });
    }

    try {
        const result = await pool.query<Product>(
            'UPDATE product SET unit_price = $1 WHERE product_id = $2 RETURNING *',
            [unit_price, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;
