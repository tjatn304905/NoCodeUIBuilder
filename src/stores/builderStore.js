import { reactive, ref, computed } from "vue";
import { COMPONENT_CATALOG, COLS, CELL_SIZE } from "../data/componentCatalog";

let uid = 1;

const state = reactive({
  screenName: "Telecom Customer Lookup",
  components: []
});

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
  return {
    id,
    type,
    parentId,
    layout: { ...layout },
    props: {
      fieldId: extraProps.fieldId ?? `${type.replaceAll("-", "_")}_${id}`,
      label: descriptor?.label ?? labelFromType(type),
      alignment: "left",
      valign: "top",
      ...(descriptor?.defaultProps ?? {}),
      ...extraProps
    }
  };
}

function init() {
  const superSection = createComponent("super-section", null, { x: 0, y: 0, w: 64, h: 28 }, {
    title: "Customer Management",
    subtitle: "Search and manage telecom customer accounts",
    icon: "user",
    bgColor: "#ffffff"
  });

  const sectionProfile = createComponent("section-box", superSection.id, { x: 0, y: 0, w: 30, h: 20 }, {
    title: "Customer Profile",
    icon: "user"
  });

  const sectionAccount = createComponent("section-box", superSection.id, { x: 31, y: 0, w: 30, h: 20 }, {
    title: "Account Details",
    icon: "chart"
  });

  const inputName = createComponent("text-input", sectionProfile.id, { x: 0, y: 0, w: 26, h: 4 }, {
    label: "Customer Name", fieldId: "customer_name", placeholder: "Enter name"
  });
  const inputPhone = createComponent("text-input", sectionProfile.id, { x: 0, y: 5, w: 26, h: 4 }, {
    label: "Phone Number", fieldId: "customer_phone", mask: "000-0000-0000", inputType: "tel"
  });
  const factStatus = createComponent("data-fact", sectionProfile.id, { x: 0, y: 10, w: 12, h: 4 }, {
    label: "Status", fieldId: "status", dataPath: "@apiData.user.status"
  });
  const factPlan = createComponent("data-fact", sectionProfile.id, { x: 13, y: 10, w: 13, h: 4 }, {
    label: "Plan", fieldId: "plan", dataPath: "@apiData.user.plan"
  });

  const factAccId = createComponent("data-fact", sectionAccount.id, { x: 0, y: 0, w: 13, h: 4 }, {
    label: "Account ID", fieldId: "acc_id", dataPath: "@apiData.account.id"
  });
  const factCredit = createComponent("data-fact", sectionAccount.id, { x: 14, y: 0, w: 12, h: 4 }, {
    label: "Credit Rating", fieldId: "credit", dataPath: "@apiData.account.credit"
  });
  const factBalance = createComponent("data-fact", sectionAccount.id, { x: 0, y: 5, w: 13, h: 4 }, {
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
    superSection, sectionProfile, sectionAccount,
    inputName, inputPhone, factStatus, factPlan,
    factAccId, factCredit, factBalance,
    lookupBtn, resetBtn
  ];
}

function getChildren(parentId) {
  return state.components.filter((c) => c.parentId === parentId);
}

function selectComponent(id) {
  selectedId.value = id;
}

function deselectAll() {
  selectedId.value = null;
}

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
    if (layout.x + w <= maxCols && !overlaps(layout.x, ty)) {
      return { x: layout.x, y: ty, w, h };
    }
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

function addComponent(type, parentId, rawX, rawY, maxCols = COLS) {
  const descriptor = findDescriptor(type);
  if (!descriptor) return null;
  const defW = Math.min(maxCols, descriptor.defaultSize.w);
  const defH = descriptor.defaultSize.h;
  const x = Math.max(0, Math.min(maxCols - defW, Math.round(rawX)));
  const y = Math.max(0, Math.round(rawY));
  const layout = resolveOverlap({ x, y, w: defW, h: defH }, parentId, null, maxCols);
  const comp = createComponent(type, parentId, layout);
  state.components.push(comp);
  selectedId.value = comp.id;
  return comp;
}

function updateProp(key, value) {
  const idx = state.components.findIndex((c) => c.id === selectedId.value);
  if (idx === -1) return;
  state.components[idx].props[key] = value;
}

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
    getChildren,
    selectComponent,
    deselectAll,
    deleteComponent,
    updateLayout,
    addComponent,
    updateProp,
    typeLabel,
    checkOverlap
  };
}
