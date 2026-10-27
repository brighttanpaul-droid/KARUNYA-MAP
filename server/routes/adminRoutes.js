/**
 * Admin Protected Routes (Server-Side Authentication & Authorization)
 * 
 * Provides CRUD capabilities for Campus Buildings and Walkable Paths.
 * All modifying endpoints strictly require a valid JWT Bearer token with ADMIN role.
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const config = require('../config');
const { requireAdminAuth } = require('../middleware/auth');

const BUILDINGS_FILE = path.join(__dirname, '../data/buildings.json');
const PATHS_FILE = path.join(__dirname, '../data/paths.json');

function readJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function writeJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
}

/**
 * POST /api/admin/login
 * Authenticates admin and returns signed JWT token
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (
    username === config.ADMIN_CREDENTIALS.username &&
    password === config.ADMIN_CREDENTIALS.password
  ) {
    const token = jwt.sign(
      { username, role: config.ADMIN_CREDENTIALS.role },
      config.JWT_SECRET,
      { expiresIn: config.JWT_EXPIRES_IN }
    );

    return res.json({
      success: true,
      message: 'Authentication successful. Admin session active.',
      token,
      user: { username, role: 'ADMIN' },
    });
  }

  return res.status(401).json({
    success: false,
    error: 'Invalid administrator credentials. Access denied.',
  });
});

/**
 * GET /api/admin/verify
 * Validates active admin session token
 */
router.get('/verify', requireAdminAuth, (req, res) => {
  res.json({ success: true, user: req.user });
});

/**
 * POST /api/admin/buildings
 * Add a new campus building/facility (Protected)
 */
router.post('/buildings', requireAdminAuth, (req, res) => {
  try {
    const { id, name, category, lat, lng, description, icon, verificationStatus, zone, separateCampusArea } = req.body;

    if (!id || !name || !category || lat === undefined || lng === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing required building attributes: id, name, category, lat, lng.',
      });
    }

    const buildings = readJSON(BUILDINGS_FILE);
    const existing = buildings.find((b) => b.id.toUpperCase() === id.toUpperCase());
    if (existing) {
      return res.status(409).json({
        success: false,
        error: `A building with ID "${id}" already exists.`,
      });
    }

    const newBuilding = {
      id: id.toUpperCase().trim(),
      name: name.trim(),
      category: category.toLowerCase().trim(),
      lat: Number(lat),
      lng: Number(lng),
      description: (description || '').trim(),
      icon: icon || 'map-pin',
      verificationStatus: verificationStatus || 'Needs verification',
      zone: zone || 'Campus',
      separateCampusArea: Boolean(separateCampusArea),
    };

    buildings.push(newBuilding);
    writeJSON(BUILDINGS_FILE, buildings);

    res.status(201).json({
      success: true,
      message: `Building "${newBuilding.name}" added successfully.`,
      data: newBuilding,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to add building.' });
  }
});

/**
 * PUT /api/admin/buildings/:id
 * Edit existing building (Protected)
 */
router.put('/buildings/:id', requireAdminAuth, (req, res) => {
  try {
    const targetId = req.params.id.toUpperCase();
    const buildings = readJSON(BUILDINGS_FILE);
    const index = buildings.findIndex((b) => b.id === targetId);

    if (index === -1) {
      return res.status(404).json({ success: false, error: 'Building not found.' });
    }

    const { name, category, lat, lng, description, icon, verificationStatus, zone, separateCampusArea } = req.body;
    buildings[index] = {
      ...buildings[index],
      name: name !== undefined ? name.trim() : buildings[index].name,
      category: category !== undefined ? category.toLowerCase().trim() : buildings[index].category,
      lat: lat !== undefined ? Number(lat) : buildings[index].lat,
      lng: lng !== undefined ? Number(lng) : buildings[index].lng,
      description: description !== undefined ? description.trim() : buildings[index].description,
      icon: icon !== undefined ? icon : buildings[index].icon,
      verificationStatus: verificationStatus !== undefined ? verificationStatus : (buildings[index].verificationStatus || 'Needs verification'),
      zone: zone !== undefined ? zone : (buildings[index].zone || 'Campus'),
      separateCampusArea: separateCampusArea !== undefined ? Boolean(separateCampusArea) : Boolean(buildings[index].separateCampusArea),
    };

    writeJSON(BUILDINGS_FILE, buildings);

    res.json({
      success: true,
      message: `Building "${targetId}" updated successfully.`,
      data: buildings[index],
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to update building.' });
  }
});

/**
 * DELETE /api/admin/buildings/:id
 * Delete building and any connected paths (Protected)
 */
router.delete('/buildings/:id', requireAdminAuth, (req, res) => {
  try {
    const targetId = req.params.id.toUpperCase();
    const buildings = readJSON(BUILDINGS_FILE);
    const filteredBuildings = buildings.filter((b) => b.id !== targetId);

    if (filteredBuildings.length === buildings.length) {
      return res.status(404).json({ success: false, error: 'Building not found.' });
    }

    // Also remove connected paths
    const paths = readJSON(PATHS_FILE);
    const filteredPaths = paths.filter((p) => p.from !== targetId && p.to !== targetId);

    writeJSON(BUILDINGS_FILE, filteredBuildings);
    writeJSON(PATHS_FILE, filteredPaths);

    res.json({
      success: true,
      message: `Building "${targetId}" and related connections removed successfully.`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to delete building.' });
  }
});

/**
 * POST /api/admin/paths
 * Add or update a walkable connection (Protected)
 */
router.post('/paths', requireAdminAuth, (req, res) => {
  try {
    const { from, to, distance, pathName, bidirectional } = req.body;

    if (!from || !to || !distance) {
      return res.status(400).json({
        success: false,
        error: 'Missing required path properties: from, to, distance.',
      });
    }

    const fromId = from.toUpperCase();
    const toId = to.toUpperCase();
    const distNum = Number(distance);

    if (distNum <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Distance must be a positive number in meters.',
      });
    }

    const paths = readJSON(PATHS_FILE);
    // Remove if existing
    const filtered = paths.filter(
      (p) => !(p.from === fromId && p.to === toId) && !(p.from === toId && p.to === fromId)
    );

    const newPath = {
      from: fromId,
      to: toId,
      distance: distNum,
      pathName: pathName ? pathName.trim() : 'Walkable Path',
      bidirectional: bidirectional !== undefined ? Boolean(bidirectional) : true,
    };

    filtered.push(newPath);
    writeJSON(PATHS_FILE, filtered);

    res.status(201).json({
      success: true,
      message: `Path between ${fromId} and ${toId} saved successfully.`,
      data: newPath,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to save pathway.' });
  }
});

/**
 * DELETE /api/admin/paths
 * Remove a connection between two buildings (Protected)
 */
router.delete('/paths', requireAdminAuth, (req, res) => {
  try {
    const { from, to } = req.body;
    if (!from || !to) {
      return res.status(400).json({
        success: false,
        error: 'Please specify both from and to node IDs.',
      });
    }

    const fromId = from.toUpperCase();
    const toId = to.toUpperCase();

    const paths = readJSON(PATHS_FILE);
    const filtered = paths.filter(
      (p) => !(p.from === fromId && p.to === toId) && !(p.from === toId && p.to === fromId)
    );

    writeJSON(PATHS_FILE, filtered);

    res.json({
      success: true,
      message: `Connection between ${fromId} and ${toId} removed.`,
    });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to remove pathway.' });
  }
});

module.exports = router;
