/**
 * Graph Data Structure (Adjacency List Implementation)
 * 
 * In a campus navigation system:
 * - Vertices (Nodes) represent campus buildings, gates, crossings, and facilities.
 * - Edges represent walkable pedestrian pathways between landmarks.
 * - Weights represent real walking distances in meters.
 * 
 * Space Complexity: O(V + E)
 * Time Complexities:
 * - Add Vertex: O(1)
 * - Add Edge: O(1)
 * - Remove Vertex: O(V + E)
 * - Remove Edge: O(degree(V))
 * - Query Neighbors: O(1) lookup
 */

class Graph {
  constructor() {
    // adjacencyList: Map where key = nodeId, value = Array of { to, weight, metadata }
    this.adjacencyList = new Map();
    // nodes: Map storing vertex metadata (e.g. name, category, lat, lng)
    this.nodes = new Map();
  }

  /**
   * Adds a vertex to the graph.
   * @param {string} id - Unique identifier for the building/crossing (e.g., 'ADMIN', 'CTC')
   * @param {object} data - Vertex metadata (name, category, lat, lng, etc.)
   */
  addNode(id, data = {}) {
    if (!id) throw new Error('Vertex ID must be provided.');
    if (!this.adjacencyList.has(id)) {
      this.adjacencyList.set(id, []);
    }
    this.nodes.set(id, { id, ...data });
    return this;
  }

  /**
   * Checks if a vertex exists in the graph.
   * @param {string} id
   * @returns {boolean}
   */
  hasNode(id) {
    return this.adjacencyList.has(id);
  }

  /**
   * Retrieves metadata for a specific vertex.
   * @param {string} id
   * @returns {object|null}
   */
  getNode(id) {
    return this.nodes.get(id) || null;
  }

  /**
   * Removes a vertex and all its connected incident edges from the graph.
   * @param {string} id
   * @returns {boolean} True if removed, false if not found
   */
  removeNode(id) {
    if (!this.adjacencyList.has(id)) return false;

    // Remove all edges pointing to this node from other nodes
    for (const [otherNodeId, edges] of this.adjacencyList.entries()) {
      if (otherNodeId !== id) {
        this.adjacencyList.set(
          otherNodeId,
          edges.filter((edge) => edge.to !== id)
        );
      }
    }

    // Remove the node itself and its outgoing edges
    this.adjacencyList.delete(id);
    this.nodes.delete(id);
    return true;
  }

  /**
   * Adds a weighted edge representing a walkable pathway between two vertices.
   * @param {string} from - Origin vertex ID
   * @param {string} to - Destination vertex ID
   * @param {number} weight - Walking distance in meters (must be > 0)
   * @param {boolean} bidirectional - If true, adds edge both ways (default: true for pedestrian paths)
   * @param {object} metadata - Optional pathway information (e.g. road name, path type)
   */
  addEdge(from, to, weight, bidirectional = true, metadata = {}) {
    if (!this.adjacencyList.has(from)) {
      this.addNode(from);
    }
    if (!this.adjacencyList.has(to)) {
      this.addNode(to);
    }

    if (typeof weight !== 'number' || weight <= 0) {
      throw new Error('Edge weight must be a positive number representing distance in meters.');
    }

    // Check if edge already exists and update or add
    const fromEdges = this.adjacencyList.get(from);
    const existingIndex = fromEdges.findIndex((e) => e.to === to);
    if (existingIndex !== -1) {
      fromEdges[existingIndex] = { to, weight, ...metadata };
    } else {
      fromEdges.push({ to, weight, ...metadata });
    }

    if (bidirectional) {
      const toEdges = this.adjacencyList.get(to);
      const revIndex = toEdges.findIndex((e) => e.to === from);
      if (revIndex !== -1) {
        toEdges[revIndex] = { to: from, weight, ...metadata };
      } else {
        toEdges.push({ to: from, weight, ...metadata });
      }
    }

    return this;
  }

  /**
   * Removes an edge between two vertices.
   * @param {string} from
   * @param {string} to
   * @param {boolean} bidirectional
   */
  removeEdge(from, to, bidirectional = true) {
    if (this.adjacencyList.has(from)) {
      this.adjacencyList.set(
        from,
        this.adjacencyList.get(from).filter((edge) => edge.to !== to)
      );
    }

    if (bidirectional && this.adjacencyList.has(to)) {
      this.adjacencyList.set(
        to,
        this.adjacencyList.get(to).filter((edge) => edge.to !== from)
      );
    }
  }

  /**
   * Returns list of directly reachable neighbors from a vertex with distance weights.
   * @param {string} id
   * @returns {Array<{ to: string, weight: number }>}
   */
  getNeighbors(id) {
    return this.adjacencyList.get(id) || [];
  }

  /**
   * Returns all node IDs in the graph.
   * @returns {Array<string>}
   */
  getAllNodes() {
    return Array.from(this.adjacencyList.keys());
  }

  /**
   * Returns all node objects with metadata.
   * @returns {Array<object>}
   */
  getAllNodeObjects() {
    return Array.from(this.nodes.values());
  }

  /**
   * Returns all edges in the graph.
   * @returns {Array<{ from: string, to: string, weight: number }>}
   */
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

module.exports = Graph;
