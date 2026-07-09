import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../index';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

interface SignUpRequest {
  email: string;
  password: string;
  name: string;
}

interface SignInRequest {
  email: string;
  password: string;
}

// Sign Up
router.post('/signup', async (req: Request<{}, {}, SignUpRequest>, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user exists
    const existing = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = uuidv4();

    // Insert user
    await pool.query(
      'INSERT INTO users (id, email, password, name, role) VALUES ($1, $2, $3, $4, $5)',
      [userId, email, hashedPassword, name, 'user']
    );

    // Generate token
    const token = jwt.sign(
      { userId, role: 'user' },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      user: { id: userId, email, name, role: 'user' },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Sign In
router.post('/signin', async (req: Request<{}, {}, SignInRequest>, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];

    // Compare password
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
