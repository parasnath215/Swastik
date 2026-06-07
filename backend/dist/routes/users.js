"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma_1 = __importDefault(require("../prisma"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.authenticate);
router.use((0, authMiddleware_1.authorizeRoles)('SUPER_ADMIN'));
// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await prisma_1.default.user.findMany({
            select: { id: true, name: true, email: true, role: true, createdAt: true }
        });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});
// Create new user
router.post('/', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        const existing = await prisma_1.default.user.findUnique({ where: { email } });
        if (existing) {
            res.status(400).json({ error: 'Email already exists' });
            return;
        }
        const hashedPassword = await bcrypt_1.default.hash(password, 10);
        const user = await prisma_1.default.user.create({
            data: { name, email, password: hashedPassword, role }
        });
        res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
});
// Update user
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, role, password } = req.body;
        let updateData = { name, email, role };
        if (password) {
            updateData.password = await bcrypt_1.default.hash(password, 10);
        }
        const user = await prisma_1.default.user.update({
            where: { id },
            data: updateData
        });
        res.json({ id: user.id, name: user.name, email: user.email, role: user.role });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update user' });
    }
});
// Delete user
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        // Prevent deleting oneself
        if (req.user.id === id) {
            res.status(400).json({ error: 'Cannot delete yourself' });
            return;
        }
        await prisma_1.default.user.delete({ where: { id } });
        res.json({ message: 'User deleted' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete user' });
    }
});
exports.default = router;
