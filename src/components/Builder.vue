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
                class="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs transition-colors hover:border-blue-300 hover:bg-blue-50"
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
            <p class="text-xs text-slate-500">{{ COLS }}-col · {{ CELL_SIZE }}px square grid</p>
          </div>
          <div class="flex items-center gap-2">
            <button
              class="rounded-md border px-3 py-1.5 text-xs transition-colors"
              :class="previewMode ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-300 hover:bg-slate-50'"
              @click="previewMode = !previewMode"
            >
              {{ previewMode ? "Exit Preview" : "Preview" }}
            </button>
            <button class="rounded-md bg-slate-900 px-3 py-1.5 text-xs text-white hover:bg-slate-800" @click="showExport = true">
              JSON Export
            </button>
          </div>
        </header>

        <div class="flex-1 overflow-auto bg-slate-50 p-4" @click="deselectAll()">
          <div class="mx-auto" :style="{ width: `${CANVAS_WIDTH}px` }">
            <div
              class="relative rounded-xl border border-slate-300 bg-white"
              :class="previewMode ? '' : 'canvas-grid'"
              style="min-height: 768px"
              @click.stop="deselectAll()"
              @dragover.prevent
              @drop.prevent="onCanvasDrop"
            >
              <BuilderNode
                v-for="comp in rootComponents"
                :key="comp.id"
                :component="comp"
                :cols="COLS"
              />
            </div>
          </div>
        </div>
      </main>

      <!-- Property Editor -->
      <aside class="enterprise-panel flex flex-col overflow-hidden">
        <div class="border-b border-slate-200 p-4">
          <h2 class="text-sm font-semibold">Property Editor</h2>
          <p class="mt-1 text-xs text-slate-500">
            {{ selectedComponent ? typeLabel(selectedComponent.type) : 'Select a component to edit.' }}
          </p>
        </div>
        <div class="h-[calc(100%-73px)] overflow-y-auto p-4">
          <div v-if="selectedComponent" :key="selectedComponent.id">
            <div class="mb-3 flex items-center justify-between rounded-md bg-slate-100 px-2 py-1.5">
              <span class="text-xs font-medium text-slate-700">{{ typeLabel(selectedComponent.type) }}</span>
              <button
                class="rounded px-1.5 py-0.5 text-[10px] text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
                @click="deleteComponent(selectedComponent.id)"
              >
                Delete
              </button>
            </div>

            <div class="space-y-3">
              <FieldText label="Field ID" :model-value="selectedComponent.props.fieldId" @update:model-value="(v) => p('fieldId', v)" />
              <FieldText label="Label" :model-value="selectedComponent.props.label" @update:model-value="(v) => p('label', v)" />
              <FieldSelect label="Alignment" :model-value="selectedComponent.props.alignment" :options="['left','center','right']" @update:model-value="(v) => p('alignment', v)" />

              <div class="rounded-md bg-slate-50 p-2">
                <p class="mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">Grid Position</p>
                <div class="grid grid-cols-4 gap-1 text-[11px] text-slate-600">
                  <span>X: {{ selectedComponent.layout.x }}</span>
                  <span>Y: {{ selectedComponent.layout.y }}</span>
                  <span>W: {{ selectedComponent.layout.w }}</span>
                  <span>H: {{ selectedComponent.layout.h }}</span>
                </div>
              </div>

              <!-- Section Box -->
              <template v-if="selectedComponent.type === 'section-box'">
                <FieldText label="Section Title" :model-value="selectedComponent.props.title" @update:model-value="(v) => p('title', v)" />
                <FieldSelect label="Icon" :model-value="selectedComponent.props.icon" :options="['folder','user','settings','star','list','chart']" @update:model-value="(v) => p('icon', v)" />
              </template>

              <!-- Text Input -->
              <template v-if="selectedComponent.type === 'text-input'">
                <FieldText label="Placeholder" :model-value="selectedComponent.props.placeholder" @update:model-value="(v) => p('placeholder', v)" />
                <FieldSelect label="Input Type" :model-value="selectedComponent.props.inputType" :options="['text','number','email','tel','password']" @update:model-value="(v) => p('inputType', v)" />
                <FieldNumber label="Max Length" :model-value="selectedComponent.props.maxLength" @update:model-value="(v) => p('maxLength', v)" />
              </template>

              <!-- Combo / Radio -->
              <template v-if="selectedComponent.type === 'combo-box' || selectedComponent.type === 'radio-group'">
                <FieldText label="Options (comma-separated)" :model-value="selectedComponent.props.options" @update:model-value="(v) => p('options', v)" />
              </template>

              <!-- Data Fact -->
              <template v-if="selectedComponent.type === 'data-fact'">
                <FieldText label="Value" :model-value="selectedComponent.props.value" @update:model-value="(v) => p('value', v)" />
                <FieldSelect label="Display" :model-value="selectedComponent.props.displayMode" :options="['side-by-side','stacked']" @update:model-value="(v) => p('displayMode', v)" />
              </template>

              <!-- Status Badge -->
              <template v-if="selectedComponent.type === 'status-badge'">
                <FieldText label="Status Text" :model-value="selectedComponent.props.status" @update:model-value="(v) => p('status', v)" />
                <FieldSelect label="Tone" :model-value="selectedComponent.props.tone" :options="['default','success','warning','error']" @update:model-value="(v) => p('tone', v)" />
              </template>

              <!-- Buttons -->
              <template v-if="selectedComponent.type === 'primary-button' || selectedComponent.type === 'secondary-button'">
                <FieldText label="Button Text" :model-value="selectedComponent.props.text" @update:model-value="(v) => p('text', v)" />
                <FieldSelect label="Action Type" :model-value="selectedComponent.props.actionType" :options="['submit','navigate','api-call','open-modal']" @update:model-value="(v) => p('actionType', v)" />
              </template>

              <!-- Data Grid -->
              <template v-if="selectedComponent.type === 'data-grid'">
                <FieldText label="Data Source Path" :model-value="selectedComponent.props.dataSourcePath" @update:model-value="(v) => p('dataSourcePath', v)" />
                <FieldText label="Columns (Header:field, ...)" :model-value="selectedComponent.props.columns" @update:model-value="(v) => p('columns', v)" />
                <FieldSelect label="Selection Mode" :model-value="selectedComponent.props.selectionMode" :options="['none','single','multiple']" @update:model-value="(v) => p('selectionMode', v)" />
                <div class="rounded-md border border-slate-200 p-2">
                  <p class="mb-2 text-[10px] font-medium uppercase tracking-wide text-slate-500">Feature Toggles</p>
                  <div class="space-y-2">
                    <FieldCheck label="Read Only" :model-value="selectedComponent.props.isReadOnly" @update:model-value="(v) => p('isReadOnly', v)" />
                    <FieldCheck label="Editable" :model-value="selectedComponent.props.isEditable" @update:model-value="(v) => p('isEditable', v)" />
                    <FieldCheck label="Allow Add Row" :model-value="selectedComponent.props.allowAddRow" @update:model-value="(v) => p('allowAddRow', v)" />
                    <FieldCheck label="Allow Delete Row" :model-value="selectedComponent.props.allowDeleteRow" @update:model-value="(v) => p('allowDeleteRow', v)" />
                  </div>
                </div>
                <div class="rounded-md border border-slate-200 p-2">
                  <p class="mb-2 text-[10px] font-medium uppercase tracking-wide text-slate-500">Pagination</p>
                  <div class="space-y-2">
                    <FieldCheck label="Enable Pagination" :model-value="selectedComponent.props.pagination" @update:model-value="(v) => p('pagination', v)" />
                    <FieldNumber label="Page Size" :model-value="selectedComponent.props.pageSize" @update:model-value="(v) => p('pageSize', v)" />
                  </div>
                </div>
              </template>

              <!-- Card List Repeater -->
              <template v-if="selectedComponent.type === 'card-list-repeater'">
                <FieldText label="Data Source Path" :model-value="selectedComponent.props.dataSourcePath" @update:model-value="(v) => p('dataSourcePath', v)" />
                <FieldText label="Card Title" :model-value="selectedComponent.props.cardTitle" @update:model-value="(v) => p('cardTitle', v)" />
                <FieldText label="Card Badge" :model-value="selectedComponent.props.cardBadge" @update:model-value="(v) => p('cardBadge', v)" />
                <FieldText label="Card Price" :model-value="selectedComponent.props.cardPrice" @update:model-value="(v) => p('cardPrice', v)" />
                <FieldText label="Price Unit" :model-value="selectedComponent.props.cardPriceUnit" @update:model-value="(v) => p('cardPriceUnit', v)" />
                <FieldText label="Description" :model-value="selectedComponent.props.cardDescription" @update:model-value="(v) => p('cardDescription', v)" />
                <FieldText label="Facts (Key: Val, ...)" :model-value="selectedComponent.props.cardFacts" @update:model-value="(v) => p('cardFacts', v)" />
                <FieldText label="Button Text" :model-value="selectedComponent.props.cardButtonText" @update:model-value="(v) => p('cardButtonText', v)" />
                <FieldSelect label="Accent Color" :model-value="selectedComponent.props.accentColor" :options="['blue','green','purple','red','amber']" @update:model-value="(v) => p('accentColor', v)" />
              </template>

              <!-- Address Picker -->
              <template v-if="selectedComponent.type === 'address-picker'">
                <FieldText label="Button Label" :model-value="selectedComponent.props.buttonLabel" @update:model-value="(v) => p('buttonLabel', v)" />
              </template>
            </div>
          </div>
          <div v-else class="flex h-full items-center justify-center">
            <p class="text-center text-sm text-slate-400">Click a component on the canvas<br />to edit its properties.</p>
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
import { computed, ref, h } from "vue";
import BuilderNode from "./BuilderNode.vue";
import { COMPONENT_CATALOG, COLS, CANVAS_WIDTH, CELL_SIZE } from "../data/componentCatalog";
import { useBuilderStore } from "../stores/builderStore";

