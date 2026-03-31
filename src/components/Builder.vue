<template>
  <div class="box-border h-[100dvh] w-full overflow-hidden bg-slate-950 text-slate-200 flex flex-col">
    <!-- ═══ Top Header Bar ═══ -->
    <header class="flex items-center justify-between border-b border-slate-700 bg-slate-900 px-4 py-2.5 shrink-0">
      <div class="flex items-center gap-4">
        <span class="text-sm font-semibold text-slate-100">No-Code Builder</span>
        <div class="h-5 w-px bg-slate-700" />
        <span class="text-[10px] text-slate-500">{{ COLS }}-col · {{ CELL_SIZE }}px grid · {{ state.components.length }} components</span>
        <div class="h-5 w-px bg-slate-700" />
        <button class="rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors" :class="previewMode ? 'border-blue-400 bg-blue-500/20 text-blue-200' : 'border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-slate-100'" @click="previewMode = !previewMode">
          {{ previewMode ? "Exit Preview" : "Preview" }}
        </button>
        <button class="rounded-md border border-slate-600 px-2.5 py-1 text-[11px] font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-slate-100" @click="showExport = true">View JSON</button>
        <div class="h-5 w-px bg-slate-700" />
        <!-- Undo / Redo -->
        <button
          class="flex h-7 w-7 items-center justify-center rounded-md border transition-colors"
          :class="canUndo ? 'border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-slate-100' : 'border-slate-700 text-slate-600 cursor-not-allowed'"
          :disabled="!canUndo"
          @click="undo"
          title="Undo (Ctrl+Z)"
        >
          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"/></svg>
        </button>
        <button
          class="flex h-7 w-7 items-center justify-center rounded-md border transition-colors"
          :class="canRedo ? 'border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-slate-100' : 'border-slate-700 text-slate-600 cursor-not-allowed'"
          :disabled="!canRedo"
          @click="redo"
          title="Redo (Ctrl+Y)"
        >
          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 15l6-6m0 0l-6-6m6 6H9a6 6 0 000 12h3"/></svg>
        </button>
      </div>
      <div class="flex items-center gap-2">
        <!-- Template Selector -->
        <select v-model="selectedTemplate" class="h-8 rounded-md border border-slate-600 bg-slate-800 px-2 text-[11px] text-slate-200 focus:border-blue-400 focus:outline-none" @change="onTemplateSelect">
          <option value="">— Load Template —</option>
          <option v-for="t in DEMO_TEMPLATES" :key="t.key" :value="t.key">{{ t.label }}</option>
        </select>
        <div class="h-5 w-px bg-slate-700" />
        <!-- Import -->
        <button class="flex items-center gap-1.5 rounded-md border border-slate-600 px-2.5 py-1.5 text-[11px] font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-slate-100" @click="openImportChooser" title="Import options">
          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
          </svg>
          Import
        </button>
        <!-- Export JSON -->
        <button class="flex items-center gap-1.5 rounded-md border border-slate-600 px-2.5 py-1.5 text-[11px] font-medium text-slate-300 transition-colors hover:bg-slate-800 hover:text-slate-100" @click="onExportJson" title="Export as JSON file">
          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" 
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
          </svg>   
          Export
        </button>
        <div class="h-5 w-px bg-slate-700" />
        <!-- Save -->
        <button class="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-blue-500" @click="onSave" title="Save to browser storage">
          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/></svg>
          Save
        </button>
        <!-- Clear -->
        <button class="flex items-center gap-1.5 rounded-md border border-red-500/30 bg-red-500/10 px-2.5 py-1.5 text-[11px] font-medium text-red-300 transition-colors hover:bg-red-500/20 hover:text-red-200" @click="onClear" title="Clear canvas and reset all data">
          <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
          Clear
        </button>
      </div>
    </header>

    <!-- ═══ Toast Notification ═══ -->
    <Transition name="toast-slide">
      <div v-if="toastVisible" class="fixed top-14 right-4 z-50 flex items-center gap-2 rounded-lg border px-4 py-2.5 text-xs font-medium shadow-lg backdrop-blur-sm" :class="toastType === 'success' ? 'border-emerald-500/30 bg-emerald-500/15 text-emerald-200' : toastType === 'error' ? 'border-red-500/30 bg-red-500/15 text-red-200' : 'border-blue-500/30 bg-blue-500/15 text-blue-200'">
        <svg v-if="toastType === 'success'" class="h-4 w-4 text-emerald-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>
        <svg v-else-if="toastType === 'error'" class="h-4 w-4 text-red-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
        <svg v-else class="h-4 w-4 text-blue-400" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
        {{ toastMessage }}
      </div>
    </Transition>

    <!-- ═══ Main Content Area ═══ -->
    <div class="grid flex-1 min-h-0 w-full min-w-0 grid-cols-[minmax(240px,280px)_minmax(0,1fr)_minmax(260px,320px)] gap-3 p-3">
      <!-- ═══ Left Panel ═══ -->
      <aside class="relative z-[40] flex flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
        <div class="grid grid-cols-4 gap-0.5 border-b border-slate-700 p-1.5">
          <button v-for="t in leftTabs" :key="t.key" type="button" class="rounded-md px-1 py-1.5 text-[10px] font-medium transition-colors" :class="leftTab === t.key ? 'bg-slate-700 text-slate-100' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'" @click="leftTab = t.key">{{ t.label }}</button>
        </div>
        <div class="min-h-0 flex-1 overflow-y-auto p-3">

          <!-- Library -->
          <template v-if="leftTab === 'library'">
            <div v-for="group in COMPONENT_CATALOG" :key="group.group" class="mb-4">
              <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{{ group.group }}</p>
              <div class="space-y-2">
                <button v-for="item in group.items" :key="item.type" :draggable="!previewMode" class="flex w-full items-center justify-between rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-left text-xs text-slate-200 transition-colors" :class="previewMode ? 'cursor-not-allowed opacity-50' : 'hover:border-blue-400 hover:bg-slate-700'" @dragstart="onPaletteDragStart($event, item.type)">
                  <span>{{ item.label }}</span><span class="text-slate-400">+</span>
                </button>
              </div>
            </div>
          </template>

          <!-- Nodes -->
          <template v-else-if="leftTab === 'nodes'">
            <p v-if="!nodeTreeItems.length" class="text-xs text-slate-500">No nodes on canvas.</p>
            <div v-else class="space-y-1">
              <button v-for="node in nodeTreeItems" :key="node.id" class="flex w-full items-center rounded-md border px-2 py-1.5 text-left text-xs transition-colors" :style="{ paddingLeft: `${8 + node.depth * 14}px` }" :class="selectedId === node.id ? 'border-blue-400 bg-blue-500/20 text-blue-200' : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'" @click="onSelectNode(node.id)">
                <span class="truncate">{{ node.label }}</span>
              </button>
            </div>
          </template>

          <!-- ═══ DATA Tab (State + Data Navigator) ═══ -->
          <template v-else-if="leftTab === 'dataTab'">
            <div class="mb-3 flex items-center justify-between">
              <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">State Variables</p>
              <button type="button" class="rounded border border-cyan-500/35 bg-cyan-500/15 px-2 py-1 text-[10px] font-medium text-cyan-200 hover:bg-cyan-500/25" @click.stop="addLogicVariable">+ Add</button>
            </div>
            <div v-for="v in state.logic.variables" :key="v.id" class="mb-2">
              <details open class="group rounded-lg border border-slate-700 bg-slate-800/60 [&[open]>summary_.chevron]:rotate-90">
                <summary class="flex cursor-pointer list-none items-center gap-1.5 px-2 py-1.5 marker:content-none [&::-webkit-details-marker]:hidden">
                  <span class="chevron text-[10px] text-slate-500 transition-transform">▸</span>
                  <span class="min-w-0 flex-1 truncate font-mono text-[11px] font-semibold text-slate-200">{{ v.name || 'unnamed' }}</span>
                  <span class="shrink-0 rounded border border-slate-600 bg-slate-700/60 px-1.5 py-0.5 text-[9px] text-slate-400">{{ v.type }}</span>
                  <button type="button" class="flex h-4 w-4 shrink-0 items-center justify-center rounded text-[10px] text-red-400 hover:bg-red-500/15 hover:text-red-300" title="Remove" @click.stop="removeLogicVariable(v.id)">✕</button>
                </summary>
                <div class="space-y-1.5 border-t border-slate-700 p-2">
                  <div class="flex gap-1">
                    <input v-model="v.name" class="min-w-0 flex-1 rounded border border-slate-600 bg-slate-900 px-1.5 py-1 font-mono text-[11px] text-slate-200" placeholder="Variable name" @change="updateLogicVariable(v.id, { name: v.name })" />
                    <select v-model="v.type" class="w-[72px] shrink-0 rounded border border-slate-600 bg-slate-900 px-1 py-1 text-[10px] text-slate-200" @change="updateLogicVariable(v.id, { type: v.type })">
                      <option value="string">String</option>
                      <option value="number">Number</option>
                      <option value="boolean">Boolean</option>
                      <option value="array">Array</option>
                      <option value="object">Object</option>
                    </select>
                  </div>
                  <textarea v-model="v.initialValue" rows="2" class="w-full rounded border border-slate-600 bg-slate-900 px-1.5 py-1 font-mono text-[10px] text-slate-300" placeholder='Initial value (e.g. [] or "text")' @change="updateLogicVariable(v.id, { initialValue: v.initialValue })" />
                  <span class="inline-flex items-center gap-1 rounded-full border border-cyan-500/25 bg-cyan-500/10 px-2 py-0.5 font-mono text-[9px] text-cyan-300">@state.{{ v.name }}</span>
                </div>
              </details>
            </div>
            <p v-if="!state.logic.variables.length" class="mb-3 rounded border border-dashed border-slate-700 p-3 text-center text-xs text-slate-500">No variables. Click + Add.</p>

            <details open class="mb-2 rounded-lg border border-slate-700 bg-slate-800/40 [&[open]>summary_.chevron]:rotate-90">
              <summary class="flex cursor-pointer list-none items-center gap-1.5 px-2 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400 marker:content-none [&::-webkit-details-marker]:hidden">
                <span class="chevron text-[10px] text-slate-500 transition-transform">▸</span> Data Navigator
              </summary>
              <div class="border-t border-slate-700 p-2">
                <p v-if="!visibleDataPathTreeItems.length" class="text-xs text-slate-500">No paths yet.</p>
                <div v-else class="space-y-1">
                  <button v-for="item in visibleDataPathTreeItems" :key="item.path" type="button" class="flex w-full items-center gap-1 rounded-md border px-2 py-1.5 text-left text-xs font-mono transition-colors" :style="{ paddingLeft: `${8 + item.depth * 14}px` }" :class="activeDataPath === item.path ? 'border-cyan-500 bg-cyan-500/15 text-cyan-200' : 'border-slate-700 bg-slate-800 text-cyan-300 hover:border-cyan-500 hover:bg-slate-700'" @click="onOpenDataPreview(item.path)">
                    <span class="inline-flex h-4 w-4 items-center justify-center rounded text-[10px] text-slate-300 hover:bg-slate-700" @click.stop="toggleDataTree(item.path)">
                      {{ item.hasChildren ? (expandedDataPaths.has(item.path) ? '▾' : '▸') : '·' }}
                    </span>
                    <span class="truncate">{{ item.label }}</span>
                  </button>
                </div>
              </div>
            </details>
          </template>

          <!-- ═══ ORDER EVENT Tab ═══ -->
          <template v-else-if="leftTab === 'orderEvent'">
            <div class="mb-3 flex items-center justify-between">
              <p class="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Order Events</p>
              <button type="button" class="rounded border border-violet-500/35 bg-violet-500/15 px-2 py-1 text-[10px] font-medium text-violet-200 hover:bg-violet-500/25" @click="addOrderEvent">+ Add</button>
            </div>

            <div v-for="oe in state.logic.orderEvents" :key="oe.id" class="mb-2">
              <details open class="group rounded-lg border border-slate-700 bg-slate-800/60 [&[open]>summary_.chevron]:rotate-90">
                <summary class="flex cursor-pointer list-none items-center gap-1.5 px-2 py-1.5 marker:content-none [&::-webkit-details-marker]:hidden">
                  <span class="chevron text-[10px] text-slate-500 transition-transform">▸</span>
                  <input v-model="oe.name" class="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 py-0.5 text-[11px] font-semibold text-slate-200 outline-none hover:border-slate-600 focus:border-slate-500 focus:bg-slate-900" placeholder="Event Name" @click.stop />
                  <input v-model="oe.eventCode" class="w-[72px] shrink-0 rounded border border-violet-500/30 bg-violet-500/10 px-1.5 py-0.5 text-center font-mono text-[9px] font-semibold text-violet-300 outline-none focus:border-violet-400" placeholder="CODE" @click.stop />
                  <button type="button" class="flex h-4 w-4 shrink-0 items-center justify-center rounded text-[10px] text-red-400 hover:bg-red-500/15 hover:text-red-300" title="Remove" @click.stop="removeOrderEvent(oe.id)">✕</button>
                </summary>
                <div class="space-y-2.5 border-t border-slate-700 p-2">
                  <!-- Request DTO JSON -->
                  <div>
                    <div class="mb-1 flex items-center justify-between">
                      <p class="text-[10px] font-semibold uppercase tracking-wide text-slate-500">Request DTO (JSON)</p>
                      <span class="rounded bg-slate-700/60 px-1 py-0.5 text-[9px] text-slate-500">predefined</span>
                    </div>
                    <textarea v-model="oe.requestDtoJson" rows="4" class="w-full rounded border border-slate-600 bg-slate-900 px-1.5 py-1 font-mono text-[10px] leading-relaxed text-slate-300 outline-none focus:border-blue-500" placeholder='{ "field": "" }' />
                  </div>

                  <!-- Field Mapping -->
                  <div>
                    <p class="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Field Mapping → DTO</p>
                    <p class="mb-1 text-[9px] leading-snug text-slate-500">
                      <span class="font-mono text-blue-400">$fieldId.value</span>
                      <span class="text-slate-600"> · </span>
                      <span class="font-mono text-cyan-400">@state.var</span>
                    </p>
                    <textarea v-model="oe.requestMapping" rows="3" class="w-full rounded border border-slate-600 bg-slate-900 px-1.5 py-1 font-mono text-[10px] leading-relaxed text-slate-300 outline-none focus:border-blue-500" placeholder="customer_name:$customer_name.value" />
                  </div>

                  <!-- Response Mapping -->
                  <div>
                    <p class="mb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">Response → State</p>
                    <p class="mb-1 text-[9px] leading-snug text-slate-500">응답 경로의 값을 State Variable에 저장</p>
                    <div class="flex items-center gap-1">
                      <input v-model="oe.onSuccessPath" class="min-w-0 flex-1 rounded border border-slate-600 bg-slate-900 px-1.5 py-1 font-mono text-[10px] text-slate-200 outline-none placeholder:text-slate-500 focus:border-blue-500" placeholder="data.list" />
                      <span class="shrink-0 text-[10px] text-slate-500">→</span>
                      <select v-model="oe.onSuccessVariable" class="min-w-0 flex-1 rounded border border-slate-600 bg-slate-900 px-1.5 py-1 font-mono text-[10px] text-slate-200 outline-none focus:border-blue-500">
                        <option value="">— variable —</option>
                        <option v-for="sv in state.logic.variables" :key="sv.id" :value="sv.name">{{ sv.name }}</option>
                      </select>
                    </div>
                  </div>
                </div>
              </details>
            </div>

            <p v-if="!state.logic.orderEvents.length" class="rounded border border-dashed border-slate-700 p-4 text-center text-xs text-slate-500">No Order Events defined.</p>
          </template>
        </div>
      </aside>

      <!-- ═══ Canvas ═══ -->
      <main id="canvas-root" class="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
        <div class="relative flex-1 overflow-auto bg-slate-950" @click="deselectAll()">
          <div class="mx-auto" :style="{ width: `${CANVAS_WIDTH}px` }">
            <div class="relative rounded-xl border border-slate-700 bg-slate-900" :class="previewMode ? '' : 'canvas-grid'" :style="{ height: canvasRows * CELL_SIZE + 'px' }" @click.stop="deselectAll()" @dragover.prevent @drop.prevent="onCanvasDrop">
              <BuilderNode v-for="comp in rootComponents" :key="comp.id" :component="comp" :cols="COLS" :rows="canvasRows" @open-data-preview="onOpenDataPreview" />
            </div>
          </div>
        </div>
      </main>

      <!-- ═══ Property Editor ═══ -->
      <aside class="relative z-[40] flex flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
        <div class="border-b border-slate-700 p-4">
          <h2 class="text-sm font-semibold text-slate-100">Property Editor</h2>
          <p class="mt-1 text-xs text-slate-400">{{ selectedComponent ? typeLabel(selectedComponent.type) : 'Select a component to edit.' }}</p>
        </div>
        <div class="h-[calc(100%-73px)] overflow-y-auto p-3">
          <div v-if="selectedComponent" :key="selectedComponent.id">

            <!-- ── 기본 식별자 필드 (항상 노출) ── -->
            <div class="mb-3 rounded-md bg-slate-900/60 px-3 py-2.5 ring-1 ring-slate-700/80">

              <!-- 헤더 행: 라벨 + 참조 뱃지 + 편집 버튼 -->
              <div class="mb-1.5 flex items-center gap-1.5">
                <span class="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Field ID</span>
                <!-- 참조 카운터 뱃지 -->
                <span
                  v-if="fieldIdRefCount > 0"
                  class="rounded-full bg-cyan-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-cyan-300 ring-1 ring-cyan-500/30"
                  :title="`Referenced by ${fieldIdRefCount} other component(s)`"
                >
                  ⟨/⟩ {{ fieldIdRefCount }}
                </span>
                <span v-else class="rounded-full bg-slate-700/50 px-1.5 py-0.5 text-[9px] text-slate-500">no refs</span>
                <button
                  v-if="!fieldIdEditing"
                  class="ml-auto rounded px-1.5 py-0.5 text-[10px] text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                  title="Rename Field ID"
                  @click="fieldIdEditing = true"
                >✎ rename</button>
              </div>

              <!-- 읽기 모드 -->
              <div v-if="!fieldIdEditing" class="flex items-center gap-2">
                <code class="flex-1 rounded bg-slate-800 px-2 py-1 font-mono text-[12px] text-cyan-300">
                  {{ selectedComponent.props.fieldId }}
                </code>
              </div>

              <!-- 편집 모드 -->
              <div v-else class="space-y-1.5">
                <input
                  :value="fieldIdDraft"
                  autofocus
                  spellcheck="false"
                  class="h-8 w-full rounded border bg-slate-900 px-2 font-mono text-[12px] text-slate-100 outline-none focus:ring-1"
                  :class="fieldIdError
                    ? 'border-red-500/70 focus:ring-red-500/40'
                    : 'border-cyan-500/50 focus:ring-cyan-500/40'"
                  @input="onFieldIdInput($event.target.value)"
                  @keydown.enter.prevent="commitFieldId"
                  @keydown.escape.prevent="cancelFieldId"
                />
                <!-- 에러 메시지 -->
                <p v-if="fieldIdError" class="flex items-center gap-1 text-[10px] text-red-400">
                  <span>⚠</span> {{ fieldIdError }}
                </p>
                <!-- 참조 영향 경고 -->
                <p v-else-if="fieldIdRefCount > 0" class="flex items-center gap-1 text-[10px] text-amber-300/80">
                  <span>↻</span> {{ fieldIdRefCount }} reference(s) will be auto-updated.
                </p>
                <!-- 액션 버튼 -->
                <div class="flex gap-1.5">
                  <button
                    class="flex-1 rounded border py-1 text-[10px] font-semibold transition-colors"
                    :class="fieldIdError
                      ? 'cursor-not-allowed border-slate-700 text-slate-500'
                      : 'border-cyan-600 bg-cyan-600/20 text-cyan-200 hover:bg-cyan-600/30'"
                    :disabled="!!fieldIdError"
                    @click="commitFieldId"
                  >✓ Apply</button>
                  <button
                    class="rounded border border-slate-600 px-3 py-1 text-[10px] text-slate-400 hover:bg-slate-700 hover:text-slate-200"
                    @click="cancelFieldId"
                  >✕</button>
                </div>
              </div>

            </div>

            <!-- ── Label (Field ID 바로 아래, container·label·divider·card-list-repeater·data-grid 타입 제외) ── -->
            <template v-if="!['container','label','divider','card-list-repeater','data-grid'].includes(selectedComponent.type)">
              <div class="mb-3 rounded-md bg-slate-900/40 px-2.5 py-2 ring-1 ring-slate-700/60">
                <FieldText label="Label" :model-value="selectedComponent.props.label" @update:model-value="(v) => p('label', v)" />
              </div>
            </template>

            <!-- ── Collapsible sections ── -->
            <div class="space-y-1.5">

              <!-- ── Component Identity ── -->
              <details class="group rounded-md border border-slate-600 bg-slate-800/80 [&[open]>summary_.chevron]:rotate-90">
                <summary class="flex cursor-pointer list-none items-center gap-2 px-2.5 py-2 marker:content-none [&::-webkit-details-marker]:hidden">
                  <span class="chevron inline-block text-[10px] text-slate-400 transition-transform duration-150">▸</span>
                  <span class="text-[10px] font-bold uppercase tracking-widest text-slate-300">Component Identity</span>
                </summary>
                <div class="space-y-2 border-t border-slate-700 px-2.5 py-2.5">
                  <label class="block text-xs text-slate-300">
                    <span class="mb-0.5 block font-medium text-slate-400">Parent (fieldId)</span>
                    <select class="h-8 w-full rounded-md border border-slate-600 bg-slate-800 px-2 text-xs text-slate-100" :value="selectedComponent.parentFieldId || ''" @change="onParentChange($event)">
                      <option v-for="opt in parentSelectOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                    </select>
                  </label>
                  <div>
                    <p class="mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">Layout (grid cells)</p>
                    <div class="grid grid-cols-4 items-center gap-1.5">
                      <label class="flex items-center gap-1">
                        <span class="text-[9px] text-slate-500">x</span>
                        <input type="number" class="h-7 w-12 rounded border border-slate-600 bg-slate-900 px-1 text-[10px] text-slate-200 outline-none" :value="layoutEditor.x" @input="patchGridPos({ x: Number(($event.target).value) })" />
                      </label>
                      <label class="flex items-center gap-1">
                        <span class="text-[9px] text-slate-500">y</span>
                        <input type="number" class="h-7 w-12 rounded border border-slate-600 bg-slate-900 px-1 text-[10px] text-slate-200 outline-none" :value="layoutEditor.y" @input="patchGridPos({ y: Number(($event.target).value) })" />
                      </label>
                      <label class="flex items-center gap-1">
                        <span class="text-[9px] text-slate-500">w</span>
                        <input type="number" class="h-7 w-12 rounded border border-slate-600 bg-slate-900 px-1 text-[10px] text-slate-200 outline-none" :value="layoutEditor.w" @input="patchGridPos({ w: Number(($event.target).value) })" />
                      </label>
                      <label class="flex items-center gap-1">
                        <span class="text-[9px] text-slate-500">h</span>
                        <input type="number" class="h-7 w-12 rounded border border-slate-600 bg-slate-900 px-1 text-[10px] text-slate-200 outline-none" :value="layoutEditor.h" @input="patchGridPos({ h: Number(($event.target).value) })" />
                      </label>
                    </div>
                  </div>
                </div>
              </details>

              <!-- ── Display & Access Logic ── -->
              <details class="group rounded-md border border-slate-600 bg-slate-800/80 [&[open]>summary_.chevron]:rotate-90">
                <summary class="flex cursor-pointer list-none items-center gap-2 px-2.5 py-2 marker:content-none [&::-webkit-details-marker]:hidden">
                  <span class="chevron inline-block text-[10px] text-slate-400 transition-transform duration-150">▸</span>
                  <span class="text-[10px] font-bold uppercase tracking-widest text-slate-300">Display &amp; Access Logic</span>
                </summary>
                <div class="space-y-2 border-t border-slate-700 px-2.5 py-2.5">
                  <label class="block text-xs text-slate-300">
                    <span class="mb-0.5 block font-medium text-slate-400">hiddenCon</span>
                    <textarea :value="selectedComponent.props.hiddenCon ?? ''" rows="2" class="w-full rounded-md border border-slate-600 bg-slate-900 px-2 py-1 font-mono text-[11px] text-slate-200" placeholder="e.g. {{$state.flag}} or true" @input="p('hiddenCon', $event.target.value)" />
                  </label>
                  <label class="block text-xs text-slate-300">
                    <span class="mb-0.5 block font-medium text-slate-400">readonlyCon</span>
                    <textarea :value="selectedComponent.props.readonlyCon ?? ''" rows="2" class="w-full rounded-md border border-slate-600 bg-slate-900 px-2 py-1 font-mono text-[11px] text-slate-200" placeholder="Expression when read-only in preview" @input="p('readonlyCon', $event.target.value)" />
                  </label>
                </div>
              </details>

              <!-- ── Alignment (container·divider·card-list-repeater·data-grid 타입 제외) ── -->
              <details
                v-if="!['container','divider','card-list-repeater','data-grid'].includes(selectedComponent.type)"
                class="group rounded-md border border-slate-600 bg-slate-800/80 [&[open]>summary_.chevron]:rotate-90"
              >
                <summary class="flex cursor-pointer list-none items-center gap-2 px-2.5 py-2 marker:content-none [&::-webkit-details-marker]:hidden">
                  <span class="chevron inline-block text-[10px] text-slate-400 transition-transform duration-150">▸</span>
                  <span class="text-[10px] font-bold uppercase tracking-widest text-slate-300">Alignment</span>
                </summary>
                <div class="space-y-2 border-t border-slate-700 px-2.5 py-2.5">
                  <FieldSelect label="Horizontal" :model-value="selectedComponent.props.hAlign" :options="['left','center','right']" @update:model-value="(v) => p('hAlign', v)" />
                  <FieldSelect v-if="selectedComponent.type !== 'accordion'" label="Vertical" :model-value="selectedComponent.props.vAlign" :options="['top','middle','bottom']" @update:model-value="(v) => p('vAlign', v)" />
                </div>
              </details>

              <!-- ── Data Grid: H Align만 표시 ── -->
              <details
                v-if="selectedComponent.type === 'data-grid'"
                class="group rounded-md border border-slate-600 bg-slate-800/80 [&[open]>summary_.chevron]:rotate-90"
              >
                <summary class="flex cursor-pointer list-none items-center gap-2 px-2.5 py-2 marker:content-none [&::-webkit-details-marker]:hidden">
                  <span class="chevron inline-block text-[10px] text-slate-400 transition-transform duration-150">▸</span>
                  <span class="text-[10px] font-bold uppercase tracking-widest text-slate-300">Alignment</span>
                </summary>
                <div class="space-y-2 border-t border-slate-700 px-2.5 py-2.5">
                  <FieldSelect label="Horizontal" :model-value="selectedComponent.props.hAlign" :options="['left','center','right']" @update:model-value="(v) => p('hAlign', v)" />
                </div>
              </details>

              <!-- ── Events ── -->
              <details class="group rounded-md border border-slate-600 bg-slate-800/80 [&[open]>summary_.chevron]:rotate-90">
                <summary class="flex cursor-pointer list-none items-center gap-2 px-2.5 py-2 marker:content-none [&::-webkit-details-marker]:hidden">
                  <span class="chevron inline-block text-[10px] text-slate-400 transition-transform duration-150">▸</span>
                  <span class="text-[10px] font-bold uppercase tracking-widest text-slate-300">Events</span>
                  <span v-if="totalEventCount > 0" class="ml-auto rounded-full bg-blue-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-blue-300 ring-1 ring-blue-500/30">{{ totalEventCount }}</span>
                </summary>
                <div class="space-y-2.5 border-t border-slate-700 px-2.5 py-2.5">
                  <div>
                    <label class="mb-0.5 block text-[9px] font-semibold text-slate-500">onPageLoad</label>
                    <EventActionEditor :actions="currentEvents.onPageLoad" :order-events="state.logic.orderEvents" :variables="state.logic.variables" @update="(a) => setEventActions('onPageLoad', a)" />
                  </div>
                  <div v-if="['action-button','card-list-repeater'].includes(selectedComponent.type)">
                    <label class="mb-0.5 block text-[9px] font-semibold text-slate-500">onClick</label>
                    <EventActionEditor :actions="currentEvents.onClick" :order-events="state.logic.orderEvents" :variables="state.logic.variables" @update="(a) => setEventActions('onClick', a)" />
                  </div>
                  <div v-if="['text-input','combo-box','radio-group','checkbox-group','date-picker'].includes(selectedComponent.type)">
                    <label class="mb-0.5 block text-[9px] font-semibold text-slate-500">onChange</label>
                    <EventActionEditor :actions="currentEvents.onChange" :order-events="state.logic.orderEvents" :variables="state.logic.variables" @update="(a) => setEventActions('onChange', a)" />
                  </div>
                </div>
              </details>

              <!-- ── 타입별 속성 필드 ── -->
              <div class="space-y-2 rounded-md bg-slate-900/40 px-2.5 py-2.5 ring-1 ring-slate-700/60">

              <!-- Container -->
              <template v-if="selectedComponent.type === 'container'">
                <FieldCheck label="Show border" :model-value="selectedComponent.props.showBorder" @update:model-value="(v) => p('showBorder', v)" />
                <FieldCheck label="Show background" :model-value="selectedComponent.props.showBackground" @update:model-value="(v) => p('showBackground', v)" />
                <FieldNumber label="Padding (px)" :model-value="selectedComponent.props.padding" @update:model-value="(v) => p('padding', v)" />
                <FieldColor v-if="selectedComponent.props.showBackground !== false" label="Background color" :model-value="selectedComponent.props.bgColor" @update:model-value="(v) => p('bgColor', v)" />
              </template>

              <!-- Label -->
              <template v-if="selectedComponent.type === 'label'">
                <FieldText label="Text" :model-value="selectedComponent.props.text" @update:model-value="(v) => p('text', v)" />
                <FieldSelect label="Icon" :model-value="selectedComponent.props.icon" :options="['none','folder','user','settings','star','list','chart']" @update:model-value="(v) => p('icon', v)" />
                <FieldSelect label="Preset" :model-value="selectedComponent.props.preset" :options="['h1','h2','h3','body','small']" @update:model-value="(v) => p('preset', v)" />
                <FieldNumber label="Custom font size (0 = preset)" :model-value="selectedComponent.props.customFontSize" @update:model-value="(v) => p('customFontSize', v)" />
                <FieldColor label="Color" :model-value="selectedComponent.props.color" @update:model-value="(v) => p('color', v)" />
                <FieldSelect label="Font weight" :model-value="selectedComponent.props.fontWeight" :options="['normal','bold','extrabold']" @update:model-value="(v) => p('fontWeight', v)" />
              </template>

              <!-- Accordion -->
              <template v-if="selectedComponent.type === 'accordion'">
                <FieldText label="Accordion Title" :model-value="selectedComponent.props.title" @update:model-value="(v) => p('title', v)" />
                <FieldText label="Panels (comma-separated)" :model-value="selectedComponent.props.panels" @update:model-value="(v) => p('panels', v)" />
              </template>

              <!-- Text Input -->
              <template v-if="selectedComponent.type === 'text-input'">
                <FieldText label="Placeholder" :model-value="selectedComponent.props.placeholder" @update:model-value="(v) => p('placeholder', v)" />
                <FieldSelect label="Input Type" :model-value="selectedComponent.props.inputType" :options="['text','number','email','tel','password']" @update:model-value="(v) => p('inputType', v)" />
                <FieldNumber label="Max Length" :model-value="selectedComponent.props.maxLength" @update:model-value="(v) => p('maxLength', v)" />
                <FieldText label="Input Mask" :model-value="selectedComponent.props.mask" @update:model-value="(v) => p('mask', v)" />
              </template>

              <!-- Combo / Radio / Checkbox -->
              <template v-if="selectedComponent.type === 'combo-box' || selectedComponent.type === 'radio-group' || selectedComponent.type === 'checkbox-group'">
                <FieldText label="Options (comma-separated)" :model-value="selectedComponent.props.options" @update:model-value="(v) => p('options', v)" />
              </template>

              <!-- Data Fact -->
              <template v-if="selectedComponent.type === 'data-fact'">
                <FieldText label="Value" :model-value="selectedComponent.props.value" @update:model-value="(v) => p('value', v)" />
                <FieldSelect label="Display" :model-value="selectedComponent.props.displayMode" :options="['side-by-side','stacked']" @update:model-value="(v) => p('displayMode', v)" />
                <FieldText label="Data Path (@state.… or @apiData.…)" :model-value="selectedComponent.props.dataPath" @update:model-value="(v) => p('dataPath', v)" />
                <FieldText label="Value Path (alternate bind)" :model-value="selectedComponent.props.valuePath" @update:model-value="(v) => p('valuePath', v)" />
                <FieldColor label="Background Color" :model-value="selectedComponent.props.bgColor" @update:model-value="(v) => p('bgColor', v)" />
              </template>

              <!-- Status Badge -->
              <template v-if="selectedComponent.type === 'status-badge'">
                <FieldSelect label="Tone" :model-value="selectedComponent.props.tone" :options="['default','success','warning','error']" @update:model-value="(v) => p('tone', v)" />
              </template>

              <!-- Divider -->
              <template v-if="selectedComponent.type === 'divider'">
                <FieldSelect label="Orientation" :model-value="selectedComponent.props.orientation" :options="['horizontal','vertical']" @update:model-value="(v) => p('orientation', v)" />
                <FieldColor label="Color" :model-value="selectedComponent.props.color" @update:model-value="(v) => p('color', v)" />
                <FieldNumber label="Thickness (px)" :model-value="selectedComponent.props.thickness" @update:model-value="(v) => p('thickness', v)" />
              </template>

              <!-- Button -->
              <template v-if="selectedComponent.type === 'action-button'">
                <FieldSelect label="Action Type" :model-value="selectedComponent.props.actionType" :options="['submit','navigate','api-call','open-modal']" @update:model-value="(v) => p('actionType', v)" />
                <FieldSelect label="Icon" :model-value="selectedComponent.props.icon" :options="['none','search','plus','edit','delete','check','arrow','download','refresh','save']" @update:model-value="(v) => p('icon', v)" />
                <FieldSelect label="Color Preset" :model-value="selectedComponent.props.colorPreset" :options="['primary','secondary','success','danger','warning','dark','custom']" @update:model-value="(v) => p('colorPreset', v)" />
                <template v-if="selectedComponent.props.colorPreset === 'custom'">
                  <FieldColor label="Background Color" :model-value="selectedComponent.props.customBgColor" @update:model-value="(v) => p('customBgColor', v)" />
                  <FieldColor label="Text Color" :model-value="selectedComponent.props.customTextColor" @update:model-value="(v) => p('customTextColor', v)" />
                </template>
                <div class="rounded-md border border-slate-700 bg-slate-800/40 p-2">
                  <p class="mb-2 text-[10px] font-medium uppercase tracking-wide text-slate-400">Parameter Mapping</p>
                  <FieldText label="Params (key:$fieldId.value, ...)" :model-value="selectedComponent.props.params" @update:model-value="(v) => p('params', v)" />
                  <div v-if="parsedParams.length" class="mt-2 space-y-1">
                    <div v-for="pm in parsedParams" :key="pm.key" class="flex items-center gap-1 rounded border border-slate-600/80 bg-slate-900/60 px-2 py-1 text-[10px]">
                      <span class="font-mono font-semibold text-cyan-300">{{ pm.key }}</span>
                      <span class="text-slate-500">&rarr;</span>
                      <span class="font-mono text-slate-300">{{ pm.value }}</span>
                    </div>
                  </div>
                  <div v-if="bindingPills.length" class="mt-2 flex flex-wrap gap-1">
                    <span v-for="pill in bindingPills" :key="pill" class="cursor-pointer rounded-full border border-slate-600 bg-slate-900 px-1.5 py-0.5 font-mono text-[8px] text-cyan-300 hover:border-cyan-500 hover:bg-cyan-500/10" @click="copyToClipboard(pill)">{{ pill }}</span>
                  </div>
                </div>
              </template>

              <!-- Data Grid -->
              <template v-if="selectedComponent.type === 'data-grid'">
                <FieldText label="Data Source (@state.varName or @apiData.…)" :model-value="selectedComponent.props.dataSourcePath" @update:model-value="(v) => p('dataSourcePath', v)" />
                <div class="rounded-md border border-slate-700 bg-slate-800/40 p-2">
                  <div class="mb-2 flex items-center justify-between gap-2">
                    <p class="text-[10px] font-medium uppercase tracking-wide text-slate-400">Column Definitions</p>
                    <button type="button" class="shrink-0 rounded border border-cyan-500/35 bg-cyan-500/15 px-2 py-0.5 text-[10px] font-medium text-cyan-200 hover:bg-cyan-500/25" @click="addGridColumn">+ Add</button>
                  </div>
                  <div class="space-y-1.5">
                    <div v-for="(col, ci) in gridColumns" :key="ci" class="flex items-center gap-1">
                      <input :value="col.header" placeholder="Header" class="h-7 w-1/2 rounded border border-slate-600 bg-slate-900 px-1.5 text-[11px] text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30" @input="(e) => updateGridColumn(ci, 'header', e.target.value)" />
                      <input :value="col.field" placeholder="field" class="h-7 w-1/2 rounded border border-slate-600 bg-slate-900 px-1.5 font-mono text-[11px] text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30" @input="(e) => updateGridColumn(ci, 'field', e.target.value)" />
                      <button type="button" class="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-transparent text-red-400 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300" @click="removeGridColumn(ci)">✕</button>
                    </div>
                    <p v-if="!gridColumns.length" class="text-center text-[10px] text-slate-500">No columns defined</p>
                  </div>
                </div>
                <FieldSelect label="Selection Mode" :model-value="selectedComponent.props.selectionMode" :options="['none','single','multiple']" @update:model-value="(v) => p('selectionMode', v)" />
                <div class="rounded-md border border-slate-700 bg-slate-800/40 p-2">
                  <p class="mb-2 text-[10px] font-medium uppercase tracking-wide text-slate-400">Feature Toggles</p>
                  <div class="space-y-2">
                    <FieldCheck label="Read Only" :model-value="selectedComponent.props.isReadOnly" @update:model-value="(v) => p('isReadOnly', v)" />
                    <FieldCheck label="Editable" :model-value="selectedComponent.props.isEditable" @update:model-value="(v) => p('isEditable', v)" />
                    <FieldCheck label="Allow Add Row" :model-value="selectedComponent.props.allowAddRow" @update:model-value="(v) => p('allowAddRow', v)" />
                    <FieldCheck label="Allow Delete Row" :model-value="selectedComponent.props.allowDeleteRow" @update:model-value="(v) => p('allowDeleteRow', v)" />
                  </div>
                </div>
                <div class="rounded-md border border-slate-700 bg-slate-800/40 p-2">
                  <p class="mb-2 text-[10px] font-medium uppercase tracking-wide text-slate-400">Pagination</p>
                  <div class="space-y-2">
                    <FieldCheck label="Enable Pagination" :model-value="selectedComponent.props.pagination" @update:model-value="(v) => p('pagination', v)" />
                    <FieldNumber label="Page Size" :model-value="selectedComponent.props.pageSize" @update:model-value="(v) => p('pageSize', v)" />
                  </div>
                </div>
              </template>

              <!-- Card List Repeater -->
              <template v-if="selectedComponent.type === 'card-list-repeater'">
                <FieldText label="Data Source (@state.varName or @apiData.…)" :model-value="selectedComponent.props.dataSourcePath" @update:model-value="(v) => p('dataSourcePath', v)" />
                <FieldText label="Card Title" :model-value="selectedComponent.props.cardTitle" @update:model-value="(v) => p('cardTitle', v)" />
                <FieldText label="Card Badge" :model-value="selectedComponent.props.cardBadge" @update:model-value="(v) => p('cardBadge', v)" />
                <FieldText label="Card Price" :model-value="selectedComponent.props.cardPrice" @update:model-value="(v) => p('cardPrice', v)" />
                <FieldText label="Price Unit" :model-value="selectedComponent.props.cardPriceUnit" @update:model-value="(v) => p('cardPriceUnit', v)" />
                <FieldText label="Description" :model-value="selectedComponent.props.cardDescription" @update:model-value="(v) => p('cardDescription', v)" />
                <FieldText label="Facts (Key: Val, ...)" :model-value="selectedComponent.props.cardFacts" @update:model-value="(v) => p('cardFacts', v)" />
                <FieldText label="Button Text" :model-value="selectedComponent.props.cardButtonText" @update:model-value="(v) => p('cardButtonText', v)" />
                <FieldColor label="Accent Color" :model-value="selectedComponent.props.accentColor" @update:model-value="(v) => p('accentColor', v)" />
                <FieldNumber label="Card Width (px)" :model-value="selectedComponent.props.cardWidth ?? 240" @update:model-value="(v) => p('cardWidth', v)" :min="100" :max="600" />
                <FieldNumber label="Card Height (px, 0=auto)" :model-value="selectedComponent.props.cardHeight ?? 0" @update:model-value="(v) => p('cardHeight', v)" :min="0" :max="800" />
              </template>

              <!-- Date Picker -->
              <template v-if="selectedComponent.type === 'date-picker'">
                <FieldText label="Placeholder" :model-value="selectedComponent.props.placeholder" @update:model-value="(v) => p('placeholder', v)" />
                <FieldText label="Date Format" :model-value="selectedComponent.props.dateFormat" @update:model-value="(v) => p('dateFormat', v)" />
              </template>

              </div><!-- /타입별 속성 필드 -->
            </div><!-- /Collapsible sections -->
          </div><!-- /v-if selectedComponent -->
          <div v-else class="flex h-full items-center justify-center">
            <p class="text-center text-sm text-slate-400">Click a component on the canvas<br />to edit its properties.</p>
          </div>
        </div><!-- /h-[calc...] -->
      </aside>
    </div>

    <!-- Data Preview Modal -->
    <div v-if="isDataPreviewOpen" class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4" @click.self="closeDataPreview">
      <div class="w-full max-w-4xl overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl" @click.stop>
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-slate-700 px-4 py-3">
          <div class="min-w-0 flex-1">
            <h3 class="text-sm font-semibold text-slate-100">Data Preview</h3>
            <p class="mt-0.5 truncate font-mono text-xs text-cyan-300/90">{{ activeDataPath || "—" }}</p>
          </div>
          <div class="flex shrink-0 items-center gap-2">
            <div class="flex items-center rounded border border-slate-600 bg-slate-800 p-0.5">
              <button type="button" class="rounded px-2 py-0.5 text-[11px] transition-colors" :class="dataPreviewViewMode === 'json' ? 'bg-slate-700 text-slate-100' : 'text-slate-300 hover:bg-slate-700'" @click="dataPreviewViewMode = 'json'">JSON</button>
              <button type="button" class="rounded px-2 py-0.5 text-[11px] transition-colors disabled:cursor-not-allowed disabled:opacity-40" :class="dataPreviewViewMode === 'table' ? 'bg-slate-700 text-slate-100' : 'text-slate-300 hover:bg-slate-700'" :disabled="!canShowTable" @click="dataPreviewViewMode = 'table'">Table</button>
            </div>
            <button type="button" class="rounded border border-slate-600 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800" @click="closeDataPreview">Close</button>
          </div>
        </div>
        <div class="max-h-[70vh] overflow-auto">
          <table v-if="activePreviewMode === 'table'" class="w-full min-w-full border-collapse text-xs">
            <thead class="sticky top-0 z-[1] bg-slate-800 text-slate-300">
              <tr><th v-for="col in previewColumns" :key="col" class="border-b border-r border-slate-700 px-2 py-1.5 text-left font-semibold">{{ col }}</th></tr>
            </thead>
            <tbody>
              <tr v-for="(row, ri) in previewRows" :key="ri" class="odd:bg-slate-900 even:bg-slate-800/70">
                <td v-for="col in previewColumns" :key="`${ri}-${col}`" class="max-w-[260px] border-b border-r border-slate-800 px-2 py-1 align-top text-slate-200">{{ formatCellValue(row[col]) }}</td>
              </tr>
            </tbody>
          </table>
          <pre v-else class="p-4 text-xs text-emerald-300">{{ previewJson }}</pre>
        </div>
      </div>
    </div>

    <!-- Import Chooser Modal -->
    <div v-if="importChooserOpen" class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4" @click.self="importChooserOpen = false">
      <div class="w-full max-w-md overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl" @click.stop>
        <div class="border-b border-slate-700 px-4 py-3">
          <h3 class="text-sm font-semibold text-slate-100">Import</h3>
          <p class="mt-1 text-xs text-slate-400">Choose how to create or load your screen.</p>
        </div>
        <div class="space-y-2 p-4">
          <button
            class="flex w-full items-center gap-3 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2 text-left text-xs text-slate-200 transition-colors hover:border-blue-400 hover:bg-slate-700"
            @click="chooseImportJson"
          >
            <svg class="h-4 w-4 text-blue-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 16V4m0 12l-4-4m4 4l4-4M4 20h16" />
            </svg>
            <span class="font-medium">Import JSON File</span>
          </button>
          <button
            class="flex w-full items-center gap-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-left text-xs text-cyan-200 transition-colors hover:bg-cyan-500/20"
            :disabled="aiBusy"
            @click="chooseImportAi"
          >
            <svg class="h-4 w-4 text-cyan-300" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 3l1.8 3.7L18 8.5l-3 2.9.7 4.1L12 13.8l-3.7 1.7.7-4.1-3-2.9 4.2-1.8L12 3z" />
            </svg>
            <span class="font-medium">Build with AI</span>
          </button>
        </div>
      </div>
    </div>

    <!-- JSON Export Modal -->
    <div v-if="showExport" class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4" @click.self="showExport = false">
      <div class="w-full max-w-4xl overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-700 px-4 py-3">
          <h3 class="text-sm font-semibold text-slate-100">Builder JSON Export</h3>
          <div class="flex items-center gap-2">
            <button class="rounded border border-slate-600 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800" @click="copyJsonExport">Copy</button>
            <button class="rounded border border-slate-600 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800" @click="onExportJson">Download</button>
            <button class="rounded border border-slate-600 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800" @click="showExport = false">Close</button>
          </div>
        </div>
        <pre class="max-h-[70vh] overflow-auto bg-slate-950 p-4 text-xs text-emerald-300">{{ jsonExport }}</pre>
      </div>
    </div>

    <!-- AI Build Modal -->
    <div v-if="aiOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" @click.self="!aiBusy && (aiOpen = false)">
      <div class="w-full max-w-3xl overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl" @click.stop>

        <!-- Header -->
        <div class="relative flex items-center justify-between border-b border-slate-700 px-4 py-3 overflow-hidden">
          <div v-if="aiBusy" class="absolute inset-x-0 top-0 h-0.5 ai-scan-line" />
          <div class="flex items-center gap-2">
            <span class="relative flex h-5 w-5 items-center justify-center">
              <span v-if="aiBusy" class="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-30" />
              <svg class="relative h-4 w-4" :class="aiBusy ? 'text-cyan-300' : 'text-cyan-500'" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3l1.8 3.7L18 8.5l-3 2.9.7 4.1L12 13.8l-3.7 1.7.7-4.1-3-2.9 4.2-1.8L12 3z" />
              </svg>
            </span>
            <h3 class="text-sm font-semibold" :class="aiBusy ? 'text-cyan-200' : 'text-slate-100'">AI Screen Builder</h3>
          </div>
          <button class="rounded border border-slate-600 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed" @click="aiOpen = false" :disabled="aiBusy">Close</button>
        </div>

        <!-- Body -->
        <div class="p-4 space-y-4">

          <!-- Input area -->
          <template v-if="!aiBusy">
            <p class="text-xs text-slate-400">
              Describe what you want. Example: &quot;가입자를 조회하는 화면을 만들어줘. 전화번호를 검색하면 사용자의 이름과 요금제 정보를 보여줘.&quot;
            </p>
            <textarea
              v-model="aiUserPrompt"
              rows="7"
              class="w-full rounded border border-slate-600 bg-slate-950 px-3 py-2 font-mono text-[12px] text-slate-200 outline-none focus:border-cyan-500/50"
              placeholder="Enter your request (Korean is fine)..."
            />
          </template>

          <!-- Loading overlay -->
          <AILoadingOverlay v-else :stage="aiStage" :progress="aiProgress" />

          <!-- Action buttons -->
          <div v-if="!aiBusy" class="flex items-center justify-end gap-2">
            <button class="rounded border border-slate-600 px-3 py-2 text-xs text-slate-200 hover:bg-slate-800" @click="aiOpen = false">Cancel</button>
            <button
              class="flex items-center gap-1.5 rounded bg-cyan-600 px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-cyan-500"
              @click="onRunAI"
            >
              <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Run AI
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch, provide, onMounted, onUnmounted } from "vue";
import BuilderNode from "./BuilderNode.vue";
import EventActionEditor from "./EventActionEditor.vue";
import AILoadingOverlay from "./AILoadingOverlay.vue";
import { FieldText, FieldNumber, FieldSelect, FieldColor, FieldCheck } from "./FieldComponents.js";
import { COMPONENT_CATALOG, COLS, CANVAS_WIDTH, CELL_SIZE, MOCK_API_DATA, CONTAINER_TYPES } from "../data/componentCatalog";
import { DEMO_TEMPLATES } from "../data/demoTemplates";
import { useBuilderStore } from "../stores/builderStore";
import { PREVIEW_CTX } from "../runtime/previewContext";
import { getPath } from "../runtime/runtimeEngine";
import { generateScreenFromPrompt, AI_STAGES } from "../ai/fakeAIService";
import { validateAndNormalizeBuilderState } from "../ai/builderStateValidator";

