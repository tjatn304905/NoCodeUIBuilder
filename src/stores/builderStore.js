import { reactive, ref, computed } from "vue";
import { COMPONENT_CATALOG, COLS, CELL_SIZE, CANVAS_WIDTH, DEFAULT_CONTAINER_BG } from "../data/componentCatalog";
import { parseInitialValue, runActionChain } from "../runtime/runtimeEngine";

let uid = 1;
let logicUid = 1;

const STORAGE_KEY = "nocode_builder_save";

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

const rootComponents = computed(() =>
  state.components.filter((c) => c.parentId === null)
);

const MIN_CANVAS_ROWS = 40;

const canvasRows = computed(() => {
  let maxBottom = MIN_CANVAS_ROWS;
  for (const c of state.components) {
    if (c.parentId === null) {
      const bottom = c.layout.y + c.layout.h;
      if (bottom > maxBottom) maxBottom = bottom;
    }
  }
  return maxBottom + 2;
});

function createComponent(type, parentId, layout, extraProps = {}) {
  const id = `cmp_${uid++}`;
  const descriptor = findDescriptor(type);
  const layoutCopy = { ...layout };
  const comp = {
    id,
    compId: newCompUuid(),
    type,
    parentId,
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

function ensureComponentSchema(comp) {
  if (!comp.compId) comp.compId = newCompUuid();
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
}

function getChildren(parentId) {
  return state.components.filter((c) => c.parentId === parentId);
}

function selectComponent(id) { selectedId.value = id; }
function deselectAll() { selectedId.value = null; }

function deleteComponent(id) {
  if (!confirm("Are you sure you want to delete this component?")) return;
  const idsToRemove = new Set();
  function collect(pid) {
    idsToRemove.add(pid);
    state.components.filter((c) => c.parentId === pid).forEach((c) => collect(c.id));
  }
  collect(id);
  state.components = state.components.filter((c) => !idsToRemove.has(c.id));
  if (idsToRemove.has(selectedId.value)) selectedId.value = null;
}

function rectsOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function checkOverlap(layout, parentId, excludeId) {
  return state.components
    .filter((c) => c.parentId === parentId && c.id !== excludeId)
    .some((s) => rectsOverlap(layout, s.layout));
}

function resolveOverlap(layout, parentId, excludeId, maxCols, maxRows = 9999) {
  const siblings = state.components.filter(
    (c) => c.parentId === parentId && c.id !== excludeId
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
  target.layout = resolveOverlap(nl, target.parentId, componentId, maxCols, maxRows);
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
  const resolved = resolveOverlap(layout, target.parentId, componentId, maxCols);
  target.layout = resolved;
}

function isDescendantOf(ancestorId, nodeId) {
  let cur = state.components.find((c) => c.id === nodeId);
  while (cur?.parentId) {
    if (cur.parentId === ancestorId) return true;
    cur = state.components.find((c) => c.id === cur.parentId);
  }
  return false;
}

function updateComponentParent(componentId, newParentId) {
  const target = state.components.find((c) => c.id === componentId);
  if (!target) return;
  const pid = newParentId === "" || newParentId == null ? null : newParentId;
  if (pid === componentId) return;
  if (pid && isDescendantOf(componentId, pid)) return;
  target.parentId = pid;
  target.layout = resolveOverlap(target.layout, target.parentId, componentId, COLS);
}

function addComponent(type, parentId, rawX, rawY, maxCols = COLS) {
  const descriptor = findDescriptor(type);
  if (!descriptor) return null;
  const defW = Math.min(maxCols, descriptor.defaultSize.w);
  const defH = descriptor.defaultSize.h;
  const x = Math.max(0, Math.min(maxCols - defW, Math.round(rawX)));
  const y = Math.max(0, Math.round(rawY));
  const layout = resolveOverlap({ x, y, w: defW, h: defH }, parentId, null, maxCols);
  const comp = createComponent(type, parentId, layout);
  ensureComponentSchema(comp);
  state.components.push(comp);
  selectedId.value = comp.id;
  return comp;
}

function updateProp(key, value) {
  const idx = state.components.findIndex((c) => c.id === selectedId.value);
  if (idx === -1) return;
  state.components[idx].props[key] = value;
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
}

function removeLogicVariable(variableId) {
  const idx = state.logic.variables.findIndex((v) => v.id === variableId);
  if (idx < 0) return;
  const [rm] = state.logic.variables.splice(idx, 1);
  if (rm?.name) delete runtimeVars[rm.name];
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
}

function removeOrderEvent(eventId) {
  state.logic.orderEvents = state.logic.orderEvents.filter((e) => e.id !== eventId);
}

function updateOrderEvent(eventId, patch) {
  const e = state.logic.orderEvents.find((x) => x.id === eventId);
  if (e) Object.assign(e, patch);
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
      parentId: c.parentId,
      layout: { ...c.layout },
      props: JSON.parse(JSON.stringify(c.props))
    }))
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
    updateComponentParent,
    /* Persistence & Serialization */
    serializeState,
    hydrateState,
    saveToLocalStorage,
    loadFromLocalStorage,
    hasSavedData,
    clearAll,
    exportToFile,
    importFromFile,
    loadTemplate
  };
}
