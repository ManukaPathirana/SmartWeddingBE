const db = require('../db/db');

// Utility to generate slug from title
function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// POST /api/weddings
exports.createWedding = async (req, res) => {
  const { event_date } = req.body;
  const username = req.user && req.user.username;
  if (!username || !event_date) {
    return res.status(400).json({ error: 'Username (from login) and event_date are required' });
  }
  try {
    const pool = await db.connect();
    // Check for duplicate wedding for this username
    const check = await pool.request()
      .input('username', db.sql.NVarChar, username)
      .query('SELECT id FROM Weddings WHERE username = @username');
    if (check.recordset.length > 0) {
      return res.status(409).json({ error: 'Wedding for this user already exists' });
    }
    const result = await pool.request()
      .input('username', db.sql.NVarChar, username)
      .input('event_date', db.sql.Date, event_date)
      .query(`INSERT INTO Weddings (username, event_date) OUTPUT INSERTED.* VALUES (@username, @event_date)`);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// GET /api/weddings/:slug
exports.getWeddingBySlug = async (req, res) => {
  const { slug } = req.params;
  try {
    const pool = await db.connect();
    const result = await pool.request()
      .input('slug', db.sql.NVarChar, slug)
      .query('SELECT * FROM Weddings WHERE slug = @slug');
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Wedding not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
