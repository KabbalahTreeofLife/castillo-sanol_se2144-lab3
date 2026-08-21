import { Router, Request, Response } from 'express';
import { pool } from '../db';

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

export default router;