const store = useBuilderStore();
const {
  state, selectedId, previewMode, selectedComponent, rootComponents, canvasRows,
  deselectAll, deleteComponent, addComponent, updateProp, updatePropUndoable,
  renameFieldId, countFieldIdRefs,
  typeLabel,
  rebuildRuntimeVars, seedFieldValues, runAllPageLoadTriggers, runPreviewTrigger,
  runtimeVars, fieldValues, loadingByComponent,
  addLogicVariable, removeLogicVariable, updateLogicVariable,
  addOrderEvent, removeOrderEvent,
  updateGridPosRect, updateComponentParentField,
  saveToLocalStorage,
  clearAll, exportToFile, importFromFile, loadTemplate, serializeStateForExport,
  undo, redo, canUndo, canRedo, commitSnapshot
} = store;

provide(PREVIEW_CTX, { runPreviewTrigger, runtimeVars, fieldValues, loadingByComponent });

/* ─── Toast ─── */
const toastVisible = ref(false);
const toastMessage = ref("");
const toastType = ref("success");
let toastTimer = null;

function showToast(message, type = "success", duration = 2500) {
  toastMessage.value = message;
  toastType.value = type;
  toastVisible.value = true;
  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastVisible.value = false; }, duration);
}

/* ─── Undo / Redo ─── */
function handleKeyboard(e) {
  const tag = e.target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || e.target.isContentEditable) return;
  const ctrl = e.ctrlKey || e.metaKey;
  if (ctrl && e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
  else if (ctrl && (e.key === "y" || (e.key === "z" && e.shiftKey))) { e.preventDefault(); redo(); }
}

