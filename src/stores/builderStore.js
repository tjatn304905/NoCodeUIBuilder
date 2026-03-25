import { reactive, ref, computed } from "vue";
import { COMPONENT_CATALOG, COLS, CELL_SIZE, DEFAULT_CONTAINER_BG } from "../data/componentCatalog";
import { parseInitialValue, runActionChain } from "../runtime/runtimeEngine";

let uid = 1;
let logicUid = 1;

function newCompUuid() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx`.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === "x" ? r : (r & 3) | 8).toString(16);
  });
}

function syncGridPosFromLayout(comp) {
  if (!comp.layout) return;
  comp.gridPos = {
    x: comp.layout.x,
    y: comp.layout.y,
    colSpan: comp.layout.w,
    rowSpan: comp.layout.h
  };
}

const state = reactive({
  screenName: "Telecom Customer Lookup",
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
    gridPos: {
      x: layoutCopy.x,
      y: layoutCopy.y,
      colSpan: layoutCopy.w,
      rowSpan: layoutCopy.h
    },
    props: {
      fieldId: extraProps.fieldId ?? `${type.replaceAll("-", "_")}_${id}`,
      label: descriptor?.label ?? labelFromType(type),
      alignment: "left",
      valign: "top",
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
  if (!comp.gridPos) syncGridPosFromLayout(comp);
  if (comp.props.hiddenCon === undefined) comp.props.hiddenCon = "";
  if (comp.props.readonlyCon === undefined) comp.props.readonlyCon = "";
  if (comp.type === "data-fact") {
    const bg = String(comp.props?.bgColor ?? "").trim().toLowerCase();
    if (!bg || bg === "#ffffff" || bg === "#fff") comp.props.bgColor = DEFAULT_CONTAINER_BG;
  }
}

function init() {
  const root = createComponent("container", null, { x: 0, y: 0, w: 64, h: 28 }, {
    showBorder: true, showBackground: true, padding: 12, bgColor: DEFAULT_CONTAINER_BG
  });
  const titleLbl = createComponent("label", root.id, { x: 0, y: 0, w: 50, h: 2 }, {
    text: "Customer Management", preset: "h2", color: "#f1f5f9", fontWeight: "bold", fieldId: "title_main"
  });
  const subLbl = createComponent("label", root.id, { x: 0, y: 2, w: 58, h: 2 }, {
    text: "Search and manage telecom customer accounts", preset: "small", color: "#94a3b8", fontWeight: "normal", fieldId: "subtitle_main"
  });
  const sectionProfile = createComponent("container", root.id, { x: 0, y: 5, w: 30, h: 20 }, {
    showBorder: true, showBackground: true, padding: 10, bgColor: DEFAULT_CONTAINER_BG
  });
  const lblProfile = createComponent("label", sectionProfile.id, { x: 0, y: 0, w: 26, h: 2 }, {
    text: "Customer Profile", preset: "h3", fieldId: "sec_profile_title"
  });
  const sectionAccount = createComponent("container", root.id, { x: 31, y: 5, w: 30, h: 20 }, {
    showBorder: true, showBackground: true, padding: 10, bgColor: DEFAULT_CONTAINER_BG
  });
  const lblAccount = createComponent("label", sectionAccount.id, { x: 0, y: 0, w: 26, h: 2 }, {
    text: "Account Details", preset: "h3", fieldId: "sec_account_title"
  });
  const inputName = createComponent("text-input", sectionProfile.id, { x: 0, y: 3, w: 26, h: 4 }, {
    label: "Customer Name", fieldId: "customer_name", placeholder: "Enter name"
  });
  const inputPhone = createComponent("text-input", sectionProfile.id, { x: 0, y: 8, w: 26, h: 4 }, {
    label: "Phone Number", fieldId: "customer_phone", mask: "000-0000-0000", inputType: "tel"
  });
  const factStatus = createComponent("data-fact", sectionProfile.id, { x: 0, y: 13, w: 12, h: 4 }, {
    label: "Status", fieldId: "status", dataPath: "@apiData.user.status"
  });
  const factPlan = createComponent("data-fact", sectionProfile.id, { x: 13, y: 13, w: 13, h: 4 }, {
    label: "Plan", fieldId: "plan", dataPath: "@apiData.user.plan"
  });
  const factAccId = createComponent("data-fact", sectionAccount.id, { x: 0, y: 3, w: 13, h: 4 }, {
    label: "Account ID", fieldId: "acc_id", dataPath: "@apiData.account.id"
  });
  const factCredit = createComponent("data-fact", sectionAccount.id, { x: 14, y: 3, w: 12, h: 4 }, {
    label: "Credit Rating", fieldId: "credit", dataPath: "@apiData.account.credit"
  });
  const factBalance = createComponent("data-fact", sectionAccount.id, { x: 0, y: 8, w: 13, h: 4 }, {
    label: "Balance", fieldId: "balance", dataPath: "@apiData.user.balance", value: "89,000"
  });
  const lookupBtn = createComponent("action-button", null, { x: 0, y: 30, w: 12, h: 4 }, {
    text: "Lookup", actionType: "api-call", icon: "search", colorPreset: "primary",
    params: "customer_name:$customer_name.value, phone:$customer_phone.value"
  });
  const resetBtn = createComponent("action-button", null, { x: 13, y: 30, w: 12, h: 4 }, {
    text: "Reset", actionType: "navigate", icon: "refresh", colorPreset: "secondary"
  });

  state.components = [
    root, titleLbl, subLbl, sectionProfile, lblProfile, sectionAccount, lblAccount,
    inputName, inputPhone, factStatus, factPlan, factAccId, factCredit, factBalance,
    lookupBtn, resetBtn
  ];
  for (const c of state.components) ensureComponentSchema(c);

  state.logic.orderEvents = [
    {
      id: `oe_${logicUid++}`,
      eventCode: "CUST_LOOKUP",
      name: "Customer Lookup",
      requestDtoJson: '{\n  "customer_name": "",\n  "phone": ""\n}',
      requestMapping: "customer_name:$customer_name.value, phone:$customer_phone.value",
      onSuccessVariable: "",
      onSuccessPath: ""
    }
  ];
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
  syncGridPosFromLayout(target);
}

function updateGridPosRect(componentId, patch, maxCols = COLS) {
  const target = state.components.find((c) => c.id === componentId);
  if (!target) return;
  const gp = { ...target.gridPos, ...patch };
  const layout = {
    x: Math.max(0, Number(gp.x) || 0),
    y: Math.max(0, Number(gp.y) || 0),
    w: Math.max(1, Number(gp.colSpan) || 1),
    h: Math.max(1, Number(gp.rowSpan) || 1)
  };
  const resolved = resolveOverlap(layout, target.parentId, componentId, maxCols);
  target.layout = resolved;
  syncGridPosFromLayout(target);
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
  syncGridPosFromLayout(target);
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
    fieldValues[fid] = c.type === "address-picker"
      ? { line1: "", line2: "", city: "", postal: "" }
      : "";
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
    updateComponentParent
  };
}
