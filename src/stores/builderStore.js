import { reactive, ref, computed } from "vue";
import { COMPONENT_CATALOG, COLS, CELL_SIZE, CANVAS_WIDTH, DEFAULT_CONTAINER_BG, CONTAINER_TYPES } from "../data/componentCatalog";
import { parseInitialValue, runActionChain } from "../runtime/runtimeEngine";
import { useHistoryManager } from "./historyManager";

let uid = 1;
let logicUid = 1;

const STORAGE_KEY = "nocode_builder_save";

/* ─── History manager instance ─── */
const history = useHistoryManager();

function newCompUuid() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 3) | 8).toString(16);
  });
}

const state = reactive({
  screenName: "Canvas",
  components: [],
  logic: {
    variables: [],
    orderEvents: [],
    activeScreen: "default"
  }
});

const runtimeVars = reactive({});
const fieldValues = reactive({});
const loadingByComponent = reactive({});

const selectedId = ref(null);
const previewMode = ref(false);

const selectedComponent = computed(() => {
  if (!selectedId.value) return null;
  return state.components.find((c) => c.id === selectedId.value) ?? null;
});

function normalizeParentFieldId(v) {
  if (v == null || v === "") return null;
  return String(v);
}

const rootComponents = computed(() =>
  state.components.filter((c) => normalizeParentFieldId(c.parentFieldId) === null)
);

const MIN_CANVAS_ROWS = 80;

const canvasRows = computed(() => {
  let maxBottom = MIN_CANVAS_ROWS;
  for (const c of state.components) {
    if (normalizeParentFieldId(c.parentFieldId) === null) {
      const bottom = c.layout.y + c.layout.h;
      if (bottom > maxBottom) maxBottom = bottom;
    }
  }
  return maxBottom + 2;
});

/* ═══════════════════════════════════════
 * Snapshot helpers for Undo / Redo
 * ═══════════════════════════════════════
 *
 * Design (post-action recording):
 *   Every mutating function calls _pushCurrentState() AFTER it has
 *   made its change.  The history stack therefore always contains
 *   "result" states.  Undo/Redo simply restore one of those states.
 *
 *   _isUndoRedoing prevents the restore itself from being recorded.
 */

let _isUndoRedoing = false;

/** Deep-clone the builder state into a plain object. */
function _takeSnapshot() {
  return JSON.parse(JSON.stringify({
    screenName: state.screenName,
    components: state.components,
    logic: state.logic
  }));
}

/** Push the current (post-mutation) state to the history stack.
 *  No-op when we are inside an undo/redo restoration. */
function _pushCurrentState() {
  if (_isUndoRedoing) return;
  history.pushState(_takeSnapshot());
}

/** Restore a snapshot into the reactive state. */
function _restoreSnapshot(snap) {
  if (!snap) return;
  state.screenName = snap.screenName ?? "Canvas";
  const comps = snap.components ?? [];
  migrateLegacyParentId(comps);
  for (const c of comps) ensureComponentSchema(c);
  state.components = comps;
  state.logic.variables = snap.logic?.variables ?? [];
  state.logic.orderEvents = snap.logic?.orderEvents ?? [];
  state.logic.activeScreen = snap.logic?.activeScreen ?? "default";
  // Recalculate uid/logicUid to avoid id collisions
  let maxCmpNum = 0, maxLogicNum = 0;
  for (const c of state.components) {
    const m = String(c.id).match(/\d+/);
    if (m) maxCmpNum = Math.max(maxCmpNum, Number(m[0]));
  }
  for (const v of state.logic.variables) {
    const m = String(v.id).match(/\d+/);
    if (m) maxLogicNum = Math.max(maxLogicNum, Number(m[0]));
  }
  for (const e of state.logic.orderEvents) {
    const m = String(e.id).match(/\d+/);
    if (m) maxLogicNum = Math.max(maxLogicNum, Number(m[0]));
  }
  uid = maxCmpNum + 1;
  logicUid = maxLogicNum + 1;
}

function undo() {
  if (!history.canUndo.value) return;
  _isUndoRedoing = true;
  try {
    const snap = history.undo();
    if (snap) {
      _restoreSnapshot(snap);
      selectedId.value = null;
    }
  } finally {
    _isUndoRedoing = false;
  }
}

function redo() {
  if (!history.canRedo.value) return;
  _isUndoRedoing = true;
  try {
    const snap = history.redo();
    if (snap) {
      _restoreSnapshot(snap);
      selectedId.value = null;
    }
  } finally {
    _isUndoRedoing = false;
  }
}

