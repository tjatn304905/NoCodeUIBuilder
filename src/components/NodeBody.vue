<template>
  <div
    class="h-full w-full overflow-hidden rounded-lg"
    :class="[
      previewBorderless ? 'border-transparent bg-transparent' : 'border bg-white',
      !previewBorderless && isSelected && !preview ? 'border-blue-500 ring-2 ring-blue-400/30' : !previewBorderless ? 'border-slate-200' : '',
      component.type === 'divider' ? '!border-transparent bg-transparent !p-0' : 'p-2',
      alignClass
    ]"
    :style="componentBgStyle"
    @click.stop="$emit('select')"
  >
    <!-- Super Section -->
    <template v-if="component.type === 'super-section'">
      <div class="flex h-full flex-col">
        <div class="shrink-0 flex items-center gap-2 pb-1 border-b" :style="superSectionHeaderStyle">
          <span class="inline-flex h-7 w-7 items-center justify-center rounded-md text-sm font-bold" :style="superSectionIconStyle">
            {{ iconLetter }}
          </span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-bold text-slate-800">{{ component.props.title || component.props.label }}</p>
            <p v-if="component.props.subtitle" class="truncate text-[11px] text-slate-500">{{ component.props.subtitle }}</p>
          </div>
          <span class="ml-auto shrink-0 rounded bg-indigo-100 px-1.5 py-0.5 text-[9px] font-semibold text-indigo-600">SUPER</span>
        </div>
        <div
          class="relative mt-1 flex-1 min-h-0 rounded-lg p-1"
          :class="preview ? 'border-transparent' : 'border-2 border-dashed'"
          :style="superSectionDropStyle"
          @dragover.prevent
          @drop.stop.prevent="$emit('drop-item', $event)"
        >
          <p v-if="!children.length" class="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] text-slate-400">
            Drop Section Boxes or components here
          </p>
          <slot name="children" />
        </div>
      </div>
    </template>

    <!-- Section Box -->
    <template v-else-if="component.type === 'section-box'">
      <div class="flex h-full flex-col">
        <div class="shrink-0 flex items-center gap-2 border-b border-slate-200 pb-1">
          <span class="inline-flex h-6 w-6 items-center justify-center rounded bg-blue-50 text-xs text-blue-600">
            {{ iconLetter }}
          </span>
          <p class="text-xs font-semibold text-slate-700">{{ component.props.title || component.props.label }}</p>
        </div>
        <div
          class="relative mt-1 flex-1 min-h-0 rounded p-1"
          :class="preview ? 'border-transparent bg-transparent' : 'border border-dashed border-slate-300 bg-slate-50/50'"
          @dragover.prevent
          @drop.stop.prevent="$emit('drop-item', $event)"
        >
          <p v-if="!children.length" class="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] text-slate-400">
            Drop components here
          </p>
          <slot name="children" />
        </div>
      </div>
    </template>

    <!-- Accordion -->
    <template v-else-if="component.type === 'accordion'">
      <p class="mb-2 truncate text-xs font-semibold text-slate-700">{{ component.props.title }}</p>
      <div class="space-y-1 overflow-hidden">
        <div v-for="panel in accordionPanels" :key="panel" class="overflow-hidden rounded border border-slate-200">
          <div
            class="flex items-center justify-between px-3 py-1.5 text-xs font-medium"
            :class="panel === component.props.activePanel ? 'bg-blue-50 text-blue-700' : 'bg-slate-50 text-slate-600'"
          >
            <span>{{ panel }}</span>
            <span class="text-[10px]">{{ panel === component.props.activePanel ? '\u25BE' : '\u25B8' }}</span>
          </div>
          <div v-if="panel === component.props.activePanel" class="border-t border-slate-200 bg-white">
            <div
              v-if="canDrop"
              class="relative min-h-[2.5rem] p-2"
              @dragover.prevent
              @drop.stop.prevent="$emit('drop-item', $event)"
            >
              <slot name="children" />
              <p v-if="!children.length" class="pointer-events-none text-center text-[10px] text-slate-400">
                Drop components for "{{ panel }}"
              </p>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- Data Grid (AG-Grid Style) -->
    <template v-else-if="component.type === 'data-grid'">
      <div class="flex h-full flex-col overflow-hidden rounded border border-slate-200">
        <div class="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-2 py-1.5">
          <div class="flex items-center gap-1.5">
            <span class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Data Grid</span>
            <span class="rounded bg-slate-200 px-1.5 py-0.5 text-[9px] text-slate-600">{{ component.props.dataSourcePath }}</span>
          </div>
          <div class="flex items-center gap-1">
            <button v-if="!component.props.isReadOnly && component.props.isEditable" class="rounded bg-blue-50 px-1.5 py-0.5 text-[9px] text-blue-600">Edit</button>
            <button v-if="!component.props.isReadOnly && component.props.allowAddRow" class="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] text-emerald-600">+ Add</button>
            <button v-if="!component.props.isReadOnly && component.props.allowDeleteRow" class="rounded bg-red-50 px-1.5 py-0.5 text-[9px] text-red-500">Delete</button>
          </div>
        </div>
        <div class="flex-1 overflow-hidden">
          <table class="w-full text-[11px]">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-100">
                <th v-if="component.props.selectionMode !== 'none'" class="w-8 border-r border-slate-200 px-2 py-1.5 text-center">
                  <input v-if="component.props.selectionMode === 'multiple'" type="checkbox" class="pointer-events-none accent-blue-600" />
                  <span v-else class="text-[9px] text-slate-400">#</span>
                </th>
                <th
                  v-for="col in parsedColumns"
                  :key="col.field"
                  class="border-r border-slate-200 px-2 py-1.5 text-left font-semibold text-slate-700"
                >
                  {{ col.header }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="row in sampleRows" :key="row._idx" class="border-b border-slate-100 hover:bg-blue-50/30">
                <td v-if="component.props.selectionMode !== 'none'" class="w-8 border-r border-slate-100 px-2 py-1.5 text-center">
                  <input v-if="component.props.selectionMode === 'multiple'" type="checkbox" class="pointer-events-none accent-blue-600" />
                  <input v-else type="radio" class="pointer-events-none accent-blue-600" />
                </td>
                <td
                  v-for="col in parsedColumns"
                  :key="col.field"
                  class="border-r border-slate-100 px-2 py-1.5 text-slate-600"
                >
                  {{ row[col.field] }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-if="component.props.pagination" class="flex items-center justify-between border-t border-slate-200 bg-slate-50 px-2 py-1">
          <span class="text-[10px] text-slate-500">Page 1 of 3</span>
          <div class="flex items-center gap-1">
            <span class="text-[10px] text-slate-500">{{ component.props.pageSize }} rows/page</span>
            <button class="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] text-slate-500">&lt;</button>
            <button class="rounded border border-blue-400 bg-blue-50 px-1.5 py-0.5 text-[10px] font-semibold text-blue-600">1</button>
            <button class="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] text-slate-500">2</button>
            <button class="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] text-slate-500">3</button>
            <button class="rounded border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] text-slate-500">&gt;</button>
          </div>
        </div>
      </div>
    </template>

    <!-- Card List Repeater -->
    <template v-else-if="component.type === 'card-list-repeater'">
      <div class="flex items-center justify-between border-b border-slate-200 pb-1.5">
        <div class="flex items-center gap-1.5">
          <span class="text-[10px] text-slate-400">&orarr;</span>
          <span class="text-xs font-semibold text-slate-700">Card Repeater</span>
        </div>
        <span class="rounded border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] text-amber-700">
          {{ component.props.dataSourcePath }}
        </span>
      </div>

      <div class="mt-2 overflow-hidden rounded-lg border border-slate-200 shadow-sm">
        <div class="flex items-center gap-3 border-b border-slate-100 px-3 py-2.5">
          <div class="h-8 w-1 shrink-0 rounded-full" :style="{ backgroundColor: accentColorHex }" />
          <p class="flex-1 truncate text-sm font-bold text-slate-800">{{ component.props.cardTitle }}</p>
          <span class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold" :style="accentBadgeStyle">
            {{ component.props.cardBadge }}
          </span>
        </div>
        <div class="border-b border-slate-100 px-3 py-2">
          <span class="text-lg font-bold text-slate-900">{{ component.props.cardPrice }}</span>
          <span class="ml-1 text-[11px] text-slate-500">{{ component.props.cardPriceUnit }}</span>
        </div>
        <div class="border-b border-slate-100 px-3 py-2">
          <p class="line-clamp-2 text-[11px] leading-relaxed text-slate-600">{{ component.props.cardDescription }}</p>
        </div>
        <div class="space-y-0.5 border-b border-slate-100 px-3 py-2">
          <div v-for="fact in parseFacts(component.props.cardFacts)" :key="fact.key" class="flex items-center justify-between py-0.5 text-[11px]">
            <span class="text-slate-500">{{ fact.key }}</span>
            <span class="font-medium text-slate-800">{{ fact.value }}</span>
          </div>
        </div>
        <div class="px-3 py-2.5">
          <button class="pointer-events-none h-8 w-full rounded-md text-xs font-semibold text-white" :style="{ backgroundColor: accentColorHex }">
            {{ component.props.cardButtonText }}
          </button>
        </div>
      </div>

      <div
        v-if="canDrop"
        class="relative mt-2 min-h-[2rem] rounded border border-dashed border-slate-300 bg-slate-50/50 p-2"
        @dragover.prevent
        @drop.stop.prevent="$emit('drop-item', $event)"
      >
        <slot name="children" />
        <p v-if="!children.length" class="text-center text-[10px] text-slate-400">Extra card elements</p>
      </div>
    </template>

    <!-- Text Input -->
    <template v-else-if="component.type === 'text-input'">
      <p class="mb-1 truncate text-xs font-medium text-slate-600">{{ component.props.label }}</p>
      <div class="relative">
        <input
          :type="component.props.inputType || 'text'"
          :placeholder="component.props.mask || component.props.placeholder || 'Enter value'"
          class="pointer-events-none h-8 w-full rounded-md border border-slate-300 bg-slate-50 px-2 text-xs"
          :class="component.props.mask ? 'pr-14' : ''"
        />
        <span
          v-if="component.props.mask"
          class="absolute right-1.5 top-1/2 -translate-y-1/2 rounded bg-purple-100 px-1.5 py-0.5 text-[9px] font-semibold text-purple-600"
        >
          MASK
        </span>
      </div>
    </template>

    <!-- Combo Box -->
    <template v-else-if="component.type === 'combo-box'">
      <p class="mb-1 truncate text-xs font-medium text-slate-600">{{ component.props.label }}</p>
      <select class="pointer-events-none h-8 w-full rounded-md border border-slate-300 bg-slate-50 px-2 text-xs">
        <option v-for="opt in parseOptions(component.props.options)" :key="opt">{{ opt }}</option>
      </select>
    </template>

    <!-- Radio Group -->
    <template v-else-if="component.type === 'radio-group'">
      <p class="mb-1 truncate text-xs font-medium text-slate-600">{{ component.props.label }}</p>
      <div class="flex flex-wrap gap-3 text-xs text-slate-700">
        <label v-for="opt in parseOptions(component.props.options)" :key="opt" class="pointer-events-none inline-flex items-center gap-1.5">
          <input type="radio" :name="component.id" class="accent-blue-600" />{{ opt }}
        </label>
      </div>
    </template>

    <!-- Date Picker -->
    <template v-else-if="component.type === 'date-picker'">
      <p class="mb-1 truncate text-xs font-medium text-slate-600">{{ component.props.label }}</p>
      <div class="relative">
        <input
          :placeholder="component.props.placeholder || 'YYYY-MM-DD'"
          class="pointer-events-none h-8 w-full rounded-md border border-slate-300 bg-slate-50 px-2 pr-8 text-xs"
        />
        <span class="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-slate-400">&#128197;</span>
      </div>
    </template>

    <!-- Data Fact -->
    <template v-else-if="component.type === 'data-fact'">
      <div :class="component.props.displayMode === 'stacked' ? '' : 'flex items-baseline gap-2'">
        <p class="shrink-0 text-[11px] text-slate-500">{{ component.props.label }}</p>
        <div class="flex items-baseline gap-1" :class="component.props.displayMode === 'stacked' ? 'mt-0.5' : ''">
          <p class="text-sm font-semibold text-slate-800">{{ resolvedFactValue }}</p>
          <span
            v-if="component.props.dataPath"
            class="rounded bg-cyan-50 px-1 py-0.5 text-[8px] font-semibold text-cyan-600"
          >BOUND</span>
        </div>
      </div>
    </template>

    <!-- Status Badge -->
    <template v-else-if="component.type === 'status-badge'">
      <div class="flex h-full items-center">
        <span class="inline-flex rounded-full px-3 py-1 text-xs font-semibold" :class="badgeToneClass">{{ component.props.status }}</span>
      </div>
    </template>

    <!-- Divider -->
    <template v-else-if="component.type === 'divider'">
      <div class="flex h-full items-center" :style="dividerPaddingStyle">
        <div class="h-px w-full" :style="{ backgroundColor: dividerColorHex }" />
      </div>
    </template>

    <!-- Action Button -->
    <template v-else-if="component.type === 'action-button'">
      <div class="flex h-full items-center">
        <button
          class="pointer-events-none flex h-8 w-full items-center justify-center gap-1.5 rounded-md px-4 text-xs font-semibold"
          :style="buttonStyle"
        >
          <span v-if="buttonIconChar" class="text-sm leading-none">{{ buttonIconChar }}</span>
          <span>{{ component.props.text }}</span>
          <span v-if="component.props.params" class="ml-1 rounded-full bg-white/20 px-1 text-[8px]">P</span>
        </button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { MOCK_API_DATA } from "../data/componentCatalog";

const props = defineProps({
  component: { type: Object, required: true },
  isSelected: { type: Boolean, default: false },
  preview: { type: Boolean, default: false },
  children: { type: Array, default: () => [] },
  canDrop: { type: Boolean, default: false }
});

defineEmits(["select", "drop-item"]);

const CONTAINER_TYPES = new Set(["super-section", "section-box", "accordion", "data-grid", "card-list-repeater"]);

const previewBorderless = computed(() => {
  return props.preview && !CONTAINER_TYPES.has(props.component.type);
});

const alignClass = computed(() => {
  const a = props.component.props?.alignment;
  const v = props.component.props?.valign;
  const hMap = { center: "text-center", right: "text-right" };
  const vMap = { middle: "items-center", bottom: "items-end" };
  const classes = [hMap[a] || "text-left"];
  if (v && vMap[v]) classes.push("flex flex-col", vMap[v]);
  return classes.join(" ");
});

const iconLetter = computed(() => {
  const icon = props.component.props?.icon;
  if (!icon) return "S";
  const map = { user: "U", folder: "F", settings: "\u2699", star: "\u2605", list: "\u2630", chart: "\u25C8" };
  return map[icon] ?? icon[0]?.toUpperCase() ?? "S";
});

function resolveDataPath(path) {
  if (!path) return null;
  const cleanPath = path.startsWith("@") ? path.slice(1) : path;
  const keys = cleanPath.split(".");
  let obj = MOCK_API_DATA;
  for (const key of keys) {
    if (obj == null || typeof obj !== "object") return null;
    obj = obj[key];
  }
  return obj ?? null;
}

// --- Super Section styling ---
const superSectionColor = computed(() => props.component.props?.bgColor || "#ffffff");

const superSectionHeaderStyle = computed(() => ({
  borderColor: superSectionColor.value,
  backgroundColor: superSectionColor.value
}));

const superSectionIconStyle = computed(() => ({
  backgroundColor: superSectionColor.value,
  color: "#0f172a"
}));

const superSectionDropStyle = computed(() => ({
  borderColor: superSectionColor.value,
  backgroundColor: superSectionColor.value
}));

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
  const bg = props.component.props?.bgColor;
  if (!bg || bg === "#ffffff" || bg === "") return null;
  return { backgroundColor: bg };
});

// --- Data Fact resolved value ---
const resolvedFactValue = computed(() => {
  const dp = props.component.props?.dataPath;
  if (dp) {
    const resolved = resolveDataPath(dp);
    if (resolved != null && typeof resolved !== "object") return String(resolved);
  }
  return props.component.props?.value || "N/A";
});

// --- Divider ---
const dividerColorHex = computed(() => props.component.props?.color || "#cbd5e1");

const dividerPaddingStyle = computed(() => {
  const py = Number(props.component.props?.paddingY) || 0;
  return { paddingTop: `${py}px`, paddingBottom: `${py}px` };
});

// --- Status Badge ---
const badgeToneClass = computed(() => {
  const tone = props.component.props?.tone;
  if (tone === "success") return "bg-emerald-100 text-emerald-700";
  if (tone === "warning") return "bg-amber-100 text-amber-700";
  if (tone === "error") return "bg-red-100 text-red-700";
  return "bg-slate-200 text-slate-700";
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
