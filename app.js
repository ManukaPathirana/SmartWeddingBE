require('dotenv').config();
const express = require('express');
const cors = require('cors');

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./swagger.yaml');
const db = require('./db/db');

const app = express();


// Middleware
app.use(cors());
app.use(express.json());
console.log('CORS and JSON middleware enabled');

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
console.log('Swagger UI available at /api-docs');

// Routes
const weddingRoutes = require('./routes/weddingRoutes');
const guestRoutes = require('./routes/guestRoutes');
const rsvpRoutes = require('./routes/rsvpRoutes');

console.log('Mounting /api/weddings routes');
app.use('/api/weddings', weddingRoutes);
console.log('Mounting /api/guests routes');
app.use('/api/guests', guestRoutes);
console.log('Mounting /api/rsvp routes');
app.use('/api/rsvp', rsvpRoutes);

// Basic route
app.get('/', (req, res) => {
  console.log('Root endpoint hit');
  res.send('Smart Wedding Backend API is running');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    details: err.details || undefined
  });
});

const PORT = process.env.PORT || 5000;

// Test DB connection and start server
(async () => {
  try {
    await db.connect();
    console.log('Connected to MSSQL database');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
})();
