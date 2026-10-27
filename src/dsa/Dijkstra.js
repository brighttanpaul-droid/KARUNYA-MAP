/**
 * Dijkstra's Shortest Path Algorithm
 * 
 * In the Karunya Campus Navigation System:
 * - Finds the mathematically shortest walkable pedestrian route between any two campus locations.
 * - Uses our custom MinHeap (Priority Queue) to achieve optimal O((V + E) log V) time complexity.
 * - Reconstructs the resulting route into our custom Singly LinkedList.
 * - Accurately calculates total distance (meters) and walking time (minutes, pace = 1.2 m/s).
 * 
 * Time Complexity: O((V + E) log V)
 * Space Complexity: O(V)
 */

const MinHeap = require('./MinHeap');
const { LinkedList } = require('./LinkedList');

/**
 * Computes the shortest path from startNodeId to endNodeId on the given graph.
 * @param {Graph} graph - Instance of custom Graph
 * @param {string} startNodeId - Origin vertex ID
 * @param {string} endNodeId - Destination vertex ID
 * @returns {object} Result object containing path, distance, walking time, and directions
 */
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

  // Handle trivial case where origin == destination
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
  let nodesExploredCount = 0;

  // Initialize distances to Infinity for all vertices
  for (const nodeId of graph.getAllNodes()) {
    if (nodeId === startNodeId) {
      distances.set(nodeId, 0);
      minHeap.insert(nodeId, 0);
    } else {
      distances.set(nodeId, Infinity);
    }
  }

  while (!minHeap.isEmpty()) {
    const minNode = minHeap.extractMin();
    const currentId = minNode.key;
    const currentDist = minNode.priority;

    // Already found optimal distance or unreachable
    if (visited.has(currentId)) continue;
    visited.add(currentId);
    nodesExploredCount++;

    // Target reached early termination
    if (currentId === endNodeId) {
      break;
    }

    if (currentDist === Infinity) {
      break;
    }

    // Explore neighbors
    const neighbors = graph.getNeighbors(currentId);
    for (const edge of neighbors) {
      const neighborId = edge.to;
      const weight = edge.weight;

      if (visited.has(neighborId)) continue;

      const newDist = currentDist + weight;
      const currentNeighborDist = distances.get(neighborId);

      if (newDist < currentNeighborDist) {
        distances.set(neighborId, newDist);
        previous.set(neighborId, currentId);
        minHeap.insert(neighborId, newDist);
      }
    }
  }

  const destinationDistance = distances.get(endNodeId);

  // If destination is unreachable
  if (destinationDistance === undefined || destinationDistance === Infinity) {
    return {
      success: false,
      message: `No walkable path found between "${startNodeId}" and "${endNodeId}".`,
      pathLinkedList: new LinkedList(),
      pathArray: [],
      totalDistance: 0,
      totalTimeMinutes: 0,
      directions: [],
      nodesExploredCount,
    };
  }

  // Reconstruct path into custom LinkedList using prepend (O(1) insertion at front)
  const pathLinkedList = new LinkedList();
  let curr = endNodeId;
  while (curr) {
    pathLinkedList.prepend(curr);
    curr = previous.get(curr);
  }

  // Calculate walking time: pace = 1.2 m/s -> 72 meters/minute
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

module.exports = { dijkstra };
