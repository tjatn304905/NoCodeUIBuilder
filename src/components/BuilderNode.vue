<template>
  <template v-if="!preview">
    <!-- Ghost preview: dashed outline at snapped target during drag/resize -->
    <div
      v-if="isDragging || isResizing"
      class="pointer-events-none absolute z-10 rounded-lg border-2 border-dashed border-blue-400 bg-blue-100/30"
      :style="ghostStyle"
    />

    <!-- The element itself -->
    <div
      class="absolute z-20 select-none"
      :class="{
        'z-30': isSelected,
        'z-40': isDragging || isResizing
      }"
      :style="elementStyle"
      @pointerdown.stop="onPointerDown"
    >
      <!-- Action toolbar (visible when selected, not during drag) -->
      <div
        v-if="isSelected && !isDragging && !isResizing"
        class="absolute -top-7 right-0 z-50 flex items-center gap-1"
      >
        <span class="rounded bg-blue-600 px-1.5 py-0.5 text-[10px] font-medium text-white">
          {{ component.type }}
        </span>
        <button
          class="flex h-5 w-5 items-center justify-center rounded bg-red-500 text-[10px] text-white shadow hover:bg-red-600"
          title="Delete component"
          @click.stop="onDelete"
        >
          ✕
        </button>
      </div>

      <!-- Resize handles (visible when selected) -->
      <template v-if="isSelected">
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
          :preview="preview"
          :children="children"
          :can-drop="isContainer"
          @select="select"
          @drop-item="dropIntoContainer"
        >
          <template #children>
            <BuilderNode
              v-for="child in children"
              :key="child.id"
              :component="child"
              :children="getChildren(child.id)"
              :col-width="nestedColWidth"
              :cols="cols"
              :row-height="rowHeight"
              :selected-id="selectedId"
              :preview="preview"
              :get-children="getChildren"
              :on-select="onSelect"
              :on-update-layout="onUpdateLayout"
              :on-drop-new="onDropNew"
              :on-delete="onDelete_"
            />
          </template>
        </NodeBody>
      </div>
    </div>
  </template>

  <!-- Preview mode: static absolute positioning -->
  <div
    v-else
    class="absolute"
    :style="elementStyle"
  >
    <NodeBody
      :component="component"
      :is-selected="false"
      :preview="preview"
      :children="children"
      :can-drop="isContainer"
    >
      <template #children>
        <BuilderNode
          v-for="child in children"
          :key="child.id"
          :component="child"
          :children="getChildren(child.id)"
          :col-width="nestedColWidth"
          :cols="cols"
          :row-height="rowHeight"
          :selected-id="null"
          :preview="preview"
          :get-children="getChildren"
          :on-select="onSelect"
          :on-update-layout="onUpdateLayout"
          :on-drop-new="onDropNew"
          :on-delete="onDelete_"
        />
      </template>
    </NodeBody>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { CONTAINER_TYPES } from "../data/componentCatalog";
import NodeBody from "./NodeBody.vue";

defineOptions({ name: "BuilderNode" });

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
  children: { type: Array, required: true },
  colWidth: { type: Number, required: true },
  cols: { type: Number, required: true },
  rowHeight: { type: Number, required: true },
  selectedId: { type: String, default: null },
  preview: { type: Boolean, default: false },
  getChildren: { type: Function, required: true },
  onSelect: { type: Function, required: true },
  onUpdateLayout: { type: Function, required: true },
  onDropNew: { type: Function, required: true },
  onDelete: { type: Function, required: true }
});

const isDragging = ref(false);
const isResizing = ref(false);
const ghostX = ref(0);
const ghostY = ref(0);
const ghostW = ref(0);
const ghostH = ref(0);

const isSelected = computed(() => props.selectedId === props.component.id);
const isContainer = computed(() => CONTAINER_TYPES.has(props.component.type));

const layout = computed(() => {
  const l = props.component.layout;
  const w = Math.min(props.cols, Math.max(1, l.w));
  const h = Math.max(1, l.h);
  const x = Math.min(Math.max(0, l.x), Math.max(0, props.cols - w));
  const y = Math.max(0, l.y);
  return { x, y, w, h };
});

