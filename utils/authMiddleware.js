const db = require('../db/db');

// Simple middleware to check for user authentication (expects user id in req.header)
module.exports = async (req, res, next) => {
  const userId = req.header('x-user-id');
  if (!userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  try {
    const pool = await db.connect();
    const userResult = await pool.request()
      .input('id', db.sql.Int, userId)
      .query('SELECT id, username, name FROM Users WHERE id = @id');
    if (userResult.recordset.length === 0) {
      return res.status(401).json({ error: 'Invalid user' });
    }
    req.user = userResult.recordset[0];
    next();
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
