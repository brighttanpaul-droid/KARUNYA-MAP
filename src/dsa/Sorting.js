/**
 * Sorting & Searching Algorithms (Merge Sort & Binary Search)
 * 
 * In the Karunya Campus Navigation System:
 * - Merge Sort: Efficiently sorts campus buildings and facilities alphabetically by name,
 *   by category, or by walking distance from the student's current location.
 * - Binary Search: Once items are sorted by name or ID, enables O(log N) fast lookup.
 * 
 * Complexities:
 * - Merge Sort: O(N log N) in best, average, and worst cases (Divide and Conquer).
 * - Binary Search: O(log N) time on sorted arrays.
 */

/**
 * Merges two sorted arrays into a single sorted array.
 * @param {Array} left - Left sorted array
 * @param {Array} right - Right sorted array
 * @param {Function} compareFn - Comparator returning negative if a < b, positive if a > b, 0 if equal
 * @returns {Array} Combined sorted array
 */
function merge(left, right, compareFn) {
  const result = [];
  let i = 0;
  let j = 0;

  while (i < left.length && j < right.length) {
    if (compareFn(left[i], right[j]) <= 0) {
      result.push(left[i]);
      i++;
    } else {
      result.push(right[j]);
      j++;
    }
  }

  // Append any remaining elements
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

/**
 * Pure JavaScript implementation of Merge Sort (Divide & Conquer).
 * @param {Array} array - Array of elements to sort
 * @param {Function} compareFn - Comparison function (default: natural ascending order)
 * @returns {Array} New sorted array
 */
function mergeSort(array, compareFn = (a, b) => (a < b ? -1 : a > b ? 1 : 0)) {
  if (!Array.isArray(array)) return [];
  if (array.length <= 1) return [...array];

  const mid = Math.floor(array.length / 2);
  const left = mergeSort(array.slice(0, mid), compareFn);
  const right = mergeSort(array.slice(mid), compareFn);

  return merge(left, right, compareFn);
}

/**
 * Binary Search to find a building by name in a sorted list of buildings.
 * @param {Array<object>} sortedArray - Array of buildings sorted by name
 * @param {string} targetName - Target name to search for
 * @returns {object|null} Found building object or null
 */
function binarySearchByName(sortedArray, targetName) {
  if (!Array.isArray(sortedArray) || sortedArray.length === 0 || !targetName) {
    return null;
  }

  const normalizedTarget = targetName.toLowerCase().trim();
  let low = 0;
  let high = sortedArray.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    const midName = (sortedArray[mid].name || '').toLowerCase().trim();

    if (midName === normalizedTarget) {
      return sortedArray[mid];
    } else if (midName < normalizedTarget) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return null;
}

module.exports = { mergeSort, binarySearchByName };
