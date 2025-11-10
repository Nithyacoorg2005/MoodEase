// 1. ALL IMPORTS
const express = require('express');
const cors = require('cors');
const db = require('./db'); // Requires the db.js file
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// 2. APP SETUP
const app = express();
const port = 4000;
app.use(cors());
app.use(express.json());

// 3. AUTHENTICATION ROUTES
// (Register a new user)
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if email exists
    const user = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (user.rows.length > 0) {
      return res.status(400).json({ error: 'Email already taken' });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Save new user to db
    const newUser = await db.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, email, hashedPassword]
    );

    // Create a JWT token
    const token = jwt.sign(
      { userId: newUser.rows[0].id },
      'YOUR_SECRET_KEY_HERE', // !! REPLACE THIS with a real secret
      { expiresIn: '1h' }
    );

    res.json({ token, profile: newUser.rows[0] });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// (Login a user)
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body; // Login with email

    // Find the user by email
    const user = await db.query('SELECT * FROM users WHERE email = $1', [
      email,
    ]);
    if (user.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(
      password,
      user.rows[0].password
    );
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Create and send token
    const token = jwt.sign(
      { userId: user.rows[0].id },
      'YOUR_SECRET_KEY_HERE', // !! REPLACE THIS with a real secret
      { expiresIn: '1h' }
    );
    
    // Send back the profile info (without password!)
    const profile = { id: user.rows[0].id, username: user.rows[0].username, email: user.rows[0].email };
    res.json({ token, profile });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// 4. AUTH MIDDLEWARE (MUST be before protected routes)
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, 'YOUR_SECRET_KEY_HERE', (err, user) => {
    if (err) {
      return res.sendStatus(403); // Forbidden (token is invalid)
    }
    req.user = user;
    next();
  });
};

// 5. MOODS API ROUTES (Protected by middleware)
// (Get all moods for the logged-in user)
app.get('/api/moods', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const moods = await db.query(
      'SELECT * FROM moods WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(moods.rows);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// (Create a new mood)
app.post('/api/moods', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const { mood_value, mood_emoji, notes } = req.body;

    if (!mood_value || !mood_emoji) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const newMood = await db.query(
      'INSERT INTO moods (user_id, mood_value, mood_emoji, notes) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, mood_value, mood_emoji, notes]
    );
    res.status(201).json(newMood.rows[0]);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// (Delete a mood)
app.delete('/api/moods/:id', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const { id } = req.params;

    const result = await db.query(
      'DELETE FROM moods WHERE id = $1 AND user_id = $2 RETURNING *',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Mood not found or not authorized' });
    }
    res.json({ message: 'Mood deleted' });
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// 6. PROFILE API ROUTES (Protected by middleware)
// (Get user stats and profile info)
app.get('/api/profile/stats', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;

    const userRes = await db.query('SELECT username, created_at FROM users WHERE id = $1', [userId]);
    if (userRes.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const profile = userRes.rows[0];

    const moodRes = await db.query('SELECT COUNT(id) FROM moods WHERE user_id = $1', [userId]);
    const moodCount = parseInt(moodRes.rows[0].count, 10);
    
    res.json({
      username: profile.username,
      created_at: profile.created_at,
      totalMoods: moodCount,
      totalChallenges: 0, // Hardcoded as 0
      totalPosts: 0, // Hardcoded as 0
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
  }
});

// (Update user profile - username)
app.put('/api/profile', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user;
    const { username } = req.body;

    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    const updatedUser = await db.query(
      'UPDATE users SET username = $1 WHERE id = $2 RETURNING id, username, email',
      [username, userId]
    );

    if (updatedUser.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ username: updatedUser.rows[0].username });
  } catch (error) {
    console.error(error.message);
    if (error.code === '23505') {
         return res.status(400).json({ error: 'Username already taken' });
    }
    res.status(500).send('Server error');
  }
});

// 7. START THE SERVER
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});