onMounted(() => { window.addEventListener("keydown", handleKeyboard); });
onUnmounted(() => { window.removeEventListener("keydown", handleKeyboard); });

/* ─── Persistence actions ─── */
function onSave() {
  const ok = saveToLocalStorage();
  showToast(ok ? "Saved successfully!" : "Save failed!", ok ? "success" : "error");
}

function onClear() {
  if (!confirm("Are you sure you want to clear the canvas and reset all data? This cannot be undone.")) return;
  clearAll();
  selectedTemplate.value = "";
  showToast("Canvas cleared.", "info");
}

async function onImportJsonFile() {
  const ok = await importFromFile();
  showToast(ok ? "JSON imported successfully!" : "Import failed — invalid file.", ok ? "success" : "error");
}

function openImportChooser() {
  importChooserOpen.value = true;
}

async function chooseImportJson() {
  importChooserOpen.value = false;
  await onImportJsonFile();
}

function chooseImportAi() {
  importChooserOpen.value = false;
  aiOpen.value = true;
}

function onExportJson() {
  exportToFile();
  showToast("JSON file downloaded!", "success");
}

/* ─── Template selector ─── */
const selectedTemplate = ref("");

function onTemplateSelect() {
  if (!selectedTemplate.value) return;
  const tpl = DEMO_TEMPLATES.find((t) => t.key === selectedTemplate.value);
  if (!tpl) return;
  if (state.components.length > 0 && !confirm(`Load template "${tpl.label}"? Current workspace will be replaced.`)) {
    selectedTemplate.value = "";
    return;
  }
  const ok = loadTemplate(tpl.data);
  showToast(ok ? `Template "${tpl.label}" loaded!` : "Template load failed.", ok ? "success" : "error");
}

