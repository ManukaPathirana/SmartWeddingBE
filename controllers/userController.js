const db = require('../db/db');
const bcrypt = require('bcrypt');

// Create a new user
exports.signup = async (req, res) => {
  const { name, address, email, mobile, username, password } = req.body;
  if (!name || !address || !email || !mobile || !username || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }
  try {
    const pool = await db.connect();
    // Check if username or email already exists
    const check = await pool.request()
      .input('username', db.sql.NVarChar, username)
      .input('email', db.sql.NVarChar, email)
      .query('SELECT id FROM Users WHERE username = @username OR email = @email');
    if (check.recordset.length > 0) {
      return res.status(409).json({ error: 'Username or email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.request()
      .input('name', db.sql.NVarChar, name)
      .input('address', db.sql.NVarChar, address)
      .input('email', db.sql.NVarChar, email)
      .input('mobile', db.sql.NVarChar, mobile)
      .input('username', db.sql.NVarChar, username)
      .input('password', db.sql.NVarChar, hashedPassword)
      .query(`INSERT INTO Users (name, address, email, mobile, username, password)
              OUTPUT INSERTED.id, INSERTED.username
              VALUES (@name, @address, @email, @mobile, @username, @password)`);
    res.status(201).json({ id: result.recordset[0].id, username: result.recordset[0].username });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};

// Login user
exports.login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  try {
    const pool = await db.connect();
    const userResult = await pool.request()
      .input('username', db.sql.NVarChar, username)
      .query('SELECT * FROM Users WHERE username = @username');
    if (userResult.recordset.length === 0) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    const user = userResult.recordset[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: 'Invalid username or password' });
    }
    // For simplicity, return user info (in production, use JWT)
    res.json({ id: user.id, username: user.username, name: user.name });
  } catch (err) {
    res.status(500).json({ error: 'Server error', details: err.message });
  }
};
