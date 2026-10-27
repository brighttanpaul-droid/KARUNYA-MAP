/**
 * Karunya Campus Navigation & Resource Finder
 * Main Frontend Application Controller
 * 
 * Pairs with custom DSA engine (Graph, MinHeap, HashTable, LinkedList, Queue,
 * Dijkstra, BFS, MergeSort, BinarySearch) and server APIs.
 */

document.addEventListener('DOMContentLoaded', () => {
  const app = new AppController();
  window.appController = app;
  app.init();
});

class AppController {
  constructor() {
    this.mapController = new CampusMapController('campusMap');
    this.graph = new KarunyaDSA.Graph();
    this.hashTable = new KarunyaDSA.HashTable(31);

    this.buildings = [];
    this.paths = [];
    this.buildingsMap = new Map(); // id -> building object

    this.adminToken = localStorage.getItem('karunya_admin_token') || null;
    this.currentRouteResult = null;
  }

  async init() {
    // 1. Initialize map
    this.mapController.init();

    // 2. Load campus data from server APIs
    await this.loadCampusData();

    // 3. Setup UI event handlers
    this.setupTabNavigation();
    this.setupRouteFinder();
    this.setupNearestAmenity();
    this.setupSearchAndDirectory();
    this.setupVisualizer();
    this.setupAdminPortal();
    this.setupMapControls();
  }

  // ========================================================
  // DATA LOADING & GRAPH POPULATION
  // ========================================================
  async loadCampusData() {
    try {
      const [buildingsRes, pathsRes] = await Promise.all([
        fetch('/api/campus/buildings').then((r) => r.json()),
        fetch('/api/campus/paths').then((r) => r.json()),
      ]);

      if (buildingsRes.success && pathsRes.success) {
        this.buildings = buildingsRes.data;
        this.paths = pathsRes.data;

        // Build data structures
        this.graph = new KarunyaDSA.Graph();
        this.hashTable = new KarunyaDSA.HashTable(31);
        this.buildingsMap.clear();

        this.buildings.forEach((b) => {
          this.buildingsMap.set(b.id, b);
          this.graph.addNode(b.id, b);
          this.hashTable.set(b.id, b);
        });

        this.paths.forEach((p) => {
          this.graph.addEdge(p.from, p.to, p.distance, p.bidirectional !== false, {
            pathName: p.pathName || 'Campus pathway',
          });
        });

        // Update header status
        const statusText = document.getElementById('graphStatusText');
        if (statusText) {
          statusText.textContent = `${this.graph.getNodeCount()} Landmarks • ${this.graph.getEdgeCount()} Walkways`;
        }

        // Render on map
        this.mapController.renderBuildings(this.buildings);
        this.mapController.renderPaths(this.paths, this.buildingsMap);

        // Populate dropdowns
        this.populateBuildingDropdowns();
        this.renderBuildingsList(this.buildings);
        this.renderAdminInventory();
        this.refreshVisualizer();
      }
    } catch (err) {
      console.error('Failed to load campus graph data:', err);
    }
  }

  populateBuildingDropdowns() {
    const originSelect = document.getElementById('routeOrigin');
    const destSelect = document.getElementById('routeDestination');
    const amenityOriginSelect = document.getElementById('amenityOrigin');
    const visualizerNodeSelect = document.getElementById('visualizerNodeSelect');

    const sortedBuildings = KarunyaDSA.mergeSort(this.buildings, (a, b) =>
      a.name.localeCompare(b.name)
    );

    const makeOptions = (defaultSelected = '') => {
      return sortedBuildings
        .map(
          (b) =>
            `<option value="${b.id}" ${b.id === defaultSelected ? 'selected' : ''}>${b.name} (${b.category})${b.verificationStatus !== 'Verified' ? ' ⚠️' : ''}</option>`
        )
        .join('');
    };

    if (originSelect) {
      originSelect.innerHTML = `<option value="">-- Select Starting Point --</option>` + makeOptions('MAIN_GATE');
    }
    if (destSelect) {
      destSelect.innerHTML = `<option value="">-- Select Destination --</option>` + makeOptions('CTC_LIBRARY');
    }
    if (amenityOriginSelect) {
      amenityOriginSelect.innerHTML = `<option value="">-- Current Location --</option>` + makeOptions('CSE_DEPT');
    }
    if (visualizerNodeSelect) {
      visualizerNodeSelect.innerHTML = makeOptions('ADMIN');
    }
  }