function copyJsonExport() {
  navigator.clipboard?.writeText(jsonExport.value).then(
    () => showToast("JSON copied to clipboard!", "success"),
    () => showToast("Copy failed.", "error")
  );
}

async function onRunAI() {
  const userText = String(aiUserPrompt.value ?? "").trim();
  if (!userText) {
    showToast("AI prompt를 입력해주세요.", "error", 3500);
    return;
  }
  if (aiBusy.value) return;

  aiBusy.value = true;
  aiStage.value = AI_STAGES[0];
  aiProgress.value = 0;
  try {
    const parsed = await generateScreenFromPrompt(userText, {
      onStage(stage) {
        aiStage.value = stage;
        aiProgress.value = stage.progress;
      }
    });

    const validation = validateAndNormalizeBuilderState(parsed);
    if (!validation.ok) {
      const previewIssues = (validation.issues || []).slice(0, 6).join("\n- ");
      showToast(`AI JSON 검증 실패:\n- ${previewIssues || "unknown error"}`, "error", 6000);
      return;
    }

    const ok = loadTemplate(validation.normalized);
    showToast(ok ? "AI로 캔버스를 생성/수정했어요." : "AI 캔버스 적용 실패.", ok ? "success" : "error");
    aiOpen.value = false;
  } catch (err) {
    showToast(`AI 실행 실패: ${err?.message || String(err)}`, "error", 6000);
  } finally {
    aiBusy.value = false;
    aiStage.value = null;
    aiProgress.value = 0;
  }
}

