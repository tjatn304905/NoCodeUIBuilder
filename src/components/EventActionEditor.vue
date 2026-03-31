<template>
  <div>
    <div
      v-for="(action, idx) in actions"
      :key="idx"
      class="mb-1.5 rounded border border-slate-600/60 bg-slate-900/50 p-1.5"
    >
      <div class="flex items-center gap-1">
        <span class="shrink-0 text-[9px] text-slate-500">#{{ idx + 1 }}</span>
        <select
          class="w-full rounded border border-slate-600 bg-slate-900 px-1 py-1 text-[10px] text-slate-200"
          :value="action.type || 'orderEvent'"
          @change="update(idx, { type: $event.target.value })"
        >
          <option value="orderEvent">Order Event</option>
          <option value="setVariable">Set Variable</option>
          <option value="navigate">Navigate</option>
        </select>
        <button
          type="button"
          class="shrink-0 text-[10px] text-red-400 hover:text-red-300"
          @click="remove(idx)"
        >✕</button>
      </div>

      <!-- setVariable -->
      <div v-if="action.type === 'setVariable'" class="mt-1 space-y-1">
        <select
          class="w-full rounded border border-slate-600 bg-slate-900 px-1 py-1 font-mono text-[10px] text-slate-200"
          :value="action.variable || ''"
          @change="update(idx, { variable: $event.target.value })"
        >
          <option value="">— variable —</option>
          <option v-for="v in variables" :key="v.id" :value="v.name">{{ v.name }}</option>
        </select>
        <input
          class="w-full rounded border border-slate-600 bg-slate-900 px-1.5 py-1 font-mono text-[10px] text-slate-200"
          :value="action.value || ''"
          placeholder="Value (e.g. $input.value or literal)"
          @input="update(idx, { value: $event.target.value })"
        />
      </div>

      <!-- navigate -->
      <input
        v-else-if="action.type === 'navigate'"
        class="mt-1 w-full rounded border border-slate-600 bg-slate-900 px-1.5 py-1 text-[10px] text-slate-200"
        :value="action.target || ''"
        placeholder="Target screen"
        @input="update(idx, { target: $event.target.value })"
      />

      <!-- orderEvent -->
      <div v-else class="mt-1 space-y-1">
        <select
          class="w-full rounded border border-violet-500/30 bg-violet-500/10 px-1 py-1 font-mono text-[10px] text-violet-200"
          :value="action.eventId || ''"
          @change="update(idx, { eventId: $event.target.value })"
        >
          <option value="">— select order event —</option>
          <option v-for="oe in orderEvents" :key="oe.id" :value="oe.id">
            {{ oe.eventCode || oe.id }} — {{ oe.name }}
          </option>
        </select>
        <input
          class="w-full rounded border border-slate-600 bg-slate-900 px-1.5 py-1 font-mono text-[10px] text-slate-200"
          :value="action.params || ''"
          placeholder="Override params (optional)"
          @input="update(idx, { params: $event.target.value })"
        />
        <div class="flex gap-1">
          <input
            class="min-w-0 flex-1 rounded border border-slate-600 bg-slate-900 px-1.5 py-1 font-mono text-[10px] text-slate-200"
            :value="action.resultPath || ''"
            placeholder="Result path"
            @input="update(idx, { resultPath: $event.target.value })"
          />
          <select
            class="min-w-0 flex-1 rounded border border-slate-600 bg-slate-900 px-1 py-1 font-mono text-[10px] text-slate-200"
            :value="action.resultVariable || ''"
            @change="update(idx, { resultVariable: $event.target.value })"
          >
            <option value="">→ variable</option>
            <option v-for="v in variables" :key="v.id" :value="v.name">{{ v.name }}</option>
          </select>
        </div>
      </div>
    </div>

    <button
      type="button"
      class="mt-1 w-full rounded border border-dashed border-slate-600 py-1 text-[10px] text-slate-400 hover:border-slate-500 hover:text-slate-300"
      @click="add"
    >+ Add Action</button>
  </div>
</template>

<script setup>
const props = defineProps({
  actions:     { type: Array, default: () => [] },
  orderEvents: { type: Array, default: () => [] },
  variables:   { type: Array, default: () => [] }
});

const emit = defineEmits(["update"]);

function add() {
  emit("update", [
    ...props.actions,
    { type: "orderEvent", eventId: "", params: "", resultVariable: "", resultPath: "" }
  ]);
}

function remove(idx) {
  const next = [...props.actions];
  next.splice(idx, 1);
  emit("update", next);
}

function update(idx, patch) {
  emit("update", props.actions.map((a, i) => i === idx ? { ...a, ...patch } : a));
}
</script>
