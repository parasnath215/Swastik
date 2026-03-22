import { Router } from 'express';
import prisma from '../prisma';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticate);

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: { phases: { include: { resources: true } } }
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Create project
router.post('/', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'SALES'), async (req, res) => {
  try {
    const { name, phone, address, dimensions, budget } = req.body;
    const project = await prisma.project.create({
      data: { 
        name, 
        phone, 
        address, 
        dimensions, 
        budget: parseFloat(budget), 
        status: 'LEAD',
        phases: {
          create: [
            { name: 'Machine', order: 1, status: 'PENDING' },
            { name: 'Processes', order: 2, status: 'PENDING' }
          ]
        }
      },
      include: { phases: { include: { resources: true } } }
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});
// Delete project
router.delete('/:id', authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});

// Update project status
router.patch('/:id/status', authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { status } = req.body;
    const project = await prisma.project.update({
      where: { id: req.params.id as string },
      data: { status }
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project status' });
  }
});

export default router;
