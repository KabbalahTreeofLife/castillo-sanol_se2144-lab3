import express from 'express';
import customerRoutes from './routes/customerRoutes';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use('/api/v1/customers', customerRoutes);

app.listen(PORT, () => {
  console.log(`Customer API server running on http://localhost:${PORT}`);
});