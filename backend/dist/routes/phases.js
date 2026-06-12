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
// Create phase
router.post('/', (0, authMiddleware_1.authorizeRoles)('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const { projectId, name, order } = req.body;
        const phase = await prisma_1.default.phase.create({
            data: { projectId, name, order: parseInt(order), status: 'PENDING' }
        });
        res.status(201).json(phase);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create phase' });
    }
});
// Update phase status (FSM logic)
router.patch('/:id/status', (0, authMiddleware_1.authorizeRoles)('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        const phase = await prisma_1.default.phase.findUnique({ where: { id } });
        if (!phase) {
            res.status(404).json({ error: 'Phase not found' });
            return;
        }
        // FSM Logic: Phase N+1 cannot begin until Phase N is ACCEPTED
        if (status === 'IN_PROGRESS') {
            const prevPhase = await prisma_1.default.phase.findFirst({
                where: { projectId: phase.projectId, order: phase.order - 1 }
            });
            if (prevPhase && prevPhase.status !== 'ACCEPTED') {
                res.status(400).json({ error: 'Previous phase is not accepted yet' });
                return;
            }
        }
        const updatedPhase = await prisma_1.default.phase.update({
            where: { id },
            data: { status },
        });
        res.json(updatedPhase);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update phase status' });
    }
});
// Add a resource row to a phase
router.post('/:id/resources', (0, authMiddleware_1.authorizeRoles)('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const { machineId, processId, materialId, materialsList, expectedDuration } = req.body;
        const resource = await prisma_1.default.phaseResource.create({
            data: {
                phaseId: req.params.id,
                machineId,
                processId,
                materialId,
                materialsList: materialsList ? JSON.stringify(materialsList) : null,
                expectedDuration: expectedDuration ? parseInt(expectedDuration) : null
            }
        });
        res.json(resource);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to add resource row' });
    }
});
// Update a resource row
router.patch('/resources/:resId', (0, authMiddleware_1.authorizeRoles)('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const { machineId, processId, materialId, materialsList, expectedDuration } = req.body;
        const resource = await prisma_1.default.phaseResource.update({
            where: { id: req.params.resId },
            data: {
                machineId,
                processId,
                materialId,
                materialsList: materialsList ? JSON.stringify(materialsList) : null,
                expectedDuration: expectedDuration ? parseInt(expectedDuration) : null
            }
        });
        res.json(resource);
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to update resource row' });
    }
});
// Delete a resource row
router.delete('/resources/:resId', (0, authMiddleware_1.authorizeRoles)('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        await prisma_1.default.phaseResource.delete({ where: { id: req.params.resId } });
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to delete resource row' });
    }
});
exports.default = router;
