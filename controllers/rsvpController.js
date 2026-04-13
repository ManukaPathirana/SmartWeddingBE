const db = require('../db/db');

// POST /api/rsvp
exports.createRSVP = async (req, res) => {
  const { token, attending, guest_count, message } = req.body;
  if (!token || typeof attending !== 'boolean') {
    return res.status(400).json({ error: 'token and attending are required' });
  }
  try {
    const pool = await db.connect();
    // Find guest by token
    const guestResult = await pool.request()
      .input('token', db.sql.NVarChar, token)
      .query('SELECT id FROM Guests WHERE token = @token');
    if (guestResult.recordset.length === 0) {
      return res.status(404).json({ error: 'Guest not found' });
    }
    const guest_id = guestResult.recordset[0].id;
    // Check for duplicate RSVP
    const rsvpCheck = await pool.request()
      .input('guest_id', db.sql.Int, guest_id)
      .query('SELECT id FROM RSVPs WHERE guest_id = @guest_id');
    if (rsvpCheck.recordset.length > 0) {
      return res.status(409).json({ error: 'RSVP already submitted for this guest' });
    }
    // Insert RSVP
    const result = await pool.request()
      .input('guest_id', db.sql.Int, guest_id)
      .input('attending', db.sql.Bit, attending)
      .input('guest_count', db.sql.Int, guest_count || 1)
      .input('message', db.sql.NVarChar, message)
      .query(`INSERT INTO RSVPs (guest_id, attending, guest_count, message)
              OUTPUT INSERTED.*
              VALUES (@guest_id, @attending, @guest_count, @message)`);
    res.status(201).json(result.recordset[0]);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// GET /api/rsvp/:wedding_id
exports.getRSVPsByWedding = async (req, res) => {
  const { wedding_id } = req.params;
  try {
    const pool = await db.connect();
    const result = await pool.request()
      .input('wedding_id', db.sql.Int, wedding_id)
      .query(`SELECT g.name AS guest_name, r.attending, r.guest_count
              FROM RSVPs r
              INNER JOIN Guests g ON r.guest_id = g.id
              WHERE g.wedding_id = @wedding_id`);
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
