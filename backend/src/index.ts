import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import phaseRoutes from './routes/phases';
import schedulerRoutes from './routes/scheduler';
import financeRoutes from './routes/finance';
import resourceRoutes from './routes/resources';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/phases', phaseRoutes);
app.use('/api/scheduler', schedulerRoutes);
app.use('/api/finance', financeRoutes);
app.use('/api/resources', resourceRoutes);

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`SSMS Backend running on port ${PORT}`);
});
