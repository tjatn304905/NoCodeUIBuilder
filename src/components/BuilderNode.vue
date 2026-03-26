<template>
  <template v-if="!previewMode">
    <!-- Ghost -->
    <div
      v-if="isDragging || isResizing"
      class="pointer-events-none absolute rounded-lg border-2 border-dashed"
      :class="ghostOverlaps ? 'z-[45] border-red-400 bg-red-100/25' : 'z-[15] border-blue-400 bg-blue-100/25'"
      :style="ghostStyle"
    />

    <div
      class="absolute select-none"
      :class="nodeZClass"
      :style="elementStyle"
      @pointerdown.stop="onPointerDown"
      @click.stop="onClickNode"
    >
      <!-- Action toolbar -->
      <div
        v-if="isSelected && !isDragging && !isResizing"
        class="absolute -top-7 right-0 z-50 flex items-center gap-1"
      >
        <button
          v-if="dataPathForPreview"
          class="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-100 shadow hover:bg-slate-700"
          :title="dataPathForPreview"
          @pointerdown.stop
          @click.stop="$emit('open-data-preview', dataPathForPreview)"
        >
          Data
        </button>
        <span class="rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-medium text-white shadow-sm">
          {{ component.type }}
        </span>
        <span
          v-if="devMaskTag"
          class="rounded border border-purple-500/50 bg-purple-500/25 px-1.5 py-0.5 text-[9px] font-semibold text-purple-100 shadow-sm"
          title="Input has mask"
        >MASK</span>
        <span
          v-if="devParamsTag"
          class="rounded border border-white/25 bg-white/15 px-1.5 py-0.5 text-[9px] font-semibold text-slate-100 shadow-sm"
          title="Button params mapping"
        >P</span>
        <button
          class="flex h-5 w-5 items-center justify-center rounded bg-red-500 text-[10px] text-white shadow hover:bg-red-600"
          title="Delete component"
          @pointerdown.stop
          @click.stop="store.deleteComponent(component.id)"
        >
          ✕
        </button>
      </div>

      <!-- Resize handles -->
      <template v-if="isSelected && !isDragging">
        <div
          v-for="h in HANDLES"
          :key="h"
          class="absolute z-50 bg-white shadow"
          :class="handleClasses[h]"
          @pointerdown.stop="(e) => onResizeStart(e, h)"
        />
      </template>

      <div class="h-full w-full" :class="{ 'opacity-40': isDragging || isResizing }">
        <NodeBody
          :component="component"
          :is-selected="isSelected"
          :children="childComponents"
          :can-drop="isContainer"
          @select="onClickNode"
          @drop-item="dropIntoContainer"
        >
          <template #children>
            <BuilderNode
              v-for="child in childComponents"
              :key="child.id"
              :component="child"
              :cols="nestedCols"
              :rows="nestedRows"
              @open-data-preview="$emit('open-data-preview', $event)"
            />
          </template>
        </NodeBody>
      </div>
    </div>
  </template>

  <!-- Preview mode -->
  <div v-else class="absolute" :style="elementStyle">
    <NodeBody
      :component="component"
      :is-selected="false"
      :preview="true"
      :children="childComponents"
      :can-drop="false"
    >
      <template #children>
        <BuilderNode
          v-for="child in childComponents"
          :key="child.id"
          :component="child"
          :cols="nestedCols"
          :rows="nestedRows"
          @open-data-preview="$emit('open-data-preview', $event)"
        />
      </template>
    </NodeBody>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { CONTAINER_TYPES, CELL_SIZE } from "../data/componentCatalog";
import { useBuilderStore } from "../stores/builderStore";
import NodeBody from "./NodeBody.vue";

defineOptions({ name: "BuilderNode" });

const store = useBuilderStore();
const previewMode = store.previewMode;

