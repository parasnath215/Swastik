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
// Add expense
router.post('/expenses', async (req, res) => {
    try {
        const { projectId, phaseId, amount, description } = req.body;
        const expense = await prisma_1.default.expense.create({
            data: { projectId, phaseId: phaseId || null, amount: parseFloat(amount), description }
        });
        res.status(201).json(expense);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to add expense' });
    }
});
// Get finances for dashboard
router.get('/dashboard', async (req, res) => {
    try {
        const projects = await prisma_1.default.project.findMany({
            include: {
                expenses: true,
                phases: { include: { tasks: true } }
            }
        });
        const data = projects.map(p => {
            let taskCost = 0;
            p.phases.forEach((phase) => {
                phase.tasks.forEach((task) => { taskCost += (task.actualCost || 0); });
            });
            const totalExpenses = p.expenses.reduce((sum, exp) => sum + exp.amount, 0) + taskCost;
            return {
                projectId: p.id,
                projectName: p.name,
                budget: p.budget || 0,
                totalExpenses,
                variance: (p.budget || 0) - totalExpenses
            };
        });
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch dashboard data' });
    }
});
exports.default = router;
