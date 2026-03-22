import { Router } from 'express';
import prisma from '../prisma';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();
router.use(authenticate);

// --- MACHINES ---
router.get('/machines', async (req, res) => {
  try {
    const data = await prisma.machine.findMany();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch machines' });
  }
});

router.post('/machines', authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { name, description, hourlyRate } = req.body;
    const data = await prisma.machine.create({ data: { name, description, hourlyRate: hourlyRate ? parseFloat(hourlyRate) : 0 } });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create machine' });
  }
});

router.patch('/machines/:id', authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { name, description, hourlyRate } = req.body;
    const updateData: any = { name, description };
    if (hourlyRate !== undefined) updateData.hourlyRate = parseFloat(hourlyRate);
    const data = await prisma.machine.update({ where: { id: req.params.id as string }, data: updateData });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update machine' });
  }
});

router.delete('/machines/:id', authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    await prisma.machine.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete machine' });
  }
});

// --- PROCESSES ---
router.get('/processes', async (req, res) => {
  try {
    const data = await prisma.process.findMany();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch processes' });
  }
});

router.post('/processes', authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { name, description } = req.body;
    const data = await prisma.process.create({ data: { name, description } });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create process' });
  }
});

router.patch('/processes/:id', authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { name, description } = req.body;
    const data = await prisma.process.update({ where: { id: req.params.id as string }, data: { name, description } });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update process' });
  }
});

router.delete('/processes/:id', authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    await prisma.process.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete process' });
  }
});

// --- MATERIALS ---
router.get('/materials', async (req, res) => {
  try {
    const data = await prisma.material.findMany();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch materials' });
  }
});

router.post('/materials', authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { name, description, unitCost } = req.body;
    const data = await prisma.material.create({ data: { name, description, unitCost: unitCost ? parseFloat(unitCost) : 0 } });
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create material' });
  }
});

router.patch('/materials/:id', authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { name, description, unitCost } = req.body;
    const updateData: any = { name, description };
    if (unitCost !== undefined) updateData.unitCost = parseFloat(unitCost);
    const data = await prisma.material.update({ where: { id: req.params.id as string }, data: updateData });
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update material' });
  }
});

router.delete('/materials/:id', authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    await prisma.material.delete({ where: { id: req.params.id as string } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete material' });
  }
});

export default router;