  // ========================================================
  // NAVIGATION TABS
  // ========================================================
  setupTabNavigation() {
    const tabButtons = document.querySelectorAll('.nav-tab-btn');
    const tabContents = document.querySelectorAll('.sidebar-tab-content');

    tabButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');

        tabButtons.forEach((b) => b.classList.remove('active'));
        tabContents.forEach((c) => c.classList.remove('active'));

        btn.classList.add('active');
        const content = document.getElementById(targetTab);
        if (content) content.classList.add('active');

        this.mapController.invalidateSize();

        if (targetTab === 'visualizerTab') {
          this.refreshVisualizer();
        }
      });
    });
  }

  // ========================================================
  // 1. ROUTE FINDER (DIJKSTRA SHORTCUT)
  // ========================================================
  setupRouteFinder() {
    const calculateBtn = document.getElementById('btnCalculateRoute');
    const swapBtn = document.getElementById('btnSwapLocations');
    const clearBtn = document.getElementById('btnClearRoute');
    const simulateBtn = document.getElementById('btnSimulateWalk');

    if (swapBtn) {
      swapBtn.addEventListener('click', () => {
        const originSelect = document.getElementById('routeOrigin');
        const destSelect = document.getElementById('routeDestination');
        const temp = originSelect.value;
        originSelect.value = destSelect.value;
        destSelect.value = temp;
      });
    }

    if (calculateBtn) {
      calculateBtn.addEventListener('click', () => this.calculateShortestPath());
    }

    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        this.mapController.clearActiveRoute();
        const resBox = document.getElementById('routeResultBox');
        if (resBox) resBox.style.display = 'none';
        this.currentRouteResult = null;
      });
    }

    if (simulateBtn) {
      simulateBtn.addEventListener('click', () => {
        if (this.currentRouteResult && this.currentRouteResult.pathArray) {
          this.mapController.simulateWalker(this.currentRouteResult.pathArray, this.buildingsMap);
        }
      });
    }
  }

  calculateShortestPath() {
    const origin = document.getElementById('routeOrigin').value;
    const dest = document.getElementById('routeDestination').value;

    if (!origin || !dest) {
      alert('Please select both a Starting Point and a Destination.');
      return;
    }

    const startTime = performance.now();
    const result = KarunyaDSA.dijkstra(this.graph, origin, dest);
    const endTime = performance.now();
    const latencyMs = (endTime - startTime).toFixed(3);

    this.currentRouteResult = result;

    const resBox = document.getElementById('routeResultBox');
    if (!result.success) {
      alert(result.message || 'No walkable path found between the selected locations.');
      if (resBox) resBox.style.display = 'none';
      return;
    }

    // Update UI Stats
    document.getElementById('statDistance').textContent = `${result.totalDistance} m`;
    document.getElementById('statTime').textContent = `${result.totalTimeMinutes} min`;
    document.getElementById('statNodesCount').textContent = `${result.pathArray.length} landmarks`;
    document.getElementById('statExplored').textContent = `${result.nodesExploredCount} waypoints`;
    document.getElementById('dsaLatency').textContent = `Optimal Path • Calculated in ${latencyMs} ms`;

    // Render Turn-by-Turn directions
    const dirList = document.getElementById('directionsList');
    if (dirList) {
      dirList.innerHTML = result.directions
        .map(
          (d) => `
          <div class="direction-item">
            <div class="direction-step-badge">Step ${d.step}</div>
            <div class="direction-text">
              <div>${d.instruction}</div>
              <div class="direction-dist">Distance: ${d.distanceMeters} m &bull; ${d.pathName}</div>
            </div>
          </div>
        `
        )
        .join('');
    }

    if (resBox) resBox.style.display = 'flex';

    // Highlight on map & animate
    this.mapController.highlightRoute(result.pathArray, this.buildingsMap);
  }

  setRouteOrigin(buildingId) {
    const select = document.getElementById('routeOrigin');
    if (select) {
      select.value = buildingId;
      // Switch to route tab
      document.querySelector('[data-tab="routeTab"]')?.click();
    }
  }

  setRouteDestination(buildingId) {
    const select = document.getElementById('routeDestination');
    if (select) {
      select.value = buildingId;
      // Switch to route tab
      document.querySelector('[data-tab="routeTab"]')?.click();
    }
  }

  // ========================================================
  // 2. NEAREST AMENITY FINDER (BFS)
  // ========================================================
  setupNearestAmenity() {
    const catCards = document.querySelectorAll('.amenity-cat-card');
    let selectedCategory = 'dining';

    catCards.forEach((card) => {
      card.addEventListener('click', () => {
        catCards.forEach((c) => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedCategory = card.getAttribute('data-category');
      });
    });

    const findBtn = document.getElementById('btnFindAmenity');
    if (findBtn) {
      findBtn.addEventListener('click', () => {
        const originId = document.getElementById('amenityOrigin').value;
        if (!originId) {
          alert('Please select your current campus location.');
          return;
        }

        const res = KarunyaDSA.findNearestByCategory(this.graph, originId, selectedCategory);
        const resCard = document.getElementById('amenityResultCard');

        if (!res.success) {
          alert(res.message || 'No facility found in this category.');
          if (resCard) resCard.style.display = 'none';
          return;
        }

        const nearest = res.nearestBuilding;
        document.getElementById('amenityFoundName').textContent = nearest.name;
        document.getElementById('amenityFoundDesc').textContent = nearest.description || '';
        document.getElementById('amenityFoundHops').textContent = `${res.hops} path hops away via BFS Queue`;

        const statusBadge = document.getElementById('amenityFoundStatus');
        if (statusBadge) {
          if (nearest.verificationStatus === 'Verified') {
            statusBadge.className = 'status-badge-verified';
            statusBadge.textContent = 'Verified';
          } else {
            statusBadge.className = 'status-badge-unverified';
            statusBadge.textContent = 'Needs verification';
          }
        }

        const gotoBtn = document.getElementById('btnAmenityNavigate');
        if (gotoBtn) {
          gotoBtn.onclick = () => {
            document.getElementById('routeOrigin').value = originId;
            document.getElementById('routeDestination').value = nearest.id;
            document.querySelector('[data-tab="routeTab"]')?.click();
            this.calculateShortestPath();
          };
        }

        if (resCard) resCard.style.display = 'flex';
      });
    }
  }

  // ========================================================
  // 3. CAMPUS DIRECTORY & SEARCH (MERGE SORT & BINARY SEARCH)
  // ========================================================
  setupSearchAndDirectory() {
    const searchInput = document.getElementById('directorySearchInput');
    const filterPills = document.querySelectorAll('.filter-pill');
    const statusBtns = document.querySelectorAll('.status-filter-btn');

    let currentCategory = 'all';
    let currentStatus = 'all';

    filterPills.forEach((pill) => {
      pill.addEventListener('click', () => {
        filterPills.forEach((p) => p.classList.remove('active'));
        pill.classList.add('active');
        currentCategory = pill.getAttribute('data-cat') || 'all';
        this.filterAndRenderBuildings(searchInput?.value || '', currentCategory, currentStatus);
      });
    });

    statusBtns.forEach((btn) => {
      btn.addEventListener('click', () => {
        statusBtns.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        currentStatus = btn.getAttribute('data-status') || 'all';
        this.filterAndRenderBuildings(searchInput?.value || '', currentCategory, currentStatus);
      });
    });

    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filterAndRenderBuildings(e.target.value, currentCategory, currentStatus);
      });
    }
  }

  filterAndRenderBuildings(query, category = 'all', status = 'all') {
    let filtered = [...this.buildings];

    if (category !== 'all') {
      filtered = filtered.filter((b) => (b.category || '').toLowerCase() === category.toLowerCase());
    }

    if (status === 'verified') {
      filtered = filtered.filter((b) => b.verificationStatus === 'Verified');
    } else if (status === 'unverified') {
      filtered = filtered.filter((b) => b.verificationStatus !== 'Verified');
    }

    if (query && query.trim()) {
      const q = query.toLowerCase().trim();
      filtered = filtered.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.id.toLowerCase().includes(q) ||
          (b.zone || '').toLowerCase().includes(q) ||
          (b.description || '').toLowerCase().includes(q)
      );
    }

    // Sort using custom MergeSort
    const sorted = KarunyaDSA.mergeSort(filtered, (a, b) => a.name.localeCompare(b.name));
    this.renderBuildingsList(sorted);
  }

  renderBuildingsList(list) {
    const container = document.getElementById('buildingsListContainer');
    if (!container) return;

    if (list.length === 0) {
      container.innerHTML = `<div style="color: #64748b; font-size: 13px; text-align: center; padding: 24px;">No campus landmarks match your query or filter criteria.</div>`;
      return;
    }

    container.innerHTML = list
      .map(
        (b) => `
        <div class="building-item-card" onclick="window.appController.mapController.focusBuilding('${b.id}')">
          <div class="building-card-top">
            <span class="building-card-title">${b.name}</span>
            <span class="building-cat-badge cat-${b.category || 'amenity'}">${b.category}</span>
          </div>
          <div style="display: flex; gap: 6px; align-items: center; margin-top: 4px; flex-wrap: wrap;">
            <span class="${b.verificationStatus === 'Verified' ? 'status-badge-verified' : 'status-badge-unverified'}">
              ${b.verificationStatus === 'Verified' ? 'Verified' : 'Needs verification'}
            </span>
            ${b.zone ? `<span class="badge-zone">${b.zone}</span>` : ''}
            ${b.separateCampusArea ? `<span class="badge-kcs">Separate Campus Area</span>` : ''}
          </div>
          <div class="building-desc">${b.description || 'Karunya Landmark'}</div>
          <div style="font-size: 10.5px; color: var(--text-muted); font-family: var(--font-mono);">
            Coord: ${b.lat.toFixed(5)}, ${b.lng.toFixed(5)}
          </div>
          <div class="building-card-actions">
            <button class="btn-outline" onclick="event.stopPropagation(); window.appController.setRouteOrigin('${b.id}')">Start</button>
            <button class="btn-outline" onclick="event.stopPropagation(); window.appController.setRouteDestination('${b.id}')">Destination</button>
            <button class="btn-outline" onclick="event.stopPropagation(); window.appController.mapController.focusBuilding('${b.id}')">Locate</button>
          </div>
        </div>
      `
      )
      .join('');
  }

  // ========================================================
  // 4. DSA VISUALIZER
  // ========================================================
  setupVisualizer() {
    const select = document.getElementById('visualizerNodeSelect');
    if (select) {
      select.addEventListener('change', () => this.refreshVisualizer());
    }
  }

  refreshVisualizer() {
    const select = document.getElementById('visualizerNodeSelect');
    const selectedId = select ? select.value : 'ADMIN';

    // 1. Adjacency List visualizer
    const adjBox = document.getElementById('adjListBox');
    if (adjBox && selectedId) {
      const neighbors = this.graph.getNeighbors(selectedId);
      const nodeData = this.graph.getNode(selectedId);

      let text = `VERTEX: ${selectedId} (${nodeData?.name || ''})\n`;
      text += `Total Outgoing Edges: ${neighbors.length}\n`;
      text += `--------------------------------------------------\n`;
      neighbors.forEach((e) => {
        const destName = this.graph.getNode(e.to)?.name || e.to;
        text += `  Edge -> ${e.to} | Weight: ${e.weight}m | Path: "${e.pathName || 'Walkway'}"\n`;
      });
      adjBox.textContent = text;
    }

    // 2. Hash Table Buckets visualizer
    const htBox = document.getElementById('hashTableBucketsGrid');
    if (htBox) {
      const entries = this.hashTable.entries();
      const loadFactor = this.hashTable.loadFactor().toFixed(2);
      document.getElementById('htStats').textContent = `Count: ${this.hashTable.size()} | Capacity: ${this.hashTable.capacity} | Load Factor: ${loadFactor}`;

      htBox.innerHTML = this.hashTable.buckets
        .map((bucket, index) => {
          if (bucket.length === 0) return '';
          const chainHtml = bucket
            .map((item) => `<span class="bucket-node">[${item.key} : ${item.value.name}]</span>`)
            .join(' -> ');
          return `
            <div class="bucket-row">
              <span class="bucket-index">#${index}</span>
              <div class="bucket-chain">${chainHtml}</div>
            </div>
          `;
        })
        .join('');
    }
  }

  // ========================================================
  // 5. ADMIN PORTAL (JWT AUTHENTICATED)
  // ========================================================
  setupAdminPortal() {
    this.updateAdminUI();

    const loginBtn = document.getElementById('btnAdminLogin');
    const logoutBtn = document.getElementById('btnAdminLogout');
    const addBuildingForm = document.getElementById('formAddBuilding');
    const addPathForm = document.getElementById('formAddPath');
    const togglePickerBtn = document.getElementById('btnToggleMapPicker');
    const pickerStatusText = document.getElementById('pickerStatusText');

    let isMapPicking = false;

    // Coordinate Capture Toggle
    if (togglePickerBtn) {
      togglePickerBtn.addEventListener('click', () => {
        isMapPicking = !isMapPicking;
        if (isMapPicking) {
          togglePickerBtn.textContent = 'Cancel Picker';
          togglePickerBtn.style.background = '#fee2e2';
          togglePickerBtn.style.color = '#991b1b';
          togglePickerBtn.style.borderColor = '#fca5a5';
          if (pickerStatusText) {
            pickerStatusText.textContent = '🎯 Map Picker Active: Click anywhere on the map to set Lat/Lng coordinates.';
            pickerStatusText.style.color = '#dc2626';
          }
          this.mapController.setAdminPickCallback((lat, lng) => {
            const latInput = document.getElementById('newBldgLat');
            const lngInput = document.getElementById('newBldgLng');
            if (latInput) latInput.value = lat.toFixed(7);
            if (lngInput) lngInput.value = lng.toFixed(7);

            isMapPicking = false;
            togglePickerBtn.textContent = 'Pick from Map';
            togglePickerBtn.style.background = '#ffffff';
            togglePickerBtn.style.color = '';
            togglePickerBtn.style.borderColor = '';
            if (pickerStatusText) {
              pickerStatusText.textContent = `✅ Captured: ${lat.toFixed(6)}, ${lng.toFixed(6)} from map click!`;
              pickerStatusText.style.color = '#16a34a';
            }
          });
        } else {
          togglePickerBtn.textContent = 'Pick from Map';
          togglePickerBtn.style.background = '#ffffff';
          togglePickerBtn.style.color = '';
          togglePickerBtn.style.borderColor = '';
          if (pickerStatusText) {
            pickerStatusText.textContent = 'Click "Pick from Map", then click anywhere on the campus map to auto-fill Lat/Lng.';
            pickerStatusText.style.color = '#3b82f6';
          }
          this.mapController.setAdminPickCallback(null);
        }
      });
    }

    if (loginBtn) {
      loginBtn.addEventListener('click', async () => {
        const username = document.getElementById('adminUsername').value;
        const password = document.getElementById('adminPassword').value;

        try {
          const res = await fetch('/api/admin/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
          });
          const data = await res.json();

          if (data.success) {
            this.adminToken = data.token;
            localStorage.setItem('karunya_admin_token', data.token);
            alert('Admin Authentication Successful!');
            this.updateAdminUI();
          } else {
            alert(data.error || 'Authentication failed.');
          }
        } catch (err) {
          alert('Failed to connect to authentication service.');
        }
      });
    }

    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.adminToken = null;
        localStorage.removeItem('karunya_admin_token');
        this.updateAdminUI();
      });
    }

    if (addBuildingForm) {
      addBuildingForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!this.adminToken) return alert('Session expired. Please log in.');

        const id = document.getElementById('newBldgId').value.trim().toUpperCase();
        const isExisting = this.buildingsMap.has(id);

        const categoryVal = document.getElementById('newBldgCategory').value.trim();
        const zoneVal = document.getElementById('newBldgArea') ? document.getElementById('newBldgArea').value : 'Main Campus';
        const verificationVal = document.getElementById('newBldgVerification') ? document.getElementById('newBldgVerification').value : 'Verified';

        const payload = {
          id,
          name: document.getElementById('newBldgName').value.trim(),
          category: categoryVal,
          zone: zoneVal,
          verificationStatus: verificationVal,
          lat: parseFloat(document.getElementById('newBldgLat').value),
          lng: parseFloat(document.getElementById('newBldgLng').value),
          description: document.getElementById('newBldgDesc').value.trim(),
          separateCampusArea: categoryVal === 'school' || zoneVal.includes('Separate'),
        };

        try {
          const url = isExisting ? `/api/admin/buildings/${encodeURIComponent(id)}` : '/api/admin/buildings';
          const method = isExisting ? 'PUT' : 'POST';

          const res = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.adminToken}`,
            },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          if (data.success) {
            alert(`Building "${payload.name}" ${isExisting ? 'updated' : 'added'} successfully!`);
            addBuildingForm.reset();
            await this.loadCampusData();
            this.renderAdminInventory();
          } else {
            alert(data.error || 'Failed to save building.');
          }
        } catch (err) {
          alert('Network request error.');
        }
      });
    }

    if (addPathForm) {
      addPathForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!this.adminToken) return alert('Session expired. Please log in.');

        const payload = {
          from: document.getElementById('newPathFrom').value.trim().toUpperCase(),
          to: document.getElementById('newPathTo').value.trim().toUpperCase(),
          distance: parseInt(document.getElementById('newPathDist').value, 10),
          pathName: document.getElementById('newPathName').value.trim(),
          bidirectional: document.getElementById('newPathBidi').checked,
        };

        try {
          const res = await fetch('/api/admin/paths', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${this.adminToken}`,
            },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          if (data.success) {
            alert('Walkable connection added successfully!');
            addPathForm.reset();
            await this.loadCampusData();
          } else {
            alert(data.error || 'Failed to add path.');
          }
        } catch (err) {
          alert('Network request error.');
        }
      });
    }
  }

  updateAdminUI() {
    const loginSection = document.getElementById('adminLoginSection');
    const managerSection = document.getElementById('adminManagerSection');

    if (this.adminToken) {
      if (loginSection) loginSection.style.display = 'none';
      if (managerSection) managerSection.style.display = 'flex';
      this.renderAdminInventory();
    } else {
      if (loginSection) loginSection.style.display = 'block';
      if (managerSection) managerSection.style.display = 'none';
    }
  }

  renderAdminInventory() {
    const listEl = document.getElementById('adminInventoryList');
    const countEl = document.getElementById('adminInventoryCount');
    if (!listEl) return;

    if (countEl) countEl.textContent = `${this.buildings.length} Items`;

    const sorted = KarunyaDSA.mergeSort(this.buildings, (a, b) => a.name.localeCompare(b.name));

    listEl.innerHTML = sorted
      .map((b) => {
        const isVer = b.verificationStatus === 'Verified';
        return `
          <div class="admin-inventory-item">
            <div style="flex: 1; min-width: 0;">
              <div style="font-weight: 600; font-size: 12px; color: var(--text-primary); text-overflow: ellipsis; overflow: hidden; white-space: nowrap;">
                ${b.name}
              </div>
              <div style="font-size: 10px; color: var(--text-muted); display: flex; gap: 4px; align-items: center; margin-top: 2px;">
                <code>${b.id}</code> &bull;
                <span class="${isVer ? 'status-badge-verified' : 'status-badge-unverified'}" style="font-size: 9px; padding: 1px 4px;">
                  ${isVer ? 'Verified' : 'Needs verification'}
                </span>
                &bull; <span>${b.zone || 'Campus'}</span>
              </div>
            </div>
            <div style="display: flex; gap: 4px; flex-shrink: 0;">
              <button type="button" class="btn-outline" style="padding: 2px 6px; font-size: 10px;" onclick="window.appController.populateAdminForm('${b.id}')">
                Edit
              </button>
              <button type="button" class="btn-outline" style="padding: 2px 6px; font-size: 10px;" onclick="window.appController.toggleBuildingVerification('${b.id}')">
                ${isVer ? 'Unverify' : 'Verify'}
              </button>
              <button type="button" class="btn-outline" style="padding: 2px 6px; font-size: 10px; color: #dc2626; border-color: #fca5a5;" onclick="window.appController.deleteBuilding('${b.id}')">
                Del
              </button>
            </div>
          </div>
        `;
      })
      .join('');
  }

  populateAdminForm(id) {
    const b = this.buildingsMap.get(id);
    if (!b) return;

    const idInput = document.getElementById('newBldgId');
    const nameInput = document.getElementById('newBldgName');
    const catInput = document.getElementById('newBldgCategory');
    const areaInput = document.getElementById('newBldgArea');
    const verInput = document.getElementById('newBldgVerification');
    const latInput = document.getElementById('newBldgLat');
    const lngInput = document.getElementById('newBldgLng');
    const descInput = document.getElementById('newBldgDesc');

    if (idInput) idInput.value = b.id;
    if (nameInput) nameInput.value = b.name;
    if (catInput) catInput.value = b.category || 'academic';
    if (areaInput && b.zone) areaInput.value = b.zone;
    if (verInput) verInput.value = b.verificationStatus || 'Needs verification';
    if (latInput) latInput.value = b.lat;
    if (lngInput) lngInput.value = b.lng;
    if (descInput) descInput.value = b.description || '';

    // Switch to Admin tab and scroll form into view
    document.querySelector('[data-tab="adminTab"]')?.click();
    document.getElementById('formAddBuilding')?.scrollIntoView({ behavior: 'smooth' });
  }

  async toggleBuildingVerification(id) {
    if (!this.adminToken) return alert('Please sign in as Admin first.');
    const b = this.buildingsMap.get(id);
    if (!b) return;

    const newStatus = b.verificationStatus === 'Verified' ? 'Needs verification' : 'Verified';
    try {
      const res = await fetch(`/api/admin/buildings/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.adminToken}`,
        },
        body: JSON.stringify({ verificationStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        await this.loadCampusData();
      } else {
        alert(data.error || 'Failed to update verification status.');
      }
    } catch (err) {
      alert('Network error while updating status.');
    }
  }

  async deleteBuilding(id) {
    if (!this.adminToken) return alert('Please sign in as Admin first.');
    if (!confirm(`Are you sure you want to delete landmark "${id}" and all connected paths?`)) return;

    try {
      const res = await fetch(`/api/admin/buildings/${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${this.adminToken}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        alert(`Landmark "${id}" deleted.`);
        await this.loadCampusData();
      } else {
        alert(data.error || 'Failed to delete building.');
      }
    } catch (err) {
      alert('Network error while deleting landmark.');
    }
  }

  // ========================================================
  // MAP CONTROLS
  // ========================================================
  setupMapControls() {
    const tileBtn = document.getElementById('btnToggleSatellite');
    const resetBtn = document.getElementById('btnResetMapView');

    if (tileBtn) {
      tileBtn.addEventListener('click', () => this.mapController.toggleSatellite());
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.mapController.resetView());
    }
  }
}
