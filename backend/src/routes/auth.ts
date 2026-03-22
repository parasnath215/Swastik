import { Router } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../prisma';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
       res.status(400).json({ error: 'User already exists' });
       return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: role || 'SALES' },
    });

    res.status(201).json({ message: 'User created successfully', user: { id: user.id, email: user.email, role: user.role } });
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      res.status(400).json({ error: 'Invalid credentials' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      process.env.JWT_SECRET || 'supersecret_ssms_key_2026',
      { expiresIn: '1d' }
    );

    res.json({ token, user: { id: user.id, name: user.name, role: user.role, email: user.email } });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

export default router;
