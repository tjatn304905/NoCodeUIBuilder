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
  const W = 40;
  const P = 6;
  const IW = 38;
  const HW = 18;
  const HX = 20;

  /* ── 1. Page Header Banner ── */
  const headerBox = createComponent("container", null, { x: 0, y: 0, w: W, h: 7 }, {
    showBorder: true, showBackground: true, padding: P, bgColor: "#0f172a", fieldId: "section_header"
  });
  const titleLbl = createComponent("label", headerBox.id, { x: 0, y: 0, w: 30, h: 3 }, {
    text: "Telecom Customer Management", preset: "h2", color: "#f1f5f9", fontWeight: "bold", fieldId: "title_main"
  });
  const statusBadge = createComponent("status-badge", headerBox.id, { x: 30, y: 0, w: 8, h: 3 }, {
    status: "Online", tone: "success", fieldId: "system_status", alignment: "right", valign: "middle"
  });
  const subtitleLbl = createComponent("label", headerBox.id, { x: 0, y: 3, w: IW, h: 2 }, {
    text: "Search and manage customer accounts, plans, and billing", preset: "small", color: "#64748b", fontWeight: "normal", fieldId: "subtitle_main"
  });

  /* ── 2. Search Section ── */
  const searchBox = createComponent("container", null, { x: 0, y: 8, w: W, h: 23 }, {
    showBorder: true, showBackground: true, padding: P, bgColor: DEFAULT_CONTAINER_BG, fieldId: "section_search"
  });
  const lblSearch = createComponent("label", searchBox.id, { x: 0, y: 0, w: IW, h: 3 }, {
    text: "Customer Search", preset: "h3", color: "#f1f5f9", icon: "user", fieldId: "sec_search_title"
  });
  const inputName = createComponent("text-input", searchBox.id, { x: 0, y: 3, w: HW, h: 4 }, {
    label: "Customer Name", fieldId: "customer_name", placeholder: "Enter customer name"
  });
  const inputPhone = createComponent("text-input", searchBox.id, { x: HX, y: 3, w: HW, h: 4 }, {
    label: "Phone Number", fieldId: "customer_phone", mask: "000-0000-0000", inputType: "tel"
  });
  const comboPlan = createComponent("combo-box", searchBox.id, { x: 0, y: 8, w: HW, h: 4 }, {
    options: "5G Premium, 5G Standard, LTE Basic, LTE Plus", fieldId: "plan_select", label: "Plan Type"
  });
  const radioType = createComponent("radio-group", searchBox.id, { x: HX, y: 8, w: HW, h: 4 }, {
    options: "Individual, Corporate, Family", fieldId: "customer_type", label: "Customer Type"
  });
  const checkboxServices = createComponent("checkbox-group", searchBox.id, { x: 0, y: 13, w: HW, h: 4 }, {
    options: "5G, VoLTE, Roaming, Data Plus", fieldId: "service_options", label: "Additional Services"
  });
  const searchBtn = createComponent("action-button", searchBox.id, { x: 0, y: 18, w: 12, h: 3 }, {
    text: "Search", actionType: "api-call", icon: "search", colorPreset: "primary",
    params: "customer_name:$customer_name.value, phone:$customer_phone.value",
    fieldId: "btn_search"
  });
  const resetBtn = createComponent("action-button", searchBox.id, { x: 13, y: 18, w: 12, h: 3 }, {
    text: "Reset", actionType: "navigate", icon: "refresh", colorPreset: "secondary",
    fieldId: "btn_reset"
  });

  /* ── 3. Customer Info Dashboard ── */
  const infoBox = createComponent("container", null, { x: 0, y: 32, w: W, h: 15 }, {
    showBorder: true, showBackground: true, padding: P, bgColor: DEFAULT_CONTAINER_BG, fieldId: "section_info"
  });
  const lblInfo = createComponent("label", infoBox.id, { x: 0, y: 0, w: 26, h: 3 }, {
    text: "Customer Information", preset: "h3", color: "#f1f5f9", icon: "folder", fieldId: "sec_info_title"
  });
  const badgeActive = createComponent("status-badge", infoBox.id, { x: 30, y: 0, w: 8, h: 3 }, {
    status: "Active", tone: "success", fieldId: "cust_status_badge", alignment: "right", valign: "middle"
  });
  const factPlan = createComponent("data-fact", infoBox.id, { x: 0, y: 4, w: HW, h: 4 }, {
    label: "Current Plan", fieldId: "cust_plan", dataPath: "@apiData.user.plan"
  });
  const factBalance = createComponent("data-fact", infoBox.id, { x: HX, y: 4, w: HW, h: 4 }, {
    label: "Balance", fieldId: "balance", dataPath: "@apiData.user.balance", value: "89,000"
  });
  const factAccId = createComponent("data-fact", infoBox.id, { x: 0, y: 9, w: HW, h: 4 }, {
    label: "Account ID", fieldId: "acc_id", dataPath: "@apiData.account.id"
  });
  const factCredit = createComponent("data-fact", infoBox.id, { x: HX, y: 9, w: HW, h: 4 }, {
    label: "Credit Rating", fieldId: "credit", dataPath: "@apiData.account.credit"
  });

  /* ── 4. Additional Info ── */
  const extraBox = createComponent("container", null, { x: 0, y: 48, w: W, h: 9 }, {
    showBorder: true, showBackground: true, padding: P, bgColor: DEFAULT_CONTAINER_BG, fieldId: "section_extra"
  });
  const lblExtra = createComponent("label", extraBox.id, { x: 0, y: 0, w: IW, h: 3 }, {
    text: "Additional Info", preset: "h3", color: "#f1f5f9", fieldId: "sec_extra_title"
  });
  const datePicker = createComponent("date-picker", extraBox.id, { x: 0, y: 3, w: HW, h: 4 }, {
    fieldId: "join_date", label: "Join Date", placeholder: "YYYY-MM-DD", dateFormat: "YYYY-MM-DD"
  });
  const factDueDate = createComponent("data-fact", extraBox.id, { x: HX, y: 3, w: HW, h: 4 }, {
    label: "Due Date", fieldId: "due_date", dataPath: "@apiData.account.dueDate"
  });

  /* ── 5. Divider ── */
  const divider1 = createComponent("divider", null, { x: 0, y: 58, w: W, h: 1 }, {
    color: "#334155", orientation: "horizontal", thickness: 1, alignment: "center", valign: "middle", fieldId: "divider_1"
  });

  /* ── 6. Customer List (Data Grid) ── */
  const gridTitle = createComponent("label", null, { x: 0, y: 60, w: 30, h: 3 }, {
    text: "Customer List", preset: "h3", color: "#f1f5f9", fontWeight: "bold", icon: "list", fieldId: "grid_title"
  });
  const dataGrid = createComponent("data-grid", null, { x: 0, y: 63, w: W, h: 14 }, {
    columns: [
      { header: "Name", field: "name" },
      { header: "Status", field: "status" },
      { header: "Plan", field: "plan" },
      { header: "Amount", field: "amount" }
    ],
    selectionMode: "single",
    isEditable: false,
    allowAddRow: false,
    allowDeleteRow: false,
    isReadOnly: true,
    pagination: true,
    pageSize: 10,
    dataSourcePath: "@apiData.response.customers",
    fieldId: "customer_grid"
  });

  /* ── 7. Divider ── */
  const divider2 = createComponent("divider", null, { x: 0, y: 78, w: W, h: 1 }, {
    color: "#334155", orientation: "horizontal", thickness: 1, alignment: "center", valign: "middle", fieldId: "divider_2"
  });

  /* ── 8. Payment Accordion ── */
  const accordion = createComponent("accordion", null, { x: 0, y: 80, w: W, h: 16 }, {
    title: "Payment & Billing",
    panels: "Payment Method, Billing History, Auto-Pay Settings",
    activePanel: "Payment Method",
    fieldId: "payment_accordion"
  });

  /* ── 9. Divider ── */
  const divider3 = createComponent("divider", null, { x: 0, y: 97, w: W, h: 1 }, {
    color: "#334155", orientation: "horizontal", thickness: 1, alignment: "center", valign: "middle", fieldId: "divider_3"
  });

  /* ── 10. Available Plans ── */
  const plansTitle = createComponent("label", null, { x: 0, y: 99, w: 30, h: 3 }, {
    text: "Available Plans", preset: "h3", color: "#f1f5f9", fontWeight: "bold", icon: "star", fieldId: "plans_title"
  });
  const cardRepeater = createComponent("card-list-repeater", null, { x: 0, y: 102, w: W, h: 18 }, {
    dataSourcePath: "@apiData.response.products",
    cardTitle: "5G Premium",
    cardBadge: "5G",
    cardPrice: "89,000",
    cardPriceUnit: "Won/Month",
    cardDescription: "High-speed 5G data plan with unlimited streaming and premium content access.",
    cardFacts: "Data: 210GB, Voice: Unlimited, SMS: Unlimited, Tethering: 30GB",
    cardButtonText: "Select Plan",
    accentColor: "#3b82f6",
    cardWidth: 240,
    fieldId: "plan_cards"
  });

  /* ── 11. Submit ── */
  const submitBtn = createComponent("action-button", null, { x: 0, y: 121, w: W, h: 3 }, {
    text: "Submit Application", actionType: "submit", icon: "check", colorPreset: "primary",
    customBgColor: "#3b82f6", customTextColor: "#ffffff",
    fieldId: "btn_submit"
  });

  state.components = [
    headerBox, titleLbl, statusBadge, subtitleLbl,
    searchBox, lblSearch, inputName, inputPhone, comboPlan, radioType, checkboxServices, searchBtn, resetBtn,
    infoBox, lblInfo, badgeActive, factPlan, factBalance, factAccId, factCredit,
    extraBox, lblExtra, datePicker, factDueDate,
    divider1, gridTitle, dataGrid,
    divider2, accordion,
    divider3, plansTitle, cardRepeater,
    submitBtn
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
