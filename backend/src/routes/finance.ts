import { Router } from 'express';
import prisma from '../prisma';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
router.use(authenticate);

// Add expense
router.post('/expenses', async (req, res) => {
  try {
    const { projectId, phaseId, amount, description } = req.body;
    const expense = await prisma.expense.create({
      data: { projectId, phaseId: phaseId || null, amount: parseFloat(amount), description }
    });
    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add expense' });
  }
});

// Get finances for dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: { expenses: true }
    });

    const data = projects.map(p => {
      const totalExpenses = p.expenses.reduce((sum, exp) => sum + exp.amount, 0);
      return {
        projectId: p.id,
        projectName: p.name,
        budget: p.budget || 0,
        totalExpenses,
        variance: (p.budget || 0) - totalExpenses
      };
    });

    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

export default router;
