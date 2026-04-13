const db = require('../db/db');

// Utility to generate slug from title
function generateSlug(title) {
  return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

// POST /api/weddings
exports.createWedding = async (req, res) => {
  const { title, event_date } = req.body;
  if (!title || !event_date) {
    return res.status(400).json({ error: 'Title and event_date are required' });
  }
  const slug = generateSlug(title);
  try {
    const pool = await db.connect();
    // Check for duplicate slug
    const check = await pool.request()
      .input('slug', db.sql.NVarChar, slug)
      .query('SELECT id FROM Weddings WHERE slug = @slug');
    if (check.recordset.length > 0) {
      return res.status(409).json({ error: 'Wedding with this slug already exists' });
    }
    const result = await pool.request()
      .input('title', db.sql.NVarChar, title)
      .input('slug', db.sql.NVarChar, slug)
      .input('event_date', db.sql.Date, event_date)
      .query(`INSERT INTO Weddings (title, slug, event_date) OUTPUT INSERTED.* VALUES (@title, @slug, @event_date)`);
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
