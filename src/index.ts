import express from 'express';
import customerRoutes from './routes/customerRoutes';
import productRoutes from './routes/productRoutes';
import orderRoutes from './routes/orderRoutes';
import orderItemRoutes from './routes/orderItemRoutes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/order-items', orderItemRoutes);

app.listen(PORT, () => {
  console.log(`API server running on http://localhost:${PORT}`);
});