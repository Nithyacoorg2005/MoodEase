// server/index.js (NEW DEBUGGING VERSION)
const express = require('express');
const cors = require('cors');
const db = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const port = 4000;
app.use(cors());
app.use(express.json());

// 1. REGISTER
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Missing username, email, or password' });
    }

    const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length > 0) {
      return res.status(400).json({ error: 'Email already taken' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = await db.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );

    const token = jwt.sign(
      { userId: newUser.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token, profile: newUser.rows[0] });
  } catch (error) {
    // --- THIS IS THE NEW CATCH BLOCK ---
    console.error('--- REGISTER ERROR ---');
    console.error(error); // Log the full error object
    res.status(500).json({ 
      error: error.message, 
      stack: error.stack, 
      details: error 
    });
    // --- END NEW CATCH BLOCK ---
  }
});

// 2. LOGIN
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const validPassword = await bcrypt.compare(password, user.rows[0].password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { userId: user.rows[0].id },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    const profile = { id: user.rows[0].id, username: user.rows[0].username, email: user.rows[0].email };
    res.json({ token, profile });
  } catch (error) {
    console.error('--- LOGIN ERROR ---');
    console.error(error);
    res.status(500).json({ error: error.message, stack: error.stack, details: error });
  }
});

// 3. AUTH MIDDLEWARE
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (token == null) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err) return res.sendStatus(403);
      req.user = user;
      next();
    });
  } catch (error) {
    console.error('--- MIDDLEWARE ERROR ---');
    console.error(error);
    res.status(500).json({ error: error.message, stack: error.stack, details: error });
  }
};

// 4. MOODS ROUTES
app.get('/api/moods', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const moods = await db.query('SELECT * FROM moods WHERE user_id = $1 ORDER BY created_at DESC', [userId]);
    res.json(moods.rows);
  } catch (error) {
    console.error('--- GET MOODS ERROR ---');
    console.error(error);
    res.status(500).json({ error: error.message, stack: error.stack, details: error });
  }
});

app.post('/api/moods', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const { mood_value, mood_emoji, notes } = req.body;
    const newMood = await db.query(
      'INSERT INTO moods (user_id, mood_value, mood_emoji, notes) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, mood_value, mood_emoji, notes]
    );
    res.status(201).json(newMood.rows[0]);
  } catch (error) {
    console.error('--- POST MOOD ERROR ---');
    console.error(error);
    res.status(500).json({ error: error.message, stack: error.stack, details: error });
  }
});

app.delete('/api/moods/:id', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    await db.query('DELETE FROM moods WHERE id = $1 AND user_id = $2', [id, userId]);
    res.json({ message: 'Mood deleted' });
  } catch (error) {
    console.error('--- DELETE MOOD ERROR ---');
    console.error(error);
    res.status(500).json({ error: error.message, stack: error.stack, details: error });
  }
});

// 5. PROFILE ROUTES
app.get('/api/profile/stats', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const userRes = await db.query('SELECT username, created_at FROM users WHERE id = $1', [userId]);
    const profile = userRes.rows[0];
    const moodRes = await db.query('SELECT COUNT(id) FROM moods WHERE user_id = $1', [userId]);
    const moodCount = parseInt(moodRes.rows[0].count, 10);
    res.json({
      username: profile.username,
      created_at: profile.created_at,
      totalMoods: moodCount,
      totalChallenges: 0,
      totalPosts: 0,
    });
  } catch (error) {
    console.error('--- GET STATS ERROR ---');
    console.error(error);
    res.status(500).json({ error: error.message, stack: error.stack, details: error });
  }
});

app.put('/api/profile', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const { username } = req.body;
    const updatedUser = await db.query(
      'UPDATE users SET username = $1 WHERE id = $2 RETURNING username',
      [username, userId]
    );
    res.json({ username: updatedUser.rows[0].username });
  } catch (error) {
    console.error('--- PUT PROFILE ERROR ---');
    console.error(error);
    res.status(500).json({ error: error.message, stack: error.stack, details: error });
  }
});

// 6. CHALLENGES ROUTES
app.get('/api/challenges', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    let result = await db.query('SELECT * FROM challenges WHERE user_id = $1', [userId]);
    if (result.rows.length === 0) {
      const challengeTypes = ['daily_mood', 'gratitude', 'breathing', 'meditation'];
      await db.query('BEGIN');
      for (const type of challengeTypes) {
        await db.query('INSERT INTO challenges (user_id, challenge_type) VALUES ($1, $2)', [userId, type]);
      }
      await db.query('COMMIT');
      result = await db.query('SELECT * FROM challenges WHERE user_id = $1', [userId]);
    }
    res.json(result.rows);
  } catch (error) {
    await db.query('ROLLBACK');
    console.error('--- GET CHALLENGES ERROR ---');
    console.error(error);
    res.status(500).json({ error: error.message, stack: error.stack, details: error });
  }
});

app.put('/api/challenges/:id', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    const { streak_count, last_completed, badges } = req.body;
    const result = await db.query(
      'UPDATE challenges SET streak_count = $1, last_completed = $2, badges = $3 WHERE id = $4 AND user_id = $5 RETURNING *',
      [streak_count, last_completed, badges, id, userId]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('--- PUT CHALLENGE ERROR ---');
    console.error(error);
    res.status(500).json({ error: error.message, stack: error.stack, details: error });
  }
});

// 7. COMMUNITY POSTS ROUTES
app.get('/api/posts', authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT cp.id, cp.user_id, cp.content, cp.reactions, cp.created_at, u.username 
       FROM community_posts cp
       JOIN users u ON cp.user_id = u.id
       ORDER BY cp.created_at DESC LIMIT 50`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('--- GET POSTS ERROR ---');
    console.error(error);
    res.status(500).json({ error: error.message, stack: error.stack, details: error });
  }
});

app.post('/api/posts', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const { content } = req.body;
    const newPostRes = await db.query('INSERT INTO community_posts (user_id, content) VALUES ($1, $2) RETURNING *', [userId, content]);
    const userRes = await db.query('SELECT username FROM users WHERE id = $1', [userId]);
    res.status(201).json({ ...newPostRes.rows[0], username: userRes.rows[0].username });
  } catch (error) {
    console.error('--- POST POST ERROR ---');
    console.error(error);
    res.status(500).json({ error: error.message, stack: error.stack, details: error });
  }
});

app.delete('/api/posts/:id', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;
    await db.query('DELETE FROM community_posts WHERE id = $1 AND user_id = $2', [id, userId]);
    res.json({ message: 'Post deleted' });
  } catch (error) {
    console.error('--- DELETE POST ERROR ---');
    console.error(error);
    res.status(500).json({ error: error.message, stack: error.stack, details: error });
  }
});

app.put('/api/posts/:id/react', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { emoji } = req.body;
    const postRes = await db.query('SELECT reactions FROM community_posts WHERE id = $1', [id]);
    const reactions = postRes.rows[0].reactions || {};
    reactions[emoji] = (reactions[emoji] || 0) + 1;
    const updatedPost = await db.query('UPDATE community_posts SET reactions = $1 WHERE id = $2 RETURNING reactions', [reactions, id]);
    res.json(updatedPost.rows[0].reactions);
  } catch (error) {
    console.error('--- PUT REACTION ERROR ---');
    console.error(error);
    res.status(500).json({ error: error.message, stack: error.stack, details: error });
  }
});

// 8. START THE SERVER
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});