const store = useBuilderStore();
const {
  state,
  selectedId,
  previewMode,
  selectedComponent,
  rootComponents,
  deselectAll,
  deleteComponent,
  addComponent,
  updateProp,
  typeLabel
} = store;

const showExport = ref(false);
const jsonExport = computed(() => JSON.stringify(state, null, 2));

function p(key, value) {
  updateProp(key, value);
}

function onPaletteDragStart(event, type) {
  event.dataTransfer?.setData("application/no-code-item", JSON.stringify({ type }));
}

function onCanvasDrop(event) {
  const payload = event.dataTransfer?.getData("application/no-code-item");
  if (!payload) return;
  const { type } = JSON.parse(payload);
  const rect = event.currentTarget.getBoundingClientRect();
  const rawX = (event.clientX - rect.left) / CELL_SIZE;
  const rawY = (event.clientY - rect.top) / CELL_SIZE;
  addComponent(type, null, rawX, rawY, COLS);
}

const inputClass = "h-8 w-full rounded-md border border-slate-300 px-2 text-xs focus:border-blue-400 focus:outline-none";

const FieldText = {
  props: { label: String, modelValue: [String, Number] },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    return () =>
      h("label", { class: "block text-xs text-slate-600" }, [
        h("span", { class: "mb-1 block font-medium" }, props.label),
        h("input", {
          class: inputClass,
          value: props.modelValue ?? "",
          onInput: (e) => emit("update:modelValue", e.target.value)
        })
      ]);
  }
};

