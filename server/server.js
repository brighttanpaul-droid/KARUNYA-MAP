/**
 * Karunya Campus Navigation & Resource Finder
 * Main Express Application Server
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const config = require('./config');
const campusRoutes = require('./routes/campusRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static frontend assets
app.use(express.static(path.join(__dirname, '../public')));
// Also serve client-side DSA modules
app.use('/dsa', express.static(path.join(__dirname, '../src/dsa')));

// API Routes
app.use('/api/campus', campusRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'Karunya Campus Navigation & Resource Finder',
    version: '1.0.0',
    dsaEngine: 'Custom JavaScript Graph / MinHeap / Dijkstra / BFS',
    timestamp: new Date().toISOString(),
  });
});

// Fallback to index.html for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start server
if (process.env.NODE_ENV !== 'test') {
  app.listen(config.PORT, () => {
    console.log(`=======================================================`);
    console.log(`🚀 Karunya Campus Navigation Server is running!`);
    console.log(`📍 Web Interface: http://localhost:${config.PORT}`);
    console.log(`🔒 Admin Auth: POST http://localhost:${config.PORT}/api/admin/login`);
    console.log(`=======================================================`);
  });
}

module.exports = app;