const xPx = computed(() => layout.value.x * props.colWidth);
const yPx = computed(() => layout.value.y * props.rowHeight);
const wPx = computed(() => layout.value.w * props.colWidth);
const hPx = computed(() => layout.value.h * props.rowHeight);

const elementStyle = computed(() => {
  if (isDragging.value || isResizing.value) {
    return {
      left: `${ghostX.value * props.colWidth}px`,
      top: `${ghostY.value * props.rowHeight}px`,
      width: `${ghostW.value * props.colWidth}px`,
      height: `${ghostH.value * props.rowHeight}px`
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
  left: `${ghostX.value * props.colWidth}px`,
  top: `${ghostY.value * props.rowHeight}px`,
  width: `${ghostW.value * props.colWidth}px`,
  height: `${ghostH.value * props.rowHeight}px`
}));

const nestedColWidth = computed(() => {
  const width = wPx.value - 16;
  return Math.max(12, Math.floor(width / props.cols));
});

function select() {
  props.onSelect(props.component.id);
}

function onDelete_() {
  props.onDelete(props.component.id);
}

function onPointerDown(e) {
  if (props.preview) return;
  select();

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
    moved = true;
    isDragging.value = true;

    const rawX = orig.x * props.colWidth + dx;
    const rawY = orig.y * props.rowHeight + dy;
    ghostX.value = Math.max(0, Math.min(props.cols - orig.w, Math.round(rawX / props.colWidth)));
    ghostY.value = Math.max(0, Math.round(rawY / props.rowHeight));
    ghostW.value = orig.w;
    ghostH.value = orig.h;
  }

  function onUp() {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    if (moved) {
      props.onUpdateLayout(props.component.id, {
        x: ghostX.value,
        y: ghostY.value,
        w: ghostW.value,
        h: ghostH.value
      });
    }
    isDragging.value = false;
  }

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
}

function onResizeStart(e, handle) {
  if (props.preview) return;
  e.preventDefault();

  const startX = e.clientX;
  const startY = e.clientY;
  const orig = { ...layout.value };

  ghostX.value = orig.x;
  ghostY.value = orig.y;
  ghostW.value = orig.w;
  ghostH.value = orig.h;

  const affectsLeft = handle.includes("w");
  const affectsRight = handle.includes("e") || handle === "e";
  const affectsTop = handle.includes("n");
  const affectsBottom = handle.includes("s") || handle === "s";

  function onMove(ev) {
    isResizing.value = true;
    const dx = ev.clientX - startX;
    const dy = ev.clientY - startY;
    const dCols = Math.round(dx / props.colWidth);
    const dRows = Math.round(dy / props.rowHeight);

    let nx = orig.x;
    let ny = orig.y;
    let nw = orig.w;
    let nh = orig.h;

    if (affectsRight) nw = orig.w + dCols;
    if (affectsLeft) { nx = orig.x + dCols; nw = orig.w - dCols; }
    if (affectsBottom) nh = orig.h + dRows;
    if (affectsTop) { ny = orig.y + dRows; nh = orig.h - dRows; }

    nw = Math.max(1, nw);
    nh = Math.max(1, nh);
    nx = Math.max(0, nx);
    ny = Math.max(0, ny);
    if (nx + nw > props.cols) nw = props.cols - nx;

    ghostX.value = nx;
    ghostY.value = ny;
    ghostW.value = nw;
    ghostH.value = nh;
  }

  function onUp() {
    window.removeEventListener("pointermove", onMove);
    window.removeEventListener("pointerup", onUp);
    if (isResizing.value) {
      props.onUpdateLayout(props.component.id, {
        x: ghostX.value,
        y: ghostY.value,
        w: ghostW.value,
        h: ghostH.value
      });
    }
    isResizing.value = false;
  }

  window.addEventListener("pointermove", onMove);
  window.addEventListener("pointerup", onUp);
}

function dropIntoContainer(event) {
  if (!isContainer.value) return;
  props.onDropNew(event, props.component.id, nestedColWidth.value, props.rowHeight, props.cols);
}
</script>