const HANDLES = ["n", "s", "e", "w", "nw", "ne", "sw", "se"];
const handleClasses = {
  n: "left-1/2 -top-1 h-2 w-4 -translate-x-1/2 cursor-n-resize rounded-sm border border-blue-400",
  s: "left-1/2 -bottom-1 h-2 w-4 -translate-x-1/2 cursor-s-resize rounded-sm border border-blue-400",
  e: "-right-1 top-1/2 h-4 w-2 -translate-y-1/2 cursor-e-resize rounded-sm border border-blue-400",
  w: "-left-1 top-1/2 h-4 w-2 -translate-y-1/2 cursor-w-resize rounded-sm border border-blue-400",
  nw: "-left-1 -top-1 h-2.5 w-2.5 cursor-nw-resize rounded-sm border border-blue-400",
  ne: "-right-1 -top-1 h-2.5 w-2.5 cursor-ne-resize rounded-sm border border-blue-400",
  sw: "-left-1 -bottom-1 h-2.5 w-2.5 cursor-sw-resize rounded-sm border border-blue-400",
  se: "-right-1 -bottom-1 h-2.5 w-2.5 cursor-se-resize rounded-sm border border-blue-400"
};

const props = defineProps({
  component: { type: Object, required: true },
  cols: { type: Number, required: true },
  rows: { type: Number, default: 9999 }
});
defineEmits(["open-data-preview"]);

const isDragging = ref(false);
const isResizing = ref(false);
const ghostX = ref(0);
const ghostY = ref(0);
const ghostW = ref(0);
const ghostH = ref(0);

const isSelected = computed(() => store.selectedId.value === props.component.id);
const isContainer = computed(() => CONTAINER_TYPES.has(props.component.type));
const childComponents = computed(() => store.getChildren(props.component.id));
const dataPathForPreview = computed(() => {
  const p = props.component.props || {};
  return p.dataSourcePath || p.valuePath || p.dataPath || "";
});

const devMaskTag = computed(
  () => props.component.type === "text-input" && Boolean(props.component.props?.mask)
);
const devParamsTag = computed(
  () => props.component.type === "action-button" && Boolean(props.component.props?.params)
);

const layout = computed(() => {
  const l = props.component.layout;
  const w = Math.min(props.cols, Math.max(1, l.w));
  const h = Math.max(1, l.h);
  const x = Math.min(Math.max(0, l.x), Math.max(0, props.cols - w));
  const y = Math.max(0, l.y);
  return { x, y, w, h };
});

const xPx = computed(() => layout.value.x * CELL_SIZE);
const yPx = computed(() => layout.value.y * CELL_SIZE);
const wPx = computed(() => layout.value.w * CELL_SIZE);
const hPx = computed(() => layout.value.h * CELL_SIZE);

const nestedCols = computed(() => {
  const contentWidth = wPx.value - 18;
  return Math.max(1, Math.floor(contentWidth / CELL_SIZE));
});

const nestedRows = computed(() => {
  const type = props.component.type;
  // Container has no internal grid header — use full layout height so children reach the dashed drop zone bottom.
  if (type === "container") return Math.max(1, layout.value.h);
  if (type === "accordion") return Math.max(1, layout.value.h - 5);
  return Math.max(1, layout.value.h - 3);
});

const nodeZClass = computed(() => {
  if (isDragging.value || isResizing.value) return "z-40";
  if (isSelected.value) return "z-30";
  if (isContainer.value) return "z-[5]";
  return "z-20";
});

const elementStyle = computed(() => {
  if (isDragging.value || isResizing.value) {
    return {
      left: `${ghostX.value * CELL_SIZE}px`,
      top: `${ghostY.value * CELL_SIZE}px`,
      width: `${ghostW.value * CELL_SIZE}px`,
      height: `${ghostH.value * CELL_SIZE}px`
    };
  }
  return {
    left: `${xPx.value}px`,
    top: `${yPx.value}px`,
    width: `${wPx.value}px`,
    height: `${hPx.value}px`
  };
});

const ghostStyle = computed(() => ({
  left: `${ghostX.value * CELL_SIZE}px`,
  top: `${ghostY.value * CELL_SIZE}px`,
  width: `${ghostW.value * CELL_SIZE}px`,
  height: `${ghostH.value * CELL_SIZE}px`
}));

