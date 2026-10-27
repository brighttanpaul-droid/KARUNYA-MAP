/**
 * Min-Heap (Priority Queue) Data Structure
 * 
 * Crucial component for Dijkstra's Shortest Path Algorithm:
 * - Guarantees O(log V) retrieval of the campus vertex with the smallest tentative distance.
 * - Stores nodes with their current shortest distance as the priority key.
 * - Maintains an internal keyIndexMap to enable O(log V) decreaseKey operations.
 * 
 * Complexities:
 * - Insert: O(log N)
 * - Extract Minimum: O(log N)
 * - Peek Minimum: O(1)
 * - Decrease Key: O(log N)
 * - Space: O(N)
 */

class MinHeap {
  constructor() {
    // Array storing heap elements: { key: string, priority: number, data: object }
    this.heap = [];
    // Map storing key -> index in this.heap for O(1) position lookup
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

    // Update indices in the lookup map
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

  /**
   * Inserts a key with its priority into the Min-Heap.
   * If the key already exists and newPriority is lower, updates it via decreaseKey.
   * @param {string} key - Node ID
   * @param {number} priority - Tentative distance
   * @param {object} data - Extra payload (optional)
   */
  insert(key, priority, data = {}) {
    if (this.keyIndexMap.has(key)) {
      if (priority < this.heap[this.keyIndexMap.get(key)].priority) {
        this.decreaseKey(key, priority);
      }
      return;
    }

    const item = { key, priority, data };
    this.heap.push(item);
    const index = this.heap.length - 1;
    this.keyIndexMap.set(key, index);
    this._bubbleUp(index);
  }

  /**
   * Removes and returns the element with the minimum priority (smallest distance).
   * @returns {{ key: string, priority: number, data: object }|null}
   */
  extractMin() {
    if (this.heap.length === 0) return null;

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

  /**
   * Returns the minimum element without removing it.
   */
  peek() {
    return this.heap.length > 0 ? this.heap[0] : null;
  }

  /**
   * Decreases the priority (distance) of an existing key and restores the min-heap invariant.
   * @param {string} key
   * @param {number} newPriority
   */
  decreaseKey(key, newPriority) {
    if (!this.keyIndexMap.has(key)) return false;

    const index = this.keyIndexMap.get(key);
    if (newPriority >= this.heap[index].priority) {
      return false; // Can only decrease priority
    }

    this.heap[index].priority = newPriority;
    this._bubbleUp(index);
    return true;
  }

  has(key) {
    return this.keyIndexMap.has(key);
  }

  size() {
    return this.heap.length;
  }

  isEmpty() {
    return this.heap.length === 0;
  }

  clear() {
    this.heap = [];
    this.keyIndexMap.clear();
  }
}

module.exports = MinHeap;
