import { Router } from 'express';
import prisma from '../prisma';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();
router.use(authenticate);

// Create phase
router.post('/', authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { projectId, name, order } = req.body;
    const phase = await prisma.phase.create({
      data: { projectId, name, order: parseInt(order), status: 'PENDING' }
    });
    res.status(201).json(phase);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create phase' });
  }
});

// Update phase status (FSM logic)
router.patch('/:id/status', authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const phase = await prisma.phase.findUnique({ where: { id } });
    if (!phase) {
      res.status(404).json({ error: 'Phase not found' });
      return;
    }

    // FSM Logic: Phase N+1 cannot begin until Phase N is ACCEPTED
    if (status === 'IN_PROGRESS') {
      const prevPhase = await prisma.phase.findFirst({
        where: { projectId: phase.projectId, order: phase.order - 1 }
      });

      if (prevPhase && prevPhase.status !== 'ACCEPTED') {
         res.status(400).json({ error: 'Previous phase is not accepted yet' });
         return;
      }
    }

    const updatedPhase = await prisma.phase.update({
      where: { id },
      data: { status },
    });

    res.json(updatedPhase);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update phase status' });
  }
});

// Add a resource row to a phase
router.post('/:id/resources', authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { machineId, processId, materialId } = req.body;
    const resource = await prisma.phaseResource.create({
      data: {
        phaseId: req.params.id as string,
        machineId,
        processId,
        materialId
      }
    });
    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add resource row' });
  }
});

// Update a resource row
router.patch('/resources/:resId', authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { machineId, processId, materialId } = req.body;
    const resource = await prisma.phaseResource.update({
      where: { id: req.params.resId as string },
      data: { machineId, processId, materialId }
    });
    res.json(resource);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update resource row' });
  }
});

// Delete a resource row
router.delete('/resources/:resId', authorizeRoles('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    await prisma.phaseResource.delete({ where: { id: req.params.resId as string } });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete resource row' });
  }
});

export default router;