const ghostOverlaps = computed(() => {
  if (!isDragging.value && !isResizing.value) return false;
  return store.checkOverlap(
    { x: ghostX.value, y: ghostY.value, w: ghostW.value, h: ghostH.value },
    props.component.parentId,
    props.component.id
  );
});

function onClickNode() {
  store.selectComponent(props.component.id);
}

function onPointerDown(e) {
  store.selectComponent(props.component.id);

  const startX = e.clientX;
  const startY = e.clientY;
  const orig = { ...layout.value };
  let moved = false;

  ghostX.value = orig.x;
  ghostY.value = orig.y;
  ghostW.value = orig.w;
  ghostH.value = orig.h;

  function onMove(ev) {
    const dx = ev.clientX - startX;
    const dy = ev.clientY - startY;
    if (!moved && Math.abs(dx) < 4 && Math.abs(dy) < 4) return;
    if (!moved) store.recordBeforeMove();
    moved = true;
    isDragging.value = true;

    const rawX = orig.x * CELL_SIZE + dx;
    const rawY = orig.y * CELL_SIZE + dy;
    ghostX.value = Math.max(0, Math.min(props.cols - orig.w, Math.round(rawX / CELL_SIZE)));
    ghostY.value = Math.max(0, Math.min(props.rows - orig.h, Math.round(rawY / CELL_SIZE)));
    ghostW.value = orig.w;
    ghostH.value = orig.h;
  }

  function onUp() {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    if (moved) {
      store.updateLayout(
        props.component.id,
        { x: ghostX.value, y: ghostY.value, w: ghostW.value, h: ghostH.value },
        props.cols,
        props.rows
      );
    }
    isDragging.value = false;
  }

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
}

function onResizeStart(e, handle) {
  e.preventDefault();
  const startX = e.clientX;
  const startY = e.clientY;
  const orig = { ...layout.value };

  ghostX.value = orig.x;
  ghostY.value = orig.y;
  ghostW.value = orig.w;
  ghostH.value = orig.h;

  const left = handle.includes("w");
  const right = handle.includes("e");
  const top = handle.includes("n");
  const bottom = handle.includes("s");

  let resizeStarted = false;

  function onMove(ev) {
    if (!resizeStarted) {
      store.recordBeforeMove();
      resizeStarted = true;
    }
    isResizing.value = true;
    const dCols = Math.round((ev.clientX - startX) / CELL_SIZE);
    const dRows = Math.round((ev.clientY - startY) / CELL_SIZE);

    let nx = orig.x, ny = orig.y, nw = orig.w, nh = orig.h;
    if (right) nw = orig.w + dCols;
    if (left) { nx = orig.x + dCols; nw = orig.w - dCols; }
    if (bottom) nh = orig.h + dRows;
    if (top) { ny = orig.y + dRows; nh = orig.h - dRows; }

    nw = Math.max(1, nw);
    nh = Math.max(1, nh);
    nx = Math.max(0, nx);
    ny = Math.max(0, ny);
    if (nx + nw > props.cols) nw = props.cols - nx;
    if (ny + nh > props.rows) nh = props.rows - ny;

    ghostX.value = nx;
    ghostY.value = ny;
    ghostW.value = nw;
    ghostH.value = nh;
  }

  function onUp() {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    if (isResizing.value) {
      store.updateLayout(
        props.component.id,
        { x: ghostX.value, y: ghostY.value, w: ghostW.value, h: ghostH.value },
        props.cols,
        props.rows
      );
    }
    isResizing.value = false;
  }

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
}

function dropIntoContainer(event) {
  if (!isContainer.value || previewMode.value) return;
  const payload = event.dataTransfer?.getData("application/no-code-item");
  if (!payload) return;
  const { type } = JSON.parse(payload);
  const rect = event.currentTarget.getBoundingClientRect();
  const rawX = (event.clientX - rect.left) / CELL_SIZE;
  const rawY = (event.clientY - rect.top) / CELL_SIZE;
  store.addComponent(type, props.component.id, rawX, rawY, nestedCols.value);
}
</script>
