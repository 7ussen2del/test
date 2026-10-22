require('dotenv').config();

const path = require('path');
const express = require('express');
const pool = require('./db');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Parse JSON request bodies and serve the frontend from the frontend folder.
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'frontend')));

// GET /api/health - check that the API and database are reachable.
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      database: 'disconnected',
      message: error.message,
    });
  }
});

// GET /api/tasks - return every task.
app.get('/api/tasks', async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, title, completed FROM tasks ORDER BY id ASC'
    );
    res.json(rows);
  } catch (error) {
    next(error);
  }
});

// POST /api/tasks - add a task.
app.post('/api/tasks', async (req, res, next) => {
  try {
    const title = typeof req.body.title === 'string' ? req.body.title.trim() : '';

    if (!title) {
      return res.status(400).json({ error: 'Title is required.' });
    }
    if (title.length > 255) {
      return res.status(400).json({ error: 'Title must be 255 characters or fewer.' });
    }

    const [result] = await pool.query(
      'INSERT INTO tasks (title, completed) VALUES (?, FALSE)',
      [title]
    );

    const [rows] = await pool.query(
      'SELECT id, title, completed FROM tasks WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json(rows[0]);
  } catch (error) {
    next(error);
  }
});

// PUT /api/tasks/:id - update a task's completed status.
app.put('/api/tasks/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { completed } = req.body;

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: 'Invalid task id.' });
    }
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'The "completed" field must be true or false.' });
    }

    const [result] = await pool.query(
      'UPDATE tasks SET completed = ? WHERE id = ?',
      [completed, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    const [rows] = await pool.query(
      'SELECT id, title, completed FROM tasks WHERE id = ?',
      [id]
    );

    res.json(rows[0]);
  } catch (error) {
    next(error);
  }
});

// DELETE /api/tasks/:id - delete a task.
app.delete('/api/tasks/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id < 1) {
      return res.status(400).json({ error: 'Invalid task id.' });
    }

    const [result] = await pool.query('DELETE FROM tasks WHERE id = ?', [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Task not found.' });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

// Return JSON (instead of HTML) for unknown API routes.
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API route not found.' });
});

// Central error handler so unexpected database errors become clean JSON.
app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  console.log('API health check: http://localhost:' + PORT + '/api/health');
});
