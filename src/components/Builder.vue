<template>
  <div class="h-screen overflow-hidden p-4">
    <div class="grid h-full grid-cols-[280px_1fr_320px] gap-4">
      <!-- Component Palette -->
      <aside class="enterprise-panel overflow-hidden">
        <div class="border-b border-slate-200 p-4">
          <h2 class="text-sm font-semibold">Component Palette</h2>
          <p class="mt-1 text-xs text-slate-500">Drag components onto the canvas.</p>
        </div>
        <div class="h-[calc(100%-73px)] overflow-y-auto p-3">
          <div v-for="group in COMPONENT_CATALOG" :key="group.group" class="mb-4">
            <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">{{ group.group }}</p>
            <div class="space-y-2">
              <button
                v-for="item in group.items"
                :key="item.type"
                draggable="true"
                class="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs hover:border-blue-300 hover:bg-blue-50 transition-colors"
                @dragstart="onPaletteDragStart($event, item.type)"
              >
                <span>{{ item.label }}</span>
                <span class="text-slate-400">+</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      <!-- Canvas -->
      <main class="enterprise-panel flex flex-col overflow-hidden">
        <header class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <div>
            <h1 class="text-base font-semibold">{{ state.screenName }}</h1>
            <p class="text-xs text-slate-500">{{ COLS }}-column grid · {{ COL_WIDTH }}×{{ ROW_HEIGHT }}px cells</p>
          </div>
          <div class="flex items-center gap-2">
            <button
              class="rounded-md border px-3 py-1.5 text-xs transition-colors"
              :class="previewMode ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-300 hover:bg-slate-50'"
              @click="previewMode = !previewMode"
            >
              {{ previewMode ? "Exit Preview" : "Preview" }}
            </button>
            <button
              class="rounded-md bg-slate-900 px-3 py-1.5 text-xs text-white hover:bg-slate-800"
              @click="showExport = true"
            >
              JSON Export
            </button>
          </div>
        </header>

        <div class="flex-1 overflow-auto p-4" @click="selectedId = null">
          <div class="mx-auto" :style="{ width: `${CANVAS_WIDTH}px` }">
            <div
              class="relative rounded-xl border border-slate-300 bg-white"
              :class="previewMode ? '' : 'bg-grid-pattern'"
              :style="gridBackgroundStyle"
              style="min-height: 768px"
              @dragover.prevent
              @drop.prevent="(e) => onDropNew(e, null, COL_WIDTH, ROW_HEIGHT, COLS)"
            >
              <BuilderNode
                v-for="comp in rootComponents"
                :key="comp.id"
                :component="comp"
                :children="getChildren(comp.id)"
                :col-width="COL_WIDTH"
                :cols="COLS"
                :row-height="ROW_HEIGHT"
                :selected-id="selectedId"
                :preview="previewMode"
                :get-children="getChildren"
                :on-select="selectComponent"
                :on-update-layout="updateLayout"
                :on-drop-new="onDropNew"
                :on-delete="deleteComponent"
              />
            </div>
          </div>
        </div>
      </main>

      <!-- Property Editor -->
      <aside class="enterprise-panel flex flex-col overflow-hidden">
        <div class="border-b border-slate-200 p-4">
          <h2 class="text-sm font-semibold">Property Editor</h2>
          <p class="mt-1 text-xs text-slate-500">Select a component to edit.</p>
        </div>
        <div class="h-[calc(100%-73px)] overflow-y-auto p-4">
          <template v-if="selectedComponent">
            <div class="mb-3 flex items-center justify-between rounded-md bg-slate-100 px-2 py-1.5">
              <span class="text-xs font-medium text-slate-700">{{ typeLabel(selectedComponent.type) }}</span>
              <button
                class="text-[10px] text-red-500 hover:text-red-700"
                @click="deleteComponent(selectedComponent.id)"
              >
                Delete
              </button>
            </div>

            <div class="space-y-3">
              <!-- Common props -->
              <FieldText label="Field ID (API Key)" :model-value="selectedComponent.props.fieldId" @update:model-value="(v) => updateProp('fieldId', v)" />
              <FieldText label="Label" :model-value="selectedComponent.props.label" @update:model-value="(v) => updateProp('label', v)" />
              <FieldSelect
                label="Alignment"
                :model-value="selectedComponent.props.alignment"
                :options="['left', 'center', 'right']"
                @update:model-value="(v) => updateProp('alignment', v)"
              />

              <!-- Layout (read-only display) -->
              <div class="rounded-md bg-slate-50 p-2">
                <p class="mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">Position & Size</p>
                <div class="grid grid-cols-4 gap-1 text-[11px] text-slate-600">
                  <span>X: {{ selectedComponent.layout.x }}</span>
                  <span>Y: {{ selectedComponent.layout.y }}</span>
                  <span>W: {{ selectedComponent.layout.w }}</span>
                  <span>H: {{ selectedComponent.layout.h }}</span>
                </div>
              </div>

              <!-- Section Box props -->
              <template v-if="selectedComponent.type === 'section-box'">
                <FieldText label="Section Title" :model-value="selectedComponent.props.title" @update:model-value="(v) => updateProp('title', v)" />
                <FieldSelect
                  label="Icon"
                  :model-value="selectedComponent.props.icon"
                  :options="['folder', 'user', 'settings', 'star', 'list', 'chart']"
                  @update:model-value="(v) => updateProp('icon', v)"
                />
              </template>

              <!-- Text Input props -->
              <template v-if="selectedComponent.type === 'text-input'">
                <FieldText label="Placeholder" :model-value="selectedComponent.props.placeholder" @update:model-value="(v) => updateProp('placeholder', v)" />
                <FieldSelect
                  label="Input Type"
                  :model-value="selectedComponent.props.inputType"
                  :options="['text', 'number', 'email', 'tel', 'password']"
                  @update:model-value="(v) => updateProp('inputType', v)"
                />
                <FieldNumber label="Max Length" :model-value="selectedComponent.props.maxLength" @update:model-value="(v) => updateProp('maxLength', v)" />
              </template>

              <!-- Combo Box / Radio props -->
              <template v-if="selectedComponent.type === 'combo-box' || selectedComponent.type === 'radio-group'">
                <FieldText label="Options (comma-separated)" :model-value="selectedComponent.props.options" @update:model-value="(v) => updateProp('options', v)" />
              </template>

              <!-- Data Fact props -->
              <template v-if="selectedComponent.type === 'data-fact'">
                <FieldText label="Value" :model-value="selectedComponent.props.value" @update:model-value="(v) => updateProp('value', v)" />
                <FieldSelect
                  label="Display Mode"
                  :model-value="selectedComponent.props.displayMode"
                  :options="['side-by-side', 'stacked']"
                  @update:model-value="(v) => updateProp('displayMode', v)"
                />
              </template>

              <!-- Status Badge props -->
              <template v-if="selectedComponent.type === 'status-badge'">
                <FieldText label="Status Text" :model-value="selectedComponent.props.status" @update:model-value="(v) => updateProp('status', v)" />
                <FieldSelect
                  label="Tone"
                  :model-value="selectedComponent.props.tone"
                  :options="['default', 'success', 'warning', 'error']"
                  @update:model-value="(v) => updateProp('tone', v)"
                />
              </template>

              <!-- Button props -->
              <template v-if="selectedComponent.type === 'primary-button' || selectedComponent.type === 'secondary-button'">
                <FieldText label="Button Text" :model-value="selectedComponent.props.text" @update:model-value="(v) => updateProp('text', v)" />
                <FieldSelect
                  label="Action Type"
                  :model-value="selectedComponent.props.actionType"
                  :options="['submit', 'navigate', 'api-call', 'open-modal']"
                  @update:model-value="(v) => updateProp('actionType', v)"
                />
              </template>

              <!-- Card List Repeater props -->
              <template v-if="selectedComponent.type === 'card-list-repeater'">
                <FieldText label="Data Source Path" :model-value="selectedComponent.props.dataSourcePath" @update:model-value="(v) => updateProp('dataSourcePath', v)" />
              </template>

              <!-- Address Picker props -->
              <template v-if="selectedComponent.type === 'address-picker'">
                <FieldText label="Button Label" :model-value="selectedComponent.props.buttonLabel" @update:model-value="(v) => updateProp('buttonLabel', v)" />
              </template>
            </div>
          </template>
          <div v-else class="flex h-full items-center justify-center">
            <p class="text-center text-sm text-slate-400">Click a component on the canvas<br>to edit its properties.</p>
          </div>
        </div>
      </aside>
    </div>

    <!-- JSON Export Modal -->
    <div v-if="showExport" class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4" @click.self="showExport = false">
      <div class="enterprise-panel w-full max-w-4xl overflow-hidden">
        <div class="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h3 class="text-sm font-semibold">Builder JSON Export</h3>
          <button class="rounded border border-slate-300 px-2 py-1 text-xs hover:bg-slate-50" @click="showExport = false">Close</button>
        </div>
        <pre class="max-h-[70vh] overflow-auto bg-slate-950 p-4 text-xs text-emerald-300">{{ jsonExport }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref } from "vue";
