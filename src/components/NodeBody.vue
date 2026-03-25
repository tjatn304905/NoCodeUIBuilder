<template>
  <div
    v-show="!isLogicHidden"
    class="h-full w-full overflow-hidden rounded-lg"
    :class="[
      rootSurfaceClass,
      showSelectionRing ? 'border-blue-500 ring-2 ring-blue-400/30' : '',
      component.type === 'container' ? '!p-0' : 'p-2',
      cellAlignWrapperClass
    ]"
    :style="componentBgStyle"
    @click.stop="$emit('select')"
  >
    <!-- Container (Section) — supports nested containers -->
    <template v-if="component.type === 'container'">
      <div class="flex h-full min-h-0 flex-col overflow-hidden rounded-md" :style="containerFrameStyle">
        <div
          class="relative min-h-0 flex-1 overflow-hidden rounded"
          :class="preview ? 'border-transparent bg-transparent' : 'border-2 border-dashed border-slate-500/50 bg-transparent'"
          @dragover.prevent
          @drop.stop.prevent="$emit('drop-item', $event)"
        >
          <p v-if="!children.length" class="pointer-events-none absolute inset-0 flex items-center justify-center px-2 text-center text-[10px] text-slate-500">
            Drop components here (containers can nest)
          </p>
          <slot name="children" />
        </div>
      </div>
    </template>

    <!-- Universal Label: H-align → justify-*, V-align → items-* (flex row) -->
    <template v-else-if="component.type === 'label'">
      <div class="flex h-full min-h-0 w-full gap-2 overflow-hidden" :class="labelFlexAlignClass">
        <span
          v-if="labelIconChar"
          class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-600/55 text-sm font-semibold text-slate-100"
        >{{ labelIconChar }}</span>
        <p class="min-w-0 flex-1 break-words leading-snug" :style="labelTextStyle">{{ component.props.text }}</p>
      </div>
    </template>

    <!-- Accordion -->
    <template v-else-if="component.type === 'accordion'">
      <div class="flex h-full min-h-0 w-full min-w-0 flex-col overflow-hidden">
      <p class="mb-2 shrink-0 truncate text-xs font-semibold text-slate-200">{{ component.props.title }}</p>
      <div class="min-h-0 flex-1 space-y-1 overflow-hidden">
        <div v-for="panel in accordionPanels" :key="panel" class="overflow-hidden rounded border border-slate-600">
          <div
            class="flex items-center justify-between px-3 py-1.5 text-xs font-medium"
            :class="panel === component.props.activePanel ? 'bg-blue-500/20 text-blue-200' : 'bg-slate-800/80 text-slate-300'"
          >
            <span>{{ panel }}</span>
            <span class="text-[10px]">{{ panel === component.props.activePanel ? '\u25BE' : '\u25B8' }}</span>
          </div>
          <div v-if="panel === component.props.activePanel" class="border-t border-slate-600 bg-slate-900/50">
            <div
              v-if="canDrop"
              class="relative min-h-[2.5rem] p-2"
              @dragover.prevent
              @drop.stop.prevent="$emit('drop-item', $event)"
            >
              <slot name="children" />
              <p v-if="!children.length" class="pointer-events-none text-center text-[10px] text-slate-500">
                Drop components for "{{ panel }}"
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </template>

    <!-- Data Grid (AG-Grid Style) -->
    <template v-else-if="component.type === 'data-grid'">
      <div class="flex h-full min-h-0 w-full max-w-full flex-col overflow-hidden rounded border border-slate-600 bg-slate-900/40">
        <div class="flex items-center justify-between border-b border-slate-600 bg-slate-900/60 px-2 py-1.5">
          <div class="flex items-center gap-1.5">
            <span class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Data Grid</span>
          </div>
          <div class="flex items-center gap-1">
            <button v-if="!component.props.isReadOnly && component.props.isEditable" class="rounded border border-blue-500/40 bg-blue-500/15 px-1.5 py-0.5 text-[9px] text-blue-300">Edit</button>
            <button v-if="!component.props.isReadOnly && component.props.allowAddRow" class="rounded border border-emerald-500/40 bg-emerald-500/15 px-1.5 py-0.5 text-[9px] text-emerald-300">+ Add</button>
            <button v-if="!component.props.isReadOnly && component.props.allowDeleteRow" class="rounded border border-red-500/40 bg-red-500/15 px-1.5 py-0.5 text-[9px] text-red-300">Delete</button>
          </div>
        </div>
        <div class="flex-1 overflow-hidden">
          <table class="w-full text-[11px]">
            <thead>
              <tr class="border-b border-slate-600 bg-slate-800/90">
                <th v-if="component.props.selectionMode !== 'none'" class="w-8 border-r border-slate-600 px-2 py-1.5 text-center">
                  <input v-if="component.props.selectionMode === 'multiple'" type="checkbox" class="pointer-events-none accent-blue-500" />
                  <span v-else class="text-[9px] text-slate-500">#</span>
                </th>
                <th
                  v-for="col in parsedColumns"
                  :key="col.field"
                  class="border-r border-slate-600 px-2 py-1.5 text-left font-semibold text-slate-200"
                >
                  {{ col.header }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in sampleRows" :key="row._idx" class="border-b border-slate-700 hover:bg-slate-700/40">
                <td v-if="component.props.selectionMode !== 'none'" class="w-8 border-r border-slate-700 px-2 py-1.5 text-center">
                  <input v-if="component.props.selectionMode === 'multiple'" type="checkbox" class="pointer-events-none accent-blue-500" />
                  <input v-else type="radio" class="pointer-events-none accent-blue-500" />
                </td>
                <td
                  v-for="col in parsedColumns"
                  :key="col.field"
                  class="border-r border-slate-700 px-2 py-1.5 text-slate-300"
                >
                  {{ row[col.field] }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="component.props.pagination" class="flex items-center justify-between border-t border-slate-600 bg-slate-900/60 px-2 py-1">
          <span class="text-[10px] text-slate-400">Page 1 of 3</span>
          <div class="flex items-center gap-1">
            <span class="text-[10px] text-slate-400">{{ component.props.pageSize }} rows/page</span>
            <button class="rounded border border-slate-600 bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">&lt;</button>
            <button class="rounded border border-blue-500/50 bg-blue-500/20 px-1.5 py-0.5 text-[10px] font-semibold text-blue-200">1</button>
            <button class="rounded border border-slate-600 bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">2</button>
            <button class="rounded border border-slate-600 bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">3</button>
            <button class="rounded border border-slate-600 bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-400">&gt;</button>
          </div>
        </div>
      </div>
    </template>

    <!-- Card List Repeater -->
    <template v-else-if="component.type === 'card-list-repeater'">
      <div class="flex items-center gap-1.5 border-b border-slate-600 pb-1.5">
        <span class="text-[10px] text-slate-500">&orarr;</span>
        <span class="text-xs font-semibold text-slate-200">Card Repeater</span>
      </div>

      <div class="mt-2 overflow-hidden rounded-lg border border-slate-600 bg-slate-900/45 shadow-sm">
        <div class="flex items-center gap-3 border-b border-slate-600 px-3 py-2.5">
          <div class="h-8 w-1 shrink-0 rounded-full" :style="{ backgroundColor: accentColorHex }" />
          <p class="flex-1 truncate text-sm font-bold text-slate-100">{{ component.props.cardTitle }}</p>
          <span class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold" :style="accentBadgeStyle">
            {{ component.props.cardBadge }}
          </span>
        </div>
        <div class="border-b border-slate-600 px-3 py-2">
          <span class="text-lg font-bold text-slate-100">{{ component.props.cardPrice }}</span>
          <span class="ml-1 text-[11px] text-slate-400">{{ component.props.cardPriceUnit }}</span>
        </div>
        <div class="border-b border-slate-600 px-3 py-2">
          <p class="line-clamp-2 text-[11px] leading-relaxed text-slate-300">{{ component.props.cardDescription }}</p>
        </div>
        <div class="space-y-0.5 border-b border-slate-600 px-3 py-2">
          <div v-for="fact in parseFacts(component.props.cardFacts)" :key="fact.key" class="flex items-center justify-between py-0.5 text-[11px]">
            <span class="text-slate-400">{{ fact.key }}</span>
            <span class="font-medium text-slate-100">{{ fact.value }}</span>
          </div>
        </div>
        <div class="px-3 py-2.5">
          <button
            type="button"
            class="h-8 w-full rounded-md text-xs font-semibold text-white transition-opacity"
            :class="preview ? 'cursor-pointer' : 'pointer-events-none'"
            :disabled="preview && isPreviewLoading"
            :style="{ backgroundColor: accentColorHex, ...(preview && isPreviewLoading ? { opacity: 0.65 } : {}) }"
            @click.stop="onPreviewRun('onClick', $event)"
          >
            {{ isPreviewLoading ? "…" : component.props.cardButtonText }}
          </button>
        </div>
      </div>

      <div
        v-if="canDrop"
        class="relative mt-2 min-h-[2rem] rounded border border-dashed border-slate-600 bg-slate-900/35 p-2"
        @dragover.prevent
        @drop.stop.prevent="$emit('drop-item', $event)"
      >
        <slot name="children" />
        <p v-if="!children.length" class="text-center text-[10px] text-slate-500">Extra card elements</p>
      </div>
    </template>

    <!-- Text Input -->
    <template v-else-if="component.type === 'text-input'">
      <div :class="formFieldStackClass">
      <p class="mb-1 truncate text-xs font-medium text-slate-400">{{ component.props.label }}</p>
      <input
        :type="component.props.inputType || 'text'"
        :placeholder="component.props.mask || component.props.placeholder || 'Enter value'"
        class="h-8 w-full rounded-md border border-slate-600 bg-slate-900/55 px-2 text-xs text-slate-200 placeholder:text-slate-500"
        :class="preview ? '' : 'pointer-events-none'"
        :readonly="preview && isLogicReadonly"
        :value="preview ? previewFieldModel() : ''"
        @input="onTextPreviewInput"
      />
      </div>
    </template>

    <!-- Combo Box -->
    <template v-else-if="component.type === 'combo-box'">
      <div :class="formFieldStackClass">
      <p class="mb-1 truncate text-xs font-medium text-slate-400">{{ component.props.label }}</p>
      <select
        class="h-8 w-full rounded-md border border-slate-600 bg-slate-900/55 px-2 text-xs text-slate-200"
        :class="preview ? '' : 'pointer-events-none'"
        :disabled="preview && isLogicReadonly"
        :value="preview ? previewFieldModel() : (parseOptions(component.props.options)[0] || '')"
        @change="onComboPreviewChange"
      >
        <option v-for="opt in parseOptions(component.props.options)" :key="opt" :value="opt">{{ opt }}</option>
      </select>
      </div>
    </template>

    <!-- Radio Group -->
    <template v-else-if="component.type === 'radio-group'">
      <div :class="formFieldStackClass">
      <p class="mb-1 truncate text-xs font-medium text-slate-400">{{ component.props.label }}</p>
      <div class="flex flex-wrap gap-3 text-xs text-slate-300">
        <label v-for="opt in parseOptions(component.props.options)" :key="opt" class="inline-flex items-center gap-1.5" :class="preview && !isLogicReadonly ? '' : 'pointer-events-none'">
          <input type="radio" :name="component.id" class="accent-blue-500" :disabled="preview && isLogicReadonly" />{{ opt }}
        </label>
      </div>
      </div>
    </template>

    <!-- Address Picker -->
    <template v-else-if="component.type === 'address-picker'">
      <div :class="formFieldStackClass">
      <p class="mb-1 truncate text-xs font-medium text-slate-400">{{ component.props.label }}</p>
      <div class="space-y-1">
        <input
          :placeholder="component.props.line1Placeholder || 'Street, building'"
          class="h-7 w-full rounded border border-slate-600 bg-slate-900/55 px-2 text-[11px] text-slate-200 placeholder:text-slate-500"
          :class="preview ? '' : 'pointer-events-none'"
          :readonly="preview && isLogicReadonly"
          :value="addressPart('line1')"
          @input="onAddressPartInput('line1', $event)"
        />
        <input
          :placeholder="component.props.line2Placeholder || 'Apt, floor'"
          class="h-7 w-full rounded border border-slate-600 bg-slate-900/55 px-2 text-[11px] text-slate-200 placeholder:text-slate-500"
          :class="preview ? '' : 'pointer-events-none'"
          :readonly="preview && isLogicReadonly"
          :value="addressPart('line2')"
          @input="onAddressPartInput('line2', $event)"
        />
        <div class="flex gap-1">
          <input
            :placeholder="component.props.cityPlaceholder || 'City'"
            class="h-7 min-w-0 flex-1 rounded border border-slate-600 bg-slate-900/55 px-2 text-[11px] text-slate-200 placeholder:text-slate-500"
            :class="preview ? '' : 'pointer-events-none'"
            :readonly="preview && isLogicReadonly"
            :value="addressPart('city')"
            @input="onAddressPartInput('city', $event)"
          />
          <input
            :placeholder="component.props.postalPlaceholder || 'Postal'"
            class="h-7 w-20 shrink-0 rounded border border-slate-600 bg-slate-900/55 px-2 text-[11px] text-slate-200 placeholder:text-slate-500"
            :class="preview ? '' : 'pointer-events-none'"
            :readonly="preview && isLogicReadonly"
            :value="addressPart('postal')"
            @input="onAddressPartInput('postal', $event)"
          />
        </div>
      </div>
      </div>
    </template>

    <!-- Data Fact -->
    <template v-else-if="component.type === 'data-fact'">
      <div :class="dataFactLayoutClass">
        <p class="shrink-0 text-[11px] text-slate-400">{{ component.props.label }}</p>
        <p class="min-w-0 break-words text-sm font-semibold text-slate-100">{{ resolvedFactValue }}</p>
      </div>
    </template>

    <!-- Status Badge -->
    <template v-else-if="component.type === 'status-badge'">
      <div class="flex h-full min-h-0 w-full min-w-0" :class="hvCrossAxisFlexClass">
        <span class="inline-flex rounded-full px-3 py-1 text-xs font-semibold" :class="badgeToneClass">{{ component.props.status }}</span>
      </div>
    </template>

    <!-- Divider -->
    <template v-else-if="component.type === 'divider'">
      <!--
        Divider 배치 로직:
        - outer root가 flex(row) + align/valign 기반으로 위치를 잡아주고,
        - 여기서는 라인 엘리먼트만 orientation/thickness로 크기 조절해서 렌더링합니다.

        horizontal: width=100%, height=thickness, valign(top/middle/bottom)에 따라 y 위치
        vertical: width=thickness, height=100%, alignment(left/center/right)에 따라 x 위치
      -->
      <div class="shrink-0" :style="dividerLineStyle" />
    </template>

    <!-- Action Button -->
    <template v-else-if="component.type === 'action-button'">
      <div class="flex h-full min-h-0 w-full min-w-0" :class="hvCrossAxisFlexClass">
        <button
          type="button"
          class="flex h-8 w-full items-center justify-center gap-1.5 rounded-md px-4 text-xs font-semibold transition-opacity"
          :class="preview ? 'cursor-pointer' : 'pointer-events-none'"
          :disabled="preview && isPreviewLoading"
          :style="{ ...buttonStyle, ...(preview && isPreviewLoading ? { opacity: 0.65 } : {}) }"
          @click.stop="onPreviewRun('onClick', $event)"
        >
          <span v-if="isPreviewLoading" class="text-[10px]">…</span>
          <span v-if="buttonIconChar" class="text-sm leading-none">{{ buttonIconChar }}</span>
          <span>{{ component.props.text }}</span>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed, inject } from "vue";
import { MOCK_API_DATA, DEFAULT_CONTAINER_BG, DEFAULT_DATA_FACT_BG, CONTAINER_TYPES } from "../data/componentCatalog";
import { PREVIEW_CTX } from "../runtime/previewContext";
import { resolveDataSource as resolveBinding, evaluateLogicCon } from "../runtime/runtimeEngine";

const props = defineProps({
  component: { type: Object, required: true },
  isSelected: { type: Boolean, default: false },
  preview: { type: Boolean, default: false },
  children: { type: Array, default: () => [] },
  canDrop: { type: Boolean, default: false }
});

defineEmits(["select", "drop-item"]);

const previewCtx = inject(PREVIEW_CTX, null);

const logicEvalCtx = computed(() => ({
  fieldValues: previewCtx?.fieldValues || {},
  runtimeVars: previewCtx?.runtimeVars || {}
}));

const isLogicHidden = computed(() => {
  if (!props.preview) return false;
  return evaluateLogicCon(props.component.props?.hiddenCon, logicEvalCtx.value);
});

const isLogicReadonly = computed(() => {
  if (!props.preview) return false;
  return evaluateLogicCon(props.component.props?.readonlyCon, logicEvalCtx.value);
});

const previewBorderless = computed(() => {
  return props.preview && !CONTAINER_TYPES.has(props.component.type);
});

/** Property editor has no panel background color — keep wrapper transparent in edit and preview. */
const NO_PANEL_BG_TYPES = new Set(["label", "status-badge"]);

/**
 * Own background / chrome is drawn inside the component (property colors match canvas).
 * Root stays transparent so edit vs preview vs editor don't stack conflicting panel tints.
 */
const SELF_CHROME_TYPES = new Set([
  "data-fact",
  "action-button",
  "text-input",
  "combo-box",
  "radio-group",
  "address-picker",
  "card-list-repeater",
  "data-grid",
  "accordion"
]);

const rootSurfaceClass = computed(() => {
  if (props.component.type === "divider") {
    return props.preview
      ? "border-transparent bg-transparent"
      : "border border-slate-600 bg-transparent";
  }
  if (NO_PANEL_BG_TYPES.has(props.component.type)) return "border-transparent bg-transparent";
  if (SELF_CHROME_TYPES.has(props.component.type)) {
    return props.preview
      ? "border-transparent bg-transparent"
      : "border border-slate-600 bg-transparent";
  }
  if (previewBorderless.value) return "border-transparent bg-slate-900/35 backdrop-blur-sm";
  if (props.component.type === "container") return "border-transparent bg-transparent";
  return "border border-slate-600 bg-slate-800/95";
});

const showSelectionRing = computed(() => props.isSelected && !props.preview);

/** alignment prop = horizontal; valign = vertical (grid cell, flex-row semantics). */
function cellHVParts() {
  const a = props.component.props?.alignment || "left";
  const v = props.component.props?.valign || "top";
  const justifyH = { left: "justify-start", center: "justify-center", right: "justify-end" };
  const itemsV = { top: "items-start", middle: "items-center", bottom: "items-end" };
  return {
    justify: justifyH[a] || justifyH.left,
    items: itemsV[v] || itemsV.top
  };
}

const SKIP_ROOT_CELL_ALIGN = new Set(["container", "label"]);

const cellAlignWrapperClass = computed(() => {
  if (SKIP_ROOT_CELL_ALIGN.has(props.component.type)) return "";
  const { justify, items } = cellHVParts();
  return `flex h-full min-h-0 w-full min-w-0 ${justify} ${items}`;
});

/** Inner flex row: same H/V mapping (badge, button row). */
const hvCrossAxisFlexClass = computed(() => {
  const { justify, items } = cellHVParts();
  return `${justify} ${items}`;
});

/** Label + control column; horizontal align in cell comes from root justify-* when content is narrower than cell. */
const formFieldStackClass = "flex min-h-0 w-full min-w-0 flex-col gap-1";

const dataFactLayoutClass = computed(() => {
  const p = props.component.props || {};
  const a = p.alignment || "left";
  const v = p.valign || "top";
  const justifyH = { left: "justify-start", center: "justify-center", right: "justify-end" };
  const itemsV = { top: "items-start", middle: "items-center", bottom: "items-end" };
  const itemsH = { left: "items-start", center: "items-center", right: "items-end" };
  const justifyV = { top: "justify-start", middle: "justify-center", bottom: "justify-end" };
  if (p.displayMode === "stacked") {
    return `flex w-full min-h-0 flex-col gap-0.5 ${itemsH[a] || itemsH.left} ${justifyV[v] || justifyV.top}`;
  }
  return `flex w-full min-h-0 flex-row flex-wrap items-baseline gap-2 ${justifyH[a] || justifyH.left} ${itemsV[v] || itemsV.top}`;
});

function resolveDataPath(path) {
  if (!path) return null;
  const rv = previewCtx?.runtimeVars;
  const fromState = resolveBinding(path, rv || {});
  if (fromState !== null && fromState !== undefined) return fromState;
  const cleanPath = path.startsWith("@") ? path.slice(1) : path;
  if (cleanPath.startsWith("state.")) return null;
  const keys = cleanPath.split(".").filter(Boolean);
  let obj = MOCK_API_DATA;
  for (const key of keys) {
    if (obj == null || typeof obj !== "object") return null;
    obj = obj[key];
  }
  return obj ?? null;
}

function previewFieldModel() {
  const fid = props.component.props?.fieldId;
  if (!fid || !previewCtx?.fieldValues) return "";
  return previewCtx.fieldValues[fid] ?? "";
}

function setPreviewField(v) {
  const fid = props.component.props?.fieldId;
  if (fid && previewCtx?.fieldValues) previewCtx.fieldValues[fid] = v;
}

function onPreviewRun(trigger, e) {
  if (e) e.stopPropagation();
  if (!props.preview || !previewCtx?.runPreviewTrigger) return;
  previewCtx.runPreviewTrigger(props.component.id, trigger);
}

function onTextPreviewInput(e) {
  if (!props.preview || !previewCtx) return;
  setPreviewField(e.target.value);
  onPreviewRun("onChange");
}

function onComboPreviewChange(e) {
  if (!props.preview || !previewCtx) return;
  setPreviewField(e.target.value);
  onPreviewRun("onChange");
}

function parseAddressBlob(raw) {
  if (raw == null || raw === "") return { line1: "", line2: "", city: "", postal: "" };
  try {
    const o = JSON.parse(String(raw));
    if (o && typeof o === "object")
      return {
        line1: String(o.line1 ?? ""),
        line2: String(o.line2 ?? ""),
        city: String(o.city ?? ""),
        postal: String(o.postal ?? "")
      };
  } catch { /* fallthrough */ }
  return { line1: String(raw), line2: "", city: "", postal: "" };
}

function addressPart(key) {
  const fid = props.component.props?.fieldId;
  if (!fid || !previewCtx?.fieldValues) return "";
  return parseAddressBlob(previewCtx.fieldValues[fid])[key] || "";
}

function onAddressPartInput(key, e) {
  if (!props.preview || !previewCtx) return;
  const fid = props.component.props?.fieldId;
  if (!fid) return;
  const cur = { ...parseAddressBlob(previewCtx.fieldValues[fid]), [key]: e.target.value };
  previewCtx.fieldValues[fid] = JSON.stringify(cur);
  onPreviewRun("onChange");
}

const isPreviewLoading = computed(
  () => props.preview && previewCtx?.loadingByComponent?.[props.component.id]
);

// --- Container (Section) ---
const containerFrameStyle = computed(() => {
  const p = props.component.props || {};
  const pad = Number(p.padding) >= 0 ? Number(p.padding) : 12;
  const showBg = p.showBackground !== false;
  const showBd = p.showBorder !== false;
  const bg = showBg ? (p.bgColor || DEFAULT_CONTAINER_BG) : "transparent";
  const style = {
    backgroundColor: bg,
    padding: `${pad}px`,
    boxSizing: "border-box",
    minHeight: 0,
    flex: "1 1 auto"
  };
  style.border = showBd ? "1px solid rgba(148, 163, 184, 0.45)" : "1px solid transparent";
  return style;
});

// --- Label (universal text) ---
const LABEL_PRESET = {
  h1: { fontSize: 30, fontWeight: 700 },
  h2: { fontSize: 22, fontWeight: 600 },
  h3: { fontSize: 18, fontWeight: 600 },
  body: { fontSize: 14, fontWeight: 400 },
  small: { fontSize: 12, fontWeight: 400 }
};
const FONT_WEIGHT_MAP = { normal: 400, bold: 700, extrabold: 800, "extra-bold": 800 };

const LABEL_ICON_MAP = {
  user: "U",
  folder: "F",
  settings: "\u2699",
  star: "\u2605",
  list: "\u2630",
  chart: "\u25C8"
};

const labelIconChar = computed(() => {
  const icon = props.component.props?.icon;
  if (!icon || icon === "none") return "";
  return LABEL_ICON_MAP[icon] ?? String(icon)[0]?.toUpperCase() ?? "";
});

/** Label row: alignment = horizontal (justify), valign = vertical (items). */
const labelFlexAlignClass = computed(() => {
  const p = props.component.props || {};
  const a = p.alignment || "left";
  const v = p.valign || "top";
  const justify = { left: "justify-start", center: "justify-center", right: "justify-end" };
  const items = { top: "items-start", middle: "items-center", bottom: "items-end" };
  return `${justify[a] || "justify-start"} ${items[v] || "items-start"}`;
});

const labelTextStyle = computed(() => {
  const p = props.component.props || {};
  const presetKey = (p.preset || "body").toLowerCase();
  const preset = LABEL_PRESET[presetKey] || LABEL_PRESET.body;
  const customFs = Number(p.customFontSize);
  const fontSize = customFs > 0 ? customFs : preset.fontSize;
  const fwKey = (p.fontWeight || "normal").toLowerCase().replace(/\s+/g, "-");
  const fontWeight = FONT_WEIGHT_MAP[fwKey] ?? preset.fontWeight;
  const align = p.alignment === "center" ? "center" : p.alignment === "right" ? "right" : "left";
  return {
    fontSize: `${fontSize}px`,
    fontWeight,
    color: p.color || "#e2e8f0",
    textAlign: align,
    lineHeight: 1.35,
    margin: 0
  };
});

// --- Accordion ---
const accordionPanels = computed(() => {
  const raw = props.component.props?.panels || "";
  return String(raw).split(",").map((s) => s.trim()).filter(Boolean);
});

// --- Button Icon ---
const ICON_MAP = {
  search: "\u2315", plus: "+", edit: "\u270E", delete: "\u2715",
  check: "\u2713", arrow: "\u2192", download: "\u2193", refresh: "\u21BB", save: "\u2611"
};

const buttonIconChar = computed(() => {
  const icon = props.component.props?.icon;
  if (!icon || icon === "none") return "";
  return ICON_MAP[icon] || "";
});

const BUTTON_PRESETS = {
  primary: { bg: "#3b82f6", text: "#ffffff" },
  secondary: { bg: "#ffffff", text: "#334155", border: "#cbd5e1" },
  success: { bg: "#10b981", text: "#ffffff" },
  danger: { bg: "#ef4444", text: "#ffffff" },
  warning: { bg: "#f59e0b", text: "#ffffff" },
  dark: { bg: "#1e293b", text: "#ffffff" }
};

const buttonStyle = computed(() => {
  const p = props.component.props;
  const preset = p?.colorPreset;
  if (preset === "custom") {
    return { backgroundColor: p.customBgColor || "#3b82f6", color: p.customTextColor || "#ffffff" };
  }
  const s = BUTTON_PRESETS[preset] || BUTTON_PRESETS.primary;
  const style = { backgroundColor: s.bg, color: s.text };
  if (s.border) style.border = `1px solid ${s.border}`;
  return style;
});

const componentBgStyle = computed(() => {
  if (props.component.type === "container") return null;
  if (props.component.type === "data-fact") {
    const raw = String(props.component.props?.bgColor ?? "").trim();
    const lc = raw.toLowerCase();
    if (!raw || lc === "#ffffff" || lc === "#fff") return { backgroundColor: DEFAULT_DATA_FACT_BG };
    return { backgroundColor: raw };
  }
  const bg = props.component.props?.bgColor;
  if (!bg || bg === "#ffffff" || bg === "") return null;
  return { backgroundColor: bg };
});

// --- Data Fact resolved value ---
const resolvedFactValue = computed(() => {
  const dp = props.component.props?.dataPath || props.component.props?.valuePath;
  if (dp) {
    const resolved = resolveDataPath(dp);
    if (resolved != null && typeof resolved !== "object") return String(resolved);
  }
  return props.component.props?.value || "N/A";
});

// --- Divider ---
const dividerColorHex = computed(() => props.component.props?.color || "#cbd5e1");

const dividerOrientation = computed(() => props.component.props?.orientation || "horizontal");
const dividerThicknessPx = computed(() => {
  const t = Number(props.component.props?.thickness);
  if (!Number.isFinite(t) || t <= 0) return 1;
  return t;
});
const dividerLineStyle = computed(() => {
  const t = dividerThicknessPx.value;
  if (dividerOrientation.value === "vertical") {
    return {
      width: `${t}px`,
      height: "100%",
      backgroundColor: dividerColorHex.value,
      boxSizing: "border-box"
    };
  }
  return {
    width: "100%",
    height: `${t}px`,
    backgroundColor: dividerColorHex.value,
    boxSizing: "border-box"
  };
});

// --- Status Badge ---
const badgeToneClass = computed(() => {
  const tone = props.component.props?.tone;
  if (tone === "success") return "border border-emerald-500/40 bg-emerald-500/20 text-emerald-200";
  if (tone === "warning") return "border border-amber-500/40 bg-amber-500/20 text-amber-200";
  if (tone === "error") return "border border-red-500/40 bg-red-500/20 text-red-200";
  return "border border-slate-600 bg-slate-700/80 text-slate-200";
});

// --- Card List Repeater ---
const accentColorHex = computed(() => props.component.props?.accentColor || "#3b82f6");
const accentBadgeStyle = computed(() => ({
  backgroundColor: accentColorHex.value,
  color: "#ffffff"
}));

// --- Data Grid ---
const parsedColumns = computed(() => {
  const raw = props.component.props?.columns;
  if (Array.isArray(raw)) return raw.filter((c) => c.header);
  return [];
});

const sampleRows = computed(() => {
  const dp = props.component.props?.dataSourcePath;
  if (dp) {
    const resolved = resolveDataPath(dp);
    if (Array.isArray(resolved) && resolved.length > 0) {
      return resolved.map((row, idx) => ({ _idx: idx, ...row }));
    }
  }
  const cols = parsedColumns.value;
  const samples = [
    ["Kim Min-jun", "Active", "5G Premium", "89,000"],
    ["Lee Su-jin", "Pending", "LTE Basic", "45,000"],
    ["Park Ji-ho", "Active", "5G Standard", "75,000"]
  ];
  return samples.map((row, idx) => {
    const obj = { _idx: idx };
    cols.forEach((col, ci) => { obj[col.field] = row[ci] ?? "-"; });
    return obj;
  });
});

function parseOptions(raw = "") {
  return String(raw).split(",").map((s) => s.trim()).filter(Boolean);
}

function parseFacts(raw = "") {
  return String(raw).split(",").map((s) => {
    const [key, ...rest] = s.split(":");
    return { key: key?.trim() || "", value: rest.join(":")?.trim() || "" };
  }).filter((f) => f.key);
}
</script>
