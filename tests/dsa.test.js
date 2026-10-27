/**
 * Comprehensive Unit Test Suite for Custom DSA Implementations
 * Uses Node.js built-in test runner (node:test) and assertions (node:assert)
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const {
  Graph,
  HashTable,
  MinHeap,
  LinkedList,
  Queue,
  dijkstra,
  bfsTraverse,
  findNearestByCategory,
  bfsShortestPath,
  mergeSort,
  binarySearchByName,
} = require('../src/dsa');

describe('1. Graph (Adjacency List) Data Structure', () => {
  it('should add vertices and retrieve vertex metadata', () => {
    const graph = new Graph();
    graph.addNode('ADMIN', { name: 'Administrative Block', category: 'academic' });
    graph.addNode('CTC', { name: 'Central Library & CTC', category: 'academic' });

    assert.equal(graph.hasNode('ADMIN'), true);
    assert.equal(graph.hasNode('CTC'), true);
    assert.equal(graph.hasNode('UNKNOWN'), false);

    const admin = graph.getNode('ADMIN');
    assert.equal(admin.name, 'Administrative Block');
    assert.equal(admin.category, 'academic');
    assert.equal(graph.getNodeCount(), 2);
  });

  it('should add bidirectional edges and correctly query neighbors', () => {
    const graph = new Graph();
    graph.addEdge('ADMIN', 'CTC', 150, true, { pathName: 'Main Campus Avenue' });

    const adminNeighbors = graph.getNeighbors('ADMIN');
    const ctcNeighbors = graph.getNeighbors('CTC');

    assert.equal(adminNeighbors.length, 1);
    assert.equal(adminNeighbors[0].to, 'CTC');
    assert.equal(adminNeighbors[0].weight, 150);
    assert.equal(adminNeighbors[0].pathName, 'Main Campus Avenue');

    assert.equal(ctcNeighbors.length, 1);
    assert.equal(ctcNeighbors[0].to, 'ADMIN');
    assert.equal(ctcNeighbors[0].weight, 150);
  });

  it('should remove edges cleanly', () => {
    const graph = new Graph();
    graph.addEdge('ADMIN', 'CTC', 150, true);
    graph.removeEdge('ADMIN', 'CTC', true);

    assert.equal(graph.getNeighbors('ADMIN').length, 0);
    assert.equal(graph.getNeighbors('CTC').length, 0);
  });

  it('should remove vertices and cascade remove incident edges', () => {
    const graph = new Graph();
    graph.addEdge('A', 'B', 10);
    graph.addEdge('B', 'C', 20);
    graph.addEdge('A', 'C', 25);

    assert.equal(graph.getNodeCount(), 3);
    const removed = graph.removeNode('B');

    assert.equal(removed, true);
    assert.equal(graph.hasNode('B'), false);
    assert.equal(graph.getNodeCount(), 2);

    // B should no longer be in A's or C's neighbors
    const aNeighbors = graph.getNeighbors('A').map((n) => n.to);
    const cNeighbors = graph.getNeighbors('C').map((n) => n.to);
    assert.deepEqual(aNeighbors, ['C']);
    assert.deepEqual(cNeighbors, ['A']);
  });
});

describe('2. Hash Table (Separate Chaining with Dynamic Resizing)', () => {
  it('should insert, retrieve, and check presence of keys', () => {
    const ht = new HashTable(5);
    ht.set('ADMIN', { name: 'Admin Block', lat: 10.9359 });
    ht.set('CSE', { name: 'Computer Science', lat: 10.9335 });

    assert.equal(ht.has('ADMIN'), true);
    assert.equal(ht.has('CSE'), true);
    assert.equal(ht.has('CIVIL'), false);

    assert.equal(ht.get('ADMIN').name, 'Admin Block');
    assert.equal(ht.get('CSE').name, 'Computer Science');
    assert.equal(ht.size(), 2);
  });

  it('should handle collisions cleanly without losing values', () => {
    const ht = new HashTable(3); // Small capacity forces collisions
    ht.set('key1', 'Value 1');
    ht.set('key2', 'Value 2');
    ht.set('key3', 'Value 3');
    ht.set('key4', 'Value 4');

    assert.equal(ht.get('key1'), 'Value 1');
    assert.equal(ht.get('key2'), 'Value 2');
    assert.equal(ht.get('key3'), 'Value 3');
    assert.equal(ht.get('key4'), 'Value 4');
  });

  it('should update existing keys correctly', () => {
    const ht = new HashTable();
    ht.set('CANTEEN', { status: 'Closed' });
    assert.equal(ht.get('CANTEEN').status, 'Closed');

    ht.set('CANTEEN', { status: 'Open' });
    assert.equal(ht.get('CANTEEN').status, 'Open');
    assert.equal(ht.size(), 1);
  });

  it('should delete keys and decrease size', () => {
    const ht = new HashTable();
    ht.set('A', 1);
    ht.set('B', 2);

    assert.equal(ht.delete('A'), true);
    assert.equal(ht.has('A'), false);
    assert.equal(ht.get('A'), null);
    assert.equal(ht.size(), 1);
    assert.equal(ht.delete('NON_EXISTENT'), false);
  });

  it('should list keys, values, and entries', () => {
    const ht = new HashTable();
    ht.set('k1', 'v1');
    ht.set('k2', 'v2');

    const keys = ht.keys().sort();
    assert.deepEqual(keys, ['k1', 'k2']);
    assert.equal(ht.values().length, 2);
  });
});

describe('3. Min-Heap (Priority Queue for Dijkstra)', () => {
  it('should maintain the minimum element at root and extract in ascending order', () => {
    const heap = new MinHeap();
    heap.insert('CTC', 150);
    heap.insert('ADMIN', 50);
    heap.insert('CSE', 200);
    heap.insert('CANTEEN', 80);

    assert.equal(heap.peek().key, 'ADMIN');
    assert.equal(heap.peek().priority, 50);

    const extracted = [];
    while (!heap.isEmpty()) {
      extracted.push(heap.extractMin());
    }

    assert.equal(extracted.length, 4);
    assert.equal(extracted[0].key, 'ADMIN');
    assert.equal(extracted[1].key, 'CANTEEN');
    assert.equal(extracted[2].key, 'CTC');
    assert.equal(extracted[3].key, 'CSE');
  });

  it('should decrease priority key and re-heapify upward', () => {
    const heap = new MinHeap();
    heap.insert('A', 100);
    heap.insert('B', 200);
    heap.insert('C', 300);

    // Decrease B's distance from 200 to 20
    const decreased = heap.decreaseKey('B', 20);
    assert.equal(decreased, true);

    const min = heap.extractMin();
    assert.equal(min.key, 'B');
    assert.equal(min.priority, 20);
  });

  it('should return null when extracting from an empty heap', () => {
    const heap = new MinHeap();
    assert.equal(heap.extractMin(), null);
    assert.equal(heap.isEmpty(), true);
  });
});

describe('4. Singly Linked List (Route & Navigation Steps)', () => {
  it('should append and prepend items correctly in O(1)', () => {
    const list = new LinkedList();
    list.append('B');
    list.append('C');
    list.prepend('A');

    assert.deepEqual(list.toArray(), ['A', 'B', 'C']);
    assert.equal(list.size(), 3);
  });

  it('should generate step-by-step navigation instructions', () => {
    const graph = new Graph();
    graph.addNode('MAIN_GATE', { name: 'Main Campus Gate' });
    graph.addNode('ADMIN', { name: 'Admin Block' });
    graph.addNode('LIBRARY', { name: 'Central Library' });

    graph.addEdge('MAIN_GATE', 'ADMIN', 120, true, { pathName: 'Palm Drive' });
    graph.addEdge('ADMIN', 'LIBRARY', 180, true, { pathName: 'Academic Corridor' });

    const route = new LinkedList();
    route.append('MAIN_GATE');
    route.append('ADMIN');
    route.append('LIBRARY');

    const directions = route.generateStepDirections(graph);
    assert.equal(directions.length, 2);

    assert.equal(directions[0].fromId, 'MAIN_GATE');
    assert.equal(directions[0].toId, 'ADMIN');
    assert.equal(directions[0].segmentDistance, 120);

    assert.equal(directions[1].fromId, 'ADMIN');
    assert.equal(directions[1].toId, 'LIBRARY');
    assert.equal(directions[1].cumulativeDistance, 300);
    // 300 meters / 72 m/min = 4.2 minutes
    assert.equal(directions[1].cumulativeTimeMin, 4.2);
  });
});

describe('5. Queue (FIFO for Breadth-First Search)', () => {
  it('should enqueue and dequeue items in First-In First-Out order', () => {
    const queue = new Queue();
    queue.enqueue('Item1');
    queue.enqueue('Item2');
    queue.enqueue('Item3');

    assert.equal(queue.size(), 3);
    assert.equal(queue.peek(), 'Item1');

    assert.equal(queue.dequeue(), 'Item1');
    assert.equal(queue.dequeue(), 'Item2');
    assert.equal(queue.dequeue(), 'Item3');
    assert.equal(queue.dequeue(), null);
    assert.equal(queue.isEmpty(), true);
  });
});

describe('6. Dijkstra\'s Algorithm (Shortest Route Calculation)', () => {
  it('should find the mathematically shortest path on a diamond graph', () => {
    const graph = new Graph();
    graph.addNode('A');
    graph.addNode('B');
    graph.addNode('C');
    graph.addNode('D');

    // Route 1: A -> B -> D: distance = 10 + 15 = 25m
    graph.addEdge('A', 'B', 10);
    graph.addEdge('B', 'D', 15);

    // Route 2: A -> C -> D: distance = 30 + 5 = 35m
    graph.addEdge('A', 'C', 30);
    graph.addEdge('C', 'D', 5);

    const result = dijkstra(graph, 'A', 'D');

    assert.equal(result.success, true);
    assert.equal(result.totalDistance, 25);
    assert.deepEqual(result.pathArray, ['A', 'B', 'D']);
    // Walking time: 25 / 72 = 0.3 minutes
    assert.equal(result.totalTimeMinutes, 0.3);
  });

  it('should correctly handle identical start and destination', () => {
    const graph = new Graph();
    graph.addNode('ADMIN', { name: 'Admin Block' });

    const result = dijkstra(graph, 'ADMIN', 'ADMIN');
    assert.equal(result.success, true);
    assert.equal(result.totalDistance, 0);
    assert.deepEqual(result.pathArray, ['ADMIN']);
  });

  it('should handle disconnected or unreachable destinations gracefully', () => {
    const graph = new Graph();
    graph.addNode('ISLAND_A');
    graph.addNode('ISLAND_B');

    const result = dijkstra(graph, 'ISLAND_A', 'ISLAND_B');
    assert.equal(result.success, false);
    assert.deepEqual(result.pathArray, []);
  });
});

describe('7. Breadth-First Search (BFS)', () => {
  it('should perform level-by-level traversal', () => {
    const graph = new Graph();
    graph.addEdge('A', 'B', 1);
    graph.addEdge('A', 'C', 1);
    graph.addEdge('B', 'D', 1);
    graph.addEdge('C', 'E', 1);

    const traversal = bfsTraverse(graph, 'A');
    assert.equal(traversal[0], 'A');
    assert.ok(traversal.includes('B') && traversal.includes('C'));
    assert.ok(traversal.includes('D') && traversal.includes('E'));
  });

  it('should find nearest facility by category using Queue', () => {
    const graph = new Graph();
    graph.addNode('STUDENT_HOSTEL', { name: 'Boys Hostel', category: 'hostel' });
    graph.addNode('JUNCTION', { name: 'Crossway', category: 'crossing' });
    graph.addNode('NEAR_CANTEEN', { name: 'Nescafe Kiosk', category: 'canteen' });
    graph.addNode('FAR_CANTEEN', { name: 'Central Food Court', category: 'canteen' });

    graph.addEdge('STUDENT_HOSTEL', 'JUNCTION', 50);
    graph.addEdge('JUNCTION', 'NEAR_CANTEEN', 60);
    graph.addEdge('NEAR_CANTEEN', 'FAR_CANTEEN', 300);

    const result = findNearestByCategory(graph, 'STUDENT_HOSTEL', 'canteen');

    assert.equal(result.found, true);
    assert.equal(result.node.name, 'Nescafe Kiosk');
    assert.equal(result.hops, 2);
    assert.deepEqual(result.path, ['STUDENT_HOSTEL', 'JUNCTION', 'NEAR_CANTEEN']);
  });

  it('should find shortest unweighted path', () => {
    const graph = new Graph();
    graph.addEdge('1', '2', 100);
    graph.addEdge('2', '3', 100);
    graph.addEdge('1', '4', 10);
    graph.addEdge('4', '5', 10);
    graph.addEdge('5', '3', 10);

    // Unweighted BFS: 1 -> 2 -> 3 (2 hops) vs 1 -> 4 -> 5 -> 3 (3 hops)
    const path = bfsShortestPath(graph, '1', '3');
    assert.deepEqual(path, ['1', '2', '3']);
  });
});

describe('8. Merge Sort & Binary Search', () => {
  it('should sort numbers in ascending order using Merge Sort', () => {
    const numbers = [45, 12, 85, 32, 89, 39, 69, 44, 42, 1, 45];
    const sorted = mergeSort(numbers, (a, b) => a - b);
    assert.deepEqual(sorted, [1, 12, 32, 39, 42, 44, 45, 45, 69, 85, 89]);
  });

  it('should sort campus buildings alphabetically by name', () => {
    const buildings = [
      { id: 'MECH', name: 'Mechanical Sciences' },
      { id: 'ADMIN', name: 'Administrative Block' },
      { id: 'CIVIL', name: 'Civil Engineering' },
      { id: 'BIO', name: 'Biotechnology' },
    ];

    const sorted = mergeSort(buildings, (a, b) => a.name.localeCompare(b.name));
    const names = sorted.map((b) => b.name);

    assert.deepEqual(names, [
      'Administrative Block',
      'Biotechnology',
      'Civil Engineering',
      'Mechanical Sciences',
    ]);
  });

  it('should perform binary search on sorted campus buildings', () => {
    const sortedBuildings = [
      { id: 'ADMIN', name: 'Administrative Block' },
      { id: 'BIO', name: 'Biotechnology' },
      { id: 'CIVIL', name: 'Civil Engineering' },
      { id: 'MECH', name: 'Mechanical Sciences' },
    ];

    const found = binarySearchByName(sortedBuildings, 'Civil Engineering');
    assert.notEqual(found, null);
    assert.equal(found.id, 'CIVIL');

    const notFound = binarySearchByName(sortedBuildings, 'Aerospace');
    assert.equal(notFound, null);
  });
});
