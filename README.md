# 📍 Karunya Campus Navigation & Resource Finder
### Data Structures & Algorithms (DSA) Micro-Project — Semester 3

A full-stack, graph-based campus navigation system and resource finder engineered for **Karunya Institute of Technology and Sciences (Coimbatore)**. The system calculates mathematically optimal pedestrian walking paths, identifies nearest campus facilities (canteens, study centres, ATMs, clinics), and provides interactive visualization of core data structures.

---

## 🚀 Key Features

1. **Shortest Walkable Route Finder (Dijkstra's Algorithm & Min-Heap)**
   - Computes the shortest walking distance (in meters) and estimated walking time (in minutes) between any two campus landmarks.
   - Utilizes a custom **Binary Min-Heap** as an indexed priority queue for $O((V + E) \log V)$ optimal performance.
   - Dynamically reconstructs path sequences using a custom **Singly Linked List** to output turn-by-turn navigation instructions.
   - Interactive animated walking simulator on the campus map.

2. **Nearest Campus Amenity Finder (Breadth-First Search - BFS & Queue)**
   - Unweighted shortest-hops facility finder using a custom **FIFO Queue**.
   - Identifies the closest food court/canteen, central library, clinic, sports complex, or administrative office from the user's current location.

3. **High-Speed Landmark Directory (Merge Sort & Binary Search)**
   - Custom **Merge Sort** ($O(N \log N)$) for alphabetical and category-based sorting.
   - Custom **Binary Search** ($O(\log N)$) for instant landmark lookup.

4. **Instant O(1) Landmark Lookup (Separate Chaining Hash Table)**
   - Custom hash table utilizing the **DJB2 polynomial rolling hash** algorithm with linked bucket collision resolution.
   - Dynamic rehashing when load factor $\alpha > 0.75$.

5. **Interactive Geospatial Visualization (Leaflet.js)**
   - Accurate GPS coordinate mapping of 25+ Karunya University buildings and 33+ walkable pedestrian pathways.
   - Category-coded map markers, street and satellite view toggles, and glowing neon route polylines.

6. **Admin Management Portal & Security (JWT Authentication)**
   - Role-based access control protecting campus graph mutation endpoints.
   - Add/remove campus landmarks and pathways in real time.

---

## 🧠 Data Structures & Algorithms Implementation Matrix

| Data Structure / Algorithm | Source File | Purpose in Project | Time Complexity | Space Complexity |
| :--- | :--- | :--- | :--- | :--- |
| **Graph (Adjacency List)** | `src/dsa/Graph.js` | Campus landmarks & pedestrian network | Add Vertex: $O(1)$<br>Add Edge: $O(1)$ | $O(V + E)$ |
| **Binary Min-Heap** | `src/dsa/MinHeap.js` | Priority queue for Dijkstra relaxation | Insert: $O(\log N)$<br>ExtractMin: $O(\log N)$<br>DecreaseKey: $O(\log N)$ | $O(N)$ |
| **Hash Table** | `src/dsa/HashTable.js` | Landmark caching & $O(1)$ ID lookups | Average Search: $O(1)$<br>Average Insert: $O(1)$ | $O(N + M)$ |
| **Singly Linked List** | `src/dsa/LinkedList.js` | Shortest path reconstruction & turns | Append / Prepend: $O(1)$<br>Traversal: $O(N)$ | $O(N)$ |
| **Queue (FIFO)** | `src/dsa/Queue.js` | Level-order BFS traversal | Enqueue: $O(1)$<br>Dequeue: $O(1)$ | $O(N)$ |
| **Dijkstra's Algorithm** | `src/dsa/Dijkstra.js` | Optimal pedestrian path calculation | Path Finding: $O((V + E) \log V)$ | $O(V)$ |
| **Breadth-First Search** | `src/dsa/BFS.js` | Nearest facility search by category | Traversal: $O(V + E)$ | $O(V)$ |
| **Merge Sort** | `src/dsa/Sorting.js` | Alphabetical ordering of landmarks | Worst & Average: $O(N \log N)$ | $O(N)$ |
| **Binary Search** | `src/dsa/Sorting.js` | Instant building search by name | Search: $O(\log N)$ | $O(1)$ |

---

## 📂 Project Structure

```text
Karunya-Campus-Navigation/
├── public/                     # Frontend Web Application
│   ├── css/
│   │   └── style.css           # Glassmorphism dark theme styling
│   ├── js/
│   │   ├── app.js              # Application controller & UI events
│   │   ├── dsa-client.js       # Client-side DSA engine bundle
│   │   └── map.js              # Leaflet campus map controller
│   └── index.html              # Main single-page web app
├── server/                     # Backend API Server (Node.js & Express)
│   ├── data/
│   │   ├── buildings.json      # Karunya campus landmark dataset (25 landmarks)
│   │   ├── paths.json          # Walkable pedestrian network (33 edges)
│   │   └── generate_seed.js    # Dataset verification & seed utility
│   ├── middleware/
│   │   └── auth.js             # JWT authentication middleware
│   ├── routes/
│   │   ├── adminRoutes.js      # Protected CRUD routes for buildings & paths
│   │   └── campusRoutes.js     # Public read-only endpoints
│   ├── config.js               # Server configuration & credentials
│   └── server.js               # Main Express application entry point
├── src/
│   └── dsa/                    # Custom Core Data Structures & Algorithms
│       ├── BFS.js              # Breadth-First Search implementations
│       ├── Dijkstra.js         # Dijkstra algorithm with MinHeap
│       ├── Graph.js            # Adjacency list graph
│       ├── HashTable.js        # Separate chaining hash table
│       ├── LinkedList.js       # Singly linked list & directions
│       ├── MinHeap.js          # Indexed binary min-heap
│       ├── Queue.js            # First-In First-Out queue
│       ├── Sorting.js          # Merge Sort & Binary Search
│       └── index.js            # Central DSA export module
├── tests/                      # Automated Unit Test Suites (Node.js Test Runner)
│   ├── dsa.test.js             # 24 Unit tests for custom DSA data structures
│   └── server.test.js          # 6 Integration & security authentication tests
├── package.json
└── README.md
```

---

## 🛠️ Getting Started

### Prerequisites
- Node.js (version 18 or higher recommended)
- npm

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Running Automated Tests
Run the complete unit test suite (30 automated tests):
```bash
npm test
```

### 3. Launching the Web Application
Start the local server:
```bash
npm start
```
Open your web browser and navigate to:
```text
http://localhost:3000
```

---

## 🔐 Administrator Demonstration Credentials

- **Username**: `admin`
- **Password**: `karunya123`
*(Allows adding and removing landmarks and walkable paths through the Admin Portal tab)*

---

## 🎓 Academic Information
- **Course**: Data Structures & Algorithms (DSA)
- **Institution**: Karunya Institute of Technology and Sciences, Coimbatore
- **Semester**: 3
