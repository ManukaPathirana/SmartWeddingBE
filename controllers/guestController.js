const db = require('../db/db');
const { nanoid } = require('nanoid');

// POST /api/guests/bulk
exports.bulkAddGuests = async (req, res) => {
  const { username, guests } = req.body;
  if (!username || !Array.isArray(guests) || guests.length === 0) {
    return res.status(400).json({ error: 'username and guests array are required' });
  }
  try {
    const pool = await db.connect();
    // Check if username exists
    const userResult = await pool.request()
      .input('username', db.sql.NVarChar, username)
      .query('SELECT id FROM Users WHERE username = @username');
    if (userResult.recordset.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    // Get wedding for this user
    const weddingResult = await pool.request()
      .input('username', db.sql.NVarChar, username)
      .query('SELECT id FROM Weddings WHERE username = @username');
    if (weddingResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Wedding not found for this user' });
    }
    const wedding_id = weddingResult.recordset[0].id;
    const results = [];
    for (const g of guests) {
      const token = nanoid(12);
      const request = pool.request()
        .input('wedding_id', db.sql.Int, wedding_id)
        .input('name', db.sql.NVarChar, g.name)
        .input('email', db.sql.NVarChar, g.email)
        .input('phone', db.sql.NVarChar, g.phone)
        .input('token', db.sql.NVarChar, token);
      const result = await request.query(`
        INSERT INTO Guests (wedding_id, name, email, phone, token)
        OUTPUT INSERTED.*
        VALUES (@wedding_id, @name, @email, @phone, @token)
      `);
      results.push(result.recordset[0]);
    }
    res.status(201).json(results);
  } catch (err) {
    if (err.number === 2627) {
      return res.status(409).json({ error: 'Duplicate guest token or email' });
    }
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// GET /api/guests/:token
exports.getGuestByToken = async (req, res) => {
  const { token } = req.params;
  try {
    const pool = await db.connect();
    const result = await pool.request()
      .input('token', db.sql.NVarChar, token)
      .query('SELECT name, wedding_id FROM Guests WHERE token = @token');
    if (result.recordset.length === 0) {
      return res.status(404).json({ error: 'Guest not found' });
    }
    res.json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
