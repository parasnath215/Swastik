import { Router } from 'express';
import prisma from '../prisma';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();
router.use(authenticate);

// Get all tasks for calendar
router.get('/tasks', async (req, res) => {
  try {
    const tasks = await prisma.task.findMany({
      include: { machine: true, process: true, phase: { include: { project: true } } }
    });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Schedule a new task (The Queue Logic)
router.post('/schedule', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'OPERATOR'), async (req, res) => {
  try {
    const { phaseId, machineId, processId, materialId, duration, startTime } = req.body;
    // duration in minutes
    
    // Find conflicting tasks for this machine
    const requestedStart = new Date(startTime);
    let calculatedStart = requestedStart;
    
    // Find the latest task assigned to this machine or process
    const resourceFilter = machineId ? { machineId } : { processId };
    
    const latestTask = await prisma.task.findFirst({
      where: resourceFilter,
      orderBy: { endTime: 'desc' }
    });

    if (latestTask && latestTask.endTime > calculatedStart) {
      // Conflict resolution: queue it right after the latest task
      calculatedStart = new Date(latestTask.endTime);
    }

    const calculatedEnd = new Date(calculatedStart.getTime() + duration * 60000);

    const task = await prisma.task.create({
      data: {
        phaseId,
        machineId,
        processId: processId || null,
        materialId: materialId || null,
        duration: parseInt(duration),
        startTime: calculatedStart,
        endTime: calculatedEnd
      }
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ error: 'Scheduling failed' });
  }
});

// Update an existing task (Add hours or finish early)
router.patch('/tasks/:id', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'OPERATOR'), async (req, res) => {
  try {
    const { action, hours } = req.body;
    const task = await prisma.task.findUnique({ 
      where: { id: req.params.id as string },
      include: { machine: true, material: true }
    });
    if (!task) return res.status(404).json({ error: 'Task not found' });

    let newEndTime = task.endTime;
    let newDuration = task.duration;

    if (action === 'finish_early') {
      newEndTime = new Date();
      // recalculate duration in minutes (ensure no negative duration)
      newDuration = Math.max(0, Math.round((newEndTime.getTime() - task.startTime.getTime()) / 60000));
      
      // Auto-complete the phase for the Admin Dashboard sync
      await prisma.phase.update({
        where: { id: task.phaseId },
        data: { status: 'ACCEPTED' }
      });
    } else if (action === 'add_hours' && hours) {
      newDuration += hours * 60;
      newEndTime = new Date(task.startTime.getTime() + newDuration * 60000);
    }

    // Auto-compute actual cost based on duration
    const machineCost = (newDuration / 60) * (task.machine?.hourlyRate || 0);
    const materialCost = task.material?.unitCost || 0;
    const actualCost = machineCost + materialCost;

    const updatedTask = await prisma.task.update({
      where: { id: req.params.id as string },
      data: { endTime: newEndTime, duration: newDuration, actualCost }
    });

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

export default router;
