import { Router, Request, Response } from 'express';
import { pool } from '../db';
import { Vendor } from '../types';

const router = Router();

// GET /api/v1/vendors
router.get('/', async (req: Request, res: Response) => {

    try {
        const result = await pool.query('SELECT * FROM vendor');
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// GET /api/v1/supplies/vendor/:vendorId
router.get('/vendor/:vendorId', async (req: Request, res: Response) => {
    const { vendor_id } = req.params;

    try {
        const result = await pool.query<Vendor>(`SELECT * FROM vendor WHERE vendor_id = $1`, [vendor_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Vendor not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

// PUT /api/v1/supplies/:vendorId/:productId
router.put('/:vendorId/:productId', async (req: Request, res: Response) => {
    const { vendor_id, product_id } = req.params;
    const { unit_price, stock_quantity } = req.body;

    try {
        const result = await pool.query(`UPDATE supplies SET unit_price = $1, stock_quantity = $2 WHERE vendor_id = $3 AND product_id = $4 RETURNING *`, [unit_price, stock_quantity, vendor_id, product_id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Supply not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: (error as Error).message });
    }
});

export default router;