/* ─── Left Tabs ─── */
const leftTabs = [
  { key: "library", label: "Library" },
  { key: "nodes", label: "Nodes" },
  { key: "dataTab", label: "DATA" },
  { key: "orderEvent", label: "Order Event" }
];
const leftTab = ref("library");

const parentSelectOptions = computed(() => {
  const sel = selectedComponent.value;
  const out = [{ value: "", label: "Root (canvas)" }];
  if (!sel) return out;
  for (const c of state.components) {
    if (c.id === sel.id) continue;
    if (!CONTAINER_TYPES.has(c.type)) continue;
    const fid = c.props?.fieldId;
    if (fid == null || String(fid).trim() === "") continue;
    out.push({ value: String(fid).trim(), label: `${typeLabel(c.type)} — ${String(fid).trim()}` });
  }
  return out;
});

function onParentChange(ev) {
  const c = selectedComponent.value;
  if (!c) return;
  updateComponentParentField(c.id, ev.target.value || null);
}

const layoutEditor = computed(() => {
  const c = selectedComponent.value;
  if (!c) return { x: 0, y: 0, w: 1, h: 1 };
  const l = c.layout;
  return { x: l.x, y: l.y, w: l.w, h: l.h };
});

function patchGridPos(patch) {
  const c = selectedComponent.value;
  if (!c) return;
  updateGridPosRect(c.id, patch, COLS);
}

