/**
 * Karunya Campus Navigation & Resource Finder
 * Client-Side DSA Engine
 * 
 * Provides in-browser execution for all Data Structures & Algorithms
 * implemented for the Sem3 DSA Micro-Project.
 */

(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.KarunyaDSA = factory();
  }
})(typeof window !== 'undefined' ? window : this, function () {

  // ==========================================
  // 1. GRAPH DATA STRUCTURE (Adjacency List)
  // ==========================================
  class Graph {
    constructor() {
      this.adjacencyList = new Map();
      this.nodes = new Map();
    }

    addNode(id, data = {}) {
      if (!id) throw new Error('Vertex ID must be provided.');
      if (!this.adjacencyList.has(id)) {
        this.adjacencyList.set(id, []);
      }
      this.nodes.set(id, { id, ...data });
      return this;
    }

    hasNode(id) {
      return this.adjacencyList.has(id);
    }

    getNode(id) {
      return this.nodes.get(id);
    }

    getAllNodes() {
      return Array.from(this.nodes.values());
    }

    getNodeIds() {
      return Array.from(this.adjacencyList.keys());
    }

    addEdge(from, to, weight = 1, bidirectional = true, metadata = {}) {
      if (!this.hasNode(from)) this.addNode(from);
      if (!this.hasNode(to)) this.addNode(to);

      this.adjacencyList.get(from).push({ to, weight: Number(weight), ...metadata });

      if (bidirectional) {
        this.adjacencyList.get(to).push({ to: from, weight: Number(weight), ...metadata });
      }
      return this;
    }

    getNeighbors(id) {
      return this.adjacencyList.get(id) || [];
    }

    removeEdge(from, to, bidirectional = true) {
      if (this.adjacencyList.has(from)) {
        const neighbors = this.adjacencyList.get(from);
        this.adjacencyList.set(from, neighbors.filter((edge) => edge.to !== to));
      }
      if (bidirectional && this.adjacencyList.has(to)) {
        const neighbors = this.adjacencyList.get(to);
        this.adjacencyList.set(to, neighbors.filter((edge) => edge.to !== from));
      }
      return this;
    }

    removeNode(id) {
      if (!this.adjacencyList.has(id)) return false;

      this.adjacencyList.delete(id);
      this.nodes.delete(id);

      for (const [nodeId, neighbors] of this.adjacencyList.entries()) {
        this.adjacencyList.set(
          nodeId,
          neighbors.filter((edge) => edge.to !== id)
        );
      }
      return true;
    }

    getAllEdges() {
      const edges = [];
      const visitedPairs = new Set();

      for (const [from, neighbors] of this.adjacencyList.entries()) {
        for (const edge of neighbors) {
          const pairKey = [from, edge.to].sort().join('--');
          if (!visitedPairs.has(pairKey)) {
            visitedPairs.add(pairKey);
            edges.push({
              from,
              to: edge.to,
              weight: edge.weight,
              ...edge,
            });
          }
        }
      }
      return edges;
    }

    getNodeCount() {
      return this.adjacencyList.size;
    }

    getEdgeCount() {
      return this.getAllEdges().length;
    }
  }

  // ==========================================
  // 2. HASH TABLE (Separate Chaining with DJB2)
  // ==========================================
  class HashTable {
    constructor(initialCapacity = 19) {
      this.capacity = initialCapacity;
      this.buckets = new Array(this.capacity).fill(null).map(() => []);
      this.count = 0;
    }

    _hash(key) {
      if (typeof key !== 'string') key = String(key);
      let hash = 5381;
      for (let i = 0; i < key.length; i++) {
        hash = ((hash << 5) + hash) + key.charCodeAt(i);
        hash = hash & hash;
      }
      return Math.abs(hash) % this.capacity;
    }

    set(key, value) {
      const index = this._hash(key);
      const bucket = this.buckets[index];

      for (let i = 0; i < bucket.length; i++) {
        if (bucket[i].key === key) {
          bucket[i].value = value;
          return this;
        }
      }

      bucket.push({ key, value });
      this.count++;

      if (this.loadFactor() > 0.75) {
        this._resize(this.capacity * 2 + 1);
      }
      return this;
    }

    get(key) {
      const index = this._hash(key);
      const bucket = this.buckets[index];
      for (let i = 0; i < bucket.length; i++) {
        if (bucket[i].key === key) {
          return bucket[i].value;
        }
      }
      return undefined;
    }

    has(key) {
      return this.get(key) !== undefined;
    }

    delete(key) {
      const index = this._hash(key);
      const bucket = this.buckets[index];
      for (let i = 0; i < bucket.length; i++) {
        if (bucket[i].key === key) {
          bucket.splice(i, 1);
          this.count--;
          return true;
        }
      }
      return false;
    }

    loadFactor() {
      return this.count / this.capacity;
    }

    _resize(newCapacity) {
      const oldBuckets = this.buckets;
      this.capacity = newCapacity;
      this.buckets = new Array(this.capacity).fill(null).map(() => []);
      this.count = 0;

      for (const bucket of oldBuckets) {
        for (const item of bucket) {
          this.set(item.key, item.value);
        }
      }
    }

    keys() {
      const keysList = [];
      for (const bucket of this.buckets) {
        for (const item of bucket) {
          keysList.push(item.key);
        }
      }
      return keysList;
    }

    values() {
      const valuesList = [];
      for (const bucket of this.buckets) {
        for (const item of bucket) {
          valuesList.push(item.value);
        }
      }
      return valuesList;
    }

    entries() {
      const entriesList = [];
      for (const bucket of this.buckets) {
        for (const item of bucket) {
          entriesList.push([item.key, item.value]);
        }
      }
      return entriesList;
    }

    size() {
      return this.count;
    }
  }

  // ==========================================
  // 3. MIN-HEAP (Priority Queue)
  // ==========================================
  class MinHeap {
    constructor() {
      this.heap = [];
      this.keyIndexMap = new Map();
    }

    _parent(i) {
      return Math.floor((i - 1) / 2);
    }

    _left(i) {
      return 2 * i + 1;
    }

    _right(i) {
      return 2 * i + 2;
    }

    _swap(i, j) {
      const temp = this.heap[i];
      this.heap[i] = this.heap[j];
      this.heap[j] = temp;

      this.keyIndexMap.set(this.heap[i].key, i);
      this.keyIndexMap.set(this.heap[j].key, j);
    }

    _bubbleUp(index) {
      while (index > 0) {
        const parentIdx = this._parent(index);
        if (this.heap[index].priority < this.heap[parentIdx].priority) {
          this._swap(index, parentIdx);
          index = parentIdx;
        } else {
          break;
        }
      }
    }

    _bubbleDown(index) {
      const size = this.heap.length;
      while (true) {
        let smallest = index;
        const left = this._left(index);
        const right = this._right(index);

        if (left < size && this.heap[left].priority < this.heap[smallest].priority) {
          smallest = left;
        }
        if (right < size && this.heap[right].priority < this.heap[smallest].priority) {
          smallest = right;
        }

        if (smallest !== index) {
          this._swap(index, smallest);
          index = smallest;
        } else {
          break;
        }
      }
    }

    insert(key, priority, data = null) {
      const node = { key, priority, data };
      this.heap.push(node);
      const index = this.heap.length - 1;
      this.keyIndexMap.set(key, index);
      this._bubbleUp(index);
      return this;
    }

    extractMin() {
      if (this.isEmpty()) return null;

      const min = this.heap[0];
      const last = this.heap.pop();
      this.keyIndexMap.delete(min.key);

      if (this.heap.length > 0) {
        this.heap[0] = last;
        this.keyIndexMap.set(last.key, 0);
        this._bubbleDown(0);
      }
      return min;
    }

    peek() {
      return this.isEmpty() ? null : this.heap[0];
    }

    decreaseKey(key, newPriority) {
      if (!this.keyIndexMap.has(key)) return false;

      const index = this.keyIndexMap.get(key);
      if (newPriority > this.heap[index].priority) {
        return false;
      }

      this.heap[index].priority = newPriority;
      this._bubbleUp(index);
      return true;
    }

    contains(key) {
      return this.keyIndexMap.has(key);
    }

    isEmpty() {
      return this.heap.length === 0;
    }

    size() {
      return this.heap.length;
    }
  }

  // ==========================================
  // 4. SINGLY LINKED LIST (Navigation Routes)
  // ==========================================
  class ListNode {
    constructor(data, next = null) {
      this.data = data;
      this.next = next;
    }
  }

  class LinkedList {
    constructor() {
      this.head = null;
      this.tail = null;
      this.length = 0;
    }

    append(data) {
      const newNode = new ListNode(data);
      if (!this.head) {
        this.head = newNode;
        this.tail = newNode;
      } else {
        this.tail.next = newNode;
        this.tail = newNode;
      }
      this.length++;
      return this;
    }

    prepend(data) {
      const newNode = new ListNode(data, this.head);
      this.head = newNode;
      if (!this.tail) {
        this.tail = newNode;
      }
      this.length++;
      return this;
    }

    toArray() {
      const arr = [];
      let current = this.head;
      while (current) {
        arr.push(current.data);
        current = current.next;
      }
      return arr;
    }

    generateStepDirections(graph) {
      const directions = [];
      if (!this.head || !this.head.next) {
        if (this.head) {
          const nodeData = graph ? graph.getNode(this.head.data) : null;
          directions.push({
            step: 1,
            instruction: `You are already at ${nodeData?.name || this.head.data}.`,
            distanceMeters: 0,
            cumulativeDistance: 0,
            pathName: 'Direct arrival',
          });
        }
        return directions;
      }

      let current = this.head;
      let stepIndex = 1;
      let cumulativeDist = 0;

      while (current && current.next) {
        const fromId = current.data;
        const toId = current.next.data;

        let edgeDistance = 0;
        let pathName = 'Campus pathway';

        if (graph) {
          const neighbors = graph.getNeighbors(fromId);
          const edge = neighbors.find((e) => e.to === toId);
          if (edge) {
            edgeDistance = edge.weight || 0;
            pathName = edge.pathName || pathName;
          }
        }

        cumulativeDist += edgeDistance;
        const fromName = graph?.getNode(fromId)?.name || fromId;
        const toName = graph?.getNode(toId)?.name || toId;

        directions.push({
          step: stepIndex,
          from: fromId,
          to: toId,
          fromName,
          toName,
          instruction: `Walk from ${fromName} to ${toName} along ${pathName}.`,
          distanceMeters: edgeDistance,
          cumulativeDistance: cumulativeDist,
          pathName,
        });

        stepIndex++;
        current = current.next;
      }

      return directions;
    }

    size() {
      return this.length;
    }

    isEmpty() {
      return this.length === 0;
    }
  }

  // ==========================================
  // 5. QUEUE DATA STRUCTURE (FIFO for BFS)
  // ==========================================
  class Queue {
    constructor() {
      this.items = [];
    }

    enqueue(element) {
      this.items.push(element);
      return this;
    }

    dequeue() {
      if (this.isEmpty()) return null;
      return this.items.shift();
    }

    peek() {
      return this.isEmpty() ? null : this.items[0];
    }

    isEmpty() {
      return this.items.length === 0;
    }

    size() {
      return this.items.length;
    }

    toArray() {
      return [...this.items];
    }
  }

  // ==========================================
  // 6. DIJKSTRA'S SHORTEST PATH ALGORITHM
  // ==========================================
  function dijkstra(graph, startNodeId, endNodeId) {
    if (!graph || !graph.hasNode(startNodeId)) {
      return {
        success: false,
        message: `Starting location "${startNodeId}" was not found in campus graph.`,
        pathLinkedList: new LinkedList(),
        pathArray: [],
        totalDistance: 0,
        totalTimeMinutes: 0,
        directions: [],
        nodesExploredCount: 0,
      };
    }

    if (!graph.hasNode(endNodeId)) {
      return {
        success: false,
        message: `Destination "${endNodeId}" was not found in campus graph.`,
        pathLinkedList: new LinkedList(),
        pathArray: [],
        totalDistance: 0,
        totalTimeMinutes: 0,
        directions: [],
        nodesExploredCount: 0,
      };
    }

    if (startNodeId === endNodeId) {
      const singlePath = new LinkedList();
      singlePath.append(startNodeId);
      return {
        success: true,
        originId: startNodeId,
        destinationId: endNodeId,
        totalDistance: 0,
        totalTimeMinutes: 0,
        pathLinkedList: singlePath,
        pathArray: [startNodeId],
        directions: singlePath.generateStepDirections(graph),
        nodesExploredCount: 1,
      };
    }

    const distances = new Map();
    const previous = new Map();
    const visited = new Set();
    const minHeap = new MinHeap();

    for (const nodeId of graph.getNodeIds()) {
      if (nodeId === startNodeId) {
        distances.set(nodeId, 0);
        minHeap.insert(nodeId, 0);
      } else {
        distances.set(nodeId, Infinity);
        minHeap.insert(nodeId, Infinity);
      }
      previous.set(nodeId, null);
    }

    let nodesExploredCount = 0;

    while (!minHeap.isEmpty()) {
      const minNode = minHeap.extractMin();
      const currentId = minNode.key;
      const currentDistance = minNode.priority;

      if (currentDistance === Infinity) break;
      if (visited.has(currentId)) continue;

      visited.add(currentId);
      nodesExploredCount++;

      if (currentId === endNodeId) break;

      const neighbors = graph.getNeighbors(currentId);
      for (const edge of neighbors) {
        const neighborId = edge.to;
        if (visited.has(neighborId)) continue;

        const edgeWeight = edge.weight || 0;
        const alternativeDistance = currentDistance + edgeWeight;

        if (alternativeDistance < distances.get(neighborId)) {
          distances.set(neighborId, alternativeDistance);
          previous.set(neighborId, currentId);
          minHeap.decreaseKey(neighborId, alternativeDistance);
        }
      }
    }

    const destinationDistance = distances.get(endNodeId);
    if (destinationDistance === Infinity || previous.get(endNodeId) === null) {
      return {
        success: false,
        message: `No pedestrian path connects "${startNodeId}" to "${endNodeId}".`,
        pathLinkedList: new LinkedList(),
        pathArray: [],
        totalDistance: 0,
        totalTimeMinutes: 0,
        directions: [],
        nodesExploredCount,
      };
    }

    const pathLinkedList = new LinkedList();
    let curr = endNodeId;
    while (curr !== null) {
      pathLinkedList.prepend(curr);
      curr = previous.get(curr);
    }

    const totalDistance = Math.round(destinationDistance);
    const totalTimeMinutes = Math.round((totalDistance / 72) * 10) / 10;
    const directions = pathLinkedList.generateStepDirections(graph);

    return {
      success: true,
      originId: startNodeId,
      destinationId: endNodeId,
      totalDistance,
      totalTimeMinutes,
      pathLinkedList,
      pathArray: pathLinkedList.toArray(),
      directions,
      nodesExploredCount,
    };
  }

  // ==========================================
  // 7. BREADTH-FIRST SEARCH (BFS)
  // ==========================================
  function bfsTraverse(graph, startNodeId) {
    if (!graph || !graph.hasNode(startNodeId)) return [];

    const queue = new Queue();
    const visited = new Set();
    const traversalOrder = [];

    queue.enqueue(startNodeId);
    visited.add(startNodeId);

    while (!queue.isEmpty()) {
      const currentId = queue.dequeue();
      traversalOrder.push(currentId);

      for (const edge of graph.getNeighbors(currentId)) {
        if (!visited.has(edge.to)) {
          visited.add(edge.to);
          queue.enqueue(edge.to);
        }
      }
    }
    return traversalOrder;
  }

  function findNearestByCategory(graph, startNodeId, targetCategory) {
    if (!graph || !graph.hasNode(startNodeId)) {
      return { success: false, message: 'Invalid start vertex.' };
    }

    const targetCat = targetCategory.toLowerCase().trim();
    const startData = graph.getNode(startNodeId);

    if (startData && startData.category && startData.category.toLowerCase() === targetCat) {
      return {
        success: true,
        nearestBuilding: startData,
        hops: 0,
        path: [startNodeId],
      };
    }

    const queue = new Queue();
    const visited = new Set();
    const parentMap = new Map();

    queue.enqueue({ id: startNodeId, hops: 0 });
    visited.add(startNodeId);
    parentMap.set(startNodeId, null);

    while (!queue.isEmpty()) {
      const { id: currentId, hops } = queue.dequeue();
      const nodeData = graph.getNode(currentId);

      if (currentId !== startNodeId && nodeData && nodeData.category) {
        if (nodeData.category.toLowerCase() === targetCat) {
          const path = [];
          let curr = currentId;
          while (curr !== null) {
            path.unshift(curr);
            curr = parentMap.get(curr);
          }

          return {
            success: true,
            nearestBuilding: nodeData,
            hops,
            path,
          };
        }
      }

      for (const edge of graph.getNeighbors(currentId)) {
        if (!visited.has(edge.to)) {
          visited.add(edge.to);
          parentMap.set(edge.to, currentId);
          queue.enqueue({ id: edge.to, hops: hops + 1 });
        }
      }
    }

    return {
      success: false,
      message: `No facility found in category "${targetCategory}" reachable from ${startNodeId}.`,
    };
  }

  function bfsShortestPath(graph, startNodeId, endNodeId) {
    if (!graph || !graph.hasNode(startNodeId) || !graph.hasNode(endNodeId)) {
      return { success: false, path: [], hops: 0 };
    }

    if (startNodeId === endNodeId) {
      return { success: true, path: [startNodeId], hops: 0 };
    }

    const queue = new Queue();
    const visited = new Set();
    const parentMap = new Map();

    queue.enqueue({ id: startNodeId, hops: 0 });
    visited.add(startNodeId);
    parentMap.set(startNodeId, null);

    while (!queue.isEmpty()) {
      const { id: currentId, hops } = queue.dequeue();

      if (currentId === endNodeId) {
        const path = [];
        let curr = endNodeId;
        while (curr !== null) {
          path.unshift(curr);
          curr = parentMap.get(curr);
        }
        return { success: true, path, hops };
      }

      for (const edge of graph.getNeighbors(currentId)) {
        if (!visited.has(edge.to)) {
          visited.add(edge.to);
          parentMap.set(edge.to, currentId);
          queue.enqueue({ id: edge.to, hops: hops + 1 });
        }
      }
    }

    return { success: false, path: [], hops: 0 };
  }

  // ==========================================
  // 8. MERGE SORT & BINARY SEARCH
  // ==========================================
  function merge(left, right, comparator) {
    const result = [];
    let i = 0;
    let j = 0;

    while (i < left.length && j < right.length) {
      if (comparator(left[i], right[j]) <= 0) {
        result.push(left[i]);
        i++;
      } else {
        result.push(right[j]);
        j++;
      }
    }

    while (i < left.length) {
      result.push(left[i]);
      i++;
    }

    while (j < right.length) {
      result.push(right[j]);
      j++;
    }

    return result;
  }

  function mergeSort(arr, comparator = (a, b) => (a < b ? -1 : a > b ? 1 : 0)) {
    if (!Array.isArray(arr) || arr.length <= 1) return arr ? [...arr] : [];
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid), comparator);
    const right = mergeSort(arr.slice(mid), comparator);
    return merge(left, right, comparator);
  }

  function binarySearchByName(sortedBuildings, targetName) {
    if (!Array.isArray(sortedBuildings) || sortedBuildings.length === 0) return -1;
    const cleanTarget = targetName.toLowerCase().trim();

    let low = 0;
    let high = sortedBuildings.length - 1;

    while (low <= high) {
      const mid = Math.floor((low + high) / 2);
      const midName = (sortedBuildings[mid].name || '').toLowerCase().trim();

      if (midName === cleanTarget) {
        return mid;
      } else if (midName < cleanTarget) {
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }

    return -1;
  }

  return {
    Graph,
    HashTable,
    MinHeap,
    ListNode,
    LinkedList,
    Queue,
    dijkstra,
    bfsTraverse,
    findNearestByCategory,
    bfsShortestPath,
    mergeSort,
    binarySearchByName,
  };
});
