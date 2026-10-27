/**
 * Singly Linked List Data Structure
 * 
 * In the campus navigation system:
 * - Stores the calculated shortest route sequence as an ordered chain of vertices.
 * - Dynamically supports prepend (used when backtracking from destination to start node in Dijkstra)
 *   and append operations in O(1) time.
 * - Generates clear step-by-step turn directions and cumulative travel times.
 * 
 * Complexities:
 * - Prepend / Append: O(1)
 * - Traversal: O(N)
 * - Space: O(N)
 */

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

  /**
   * Adds an element to the end of the list.
   * @param {any} data
   */
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

  /**
   * Adds an element to the beginning of the list.
   * Very useful when reconstructing paths from destination back to origin.
   * @param {any} data
   */
  prepend(data) {
    const newNode = new ListNode(data, this.head);
    this.head = newNode;
    if (!this.tail) {
      this.tail = newNode;
    }
    this.length++;
    return this;
  }

  /**
   * Converts the linked list into an array of node values.
   * @returns {Array<any>}
   */
  toArray() {
    const result = [];
    let current = this.head;
    while (current) {
      result.push(current.data);
      current = current.next;
    }
    return result;
  }

  /**
   * Generates step-by-step pedestrian navigation instructions using graph weights.
   * Standard walking pace = 1.2 meters/second (~72 meters/minute).
   * @param {Graph} graph
   * @returns {Array<{ step: number, instruction: string, distance: number, cumulativeTimeMin: number }>}
   */
  generateStepDirections(graph) {
    if (this.length <= 1) {
      if (this.length === 1) {
        const node = graph ? graph.getNode(this.head.data) : null;
        const name = node ? node.name : this.head.data;
        return [
          {
            step: 1,
            instruction: `You are already at your destination: ${name}.`,
            distance: 0,
            cumulativeTimeMin: 0,
            nodeId: this.head.data,
          },
        ];
      }
      return [];
    }

    const directions = [];
    let current = this.head;
    let stepIndex = 1;
    let cumulativeDistance = 0;

    while (current && current.next) {
      const fromId = current.data;
      const toId = current.next.data;

      const fromNode = graph ? graph.getNode(fromId) : null;
      const toNode = graph ? graph.getNode(toId) : null;

      const fromName = fromNode ? fromNode.name : fromId;
      const toName = toNode ? toNode.name : toId;

      // Find distance between fromId and toId in the graph
      let edgeDistance = 0;
      let pathName = 'campus walkway';
      if (graph) {
        const neighbors = graph.getNeighbors(fromId);
        const edge = neighbors.find((n) => n.to === toId);
        if (edge) {
          edgeDistance = edge.weight;
          if (edge.pathName) pathName = edge.pathName;
        }
      }

      cumulativeDistance += edgeDistance;
      const cumulativeMinutes = Math.round((cumulativeDistance / 72) * 10) / 10;

      let instruction = '';
      if (stepIndex === 1) {
        instruction = `Start from ${fromName}, walk along ${pathName} toward ${toName} (${Math.round(edgeDistance)} m).`;
      } else if (!current.next.next) {
        instruction = `Continue past ${fromName} and arrive at your destination: ${toName} (${Math.round(edgeDistance)} m).`;
      } else {
        instruction = `Pass ${fromName}, proceed along ${pathName} toward ${toName} (${Math.round(edgeDistance)} m).`;
      }

      directions.push({
        step: stepIndex,
        fromId,
        toId,
        fromName,
        toName,
        instruction,
        segmentDistance: Math.round(edgeDistance),
        cumulativeDistance: Math.round(cumulativeDistance),
        cumulativeTimeMin: cumulativeMinutes,
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

  clear() {
    this.head = null;
    this.tail = null;
    this.length = 0;
  }
}

module.exports = { ListNode, LinkedList };