/* ─── Binding Pills: available $fieldId.value + @state.var references ─── */
const bindingPills = computed(() => {
  const pills = [];
  for (const c of state.components) {
    const fid = c.props?.fieldId;
    if (fid) pills.push(`$${fid}.value`);
  }
  for (const v of state.logic.variables) {
    if (v?.name) pills.push(`$state.${v.name}`);
  }
  return pills;
});

function copyToClipboard(text) {
  navigator.clipboard?.writeText(text).catch(() => {});
}

/* ─── Field ID Editor ─── */
const fieldIdDraft     = ref("");          // 편집 중인 임시 값
const fieldIdEditing   = ref(false);       // 편집 모드 여부
const fieldIdError     = ref("");          // 에러 메시지 ("" = 정상)

// 선택 컴포넌트가 바뀌면 draft 초기화
watch(selectedComponent, (c) => {
  fieldIdDraft.value   = c?.props?.fieldId ?? "";
  fieldIdEditing.value = false;
  fieldIdError.value   = "";
}, { immediate: true });

// 입력할 때마다 중복 실시간 체크
function onFieldIdInput(v) {
  fieldIdDraft.value = v;
  const trimNew = v.trim();
  const trimOld = selectedComponent.value?.props?.fieldId ?? "";
  if (!trimNew) {
    fieldIdError.value = "Field ID cannot be empty.";
  } else if (trimNew !== trimOld && state.components.some((c) => c.props?.fieldId === trimNew)) {
    fieldIdError.value = `"${trimNew}" is already used by another component.`;
  } else {
    fieldIdError.value = "";
  }
}

