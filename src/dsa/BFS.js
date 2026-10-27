/**
 * Breadth-First Search (BFS) Algorithms
 * 
 * In the Karunya Campus Navigation System:
 * - Uses our custom Queue to traverse the campus network in concentric radial levels.
 * - findNearestByCategory: Finds the closest campus amenity (e.g. nearest canteen,
 *   ATM, hospital, or department) with the minimum number of waypoint transitions.
 * - bfsShortestUnweightedPath: Computes routes with the fewest intersections.
 * 
 * Time Complexity: O(V + E)
 * Space Complexity: O(V)
 */

const Queue = require('./Queue');
const { LinkedList } = require('./LinkedList');

/**
 * Traverses the campus graph level-by-level starting from startNodeId.
 * @param {Graph} graph
 * @param {string} startNodeId
 * @returns {Array<string>} Traversal order of node IDs
 */
function bfsTraverse(graph, startNodeId) {
  if (!graph || !graph.hasNode(startNodeId)) return [];

  const visited = new Set([startNodeId]);
  const queue = new Queue();
  queue.enqueue(startNodeId);
  const result = [];

  while (!queue.isEmpty()) {
    const currentId = queue.dequeue();
    result.push(currentId);

    const neighbors = graph.getNeighbors(currentId);
    for (const edge of neighbors) {
      if (!visited.has(edge.to)) {
        visited.add(edge.to);
        queue.enqueue(edge.to);
      }
    }
  }

  return result;
}

/**
 * Finds the closest campus facility matching a specific category (e.g., 'canteen', 'hospital', 'department').
 * @param {Graph} graph
 * @param {string} startNodeId - User's current location ID
 * @param {string} targetCategory - Desired facility category
 * @returns {object|null} Found facility with node info, path, and hop count
 */
function findNearestByCategory(graph, startNodeId, targetCategory) {
  if (!graph || !graph.hasNode(startNodeId) || !targetCategory) return null;

  const visited = new Set([startNodeId]);
  const queue = new Queue();
  const parentMap = new Map();

  // Queue stores { nodeId, hops }
  queue.enqueue({ nodeId: startNodeId, hops: 0 });

  const normalizedTarget = targetCategory.toLowerCase().trim();

  while (!queue.isEmpty()) {
    const { nodeId, hops } = queue.dequeue();
    const nodeData = graph.getNode(nodeId);

    // If this node matches the target category and is not the starting node itself (unless starting node is the only match)
    if (nodeData && nodeData.category) {
      const nodeCat = nodeData.category.toLowerCase().trim();
      if (nodeCat === normalizedTarget || nodeCat.includes(normalizedTarget)) {
        if (nodeId !== startNodeId || hops === 0) {
          // Reconstruct path
          const path = [];
          let curr = nodeId;
          while (curr) {
            path.unshift(curr);
            curr = parentMap.get(curr);
          }

          return {
            found: true,
            node: nodeData,
            hops,
            path,
          };
        }
      }
    }

    const neighbors = graph.getNeighbors(nodeId);
    for (const edge of neighbors) {
      if (!visited.has(edge.to)) {
        visited.add(edge.to);
        parentMap.set(edge.to, nodeId);
        queue.enqueue({ nodeId: edge.to, hops: hops + 1 });
      }
    }
  }

  return { found: false, message: `No facility found in category "${targetCategory}".` };
}

/**
 * Finds the path between startNodeId and targetNodeId with minimum number of hops (unweighted shortest path).
 * @param {Graph} graph
 * @param {string} startNodeId
 * @param {string} targetNodeId
 * @returns {Array<string>|null}
 */
function bfsShortestPath(graph, startNodeId, targetNodeId) {
  if (!graph || !graph.hasNode(startNodeId) || !graph.hasNode(targetNodeId)) return null;
  if (startNodeId === targetNodeId) return [startNodeId];

  const visited = new Set([startNodeId]);
  const queue = new Queue();
  const parentMap = new Map();

  queue.enqueue(startNodeId);

  while (!queue.isEmpty()) {
    const currentId = queue.dequeue();

    if (currentId === targetNodeId) {
      const path = [];
      let curr = targetNodeId;
      while (curr) {
        path.unshift(curr);
        curr = parentMap.get(curr);
      }
      return path;
    }

    const neighbors = graph.getNeighbors(currentId);
    for (const edge of neighbors) {
      if (!visited.has(edge.to)) {
        visited.add(edge.to);
        parentMap.set(edge.to, currentId);
        queue.enqueue(edge.to);
      }
    }
  }

  return null;
}

module.exports = { bfsTraverse, findNearestByCategory, bfsShortestPath };
