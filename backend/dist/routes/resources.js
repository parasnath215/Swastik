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
// --- MACHINES ---
router.get('/machines', async (req, res) => {
    try {
        const data = await prisma_1.default.machine.findMany();
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch machines' });
    }
});
router.post('/machines', (0, authMiddleware_1.authorizeRoles)('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const { name, description, hourlyRate } = req.body;
        const data = await prisma_1.default.machine.create({ data: { name, description, hourlyRate: hourlyRate ? parseFloat(hourlyRate) : 0 } });
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create machine' });
    }
});
router.patch('/machines/:id', (0, authMiddleware_1.authorizeRoles)('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const { name, description, hourlyRate } = req.body;
        const updateData = { name, description };
        if (hourlyRate !== undefined)
            updateData.hourlyRate = parseFloat(hourlyRate);
        const data = await prisma_1.default.machine.update({ where: { id: req.params.id }, data: updateData });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update machine' });
    }
});
router.delete('/machines/:id', (0, authMiddleware_1.authorizeRoles)('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        await prisma_1.default.machine.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete machine' });
    }
});
// --- PROCESSES ---
router.get('/processes', async (req, res) => {
    try {
        const data = await prisma_1.default.process.findMany();
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch processes' });
    }
});
router.post('/processes', (0, authMiddleware_1.authorizeRoles)('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const { name, description } = req.body;
        const data = await prisma_1.default.process.create({ data: { name, description } });
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create process' });
    }
});
router.patch('/processes/:id', (0, authMiddleware_1.authorizeRoles)('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const { name, description } = req.body;
        const data = await prisma_1.default.process.update({ where: { id: req.params.id }, data: { name, description } });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update process' });
    }
});
router.delete('/processes/:id', (0, authMiddleware_1.authorizeRoles)('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        await prisma_1.default.process.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete process' });
    }
});
// --- MATERIALS ---
router.get('/materials', async (req, res) => {
    try {
        const data = await prisma_1.default.material.findMany();
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch materials' });
    }
});
router.post('/materials', (0, authMiddleware_1.authorizeRoles)('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const { name, description, unitCost } = req.body;
        const data = await prisma_1.default.material.create({ data: { name, description, unitCost: unitCost ? parseFloat(unitCost) : 0 } });
        res.status(201).json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create material' });
    }
});
router.patch('/materials/:id', (0, authMiddleware_1.authorizeRoles)('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const { name, description, unitCost } = req.body;
        const updateData = { name, description };
        if (unitCost !== undefined)
            updateData.unitCost = parseFloat(unitCost);
        const data = await prisma_1.default.material.update({ where: { id: req.params.id }, data: updateData });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update material' });
    }
});
router.delete('/materials/:id', (0, authMiddleware_1.authorizeRoles)('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        await prisma_1.default.material.delete({ where: { id: req.params.id } });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete material' });
    }
});
exports.default = router;