// 확정: Enter 키 or blur
function commitFieldId() {
  const trimNew = fieldIdDraft.value.trim();
  const trimOld = selectedComponent.value?.props?.fieldId ?? "";
  if (!trimNew || trimNew === trimOld) {
    // 변경 없음 → 그냥 닫기
    fieldIdDraft.value   = trimOld;
    fieldIdEditing.value = false;
    fieldIdError.value   = "";
    return;
  }
  if (fieldIdError.value) return; // 에러 있으면 확정 불가
  const result = renameFieldId(trimOld, trimNew);
  if (result.ok) {
    fieldIdEditing.value = false;
    showToast(`Field ID renamed: "${trimOld}" → "${trimNew}"`, "success");
  } else if (result.reason === "duplicate") {
    fieldIdError.value = `"${trimNew}" is already used by another component.`;
  } else {
    fieldIdError.value = "Rename failed.";
  }
}

function cancelFieldId() {
  fieldIdDraft.value   = selectedComponent.value?.props?.fieldId ?? "";
  fieldIdEditing.value = false;
  fieldIdError.value   = "";
}

const fieldIdRefCount = computed(() =>
  selectedComponent.value ? countFieldIdRefs(selectedComponent.value.props?.fieldId) : 0
);

/* ─── Events (per-component) ─── */
const currentEvents = computed(() => {
  const ev = selectedComponent.value?.props?.events;
  return {
    onPageLoad: ev?.onPageLoad ?? [],
    onClick: ev?.onClick ?? [],
    onChange: ev?.onChange ?? []
  };
});

const totalEventCount = computed(() =>
  (currentEvents.value.onPageLoad?.length ?? 0) +
  (currentEvents.value.onClick?.length ?? 0) +
  (currentEvents.value.onChange?.length ?? 0)
);

function setEventActions(trigger, actions) {
  const c = selectedComponent.value;
  if (!c) return;
  updateProp("events", { ...(c.props.events || {}), [trigger]: actions });
}

/* ─── Preview mode ─── */
watch(previewMode, async (on) => {
  if (on) {
    seedFieldValues();
    rebuildRuntimeVars();
    await runAllPageLoadTriggers();
  }
});

/* ─── Misc state ─── */
const showExport = ref(false);
const importChooserOpen = ref(false);
const isDataPreviewOpen = ref(false);
const activeDataPath = ref("");
const dataPreviewViewMode = ref("json");
const expandedDataPaths = ref(new Set(["apiData", "state"]));

