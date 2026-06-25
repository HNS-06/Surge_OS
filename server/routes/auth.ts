import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { queryOne, runSQL } from '../db';
import { generateToken, authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' });
    }

    const existing = queryOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    runSQL('INSERT INTO users (email, password, name) VALUES (?, ?, ?)', [email, hashedPassword, name]);
    
    const user = queryOne('SELECT id, email, name, created_at FROM users WHERE email = ?', [email]);
    if (!user) return res.status(500).json({ error: 'Registration failed' });

    const token = generateToken(user.id as number);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, createdAt: user.created_at } });
  } catch (err: any) {
    console.error('Registration error:', err);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = queryOne('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, user.password as string);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id as number);
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, createdAt: user.created_at } });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', authenticateToken, (req: AuthRequest, res) => {
  const user = queryOne('SELECT id, email, name, created_at FROM users WHERE id = ?', [req.userId]);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json({ id: user.id, email: user.email, name: user.name, createdAt: user.created_at });
});

export default router;
