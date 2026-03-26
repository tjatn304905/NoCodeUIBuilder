/**
 * History Manager — Snapshot-based Undo / Redo (no-trim)
 *
 * The user wants a linear, never-losing timeline:
 *   A → B → C, undo  →  history = A B C B       (B re-appended)
 *   then new action D →  history = A B C B D     (not A B D!)
 *
 * Implementation:
 *   `pointer` moves freely via undo/redo (standard approach).
 *   On a NEW pushState while pointer < end-of-stack:
 *     1. Keep the full existing stack.
 *     2. Append the state at `pointer` (the "branching point"), unless
 *        it's already the last entry (dedup).
 *     3. Append the new state.
 *     4. Reset pointer to end.
 *   This preserves the full redo tail AND records the branch point.
 *
 * Consecutive undos/redos just move the pointer normally so they
 * navigate the stack without mutating it.
 */
import { ref, computed } from "vue";

const MAX_HISTORY_LIMIT = 100;

const stack = ref([]);    // string[]
const pointer = ref(-1);  // index of current state

/**
 * Record the current state. Call this AFTER performing the action.
 */
function pushState(stateObj) {
  const json = typeof stateObj === "string" ? stateObj : JSON.stringify(stateObj);

  // Deduplicate: skip if identical to the state at pointer
  if (pointer.value >= 0 && stack.value[pointer.value] === json) return;

  // If we're in the middle of the stack (after undo), re-anchor first
  if (pointer.value >= 0 && pointer.value < stack.value.length - 1) {
    const anchor = stack.value[pointer.value];
    // Append the branching-point state if it isn't already the last entry
    if (stack.value[stack.value.length - 1] !== anchor) {
      stack.value.push(anchor);
    }
  }

  stack.value.push(json);

  // Enforce maximum size (drop oldest entries)
  while (stack.value.length > MAX_HISTORY_LIMIT) {
    stack.value.shift();
  }

  pointer.value = stack.value.length - 1;
}

/**
 * Undo — move pointer back by one distinct state.
 */
function undo() {
  // Walk backwards to find a different state
  let idx = pointer.value - 1;
  while (idx >= 0 && stack.value[idx] === stack.value[pointer.value]) {
    idx--;
  }
  if (idx < 0) return null;
  pointer.value = idx;
  return JSON.parse(stack.value[idx]);
}

/**
 * Redo — move pointer forward by one distinct state.
 */
function redo() {
  let idx = pointer.value + 1;
  while (idx < stack.value.length && stack.value[idx] === stack.value[pointer.value]) {
    idx++;
  }
  if (idx >= stack.value.length) return null;
  pointer.value = idx;
  return JSON.parse(stack.value[idx]);
}

const canUndo = computed(() => {
  if (pointer.value <= 0) return false;
  // There must be at least one earlier entry with a different state
  for (let i = pointer.value - 1; i >= 0; i--) {
    if (stack.value[i] !== stack.value[pointer.value]) return true;
  }
  return false;
});

const canRedo = computed(() => {
  if (pointer.value >= stack.value.length - 1) return false;
  // There must be at least one later entry with a different state
  for (let i = pointer.value + 1; i < stack.value.length; i++) {
    if (stack.value[i] !== stack.value[pointer.value]) return true;
  }
  return false;
});

function clear() {
  stack.value = [];
  pointer.value = -1;
}

export function useHistoryManager() {
  return { pushState, undo, redo, canUndo, canRedo, clear };
}
