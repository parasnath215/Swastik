import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import projectRoutes from './routes/projects';
import phaseRoutes from './routes/phases';
import schedulerRoutes from './routes/scheduler';
import financeRoutes from './routes/finance';
import resourceRoutes from './routes/resources';
import userRoutes from './routes/users';

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
app.use('/api/users', userRoutes);

import path from 'path';
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', time: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`SSMS Backend running on port ${PORT}`);

  // Keep-alive self-pinger for Render Free Tier
  const RENDER_URL = process.env.RENDER_EXTERNAL_URL;
  if (RENDER_URL) {
    console.log(`Render environment detected. Starting self-pinger to keep-alive: ${RENDER_URL}`);
    // Ping self every 10 minutes (600,000 ms) to prevent sleeping
    setInterval(() => {
      fetch(`${RENDER_URL}/health`)
        .then((res) => console.log(`Self-ping keep-alive status: ${res.status}`))
        .catch((err) => {
          // Check if err is an object and has a message property
          const errMsg = err instanceof Error ? err.message : String(err);
          console.error('Self-ping keep-alive failed:', errMsg);
        });
    }, 600000);
  }
});
