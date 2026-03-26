/**
 * History Manager — Snapshot-based Undo / Redo
 *
 * Design:
 *   The stack always contains complete state snapshots as JSON strings.
 *   `pointer` points at the entry that represents the *current* state.
 *
 *   pushState(snapshot)
 *     - Trim any redo tail (entries after pointer).
 *     - Deduplicate: skip if the new snapshot is identical to the current one.
 *     - Push new entry, enforce MAX limit, update pointer.
 *
 *   undo() → snapshot | null
 *     - Move pointer back by 1, return that snapshot.
 *
 *   redo() → snapshot | null
 *     - Move pointer forward by 1, return that snapshot.
 *
 *   canUndo: pointer > 0  (there is at least one older state)
 *   canRedo: pointer < stack.length - 1  (there is at least one newer state)
 */
import { ref, computed } from "vue";

const MAX_HISTORY_LIMIT = 50;

const stack = ref([]);   // string[]
const pointer = ref(-1); // index of the "current" state

/**
 * Record the current state. Call this AFTER performing the action
 * (i.e. push the resulting state, not the "before" state).
 */
function pushState(stateObj) {
  const json = typeof stateObj === "string" ? stateObj : JSON.stringify(stateObj);

  // Deduplicate: if identical to the current entry, skip
  if (pointer.value >= 0 && stack.value[pointer.value] === json) return;

  // Trim redo tail
  stack.value = stack.value.slice(0, pointer.value + 1);

  stack.value.push(json);

  // Enforce maximum size
  while (stack.value.length > MAX_HISTORY_LIMIT) {
    stack.value.shift();
  }

  pointer.value = stack.value.length - 1;
}

/**
 * Undo — step back one state.
 */
function undo() {
  if (pointer.value <= 0) return null;
  pointer.value--;
  return JSON.parse(stack.value[pointer.value]);
}

/**
 * Redo — step forward one state.
 */
function redo() {
  if (pointer.value >= stack.value.length - 1) return null;
  pointer.value++;
  return JSON.parse(stack.value[pointer.value]);
}

const canUndo = computed(() => pointer.value > 0);
const canRedo = computed(() => pointer.value < stack.value.length - 1);

function clear() {
  stack.value = [];
  pointer.value = -1;
}

export function useHistoryManager() {
  return { pushState, undo, redo, canUndo, canRedo, clear };
}