/**
 * For drag/resize: we need to record the state BEFORE the move starts,
 * so that undo returns to that state.  The actual updateLayout() at the
 * end of the drag will push the "after" state.
 */
let _moveSnapshotPending = false;
function recordBeforeMove() {
  // Push the current (pre-move) state so it exists in the stack.
  // The flag prevents updateLayout from double-pushing.
  if (_isUndoRedoing) return;
  _pushCurrentState();
  _moveSnapshotPending = true;
}

/** Cancel a pending move/resize (e.g. dropped on overlapping position).
 *  Clears the pending flag without pushing an "after" state. */
function cancelMove() {
  _moveSnapshotPending = false;
}

/** Public helper: push the current state as a history entry.
 *  Used by the UI layer (e.g. after debounced property edits settle). */
function commitSnapshot() {
  _pushCurrentState();
}

function createComponent(type, parentFieldId, layout, extraProps = {}) {
  const id = `cmp_${uid++}`;
  const descriptor = findDescriptor(type);
  const layoutCopy = { ...layout };
  const comp = {
    id,
    compId: newCompUuid(),
    type,
    parentFieldId: normalizeParentFieldId(parentFieldId),
    layout: layoutCopy,
    props: {
      fieldId: extraProps.fieldId ?? `${type.replaceAll("-", "_")}_${id}`,
      label: descriptor?.label ?? labelFromType(type),
      hAlign: "left",
      vAlign: "top",
      hiddenCon: "",
      readonlyCon: "",
      events: { onPageLoad: [], onClick: [], onChange: [] },
      ...(descriptor?.defaultProps ?? {}),
      ...extraProps
    }
  };
  if (!comp.props.events || typeof comp.props.events !== "object") {
    comp.props.events = { onPageLoad: [], onClick: [], onChange: [] };
  }
  if (comp.props.hiddenCon === undefined) comp.props.hiddenCon = "";
  if (comp.props.readonlyCon === undefined) comp.props.readonlyCon = "";
  return comp;
}

function migrateLegacyParentId(comps) {
  if (!Array.isArray(comps)) return;
  const byId = new Map();
  for (const c of comps) {
    if (c && typeof c.id === "string") byId.set(c.id, c);
  }
  for (const c of comps) {
    if (!c || typeof c !== "object") continue;
    if (!Object.prototype.hasOwnProperty.call(c, "parentId")) continue;
    if (c.parentId == null || c.parentId === "") {
      c.parentFieldId = null;
    } else {
      const p = byId.get(c.parentId);
      const pf = p?.props?.fieldId;
      c.parentFieldId = typeof pf === "string" && pf.trim() ? pf.trim() : null;
    }
    delete c.parentId;
  }
}

function ensureComponentSchema(comp) {
  if (!comp.compId) comp.compId = newCompUuid();
  comp.parentFieldId = normalizeParentFieldId(comp.parentFieldId);
  if (Object.prototype.hasOwnProperty.call(comp, "parentId")) {
    delete comp.parentId;
  }
  if (comp.gridPos && comp.layout) {
    delete comp.gridPos;
  } else if (comp.gridPos && !comp.layout) {
    const gp = comp.gridPos;
    comp.layout = {
      x: Number(gp.x) || 0,
      y: Number(gp.y) || 0,
      w: Math.max(1, Number(gp.colSpan ?? gp.w) || 1),
      h: Math.max(1, Number(gp.rowSpan ?? gp.h) || 1)
    };
    delete comp.gridPos;
  }
  if (comp.props) {
    if (comp.props.alignment != null && comp.props.hAlign == null) {
      comp.props.hAlign = comp.props.alignment;
      delete comp.props.alignment;
    }
    if (comp.props.valign != null && comp.props.vAlign == null) {
      comp.props.vAlign = comp.props.valign;
      delete comp.props.valign;
    }
  }
  if (comp.props.hiddenCon === undefined) comp.props.hiddenCon = "";
  if (comp.props.readonlyCon === undefined) comp.props.readonlyCon = "";
  if (comp.type === "data-fact") {
    const bg = String(comp.props?.bgColor ?? "").trim().toLowerCase();
    if (!bg || bg === "#ffffff" || bg === "#fff") comp.props.bgColor = DEFAULT_CONTAINER_BG;
  }
}

