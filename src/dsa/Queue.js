/**
 * Queue Data Structure (FIFO - First In, First Out)
 * 
 * In the campus navigation system:
 * - Powers Breadth-First Search (BFS) to explore adjacent campus buildings level-by-level.
 * - Used to find the closest facility by category (e.g., nearest canteen, nearest ATM, nearest restroom)
 *   in terms of minimal network transitions.
 * - Implemented using a linked list chain to ensure true O(1) enqueue and O(1) dequeue
 *   without the O(N) array shifting penalty of JavaScript array.shift().
 * 
 * Complexities:
 * - Enqueue: O(1)
 * - Dequeue: O(1)
 * - Peek: O(1)
 * - Space: O(N)
 */

class QueueNode {
  constructor(value) {
    this.value = value;
    this.next = null;
  }
}

class Queue {
  constructor() {
    this.front = null;
    this.rear = null;
    this.count = 0;
  }

  /**
   * Adds an element to the rear of the queue.
   * @param {any} value
   */
  enqueue(value) {
    const newNode = new QueueNode(value);
    if (this.isEmpty()) {
      this.front = newNode;
      this.rear = newNode;
    } else {
      this.rear.next = newNode;
      this.rear = newNode;
    }
    this.count++;
  }

  /**
   * Removes and returns the element at the front of the queue.
   * @returns {any|null}
   */
  dequeue() {
    if (this.isEmpty()) {
      return null;
    }
    const dequeuedValue = this.front.value;
    this.front = this.front.next;
    this.count--;

    if (this.isEmpty()) {
      this.rear = null;
    }

    return dequeuedValue;
  }

  /**
   * Returns the element at the front without removing it.
   */
  peek() {
    return this.isEmpty() ? null : this.front.value;
  }

  /**
   * Returns whether the queue is empty.
   */
  isEmpty() {
    return this.count === 0;
  }

  /**
   * Returns number of items currently in the queue.
   */
  size() {
    return this.count;
  }

  /**
   * Converts the queue contents into an array (from front to rear).
   * @returns {Array<any>}
   */
  toArray() {
    const items = [];
    let current = this.front;
    while (current) {
      items.push(current.value);
      current = current.next;
    }
    return items;
  }

  clear() {
    this.front = null;
    this.rear = null;
    this.count = 0;
  }
}

module.exports = Queue;
