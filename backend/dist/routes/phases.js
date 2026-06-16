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
// Create phase (with auto-shifting of order if inserted in between)
router.post('/', (0, authMiddleware_1.authorizeRoles)('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const { projectId, name, order } = req.body;
        const targetOrder = parseInt(order);
        const phase = await prisma_1.default.$transaction(async (tx) => {
            // Shift existing phases with order >= targetOrder by 1
            await tx.phase.updateMany({
                where: { projectId, order: { gte: targetOrder } },
                data: { order: { increment: 1 } }
            });
            return await tx.phase.create({
                data: { projectId, name, order: targetOrder, status: 'PENDING' }
            });
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
// Add a resource row to a phase (with optional order for inserting in between)
router.post('/:id/resources', (0, authMiddleware_1.authorizeRoles)('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const { machineId, processId, materialId, materialsList, expectedDuration, order } = req.body;
        const phaseId = req.params.id;
        const resource = await prisma_1.default.$transaction(async (tx) => {
            let targetOrder = order !== undefined ? parseInt(order) : null;
            if (targetOrder === null) {
                const maxRes = await tx.phaseResource.findFirst({
                    where: { phaseId },
                    orderBy: { order: 'desc' }
                });
                targetOrder = maxRes ? maxRes.order + 1 : 1;
            }
            else {
                await tx.phaseResource.updateMany({
                    where: { phaseId, order: { gte: targetOrder } },
                    data: { order: { increment: 1 } }
                });
            }
            return await tx.phaseResource.create({
                data: {
                    phaseId,
                    machineId,
                    processId,
                    materialId,
                    materialsList: materialsList ? JSON.stringify(materialsList) : null,
                    expectedDuration: expectedDuration ? parseInt(expectedDuration) : null,
                    order: targetOrder
                }
            });
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
        const resId = req.params.resId;
        const resource = await prisma_1.default.phaseResource.findUnique({ where: { id: resId } });
        if (!resource) {
            res.status(404).json({ error: 'Resource row not found' });
            return;
        }
        await prisma_1.default.$transaction(async (tx) => {
            await tx.phaseResource.delete({ where: { id: resId } });
            await tx.phaseResource.updateMany({
                where: { phaseId: resource.phaseId, order: { gt: resource.order } },
                data: { order: { decrement: 1 } }
            });
        });
        res.json({ success: true });
    }
    catch (err) {
        res.status(500).json({ error: 'Failed to delete resource row' });
    }
});
// Reorder phases in a project
router.patch('/reorder', (0, authMiddleware_1.authorizeRoles)('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const { phaseIds } = req.body;
        if (!Array.isArray(phaseIds)) {
            res.status(400).json({ error: 'phaseIds must be an array' });
            return;
        }
        await prisma_1.default.$transaction(phaseIds.map((id, index) => prisma_1.default.phase.update({
            where: { id },
            data: { order: index + 1 }
        })));
        res.json({ success: true });
    }
    catch (error) {
        console.error('Failed to reorder phases:', error);
        res.status(500).json({ error: 'Failed to reorder phases' });
    }
});
// Delete a phase
router.delete('/:id', (0, authMiddleware_1.authorizeRoles)('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const id = req.params.id;
        const phase = await prisma_1.default.phase.findUnique({ where: { id } });
        if (!phase) {
            res.status(404).json({ error: 'Phase not found' });
            return;
        }
        await prisma_1.default.$transaction(async (tx) => {
            await tx.phase.delete({ where: { id } });
            await tx.phase.updateMany({
                where: { projectId: phase.projectId, order: { gt: phase.order } },
                data: { order: { decrement: 1 } }
            });
        });
        res.json({ success: true });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete phase' });
    }
});
// Reorder resource rows in a phase
router.patch('/:id/resources/reorder', (0, authMiddleware_1.authorizeRoles)('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
    try {
        const { resourceIds } = req.body;
        if (!Array.isArray(resourceIds)) {
            res.status(400).json({ error: 'resourceIds must be an array' });
            return;
        }
        await prisma_1.default.$transaction(resourceIds.map((id, index) => prisma_1.default.phaseResource.update({
            where: { id },
            data: { order: index + 1 }
        })));
        res.json({ success: true });
    }
    catch (error) {
        console.error('Failed to reorder resources:', error);
        res.status(500).json({ error: 'Failed to reorder resources' });
    }
});
exports.default = router;
