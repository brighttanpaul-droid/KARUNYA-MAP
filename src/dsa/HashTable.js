/**
 * Hash Table Data Structure (Separate Chaining Implementation)
 * 
 * In campus navigation:
 * - Provides average O(1) instantaneous lookup of campus buildings, facilities, and blocks
 *   by their building ID (e.g. 'ADMIN', 'CTC', 'FOOD_COURT') or name.
 * - Uses a polynomial rolling hash function (DJB2-variant) to uniformly distribute keys.
 * - Handles collisions using separate chaining (linked buckets).
 * - Dynamically resizes (rehashes) when load factor exceeds 0.75 to maintain O(1) performance.
 * 
 * Complexities:
 * - Average Insertion: O(1)
 * - Average Search / Lookup: O(1)
 * - Average Deletion: O(1)
 * - Space Complexity: O(N + M) where N = items, M = bucket capacity
 */

class HashTable {
  constructor(initialCapacity = 19) {
    this.capacity = initialCapacity; // Prime number default capacity
    this.buckets = new Array(this.capacity).fill(null).map(() => []);
    this.count = 0; // Number of stored key-value pairs
  }

  /**
   * Polynomial rolling hash function (DJB2 algorithm adapted with 31 multiplier).
   * Maps a string key to an array index within [0, capacity - 1].
   * @param {string} key
   * @returns {number}
   */
  _hash(key) {
    if (typeof key !== 'string') {
      key = String(key);
    }
    let hash = 5381;
    for (let i = 0; i < key.length; i++) {
      // hash * 33 + charCode
      hash = ((hash << 5) + hash) + key.charCodeAt(i);
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash) % this.capacity;
  }

  /**
   * Inserts or updates a key-value pair in the hash table.
   * @param {string} key
   * @param {any} value
   */
  set(key, value) {
    if (key === undefined || key === null) {
      throw new Error('Hash table key cannot be null or undefined.');
    }

    const index = this._hash(key);
    const bucket = this.buckets[index];

    // Check if key already exists in the bucket (update case)
    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i].key === key) {
        bucket[i].value = value;
        return;
      }
    }

    // Insert new entry into the chain
    bucket.push({ key, value });
    this.count++;

    // Check load factor (count / capacity)
    if (this.count / this.capacity > 0.75) {
      this._resize(this.capacity * 2 + 1);
    }
  }

  /**
   * Retrieves the value associated with a key.
   * @param {string} key
   * @returns {any|null} Value or null if not found
   */
  get(key) {
    if (key === undefined || key === null) return null;
    const index = this._hash(key);
    const bucket = this.buckets[index];

    for (let i = 0; i < bucket.length; i++) {
      if (bucket[i].key === key) {
        return bucket[i].value;
      }
    }
    return null;
  }

  /**
   * Checks whether a key exists in the hash table.
   * @param {string} key
   * @returns {boolean}
   */
  has(key) {
    return this.get(key) !== null;
  }

  /**
   * Deletes a key-value pair from the hash table.
   * @param {string} key
   * @returns {boolean} True if removed, false if key did not exist
   */
  delete(key) {
    if (key === undefined || key === null) return false;
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

  /**
   * Resizes the bucket array and rehashes all existing entries.
   * @param {number} newCapacity
   */
  _resize(newCapacity) {
    const oldBuckets = this.buckets;
    this.capacity = newCapacity;
    this.buckets = new Array(this.capacity).fill(null).map(() => []);
    this.count = 0;

    for (const bucket of oldBuckets) {
      for (const entry of bucket) {
        this.set(entry.key, entry.value);
      }
    }
  }

  /**
   * Returns all keys in the hash table.
   * @returns {Array<string>}
   */
  keys() {
    const keysList = [];
    for (const bucket of this.buckets) {
      for (const entry of bucket) {
        keysList.push(entry.key);
      }
    }
    return keysList;
  }

  /**
   * Returns all values in the hash table.
   * @returns {Array<any>}
   */
  values() {
    const valuesList = [];
    for (const bucket of this.buckets) {
      for (const entry of bucket) {
        valuesList.push(entry.value);
      }
    }
    return valuesList;
  }

  /**
   * Returns all key-value entries.
   * @returns {Array<{ key: string, value: any }>}
   */
  entries() {
    const entriesList = [];
    for (const bucket of this.buckets) {
      for (const entry of bucket) {
        entriesList.push(entry);
      }
    }
    return entriesList;
  }

  size() {
    return this.count;
  }

  isEmpty() {
    return this.count === 0;
  }

  clear() {
    this.buckets = new Array(this.capacity).fill(null).map(() => []);
    this.count = 0;
  }
}

module.exports = HashTable;