function init() {
  /* Start with an empty canvas */
  state.screenName = "Canvas";
  state.components = [];
  state.logic.variables = [];
  state.logic.orderEvents = [];
  state.logic.activeScreen = "default";

  // Seed history with the initial empty state
  history.clear();
  history.pushState(_takeSnapshot());
}

function getChildren(parentFieldIdKey) {
  const key = normalizeParentFieldId(parentFieldIdKey);
  if (key === null) {
    return state.components.filter((c) => normalizeParentFieldId(c.parentFieldId) === null);
  }
  return state.components.filter((c) => normalizeParentFieldId(c.parentFieldId) === key);
}

function selectComponent(id) { selectedId.value = id; }
function deselectAll() { selectedId.value = null; }

function deleteComponent(id) {
  if (!confirm("Are you sure you want to delete this component?")) return;
  const idsToRemove = new Set();
  function collect(compId) {
    const node = state.components.find((c) => c.id === compId);
    if (!node || idsToRemove.has(compId)) return;
    idsToRemove.add(compId);
    const fid = node.props?.fieldId;
    const nf = normalizeParentFieldId(fid);
    if (nf === null) return;
    for (const c of state.components) {
      if (normalizeParentFieldId(c.parentFieldId) === nf) collect(c.id);
    }
  }
  collect(id);
  state.components = state.components.filter((c) => !idsToRemove.has(c.id));
  if (idsToRemove.has(selectedId.value)) selectedId.value = null;
  _pushCurrentState();
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function checkOverlap(layout, parentFieldId, excludeId) {
  const pf = normalizeParentFieldId(parentFieldId);
  return state.components
    .filter((c) => normalizeParentFieldId(c.parentFieldId) === pf && c.id !== excludeId)
    .some((s) => rectsOverlap(layout, s.layout));
}

function resolveOverlap(layout, parentFieldId, excludeId, maxCols, maxRows = 9999) {
  const pf = normalizeParentFieldId(parentFieldId);
  const siblings = state.components.filter(
    (c) => normalizeParentFieldId(c.parentFieldId) === pf && c.id !== excludeId
  );
  if (siblings.length === 0) return layout;
  const { w, h } = layout;
  function overlaps(tx, ty) {
    return siblings.some((s) => rectsOverlap({ x: tx, y: ty, w, h }, s.layout));
  }
  if (!overlaps(layout.x, layout.y)) return layout;
  for (let dy = 0; dy < 100; dy++) {
    const ty = layout.y + dy;
    if (ty + h > maxRows) break;
    if (layout.x + w <= maxCols && !overlaps(layout.x, ty)) return { x: layout.x, y: ty, w, h };
    for (let dx = 1; dx <= maxCols; dx++) {
      const rx = layout.x + dx;
      if (rx + w <= maxCols && !overlaps(rx, ty)) return { x: rx, y: ty, w, h };
      const lx = layout.x - dx;
      if (lx >= 0 && lx + w <= maxCols && !overlaps(lx, ty)) return { x: lx, y: ty, w, h };
    }
  }
  return layout;
}

function updateLayout(componentId, patch, maxCols = COLS, maxRows = 9999) {
  const target = state.components.find((c) => c.id === componentId);
  if (!target) return;
  const nl = { ...target.layout, ...patch };
  nl.x = Math.max(0, nl.x);
  nl.y = Math.max(0, nl.y);
  if (nl.x + nl.w > maxCols) nl.w = Math.max(1, maxCols - nl.x);
  if (nl.y + nl.h > maxRows) nl.y = Math.max(0, maxRows - nl.h);
  target.layout = resolveOverlap(nl, target.parentFieldId, componentId, maxCols, maxRows);

  // After a drag/resize that was started with recordBeforeMove(),
  // push the resulting state so undo has "before" AND "after".
  if (_moveSnapshotPending) {
    _moveSnapshotPending = false;
    _pushCurrentState();
  }
}

function updateGridPosRect(componentId, patch, maxCols = COLS) {
  const target = state.components.find((c) => c.id === componentId);
  if (!target) return;
  const cur = target.layout;
  const merged = { ...cur, ...patch };
  const layout = {
    x: Math.max(0, Number(merged.x) || 0),
    y: Math.max(0, Number(merged.y) || 0),
    w: Math.max(1, Number(merged.w) || 1),
    h: Math.max(1, Number(merged.h) || 1)
  };
  const resolved = resolveOverlap(layout, target.parentFieldId, componentId, maxCols);
  target.layout = resolved;
  _pushCurrentState();
}

function componentByFieldId(fieldId) {
  const fid = normalizeParentFieldId(fieldId);
  if (fid === null) return null;
  return state.components.find((c) => c.props?.fieldId === fid) ?? null;
}

/** True if `startFieldId` is a descendant of `ancestorFieldId` (walks parentFieldId chain). */
function isFieldUnderAncestor(ancestorFieldId, startFieldId) {
  const root = normalizeParentFieldId(ancestorFieldId);
  let cur = normalizeParentFieldId(startFieldId);
  const seen = new Set();
  while (cur != null) {
    if (cur === root) return true;
    if (seen.has(cur)) break;
    seen.add(cur);
    const node = componentByFieldId(cur);
    if (!node) break;
    cur = normalizeParentFieldId(node.parentFieldId);
  }
  return false;
}

function updateComponentParentField(componentId, newParentFieldIdRaw) {
  const target = state.components.find((c) => c.id === componentId);
  if (!target) return;
  const pid = normalizeParentFieldId(newParentFieldIdRaw);
  const selfFid = target.props?.fieldId;
  if (pid != null && selfFid && pid === selfFid) return;
  if (pid != null) {
    const parentComp = componentByFieldId(pid);
    if (!parentComp || !CONTAINER_TYPES.has(parentComp.type)) return;
    if (selfFid && isFieldUnderAncestor(selfFid, pid)) return;
  }
  target.parentFieldId = pid;
  target.layout = resolveOverlap(target.layout, target.parentFieldId, componentId, COLS);
  _pushCurrentState();
}

function addComponent(type, parentFieldId, rawX, rawY, maxCols = COLS) {
  const descriptor = findDescriptor(type);
  if (!descriptor) return null;
  const defW = Math.min(maxCols, descriptor.defaultSize.w);
  const defH = descriptor.defaultSize.h;
  const x = Math.max(0, Math.min(maxCols - defW, Math.round(rawX)));
  const y = Math.max(0, Math.round(rawY));
  const pf = normalizeParentFieldId(parentFieldId);
  const layout = resolveOverlap({ x, y, w: defW, h: defH }, pf, null, maxCols);
  const comp = createComponent(type, pf, layout);
  ensureComponentSchema(comp);
  state.components.push(comp);
  selectedId.value = comp.id;
  _pushCurrentState();
  return comp;
}

function updateProp(key, value) {
  const idx = state.components.findIndex((c) => c.id === selectedId.value);
  if (idx === -1) return;
  if (key === "fieldId") {
    const oldFid = state.components[idx].props.fieldId;
    state.components[idx].props[key] = value;
    const oldN = normalizeParentFieldId(oldFid);
    const newN = normalizeParentFieldId(value);
    if (oldN != null && newN != null && oldN !== newN) {
      for (const c of state.components) {
        if (normalizeParentFieldId(c.parentFieldId) === oldN) c.parentFieldId = newN;
      }
    }
    return;
  }
  state.components[idx].props[key] = value;
}

/** Undoable version — updates prop then records snapshot */
function updatePropUndoable(key, value) {
  updateProp(key, value);
  _pushCurrentState();
}

/* ─── Runtime Vars ─── */
function rebuildRuntimeVars() {
  for (const k of Object.keys(runtimeVars)) delete runtimeVars[k];
  for (const v of state.logic.variables) {
    if (!v?.name) continue;
    runtimeVars[v.name] = parseInitialValue(v.type || "string", v.initialValue);
  }
}

function seedFieldValues() {
  for (const c of state.components) {
    const fid = c.props?.fieldId;
    if (!fid || fieldValues[fid] !== undefined) continue;
    fieldValues[fid] = "";
  }
}

function buildActionContext(componentId) {
  return {
    componentId,
    fieldValues,
    runtimeVars,
    onNavigate: (target) => { state.logic.activeScreen = target || "default"; }
  };
}

async function runPreviewTrigger(componentId, trigger) {
  const c = state.components.find((x) => x.id === componentId);
  if (!c) return;
  const actions = c.props.events?.[trigger];
  if (!Array.isArray(actions) || !actions.length) return;
  const ctx = buildActionContext(componentId);
  loadingByComponent[componentId] = true;
  try {
    await runActionChain(actions, ctx, state.logic.orderEvents);
  } catch { /* wireframe: swallow */ } finally {
    loadingByComponent[componentId] = false;
  }
}

async function runAllPageLoadTriggers() {
  for (const c of state.components) {
    const actions = c.props.events?.onPageLoad;
    if (!Array.isArray(actions) || !actions.length) continue;
    await runPreviewTrigger(c.id, "onPageLoad");
  }
}

/* ─── DATA CRUD ─── */
function addLogicVariable() {
  const id = `lv_${logicUid}`;
  const name = `state_${logicUid}`;
  logicUid += 1;
  state.logic.variables.push({ id, name, type: "string", initialValue: "" });
  runtimeVars[name] = "";
  _pushCurrentState();
}

function removeLogicVariable(variableId) {
  const idx = state.logic.variables.findIndex((v) => v.id === variableId);
  if (idx < 0) return;
  const [rm] = state.logic.variables.splice(idx, 1);
  if (rm?.name) delete runtimeVars[rm.name];
  _pushCurrentState();
}

function updateLogicVariable(variableId, patch) {
  const v = state.logic.variables.find((x) => x.id === variableId);
  if (!v) return;
  const prevName = v.name;
  Object.assign(v, patch);
  if (patch.name != null && patch.name !== prevName) {
    if (runtimeVars[prevName] !== undefined) {
      runtimeVars[patch.name] = runtimeVars[prevName];
      delete runtimeVars[prevName];
    }
  }
  if (patch.type != null || patch.initialValue != null || patch.name != null) {
    runtimeVars[v.name] = parseInitialValue(v.type, v.initialValue);
  }
  _pushCurrentState();
}

/* ─── ORDER EVENT CRUD ─── */
function addOrderEvent() {
  state.logic.orderEvents.push({
    id: `oe_${logicUid++}`,
    eventCode: "",
    name: "New Event",
    requestDtoJson: "{\n}",
    requestMapping: "",
    onSuccessVariable: "",
    onSuccessPath: ""
  });
  _pushCurrentState();
}

function removeOrderEvent(eventId) {
  state.logic.orderEvents = state.logic.orderEvents.filter((e) => e.id !== eventId);
  _pushCurrentState();
}

function updateOrderEvent(eventId, patch) {
  const e = state.logic.orderEvents.find((x) => x.id === eventId);
  if (e) Object.assign(e, patch);
  _pushCurrentState();
}

/* ─── Helpers ─── */
function findDescriptor(type) {
  for (const group of COMPONENT_CATALOG) {
    const found = group.items.find((i) => i.type === type);
    if (found) return found;
  }
  return null;
}
function labelFromType(type) {
  return type.split("-").map((c) => c[0].toUpperCase() + c.slice(1)).join(" ");
}
function typeLabel(type) {
  return findDescriptor(type)?.label ?? labelFromType(type);
}

/* ═══════════════════════════════════════════════
 * Serialization / Deserialization / Persistence
 * ═══════════════════════════════════════════════ */

/** Serialize the full builder state into a portable JSON object */
function serializeState() {
  return {
    screenInfo: {
      name: state.screenName,
      version: "1.0"
    },
    logic: JSON.parse(JSON.stringify(state.logic)),
    components: state.components.map((c) => ({
      id: c.id,
      compId: c.compId,
      type: c.type,
      parentFieldId: normalizeParentFieldId(c.parentFieldId),
      layout: { ...c.layout },
      props: JSON.parse(JSON.stringify(c.props))
    }))
  };
}

/** Omits `compId` (runtime-only / integration id) — use for on-screen JSON preview & copy. */
function serializeStateForExport() {
  const data = serializeState();
  return {
    ...data,
    components: data.components.map(({ compId: _omit, ...rest }) => rest)
  };
}

/** Hydrate builder state from a serialized JSON object */
function hydrateState(json) {
  if (!json || typeof json !== "object") return false;
  try {
    /* Screen info */
    if (json.screenInfo?.name) {
      state.screenName = json.screenInfo.name;
    } else if (json.screenName) {
      state.screenName = json.screenName;
    }

    /* Logic: variables + orderEvents */
    if (json.logic) {
      state.logic.variables = Array.isArray(json.logic.variables)
        ? JSON.parse(JSON.stringify(json.logic.variables))
        : [];
      state.logic.orderEvents = Array.isArray(json.logic.orderEvents)
        ? JSON.parse(JSON.stringify(json.logic.orderEvents))
        : [];
      state.logic.activeScreen = json.logic.activeScreen || "default";
    }

    /* Components */
    if (Array.isArray(json.components)) {
      const comps = JSON.parse(JSON.stringify(json.components));
      migrateLegacyParentId(comps);
      for (const c of comps) ensureComponentSchema(c);
      state.components = comps;
    }

    /* Recalculate internal counters to avoid id collisions */
    let maxCmpNum = 0;
    let maxLogicNum = 0;
    for (const c of state.components) {
      const m = String(c.id).match(/\d+/);
      if (m) maxCmpNum = Math.max(maxCmpNum, Number(m[0]));
    }
    for (const v of state.logic.variables) {
      const m = String(v.id).match(/\d+/);
      if (m) maxLogicNum = Math.max(maxLogicNum, Number(m[0]));
    }
    for (const e of state.logic.orderEvents) {
      const m = String(e.id).match(/\d+/);
      if (m) maxLogicNum = Math.max(maxLogicNum, Number(m[0]));
    }
    uid = maxCmpNum + 1;
    logicUid = maxLogicNum + 1;

    /* Reset runtime */
    for (const k of Object.keys(runtimeVars)) delete runtimeVars[k];
    for (const k of Object.keys(fieldValues)) delete fieldValues[k];
    for (const k of Object.keys(loadingByComponent)) delete loadingByComponent[k];
    rebuildRuntimeVars();
    seedFieldValues();
    selectedId.value = null;
    previewMode.value = false;

    // Reset history on hydration (import / template load)
    history.clear();
    history.pushState(_takeSnapshot());

    return true;
  } catch (err) {
    console.error("[Builder] Hydration failed:", err);
    return false;
  }
}

/* ─── LocalStorage Persistence ─── */
function saveToLocalStorage() {
  try {
    const data = serializeState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    return true;
  } catch (err) {
    console.error("[Builder] Save failed:", err);
    return false;
  }
}

function loadFromLocalStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const json = JSON.parse(raw);
    return hydrateState(json);
  } catch (err) {
    console.error("[Builder] Load failed:", err);
    return false;
  }
}