/* ─── AI ─── */
const aiOpen = ref(false);
const aiUserPrompt = ref("");
const aiBusy = ref(false);
const aiStage = ref(null);      // current AI_STAGES entry
const aiProgress = ref(0);      // 0–100

const jsonExport = computed(() => {
  const data = serializeStateForExport();
  return JSON.stringify(data, null, 2);
});

function treeParentGroupKey(c) {
  const pf = c.parentFieldId;
  return (pf == null || pf === "") ? "__root__" : String(pf);
}

const nodeTreeItems = computed(() => {
  const byParent = new Map();
  for (const c of state.components) {
    const key = treeParentGroupKey(c);
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(c);
  }
  for (const [, items] of byParent) {
    items.sort((a, b) => (a.layout.y - b.layout.y) || (a.layout.x - b.layout.x) || String(a.id).localeCompare(String(b.id)));
  }
  const out = [];
  function walk(parentFieldKey, depth) {
    for (const c of byParent.get(parentFieldKey) || []) {
      const fid = c.props?.fieldId;
      const fidStr = fid != null && String(fid).trim() !== "" ? String(fid).trim() : null;
      out.push({ id: c.id, depth, label: fidStr ? `${typeLabel(c.type)} — ${fidStr}` : typeLabel(c.type) });
      if (fidStr && byParent.has(fidStr)) walk(fidStr, depth + 1);
    }
  }
  walk("__root__", 0);
  return out;
});

function normalizePath(path) { return String(path || "").trim().replace(/^@/, ""); }

function pathWithParents(path) {
  const clean = normalizePath(path);
  if (!clean) return [];
  const parts = clean.split(".").filter(Boolean);
  return Array.from({ length: parts.length }, (_, i) => parts.slice(0, i + 1).join("."));
}

function resolveDataPath(path) {
  if (!path) return null;
  const clean = normalizePath(path);
  if (clean.startsWith("state.")) return getPath(runtimeVars, clean.slice("state.".length));
  const keys = clean.split(".").filter(Boolean);
  let cur = MOCK_API_DATA;
  for (const key of keys) {
    if (cur == null || typeof cur !== "object") return null;
    cur = cur[key];
  }
  return cur ?? null;
}

/* ─── Data Navigator tree ─── */
const dataPathItems = computed(() => {
  const set = new Set();
  function collectPaths(value, prefix) {
    if (!prefix) return;
    set.add(prefix);
    if (value == null || typeof value !== "object") return;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item === "object" && !Array.isArray(item))
          for (const key of Object.keys(item)) set.add(`${prefix}.${key}`);
      }
      return;
    }
    for (const key of Object.keys(value)) collectPaths(value[key], `${prefix}.${key}`);
  }
  collectPaths(MOCK_API_DATA.apiData, "apiData");
  for (const c of state.components) {
    const cp = c.props || {};
    for (const path of [cp.dataPath, cp.dataSourcePath, cp.valuePath]) {
      for (const item of pathWithParents(path)) set.add(item);
    }
  }
  for (const v of state.logic.variables) if (v?.name) set.add(`state.${v.name}`);
  return [...set].sort((a, b) => {
    const da = a.split(".").length, db = b.split(".").length;
    return da !== db ? da - db : a.localeCompare(b);
  });
});

const dataPathTreeItems = computed(() => {
  const all = new Set(dataPathItems.value);
  const roots = [...all].filter((p) => !p.includes(".")).sort();
  const out = [];
  function walk(path, depth) {
    const prefix = `${path}.`;
    const children = [...all].filter((p) => p.startsWith(prefix) && !p.slice(prefix.length).includes(".")).sort();
    out.push({ path, depth, label: path.split(".").at(-1) || path, hasChildren: children.length > 0 });
    for (const child of children) walk(child, depth + 1);
  }
  for (const root of roots) walk(root, 0);
  return out;
});

const dataPathTreeItemMap = computed(() => new Map(dataPathTreeItems.value.map((item) => [item.path, item])));

const visibleDataPathTreeItems = computed(() =>
  dataPathTreeItems.value.filter((item) => {
    const parts = item.path.split(".");
    for (let i = 1; i < parts.length; i++) {
      if (!expandedDataPaths.value.has(parts.slice(0, i).join("."))) return false;
    }
    return true;
  })
);

function toggleDataTree(path) {
  const item = dataPathTreeItemMap.value.get(path);
  if (!item?.hasChildren) return;
  const next = new Set(expandedDataPaths.value);
  next.has(path) ? next.delete(path) : next.add(path);
  expandedDataPaths.value = next;
}

/* ─── Property update (debounced snapshot) ─── */
let _propDebounceTimer = null;
let _propSnapshotTaken = false;

function p(key, value) {
  if (!_propSnapshotTaken) {
    commitSnapshot();
    _propSnapshotTaken = true;
  }
  updateProp(key, value);
  clearTimeout(_propDebounceTimer);
  _propDebounceTimer = setTimeout(() => {
    _propSnapshotTaken = false;
    commitSnapshot();
  }, 600);
}

function onPaletteDragStart(event, type) {
  if (previewMode.value) { event.preventDefault(); return; }
  event.dataTransfer?.setData("application/no-code-item", JSON.stringify({ type }));
}

function onCanvasDrop(event) {
  if (previewMode.value) return;
  const payload = event.dataTransfer?.getData("application/no-code-item");
  if (!payload) return;
  const { type } = JSON.parse(payload);
  const rect = event.currentTarget.getBoundingClientRect();
  addComponent(type, null, (event.clientX - rect.left) / CELL_SIZE, (event.clientY - rect.top) / CELL_SIZE, COLS);
}

function onSelectNode(id) { store.selectComponent(id); }

const previewData = computed(() => resolveDataPath(activeDataPath.value));
const canShowTable = computed(() => Array.isArray(previewData.value));
const activePreviewMode = computed(() => dataPreviewViewMode.value === "table" && canShowTable.value ? "table" : "json");

const previewColumns = computed(() => {
  if (!Array.isArray(previewData.value)) return [];
  const cols = new Set();
  for (const row of previewData.value) {
    if (row && typeof row === "object" && !Array.isArray(row))
      for (const key of Object.keys(row)) cols.add(key);
  }
  return [...cols];
});

const previewRows = computed(() => {
  if (!Array.isArray(previewData.value)) return [];
  return previewData.value.map((item) => item && typeof item === "object" && !Array.isArray(item) ? item : { value: item });
});

const previewJson = computed(() => JSON.stringify(previewData.value, null, 2));

function formatCellValue(value) {
  if (value == null) return "-";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function onOpenDataPreview(path) {
  activeDataPath.value = path || "";
  isDataPreviewOpen.value = true;
  dataPreviewViewMode.value = "json";
  const clean = normalizePath(path);
  if (!clean) return;
  const parts = clean.split(".").filter(Boolean);
  const next = new Set(expandedDataPaths.value);
  for (let i = 1; i < parts.length; i++) next.add(parts.slice(0, i).join("."));
  expandedDataPaths.value = next;
}

function closeDataPreview() { isDataPreviewOpen.value = false; }

const parsedParams = computed(() => {
  const comp = selectedComponent.value;
  if (!comp?.props?.params) return [];
  return String(comp.props.params).split(",").map((s) => {
    const [key, ...rest] = s.split(":");
    return { key: key?.trim() || "", value: rest.join(":").trim() || "" };
  }).filter((pm) => pm.key);
});

const gridColumns = computed(() => {
  const cols = selectedComponent.value?.props?.columns;
  return Array.isArray(cols) ? cols : [];
});

function addGridColumn() {
  const cols = Array.isArray(selectedComponent.value?.props?.columns) ? [...selectedComponent.value.props.columns] : [];
  cols.push({ header: "", field: "" });
  updateProp("columns", cols);
}
function updateGridColumn(index, key, value) {
  const cols = [...(selectedComponent.value?.props?.columns || [])];
  cols[index] = { ...cols[index], [key]: value };
  updateProp("columns", cols);
}
function removeGridColumn(index) {
  const cols = [...(selectedComponent.value?.props?.columns || [])];
  cols.splice(index, 1);
  updateProp("columns", cols);
}

</script>

<style scoped>
.canvas-grid {
  background-color: #111827;
  background-image:
    linear-gradient(to right, rgba(100, 116, 139, 0.15) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(100, 116, 139, 0.15) 1px, transparent 1px);
  background-size: 10px 10px;
}

/* Toast animation */
.toast-slide-enter-active {
  transition: all 0.3s ease-out;
}
.toast-slide-leave-active {
  transition: all 0.25s ease-in;
}
.toast-slide-enter-from {
  opacity: 0;
  transform: translateY(-12px) scale(0.95);
}
.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(-8px) scale(0.97);
}
</style>