import BuilderNode from "./BuilderNode.vue";
import { COMPONENT_CATALOG, COLS, CANVAS_WIDTH, COL_WIDTH, ROW_HEIGHT } from "../data/componentCatalog";

const previewMode = ref(false);
const showExport = ref(false);
const selectedId = ref(null);
let uid = 1;

const state = reactive({
  screenName: "Telecom Customer Lookup",
  components: [
    seed("section-box", null, { x: 0, y: 0, w: 16, h: 8 }, { title: "Customer Profile", icon: "user" }),
    seed("text-input", null, { x: 0, y: 9, w: 4, h: 2 }, { label: "Customer ID", fieldId: "customer_id" }),
    seed("primary-button", null, { x: 12, y: 9, w: 4, h: 2 }, { text: "Lookup", actionType: "api-call" })
  ]
});

const gridBackgroundStyle = computed(() => {
  if (previewMode.value) return {};
  return { backgroundSize: `${COL_WIDTH}px ${ROW_HEIGHT}px` };
});

const rootComponents = computed(() => state.components.filter((c) => c.parentId === null));
const selectedComponent = computed(() => state.components.find((c) => c.id === selectedId.value) ?? null);
const jsonExport = computed(() => JSON.stringify(state, null, 2));

function seed(type, parentId, layout, props = {}) {
  return {
    id: `cmp_${uid++}`,
    type,
    parentId,
    layout: { x: layout.x, y: layout.y, w: layout.w, h: layout.h },
    props: {
      fieldId: `${type.replaceAll("-", "_")}_${uid}`,
      label: labelFromType(type),
      alignment: "left",
      ...props
    }
  };
}

