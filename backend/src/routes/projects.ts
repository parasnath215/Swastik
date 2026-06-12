import { Router } from 'express';
import prisma from '../prisma';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Setup multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

const router = Router();

router.use(authenticate);

// Get all projects
router.get('/', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: { 
        phases: { include: { resources: true } },
        files: true,
        updates: { orderBy: { createdAt: 'desc' } }
      }
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Create project with file uploads
router.post('/', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'SALES'), upload.array('files'), async (req, res) => {
  try {
    const { name, phone, address, dimensions, budget } = req.body;
    
    // Create the project first
    const project = await prisma.project.create({
      data: { 
        name, 
        phone, 
        address, 
        dimensions, 
        budget: parseFloat(budget || '0'), 
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

    // Handle uploaded files
    const files = req.files as Express.Multer.File[];
    if (files && files.length > 0) {
      const fileRecords = files.map(file => ({
        projectId: project.id,
        url: `/uploads/${file.filename}`,
        name: file.originalname,
        size: file.size
      }));
      await prisma.projectFile.createMany({
        data: fileRecords
      });
    }

    // Fetch the updated project with files
    const updatedProject = await prisma.project.findUnique({
      where: { id: project.id },
      include: { 
        phases: { include: { resources: true } },
        files: true 
      }
    });

    res.status(201).json(updatedProject);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project name
router.patch('/:id/name', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'SALES'), async (req, res) => {
  try {
    const { name } = req.body;
    const project = await prisma.project.update({
      where: { id: req.params.id as string },
      data: { name }
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project name' });
  }
});

// Get project updates
router.get('/:id/updates', async (req, res) => {
  try {
    const updates = await prisma.projectUpdate.findMany({
      where: { projectId: req.params.id as string },
      orderBy: { createdAt: 'desc' }
    });
    res.json(updates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project updates' });
  }
});

// Create project update
router.post('/:id/updates', authorizeRoles('SUPER_ADMIN', 'ADMIN', 'OPERATOR'), async (req, res) => {
  try {
    const { content } = req.body;
    // req.user might have the operator's ID if authMiddleware sets it. Assuming it does:
    const operatorId = (req as any).user?.id || null; 
    
    const update = await prisma.projectUpdate.create({
      data: {
        projectId: req.params.id as string,
        content,
        operatorId
      }
    });
    res.status(201).json(update);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project update' });
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
