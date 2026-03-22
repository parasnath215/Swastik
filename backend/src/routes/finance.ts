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
      include: { 
        expenses: true,
        phases: { include: { tasks: true } }
      }
    });

    const data = projects.map(p => {
      let taskCost = 0;
      p.phases.forEach((phase: any) => {
        phase.tasks.forEach((task: any) => { taskCost += (task.actualCost || 0); });
      });
      const totalExpenses = p.expenses.reduce((sum: number, exp: any) => sum + exp.amount, 0) + taskCost;
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