function hasSavedData() {
  return !!localStorage.getItem(STORAGE_KEY);
}

/* ─── Clear / Reset ─── */
function clearAll() {
  state.screenName = "Canvas";
  state.components = [];
  state.logic.variables = [];
  state.logic.orderEvents = [];
  state.logic.activeScreen = "default";
  uid = 1;
  logicUid = 1;
  for (const k of Object.keys(runtimeVars)) delete runtimeVars[k];
  for (const k of Object.keys(fieldValues)) delete fieldValues[k];
  for (const k of Object.keys(loadingByComponent)) delete loadingByComponent[k];
  selectedId.value = null;
  previewMode.value = false;

  history.clear();
  history.pushState(_takeSnapshot());
}

/* ─── File Export / Import ─── */
function exportToFile() {
  const data = serializeState();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(state.screenName || "screen").replace(/\s+/g, "_").toLowerCase()}_export.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function importFromFile() {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) { resolve(false); return; }
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const json = JSON.parse(reader.result);
          resolve(hydrateState(json));
        } catch {
          resolve(false);
        }
      };
      reader.onerror = () => resolve(false);
      reader.readAsText(file);
    };
    input.click();
  });
}

/* ─── Load Template ─── */
function loadTemplate(templateData) {
  if (!templateData) return false;
  return hydrateState(templateData);
}

init();

export function useBuilderStore() {
  return {
    state,
    selectedId,
    previewMode,
    selectedComponent,
    rootComponents,
    canvasRows,
    runtimeVars,
    fieldValues,
    loadingByComponent,
    getChildren,
    selectComponent,
    deselectAll,
    deleteComponent,
    updateLayout,
    addComponent,
    updateProp,
    updatePropUndoable,
    typeLabel,
    checkOverlap,
    rebuildRuntimeVars,
    seedFieldValues,
    runPreviewTrigger,
    runAllPageLoadTriggers,
    addLogicVariable,
    removeLogicVariable,
    updateLogicVariable,
    addOrderEvent,
    removeOrderEvent,
    updateOrderEvent,
    updateGridPosRect,
    updateComponentParentField,
    /* Persistence & Serialization */
    serializeState,
    serializeStateForExport,
    hydrateState,
    saveToLocalStorage,
    loadFromLocalStorage,
    hasSavedData,
    clearAll,
    exportToFile,
    importFromFile,
    loadTemplate,
    /* Undo / Redo */
    undo,
    redo,
    canUndo: history.canUndo,
    canRedo: history.canRedo,
    recordBeforeMove,
    cancelMove,
    commitSnapshot
  };
}