const FieldNumber = {
  props: { label: String, modelValue: [String, Number] },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    return () =>
      h("label", { class: "block text-xs text-slate-600" }, [
        h("span", { class: "mb-1 block font-medium" }, props.label),
        h("input", {
          type: "number",
          class: inputClass,
          value: props.modelValue ?? 0,
          onInput: (e) => emit("update:modelValue", Number(e.target.value))
        })
      ]);
  }
};

const FieldSelect = {
  props: { label: String, modelValue: String, options: Array },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    return () =>
      h("label", { class: "block text-xs text-slate-600" }, [
        h("span", { class: "mb-1 block font-medium" }, props.label),
        h(
          "select",
          {
            class: inputClass,
            value: props.modelValue,
            onChange: (e) => emit("update:modelValue", e.target.value)
          },
          (props.options || []).map((o) =>
            h("option", { key: o, value: o }, o)
          )
        )
      ]);
  }
};

const FieldCheck = {
  props: { label: String, modelValue: Boolean },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    return () =>
      h("label", { class: "flex cursor-pointer items-center gap-2 text-xs text-slate-600" }, [
        h("input", {
          type: "checkbox",
          class: "accent-blue-600",
          checked: props.modelValue,
          onChange: (e) => emit("update:modelValue", e.target.checked)
        }),
        h("span", { class: "font-medium" }, props.label)
      ]);
  }
};
</script>

<style scoped>
.canvas-grid {
  background-color: #ffffff;
  background-image:
    linear-gradient(to right, rgba(148, 163, 184, 0.12) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(148, 163, 184, 0.12) 1px, transparent 1px);
  background-size: 20px 20px;
}
</style>