function getChildren(parentId) {
  return state.components.filter((c) => c.parentId === parentId);
}

function selectComponent(id) {
  selectedId.value = id;
}

function deleteComponent(id) {
  const idsToRemove = new Set();
  function collectDescendants(parentId) {
    idsToRemove.add(parentId);
    state.components
      .filter((c) => c.parentId === parentId)
      .forEach((c) => collectDescendants(c.id));
  }
  collectDescendants(id);
  state.components = state.components.filter((c) => !idsToRemove.has(c.id));
  if (idsToRemove.has(selectedId.value)) {
    selectedId.value = null;
  }
}

function onPaletteDragStart(event, type) {
  event.dataTransfer?.setData("application/no-code-item", JSON.stringify({ type }));
}

function onDropNew(event, parentId, targetColWidth, targetRowHeight, targetCols) {
  const payload = event.dataTransfer?.getData("application/no-code-item");
  if (!payload) return;
  const parsed = JSON.parse(payload);
  const descriptor = findDescriptor(parsed.type);
  if (!descriptor) return;

  const rect = event.currentTarget.getBoundingClientRect();
  const defW = Math.min(targetCols, descriptor.defaultSize.w);
  const defH = descriptor.defaultSize.h;

  const rawX = (event.clientX - rect.left) / targetColWidth;
  const rawY = (event.clientY - rect.top) / targetRowHeight;
  const x = Math.max(0, Math.min(targetCols - defW, Math.round(rawX)));
  const y = Math.max(0, Math.round(rawY));

  const next = {
    id: `cmp_${uid++}`,
    type: descriptor.type,
    parentId,
    layout: { x, y, w: defW, h: defH },
    props: {
      fieldId: `${descriptor.type.replaceAll("-", "_")}_${uid}`,
      label: descriptor.label,
      alignment: "left",
      ...descriptor.defaultProps
    }
  };
  state.components.push(next);
  selectedId.value = next.id;
}

function updateLayout(componentId, patch) {
  const target = state.components.find((c) => c.id === componentId);
  if (!target) return;
  target.layout = { ...target.layout, ...patch };
}

function updateProp(key, value) {
  if (!selectedComponent.value) return;
  selectedComponent.value.props[key] = value;
}

function findDescriptor(type) {
  for (const group of COMPONENT_CATALOG) {
    const found = group.items.find((item) => item.type === type);
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

const FieldText = {
  props: {
    label: { type: String, required: true },
    modelValue: { type: [String, Number], default: "" }
  },
  emits: ["update:modelValue"],
  template: `
    <label class="block text-xs text-slate-600">
      <span class="mb-1 block font-medium">{{ label }}</span>
      <input
        class="h-8 w-full rounded-md border border-slate-300 px-2 text-xs focus:border-blue-400 focus:outline-none"
        :value="modelValue ?? ''"
        @input="$emit('update:modelValue', $event.target.value)"
      />
    </label>
  `
};

const FieldNumber = {
  props: {
    label: { type: String, required: true },
    modelValue: { type: [String, Number], default: 0 }
  },
  emits: ["update:modelValue"],
  template: `
    <label class="block text-xs text-slate-600">
      <span class="mb-1 block font-medium">{{ label }}</span>
      <input
        type="number"
        class="h-8 w-full rounded-md border border-slate-300 px-2 text-xs focus:border-blue-400 focus:outline-none"
        :value="modelValue ?? 0"
        @input="$emit('update:modelValue', Number($event.target.value))"
      />
    </label>
  `
};

const FieldSelect = {
  props: {
    label: { type: String, required: true },
    modelValue: { type: String, default: "" },
    options: { type: Array, default: () => [] }
  },
  emits: ["update:modelValue"],
  template: `
    <label class="block text-xs text-slate-600">
      <span class="mb-1 block font-medium">{{ label }}</span>
      <select
        class="h-8 w-full rounded-md border border-slate-300 px-2 text-xs focus:border-blue-400 focus:outline-none"
        :value="modelValue"
        @change="$emit('update:modelValue', $event.target.value)"
      >
        <option v-for="option in options" :key="option" :value="option">{{ option }}</option>
      </select>
    </label>
  `
};
</script>

<style scoped>
.bg-grid-pattern {
  background-color: #ffffff;
  background-image:
    linear-gradient(to right, rgba(148, 163, 184, 0.15) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(148, 163, 184, 0.15) 1px, transparent 1px);
}
</style>
