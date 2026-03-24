import { reactive, ref, computed } from "vue";
import { COMPONENT_CATALOG, COLS } from "../data/componentCatalog";

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
      ...(descriptor?.defaultProps ?? {}),
      ...extraProps
    }
  };
}

function init() {
  state.components = [
    createComponent("section-box", null, { x: 0, y: 0, w: 64, h: 16 }, { title: "Customer Profile", icon: "user" }),
    createComponent("text-input", null, { x: 0, y: 18, w: 16, h: 4 }, { label: "Customer ID", fieldId: "customer_id" }),
    createComponent("primary-button", null, { x: 48, y: 18, w: 16, h: 4 }, { text: "Lookup", actionType: "api-call" })
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

function resolveOverlap(layout, parentId, excludeId, maxCols) {
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

function updateLayout(componentId, patch, maxCols = COLS) {
  const target = state.components.find((c) => c.id === componentId);
  if (!target) return;
  const newLayout = { ...target.layout, ...patch };
  target.layout = resolveOverlap(newLayout, target.parentId, componentId, maxCols);
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
