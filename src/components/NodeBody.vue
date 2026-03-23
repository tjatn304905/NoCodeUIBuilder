<template>
  <div
    class="h-full w-full rounded-lg border bg-white p-2"
    :class="[
      isSelected && !preview ? 'border-blue-500 shadow-[0_0_0_1px_rgba(59,130,246,.35)]' : 'border-slate-200',
      component.type === 'divider' ? 'bg-transparent p-0' : '',
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

    <!-- Grid Stack -->
    <template v-else-if="component.type === 'grid-stack'">
      <div class="text-xs font-semibold text-slate-700">{{ component.props.title || "Grid Stack" }}</div>
      <div
        class="relative mt-2 h-[calc(100%-1.5rem)] rounded border border-dashed border-slate-300 bg-slate-50/50 p-2"
        @dragover.prevent
        @drop.stop.prevent="$emit('drop-item', $event)"
      >
        <p v-if="!children.length" class="pointer-events-none absolute inset-0 flex items-center justify-center text-[10px] text-slate-400">
          Drop components here
        </p>
        <slot name="children" />
      </div>
    </template>

    <!-- Card List Repeater -->
    <template v-else-if="component.type === 'card-list-repeater'">
      <div class="flex items-center justify-between text-xs">
        <span class="font-semibold text-slate-700">Card List Repeater</span>
        <span class="rounded bg-amber-50 px-2 py-0.5 text-amber-700 border border-amber-200">{{ component.props.dataSourcePath }}</span>
      </div>
      <div
        class="relative mt-2 h-[calc(100%-1.5rem)] rounded border border-dashed border-slate-300 bg-slate-50/50 p-2"
        @dragover.prevent
        @drop.stop.prevent="$emit('drop-item', $event)"
      >
        <div class="mb-2 flex items-center gap-1 text-[10px] uppercase tracking-wide text-slate-400">
          <span>↻</span>
          <span>Repeated Card Template</span>
        </div>
        <div v-if="!children.length" class="rounded border border-dashed border-slate-300 bg-white p-3">
          <div class="h-2 w-2/3 rounded bg-slate-200" />
          <div class="mt-1.5 h-2 w-1/3 rounded bg-slate-100" />
          <p class="mt-2 text-[10px] text-slate-400">Drop card content here</p>
        </div>
        <slot name="children" />
      </div>
    </template>

    <!-- Text Input (Base Input) -->
    <template v-else-if="component.type === 'text-input'">
      <p class="mb-1 text-xs font-medium text-slate-600">{{ component.props.label }}</p>
      <input
        :type="component.props.inputType || 'text'"
        :placeholder="component.props.placeholder || 'Enter value'"
        :maxlength="component.props.maxLength || 120"
        class="h-8 w-full rounded-md border border-slate-300 bg-slate-50 px-2 text-xs focus:border-blue-400 focus:outline-none"
      />
    </template>

    <!-- Combo Box -->
    <template v-else-if="component.type === 'combo-box'">
      <p class="mb-1 text-xs font-medium text-slate-600">{{ component.props.label }}</p>
      <select class="h-8 w-full rounded-md border border-slate-300 bg-slate-50 px-2 text-xs focus:border-blue-400 focus:outline-none">
        <option v-for="opt in parseOptions(component.props.options)" :key="opt">{{ opt }}</option>
      </select>
    </template>

    <!-- Radio Group -->
    <template v-else-if="component.type === 'radio-group'">
      <p class="mb-1 text-xs font-medium text-slate-600">{{ component.props.label }}</p>
      <div class="flex flex-wrap gap-3 text-xs text-slate-700">
        <label v-for="opt in parseOptions(component.props.options)" :key="opt" class="inline-flex items-center gap-1.5 cursor-pointer">
          <input type="radio" :name="component.id" class="accent-blue-600" />
          {{ opt }}
        </label>
      </div>
    </template>

    <!-- Address Picker -->
    <template v-else-if="component.type === 'address-picker'">
      <p class="mb-1 text-xs font-medium text-slate-600">{{ component.props.label }}</p>
      <div class="flex gap-2">
        <input class="h-8 flex-1 rounded-md border border-slate-300 bg-slate-50 px-2 text-xs" placeholder="Search address..." />
        <button class="h-8 rounded-md bg-slate-700 px-3 text-xs text-white hover:bg-slate-800">{{ component.props.buttonLabel || "Search" }}</button>
      </div>
    </template>

    <!-- Data Fact (Label-Value Pair) -->
    <template v-else-if="component.type === 'data-fact'">
      <div :class="component.props.displayMode === 'stacked' ? '' : 'flex items-baseline gap-2'">
        <p class="text-[11px] text-slate-500 shrink-0">{{ component.props.label }}</p>
        <p class="text-sm font-semibold text-slate-800" :class="component.props.displayMode === 'stacked' ? 'mt-0.5' : ''">
          {{ component.props.value }}
        </p>
      </div>
    </template>

    <!-- Status Badge -->
    <template v-else-if="component.type === 'status-badge'">
      <span
        class="inline-flex rounded-full px-3 py-1 text-xs font-semibold"
        :class="badgeToneClass"
      >
        {{ component.props.status }}
      </span>
    </template>

    <!-- Divider -->
    <template v-else-if="component.type === 'divider'">
      <div class="flex h-full items-center px-1">
        <div class="h-px w-full bg-slate-300" />
      </div>
    </template>

    <!-- Primary / Secondary Button -->
    <template v-else-if="component.type === 'primary-button' || component.type === 'secondary-button'">
      <div class="flex h-full items-center">
        <button
          class="h-8 w-full rounded-md px-4 text-xs font-semibold transition-colors"
          :class="
            component.type === 'primary-button'
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
          "
        >
          {{ component.props.text }}
        </button>
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
  const map = { user: "U", folder: "F", settings: "⚙", star: "★", list: "☰", chart: "◈" };
  return map[icon] ?? icon[0]?.toUpperCase() ?? "S";
});

const badgeToneClass = computed(() => {
  const tone = props.component.props?.tone;
  if (tone === "success") return "bg-emerald-100 text-emerald-700";
  if (tone === "warning") return "bg-amber-100 text-amber-700";
  if (tone === "error") return "bg-red-100 text-red-700";
  return "bg-slate-200 text-slate-700";
});

function parseOptions(raw = "") {
  return String(raw).split(",").map((s) => s.trim()).filter(Boolean);
}
</script>
