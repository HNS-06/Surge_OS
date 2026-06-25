import { Router } from 'express';
import { queryAll, queryOne, runSQL } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

router.get('/subjects', (req: AuthRequest, res) => {
  const subjects = queryAll('SELECT name FROM subjects WHERE user_id = ? ORDER BY name', [req.userId]);
  res.json(subjects.map((s: any) => s.name));
});

router.post('/subjects', (req: AuthRequest, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Subject name required' });
  try {
    runSQL('INSERT INTO subjects (user_id, name) VALUES (?, ?)', [req.userId, name.toUpperCase()]);
  } catch (err: any) {
    if (!err.message?.includes('UNIQUE')) {
      return res.status(500).json({ error: 'Failed to add subject' });
    }
  }
  const subjects = queryAll('SELECT name FROM subjects WHERE user_id = ? ORDER BY name', [req.userId]);
  res.json(subjects.map((s: any) => s.name));
});

router.delete('/subjects/:name', (req: AuthRequest, res) => {
  runSQL('DELETE FROM subjects WHERE user_id = ? AND name = ?', [req.userId, req.params.name.toUpperCase()]);
  const subjects = queryAll('SELECT name FROM subjects WHERE user_id = ? ORDER BY name', [req.userId]);
  res.json(subjects.map((s: any) => s.name));
});

router.get('/tasks', (req: AuthRequest, res) => {
  const tasks = queryAll('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at', [req.userId]);
  res.json(tasks.map((t: any) => ({
    id: t.id, name: t.name, subject: t.subject, type: t.type,
    deadlineDate: t.deadline_date, deadlineTime: t.deadline_time,
    estimatedHours: t.estimated_hours, blockPrediction: t.block_prediction,
    completed: !!t.completed, timeSpentMinutes: t.time_spent_minutes,
    day: t.day, startHour: t.start_hour, durationHours: t.duration_hours,
    reason: t.reason
  })));
});

router.post('/tasks', (req: AuthRequest, res) => {
  const t = req.body;
  if (!t.name) return res.status(400).json({ error: 'Task name required' });
  runSQL(
    `INSERT OR REPLACE INTO tasks (id, user_id, name, subject, type, deadline_date, deadline_time, estimated_hours, block_prediction, completed, time_spent_minutes, day, start_hour, duration_hours, reason) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [t.id || `task_${Date.now()}`, req.userId, t.name, t.subject || 'GENERAL', t.type || 'ASSIGNMENT',
     t.deadlineDate, t.deadlineTime, t.estimatedHours || 1, t.blockPrediction,
     t.completed ? 1 : 0, t.timeSpentMinutes, t.day, t.startHour, t.durationHours, t.reason]
  );
  res.json({ success: true });
});

router.put('/tasks/:id', (req: AuthRequest, res) => {
  const t = req.body;
  const fields: string[] = [];
  const values: any[] = [];
  
  if (t.name !== undefined) { fields.push('name = ?'); values.push(t.name); }
  if (t.subject !== undefined) { fields.push('subject = ?'); values.push(t.subject); }
  if (t.type !== undefined) { fields.push('type = ?'); values.push(t.type); }
  if (t.completed !== undefined) { fields.push('completed = ?'); values.push(t.completed ? 1 : 0); }
  if (t.timeSpentMinutes !== undefined) { fields.push('time_spent_minutes = ?'); values.push(t.timeSpentMinutes); }
  if (t.day !== undefined) { fields.push('day = ?'); values.push(t.day); }
  if (t.startHour !== undefined) { fields.push('start_hour = ?'); values.push(t.startHour); }
  if (t.durationHours !== undefined) { fields.push('duration_hours = ?'); values.push(t.durationHours); }
  if (t.reason !== undefined) { fields.push('reason = ?'); values.push(t.reason); }

  if (fields.length === 0) return res.status(400).json({ error: 'No fields to update' });
  values.push(req.params.id, req.userId);
  runSQL(`UPDATE tasks SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`, values);
  res.json({ success: true });
});

router.delete('/tasks/:id', (req: AuthRequest, res) => {
  runSQL('DELETE FROM tasks WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
  res.json({ success: true });
});

router.get('/suggestions', (req: AuthRequest, res) => {
  const suggestions = queryAll('SELECT * FROM suggestions WHERE user_id = ? ORDER BY created_at', [req.userId]);
  res.json(suggestions.map((s: any) => ({
    id: s.id, title: s.title, type: s.type, confidence: s.confidence,
    day: s.day, startHour: s.start_hour, durationHours: s.duration_hours,
    timeString: s.time_string
  })));
});

router.post('/suggestions', (req: AuthRequest, res) => {
  const s = req.body;
  runSQL(
    `INSERT OR REPLACE INTO suggestions (id, user_id, title, type, confidence, day, start_hour, duration_hours, time_string) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [s.id || `sug_${Date.now()}`, req.userId, s.title, s.type || 'HIGH_EFFICIENCY',
     s.confidence || 80, s.day, s.startHour, s.durationHours, s.timeString]
  );
  res.json({ success: true });
});

router.delete('/suggestions/:id', (req: AuthRequest, res) => {
  runSQL('DELETE FROM suggestions WHERE id = ? AND user_id = ?', [req.params.id, req.userId]);
  res.json({ success: true });
});

router.get('/sessions', (req: AuthRequest, res) => {
  const sessions = queryAll('SELECT * FROM sessions WHERE user_id = ? ORDER BY created_at DESC LIMIT 10', [req.userId]);
  res.json(sessions);
});

router.post('/sessions', (req: AuthRequest, res) => {
  const s = req.body;
  runSQL(
    `INSERT INTO sessions (user_id, task_id, task_name, duration_string, completion_rate, time_accuracy, block_type, system_log, fog_pct, fear_pct, friction_pct, fake_pct) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [req.userId, s.taskId, s.taskName, s.durationString, s.completionRate,
     s.timeAccuracy, s.blockType, s.systemLog, s.fogPct || 0, s.fearPct || 0,
     s.frictionPct || 0, s.fakePct || 0]
  );
  res.json({ success: true });
});

export default router;
