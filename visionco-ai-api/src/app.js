const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');
const aiRoutes = require('./routes/ai.routes');
const { errorHandler } = require('./middleware/error.middleware');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// --- Security Middleware ---
app.use(helmet());
app.use(cors());

// --- Rate Limiting ---
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: { error: 'Too many requests, please try again later.' }
});
app.use(limiter);

// --- Body Parsers ---
app.use(express.json({ limit: '10kb' })); // JSON body limit

// --- Routes ---
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use('/v1', aiRoutes);

// --- 404 Handler ---
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found' });
});

// --- Centralized Error Handling ---
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Visionco AI API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app;
