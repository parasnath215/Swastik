"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticate);
// Get all projects
router.get('/', async (req, res) => {
    try {
        const projects = await prisma_1.default.project.findMany({
            include: { phases: { include: { resources: true } } }
        });
        res.json(projects);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});
// Create project
router.post('/', (0, authMiddleware_1.authorizeRoles)('SUPER_ADMIN', 'ADMIN', 'SALES'), async (req, res) => {
    try {
        const { name, phone, address, dimensions, budget } = req.body;
        const project = await prisma_1.default.project.create({
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
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create project' });
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
