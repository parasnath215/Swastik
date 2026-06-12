"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Setup multer for file uploads
const uploadDir = path_1.default.join(process.cwd(), 'uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir);
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + '-' + file.originalname);
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticate);
// Get all projects
router.get('/', async (req, res) => {
    try {
        const projects = await prisma_1.default.project.findMany({
            include: {
                phases: { include: { resources: true } },
                files: true,
                updates: { orderBy: { createdAt: 'desc' } }
            }
        });
        res.json(projects);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});
// Create project with file uploads
router.post('/', (0, authMiddleware_1.authorizeRoles)('SUPER_ADMIN', 'ADMIN', 'SALES'), upload.array('files'), async (req, res) => {
    try {
        const { name, phone, address, dimensions, budget } = req.body;
        // Create the project first
        const project = await prisma_1.default.project.create({
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
        const files = req.files;
        if (files && files.length > 0) {
            const fileRecords = files.map(file => ({
                projectId: project.id,
                url: `/uploads/${file.filename}`,
                name: file.originalname,
                size: file.size
            }));
            await prisma_1.default.projectFile.createMany({
                data: fileRecords
            });
        }
        // Fetch the updated project with files
        const updatedProject = await prisma_1.default.project.findUnique({
            where: { id: project.id },
            include: {
                phases: { include: { resources: true } },
                files: true
            }
        });
        res.status(201).json(updatedProject);
    }
    catch (error) {
        console.error('Error creating project:', error);
        res.status(500).json({ error: 'Failed to create project' });
    }
});
// Update project name
router.patch('/:id/name', (0, authMiddleware_1.authorizeRoles)('SUPER_ADMIN', 'ADMIN', 'SALES'), async (req, res) => {
    try {
        const { name } = req.body;
        const project = await prisma_1.default.project.update({
            where: { id: req.params.id },
            data: { name }
        });
        res.json(project);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update project name' });
    }
});
// Get project updates
router.get('/:id/updates', async (req, res) => {
    try {
        const updates = await prisma_1.default.projectUpdate.findMany({
            where: { projectId: req.params.id },
            orderBy: { createdAt: 'desc' }
        });
        res.json(updates);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch project updates' });
    }
});
// Create project update
router.post('/:id/updates', (0, authMiddleware_1.authorizeRoles)('SUPER_ADMIN', 'ADMIN', 'OPERATOR'), async (req, res) => {
    try {
        const { content } = req.body;
        // req.user might have the operator's ID if authMiddleware sets it. Assuming it does:
        const operatorId = req.user?.id || null;
        const update = await prisma_1.default.projectUpdate.create({
            data: {
                projectId: req.params.id,
                content,
                operatorId
            }
        });
        res.status(201).json(update);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create project update' });
    }
});
// Delete project
router.delete('/:id', (0, authMiddleware_1.authorizeRoles)('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        await prisma_1.default.project.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete project' });
    }
});
// Update project status
router.patch('/:id/status', (0, authMiddleware_1.authorizeRoles)('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const { status } = req.body;
        const project = await prisma_1.default.project.update({
            where: { id: req.params.id },
            data: { status }
        });
        res.json(project);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update project status' });
    }
});
exports.default = router;
