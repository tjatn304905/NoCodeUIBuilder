<template>
  <div
    class="h-full w-full overflow-hidden rounded-lg border bg-white"
    :class="[
      isSelected && !preview ? 'border-blue-500 ring-2 ring-blue-400/30' : 'border-slate-200',
      component.type === 'divider' ? 'bg-transparent !p-0' : 'p-2',
      alignClass
    ]"
    @click.stop="$emit('select')"
  >
    <!-- Section Box -->
    <template v-if="component.type === 'section-box'">
      <div class="flex items-center gap-2 border-b border-slate-200 pb-2">
        <span class="inline-flex h-6 w-6 items-center justify-center rounded bg-blue-50 text-xs text-blue-600">
          {{ iconLetter }}
        </span>
        <p class="text-xs font-semibold text-slate-700">{{ component.props.title || component.props.label }}</p>
      </div>
      <div
        class="relative mt-2 h-[calc(100%-2.5rem)] rounded border border-dashed border-slate-300 bg-slate-50/50 p-2"
        @dragover.prevent
        @drop.stop.prevent="$emit('drop-item', $event)"
      >
        <p v-if="!children.length" class="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] text-slate-400">
          Drop components here
        </p>
        <slot name="children" />
      </div>
    </template>

    <!-- Data Grid (AG-Grid Style) -->
    <template v-else-if="component.type === 'data-grid'">
      <div class="flex h-full flex-col overflow-hidden rounded border border-slate-200">
        <!-- Toolbar -->
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

        <!-- Table -->
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

        <!-- Pagination -->
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
          <div class="h-8 w-1 shrink-0 rounded-full" :class="accentBg" />
          <p class="flex-1 truncate text-sm font-bold text-slate-800">{{ component.props.cardTitle }}</p>
          <span class="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold" :class="accentBadge">
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
          <button class="pointer-events-none h-8 w-full rounded-md text-xs font-semibold text-white" :class="accentBg">
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
      <input
        :type="component.props.inputType || 'text'"
        :placeholder="component.props.placeholder || 'Enter value'"
        class="pointer-events-none h-8 w-full rounded-md border border-slate-300 bg-slate-50 px-2 text-xs"
      />
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

    <!-- Address Picker -->
    <template v-else-if="component.type === 'address-picker'">
      <p class="mb-1 truncate text-xs font-medium text-slate-600">{{ component.props.label }}</p>
      <div class="flex gap-2">
        <input class="pointer-events-none h-8 flex-1 rounded-md border border-slate-300 bg-slate-50 px-2 text-xs" placeholder="Search address..." />
        <button class="pointer-events-none h-8 shrink-0 rounded-md bg-slate-700 px-3 text-xs text-white">{{ component.props.buttonLabel || "Search" }}</button>
      </div>
    </template>

    <!-- Data Fact -->
    <template v-else-if="component.type === 'data-fact'">
      <div :class="component.props.displayMode === 'stacked' ? '' : 'flex items-baseline gap-2'">
        <p class="shrink-0 text-[11px] text-slate-500">{{ component.props.label }}</p>
        <p class="text-sm font-semibold text-slate-800" :class="component.props.displayMode === 'stacked' ? 'mt-0.5' : ''">{{ component.props.value }}</p>
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
      <div class="flex h-full items-center px-1"><div class="h-px w-full bg-slate-300" /></div>
    </template>

    <!-- Buttons -->
    <template v-else-if="component.type === 'primary-button' || component.type === 'secondary-button'">
      <div class="flex h-full items-center">
        <button
          class="pointer-events-none h-8 w-full rounded-md px-4 text-xs font-semibold"
          :class="component.type === 'primary-button' ? 'bg-blue-600 text-white' : 'border border-slate-300 bg-white text-slate-700'"
        >{{ component.props.text }}</button>
      </div>
    </template>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  component: { type: Object, required: true },
  isSelected: { type: Boolean, default: false },
  preview: { type: Boolean, default: false },
  children: { type: Array, default: () => [] },
  canDrop: { type: Boolean, default: false }
});

defineEmits(["select", "drop-item"]);

const alignClass = computed(() => {
  const a = props.component.props?.alignment;
  if (a === "center") return "text-center";
  if (a === "right") return "text-right";
  return "text-left";
});

const iconLetter = computed(() => {
  const icon = props.component.props?.icon;
  if (!icon) return "S";
  const map = { user: "U", folder: "F", settings: "\u2699", star: "\u2605", list: "\u2630", chart: "\u25C8" };
  return map[icon] ?? icon[0]?.toUpperCase() ?? "S";
});

const badgeToneClass = computed(() => {
  const tone = props.component.props?.tone;
  if (tone === "success") return "bg-emerald-100 text-emerald-700";
  if (tone === "warning") return "bg-amber-100 text-amber-700";
  if (tone === "error") return "bg-red-100 text-red-700";
  return "bg-slate-200 text-slate-700";
});

const accentBg = computed(() => {
  const c = props.component.props?.accentColor;
  if (c === "green") return "bg-emerald-500";
  if (c === "purple") return "bg-purple-500";
  if (c === "red") return "bg-red-500";
  if (c === "amber") return "bg-amber-500";
  return "bg-blue-500";
});

const accentBadge = computed(() => {
  const c = props.component.props?.accentColor;
  if (c === "green") return "bg-emerald-100 text-emerald-700";
  if (c === "purple") return "bg-purple-100 text-purple-700";
  if (c === "red") return "bg-red-100 text-red-700";
  if (c === "amber") return "bg-amber-100 text-amber-700";
  return "bg-blue-100 text-blue-700";
});

const parsedColumns = computed(() => {
  const raw = props.component.props?.columns || "";
  return String(raw).split(",").map((s) => {
    const [header, ...rest] = s.split(":");
    return { header: header?.trim() || "", field: rest.join(":")?.trim() || header?.trim()?.toLowerCase() || "" };
  }).filter((c) => c.header);
});

const sampleRows = computed(() => {
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
