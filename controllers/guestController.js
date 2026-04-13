const db = require('../db/db');
const { nanoid } = require('nanoid');

// POST /api/guests/bulk
exports.bulkAddGuests = async (req, res) => {
  const { wedding_id, guests } = req.body;
  if (!wedding_id || !Array.isArray(guests) || guests.length === 0) {
    return res.status(400).json({ error: 'wedding_id and guests array are required' });
  }
  try {
    const pool = await db.connect();
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
