<template>
  <!-- Loading panel shown inside the AI modal while generating -->
  <div class="flex flex-col items-center gap-5 rounded-xl border border-cyan-500/20 bg-slate-950 py-10 px-8">

    <!-- Spinning icon -->
    <div class="relative h-12 w-12">
      <div class="absolute inset-0 rounded-full border-2 border-cyan-500/25 animate-spin" style="animation-duration:2.4s" />
      <div class="absolute inset-1.5 rounded-full border border-dashed border-cyan-400/40 animate-spin" style="animation-duration:3.6s; animation-direction:reverse" />
      <div class="absolute inset-0 flex items-center justify-center">
        <svg class="h-5 w-5 text-cyan-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3l1.8 3.7L18 8.5l-3 2.9.7 4.1L12 13.8l-3.7 1.7.7-4.1-3-2.9 4.2-1.8L12 3z" />
        </svg>
      </div>
    </div>

    <!-- Current stage label -->
    <div class="text-center">
      <p class="text-sm font-semibold text-cyan-200 tracking-wide">
        {{ stage?.label ?? 'Initializing…' }}
      </p>
      <p class="mt-0.5 text-[11px] text-slate-500">Please wait a moment</p>
    </div>

    <!-- Progress bar -->
    <div class="w-full max-w-xs">
      <div class="mb-1.5 flex items-center justify-between">
        <span class="text-[10px] font-mono text-slate-500">PROGRESS</span>
        <span class="text-[10px] font-mono text-cyan-400">{{ progress }}%</span>
      </div>
      <div class="h-1 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          class="h-full rounded-full ai-progress-bar transition-[width] duration-500 ease-out"
          :style="{ width: progress + '%' }"
        />
      </div>
    </div>

    <!-- Bouncing dots -->
    <div class="flex gap-1.5">
      <span class="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style="animation-delay:0ms" />
      <span class="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style="animation-delay:160ms" />
      <span class="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-bounce" style="animation-delay:320ms" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  /** Current AI_STAGES entry: { id, label, progress } */
  stage: { type: Object, default: null },
  /** 0–100 numeric progress value */
  progress: { type: Number, default: 0 }
});
</script>
