/**
 * Karunya Campus Map Controller (Leaflet.js)
 * 
 * High-Reliability, High-Contrast Interactive Campus Map for
 * Karunya Institute of Technology and Sciences, Coimbatore.
 * 
 * Features:
 * - Multi-source resilient tile layers (CartoDB Voyager, OpenStreetMap, Esri Satellite)
 * - Automatic canvas/SVG fallback rendering
 * - Prominent, interactive campus landmark pins with rich popups & tooltips
 * - Walkable pathway network overlay
 * - Turn-by-turn route visualization with Start/End badges & animated walker
 */

class CampusMapController {
  constructor(containerId = 'campusMap') {
    this.containerId = containerId;
    this.map = null;
    this.markers = new Map();
    this.pathLines = [];
    this.activeRoutePolyline = null;
    this.activeRouteGlow = null;
    this.routeMarkers = [];
    this.walkerMarker = null;
    this.walkerInterval = null;

    // Center coordinates: Karunya Institute of Technology and Sciences, Coimbatore
    this.defaultCenter = [10.9358, 76.7442];
    this.defaultZoom = 17;

    // Standard OpenStreetMap Tile Layer as primary
    this.tileLayers = {
      osm: L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }),
      satellite: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{x}/{y}', {
        attribution: '&copy; Esri, Maxar, Earthstar Geographics',
        maxZoom: 19,
      }),
    };
    this.currentTile = 'osm';
  }

  init() {
    const container = document.getElementById(this.containerId);
    if (!container) {
      console.error('Map container element not found:', this.containerId);
      return;
    }

    try {
      this.map = L.map(this.containerId, {
        center: this.defaultCenter,
        zoom: this.defaultZoom,
        minZoom: 14,
        maxZoom: 19,
        zoomControl: true,
        layers: [this.tileLayers.osm],
      });

      // ResizeObserver for dynamic layout invalidation
      if (typeof ResizeObserver !== 'undefined') {
        const ro = new ResizeObserver(() => {
          this.invalidateSize();
        });
        ro.observe(container);
      }

      // Progressive invalidation to ensure full viewport fill
      this.invalidateSize();
      setTimeout(() => this.invalidateSize(), 100);
      setTimeout(() => this.invalidateSize(), 300);
      setTimeout(() => this.invalidateSize(), 700);

      window.addEventListener('resize', () => {
        this.invalidateSize();
      });

      // Click handler for map coordinates (used by Admin coordinate picker)
      this.map.on('click', (e) => {
        if (typeof this.adminPickCallback === 'function') {
          const lat = Number(e.latlng.lat.toFixed(7));
          const lng = Number(e.latlng.lng.toFixed(7));
          this.clearAdminPickMarker();
          const pickIcon = L.divIcon({
            className: 'campus-endpoint-marker',
            html: `<div class="campus-endpoint-badge" style="background: #2563eb;">SELECTED: ${lat}, ${lng}</div>`,
            iconAnchor: [60, 30],
          });
          this.adminPickMarker = L.marker([lat, lng], { icon: pickIcon }).addTo(this.map);
          this.adminPickCallback(lat, lng);
        }
      });

    } catch (err) {
      console.error('Failed to initialize Leaflet map:', err);
    }
  }

  invalidateSize() {
    if (this.map) {
      this.map.invalidateSize();
    }
  }

  toggleSatellite() {
    if (!this.map) return;

    const btn = document.getElementById('btnToggleSatellite');

    if (this.currentTile !== 'satellite') {
      if (this.map.hasLayer(this.tileLayers.osm)) this.map.removeLayer(this.tileLayers.osm);
      this.map.addLayer(this.tileLayers.satellite);
      this.currentTile = 'satellite';
      if (btn) btn.textContent = 'Street View';
    } else {
      this.map.removeLayer(this.tileLayers.satellite);
      this.map.addLayer(this.tileLayers.osm);
      this.currentTile = 'osm';
      if (btn) btn.textContent = 'Satellite View';
    }
  }

  resetView() {
    if (this.map) {
      this.map.flyTo(this.defaultCenter, this.defaultZoom, { duration: 0.8 });
    }
  }

  getCategoryColor(category) {
    const colors = {
      department: '#2563eb',      // Royal Blue
      academic: '#1d4ed8',        // Blue
      'hostel-boys': '#0284c7',   // Sky Cyan
      'hostel-girls': '#db2777',  // Rose/Pink
      auditorium: '#7c3aed',      // Deep Purple
      lab: '#0f766e',             // Teal
      dining: '#ea580c',          // Orange
      canteen: '#ea580c',         // Orange
      sports: '#16a34a',          // Green
      medical: '#dc2626',         // Crimson Red
      administrative: '#b45309',  // Amber
      amenity: '#d97706',         // Gold
      school: '#4f46e5',          // Indigo (KCS)
      gate: '#475569',            // Slate
    };
    return colors[category?.toLowerCase()] || '#2563eb';
  }

  setAdminPickCallback(callback) {
    this.adminPickCallback = callback;
  }

  clearAdminPickMarker() {
    if (this.adminPickMarker && this.map) {
      this.map.removeLayer(this.adminPickMarker);
      this.adminPickMarker = null;
    }
  }

  renderBuildings(buildings) {
    if (!this.map || !Array.isArray(buildings)) return;

    // Clear existing markers
    this.markers.forEach((marker) => marker.remove());
    this.markers.clear();

    const validLatLngs = [];

    buildings.forEach((b) => {
      if (!b.lat || !b.lng) return;

      validLatLngs.push([b.lat, b.lng]);
      const color = this.getCategoryColor(b.category);
      const isVerified = b.verificationStatus === 'Verified';

      // Clean readable label
      const displayName = b.name.length > 22 ? b.name.substring(0, 20) + '…' : b.name;
      const statusDotClass = isVerified ? 'verified' : 'unverified';

      const customIcon = L.divIcon({
        className: 'campus-clean-pin',
        html: `
          <div class="campus-pin-badge" style="background: ${color};">
            <span class="status-indicator-dot ${statusDotClass}"></span>
            <span>${displayName}</span>
          </div>
        `,
        iconAnchor: [30, 16],
        popupAnchor: [0, -18],
      });

      const marker = L.marker([b.lat, b.lng], {
        icon: customIcon,
        riseOnHover: true,
      });

      const verificationBadgeHtml = isVerified
        ? `<span class="status-badge-verified">Verified</span>`
        : `<span class="status-badge-unverified">Needs verification</span>`;

      const areaBadgeHtml = b.separateCampusArea
        ? `<span class="badge-separate-area">Separate Campus Area (KCS)</span>`
        : `<span style="font-size: 10px; color: #64748b; font-weight: 600;">${b.area || 'Main Campus'}</span>`;

      const popupContent = `
        <div style="min-width: 260px; padding: 4px;">
          <div class="popup-building-title">${b.name}</div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
            <div class="popup-building-cat" style="color: ${color}; margin: 0;">${b.category} &bull; [${b.id}]</div>
            ${verificationBadgeHtml}
          </div>
          <div style="margin-bottom: 6px;">
            ${areaBadgeHtml}
          </div>
          <p class="popup-building-desc">${b.description || 'Karunya University Landmark'}</p>
          <div class="popup-actions">
            <button class="popup-btn popup-btn-start" onclick="window.appController.setRouteOrigin('${b.id}')">
              Set Start
            </button>
            <button class="popup-btn popup-btn-end" onclick="window.appController.setRouteDestination('${b.id}')">
              Set Destination
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.bindTooltip(`<b>${b.name}</b><br><span style="text-transform: capitalize; color: #94a3b8;">${b.category} &bull; ${b.verificationStatus || 'Verified'}</span>`, {
        permanent: false,
        direction: 'top',
        className: 'campus-clean-tooltip',
      });

      marker.addTo(this.map);
      this.markers.set(b.id, marker);
    });

    // Fit map bounds to show all campus buildings
    if (validLatLngs.length > 0) {
      const bounds = L.latLngBounds(validLatLngs);
      this.map.fitBounds(bounds, { padding: [50, 50], maxZoom: 18 });
    }

    this.invalidateSize();
  }

  renderPaths(paths, buildingsMap) {
    if (!this.map || !Array.isArray(paths)) return;

    // Clear existing path lines
    this.pathLines.forEach((line) => line.remove());
    this.pathLines = [];

    paths.forEach((p) => {
      const fromB = buildingsMap.get(p.from);
      const toB = buildingsMap.get(p.to);

      if (fromB && toB && fromB.lat && fromB.lng && toB.lat && toB.lng) {
        const line = L.polyline(
          [
            [fromB.lat, fromB.lng],
            [toB.lat, toB.lng],
          ],
          {
            color: '#3b82f6',
            weight: 2.5,
            opacity: 0.6,
            dashArray: '5, 7',
          }
        );

        line.bindTooltip(`${p.pathName || 'Walkway'} (${p.distance}m)`, {
          sticky: true,
          className: 'campus-clean-tooltip',
        });

        line.addTo(this.map);
        this.pathLines.push(line);
      }
    });
  }

  highlightRoute(pathNodeIds, buildingsMap) {
    this.clearActiveRoute();

    if (!this.map || !pathNodeIds || pathNodeIds.length < 2) return;

    const latLngs = [];
    pathNodeIds.forEach((id) => {
      const b = buildingsMap.get(id);
      if (b && b.lat && b.lng) latLngs.push([b.lat, b.lng]);
    });

    if (latLngs.length < 2) return;

    // Outer Glow / Border Line for high contrast
    this.activeRouteGlow = L.polyline(latLngs, {
      color: '#064e3b',
      weight: 9,
      opacity: 0.4,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(this.map);

    // Active Route Polyline
    this.activeRoutePolyline = L.polyline(latLngs, {
      color: '#10b981', // Vibrant emerald
      weight: 5,
      opacity: 1.0,
      lineCap: 'round',
      lineJoin: 'round',
    }).addTo(this.map);

    // Origin Marker Badge
    const startB = buildingsMap.get(pathNodeIds[0]);
    if (startB) {
      const originIcon = L.divIcon({
        className: 'campus-endpoint-marker',
        html: `<div class="campus-endpoint-badge badge-origin">START</div>`,
        iconAnchor: [24, 30],
      });
      const startMarker = L.marker([startB.lat, startB.lng], { icon: originIcon }).addTo(this.map);
      this.routeMarkers.push(startMarker);
    }

    // Destination Marker Badge
    const endB = buildingsMap.get(pathNodeIds[pathNodeIds.length - 1]);
    if (endB) {
      const destIcon = L.divIcon({
        className: 'campus-endpoint-marker',
        html: `<div class="campus-endpoint-badge badge-destination">END</div>`,
        iconAnchor: [20, 30],
      });
      const endMarker = L.marker([endB.lat, endB.lng], { icon: destIcon }).addTo(this.map);
      this.routeMarkers.push(endMarker);
    }

    // Fit view to route
    this.map.fitBounds(this.activeRoutePolyline.getBounds(), {
      padding: [80, 80],
      maxZoom: 18,
    });
  }

  clearActiveRoute() {
    if (this.activeRoutePolyline && this.map) {
      this.map.removeLayer(this.activeRoutePolyline);
      this.activeRoutePolyline = null;
    }
    if (this.activeRouteGlow && this.map) {
      this.map.removeLayer(this.activeRouteGlow);
      this.activeRouteGlow = null;
    }
    this.routeMarkers.forEach((m) => {
      if (this.map) this.map.removeLayer(m);
    });
    this.routeMarkers = [];

    this.stopWalkerSimulation();
  }

  simulateWalker(pathNodeIds, buildingsMap) {
    this.stopWalkerSimulation();

    if (!this.map || !pathNodeIds || pathNodeIds.length < 2) return;

    const coords = [];
    pathNodeIds.forEach((id) => {
      const b = buildingsMap.get(id);
      if (b && b.lat && b.lng) coords.push([b.lat, b.lng]);
    });

    if (coords.length < 2) return;

    const walkerIcon = L.divIcon({
      className: 'clean-walker-dot',
      html: `
        <div style="
          width: 18px;
          height: 18px;
          background: #10b981;
          border: 3px solid #ffffff;
          border-radius: 50%;
          box-shadow: 0 0 12px rgba(16, 185, 129, 0.8), 0 2px 6px rgba(0,0,0,0.5);
        "></div>
      `,
      iconSize: [18, 18],
      iconAnchor: [9, 9],
    });

    this.walkerMarker = L.marker(coords[0], { icon: walkerIcon }).addTo(this.map);

    let currentSegment = 0;
    let progress = 0;
    const speed = 0.04;

    this.walkerInterval = setInterval(() => {
      if (currentSegment >= coords.length - 1) {
        clearInterval(this.walkerInterval);
        this.walkerInterval = null;
        return;
      }

      const p1 = coords[currentSegment];
      const p2 = coords[currentSegment + 1];

      progress += speed;
      if (progress >= 1) {
        progress = 0;
        currentSegment++;
        if (currentSegment >= coords.length - 1) {
          this.walkerMarker.setLatLng(coords[coords.length - 1]);
          clearInterval(this.walkerInterval);
          this.walkerInterval = null;
          return;
        }
      }

      const curLat = p1[0] + (p2[0] - p1[0]) * progress;
      const curLng = p1[1] + (p2[1] - p1[1]) * progress;

      this.walkerMarker.setLatLng([curLat, curLng]);
    }, 40);
  }

  stopWalkerSimulation() {
    if (this.walkerInterval) {
      clearInterval(this.walkerInterval);
      this.walkerInterval = null;
    }
    if (this.walkerMarker && this.map) {
      this.map.removeLayer(this.walkerMarker);
      this.walkerMarker = null;
    }
  }

  focusBuilding(id) {
    const marker = this.markers.get(id);
    if (marker && this.map) {
      this.map.flyTo(marker.getLatLng(), 18, { duration: 0.8 });
      marker.openPopup();
    }
  }
}

window.CampusMapController = CampusMapController;
