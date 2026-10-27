/**
 * Campus Public Routes (Read-Only for Students & Visitors)
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const BUILDINGS_FILE = path.join(__dirname, '../data/buildings.json');
const PATHS_FILE = path.join(__dirname, '../data/paths.json');

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

/**
 * GET /api/campus/buildings
 * Returns all verified campus buildings and facilities
 */
router.get('/buildings', (req, res) => {
  try {
    const buildings = readJSON(BUILDINGS_FILE);
    res.json({ success: true, count: buildings.length, data: buildings });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to read campus buildings data.' });
  }
});

/**
 * GET /api/campus/buildings/:id
 * Returns a specific building by ID
 */
router.get('/buildings/:id', (req, res) => {
  try {
    const buildings = readJSON(BUILDINGS_FILE);
    const building = buildings.find((b) => b.id.toUpperCase() === req.params.id.toUpperCase());
    if (!building) {
      return res.status(404).json({ success: false, error: 'Building not found.' });
    }
    res.json({ success: true, data: building });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to retrieve building.' });
  }
});

/**
 * GET /api/campus/paths
 * Returns all verified walkable pedestrian pathway connections
 */
router.get('/paths', (req, res) => {
  try {
    const paths = readJSON(PATHS_FILE);
    res.json({ success: true, count: paths.length, data: paths });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to read campus walkable paths.' });
  }
});

/**
 * GET /api/campus/categories
 * Returns distinct category list (e.g. academic, canteen, shop, hostel, etc.)
 */
router.get('/categories', (req, res) => {
  try {
    const buildings = readJSON(BUILDINGS_FILE);
    const categories = Array.from(new Set(buildings.map((b) => b.category)));
    res.json({ success: true, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to read categories.' });
  }
});

module.exports = router;
