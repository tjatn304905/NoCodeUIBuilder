<template>
  <div class="box-border h-[100dvh] w-full overflow-hidden bg-slate-950 p-3 text-slate-200">
    <div class="grid h-full w-full min-w-0 grid-cols-[minmax(240px,280px)_minmax(0,1fr)_minmax(260px,320px)] gap-3">
      <!-- ═══ Left Panel ═══ -->
      <aside class="flex flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
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
      <main class="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
        <header class="flex items-center justify-between border-b border-slate-700 px-4 py-3">
          <div>
            <h1 class="text-base font-semibold text-slate-100">{{ state.screenName }}</h1>
            <p class="text-xs text-slate-400">{{ COLS }}-col · {{ CELL_SIZE }}px square grid</p>
          </div>
          <div class="flex items-center gap-2">
            <button class="rounded-md border px-3 py-1.5 text-xs transition-colors" :class="previewMode ? 'border-blue-400 bg-blue-500/20 text-blue-200' : 'border-slate-600 text-slate-200 hover:bg-slate-800'" @click="previewMode = !previewMode">
              {{ previewMode ? "Exit Preview" : "Preview" }}
            </button>
            <button class="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-900 hover:bg-white" @click="showExport = true">JSON Export</button>
          </div>
        </header>
        <div class="relative flex-1 overflow-auto bg-slate-950 p-4" @click="deselectAll()">
          <div class="mx-auto" :style="{ width: `${CANVAS_WIDTH}px` }">
            <div class="relative rounded-xl border border-slate-700 bg-slate-900" :class="previewMode ? '' : 'canvas-grid'" :style="{ height: canvasRows * CELL_SIZE + 'px' }" @click.stop="deselectAll()" @dragover.prevent @drop.prevent="onCanvasDrop">
              <BuilderNode v-for="comp in rootComponents" :key="comp.id" :component="comp" :cols="COLS" :rows="canvasRows" @open-data-preview="onOpenDataPreview" />
            </div>
          </div>
        </div>
      </main>

      <!-- ═══ Property Editor ═══ -->
      <aside class="flex flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
        <div class="border-b border-slate-700 p-4">
          <h2 class="text-sm font-semibold text-slate-100">Property Editor</h2>
          <p class="mt-1 text-xs text-slate-400">{{ selectedComponent ? typeLabel(selectedComponent.type) : 'Select a component to edit.' }}</p>
        </div>
        <div class="h-[calc(100%-73px)] overflow-y-auto p-4">
          <div v-if="selectedComponent" :key="selectedComponent.id">
            <div class="mb-3 flex items-center justify-between rounded-md border border-slate-700 bg-slate-800 px-2 py-1.5">
              <span class="text-xs font-medium text-slate-100">{{ typeLabel(selectedComponent.type) }}</span>
              <button class="rounded px-1.5 py-0.5 text-[10px] text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300" @click="deleteComponent(selectedComponent.id)">Delete</button>
            </div>

            <div class="space-y-3">
              <!-- Schema: 5 common attributes -->
              <div class="rounded-md border border-slate-600/80 bg-slate-800/60 p-2">
                <p class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Component identity</p>
                <label class="mb-2 block text-xs text-slate-300"><span class="mb-0.5 block font-medium text-slate-400">compId</span>
                  <input type="text" readonly class="h-8 w-full cursor-not-allowed rounded-md border border-slate-600 bg-slate-900/80 px-2 font-mono text-[11px] text-slate-400" :value="selectedComponent.compId || ''" />
                </label>
                <label class="mb-2 block text-xs text-slate-300"><span class="mb-0.5 block font-medium text-slate-400">parentId</span>
                  <select class="h-8 w-full rounded-md border border-slate-600 bg-slate-800 px-2 text-xs text-slate-100" :value="selectedComponent.parentId || ''" @change="onParentChange($event)">
                    <option v-for="opt in parentSelectOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
                  </select>
                </label>
                <p class="mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-500">layout (grid cells)</p>
                <div class="grid grid-cols-2 gap-2">
                  <FieldNumber label="x" :model-value="layoutEditor.x" @update:model-value="(v) => patchGridPos({ x: v })" />
                  <FieldNumber label="y" :model-value="layoutEditor.y" @update:model-value="(v) => patchGridPos({ y: v })" />
                  <FieldNumber label="w" :model-value="layoutEditor.w" @update:model-value="(v) => patchGridPos({ w: v })" />
                  <FieldNumber label="h" :model-value="layoutEditor.h" @update:model-value="(v) => patchGridPos({ h: v })" />
                </div>
              </div>

              <div class="rounded-md border border-amber-500/25 bg-slate-800/50 p-2">
                <p class="mb-2 text-[10px] font-semibold uppercase tracking-wide text-amber-200/90">Display &amp; Access Logic</p>
                <label class="mb-2 block text-xs text-slate-300"><span class="mb-0.5 block font-medium text-slate-400">hiddenCon</span>
                  <textarea :value="selectedComponent.props.hiddenCon ?? ''" rows="2" class="w-full rounded-md border border-slate-600 bg-slate-900 px-2 py-1 font-mono text-[11px] text-slate-200" placeholder="e.g. {{$state.flag}} or true" @input="p('hiddenCon', $event.target.value)" />
                </label>
                <label class="block text-xs text-slate-300"><span class="mb-0.5 block font-medium text-slate-400">readonlyCon</span>
                  <textarea :value="selectedComponent.props.readonlyCon ?? ''" rows="2" class="w-full rounded-md border border-slate-600 bg-slate-900 px-2 py-1 font-mono text-[11px] text-slate-200" placeholder="Expression when read-only in preview" @input="p('readonlyCon', $event.target.value)" />
                </label>
              </div>

              <FieldText label="Field ID" :model-value="selectedComponent.props.fieldId" @update:model-value="(v) => p('fieldId', v)" />
              <template v-if="selectedComponent.type !== 'container'">
                <FieldText v-if="selectedComponent.type !== 'label'" label="Label" :model-value="selectedComponent.props.label" @update:model-value="(v) => p('label', v)" />
                <FieldSelect label="Horizontal align" :model-value="selectedComponent.props.hAlign" :options="['left','center','right']" @update:model-value="(v) => p('hAlign', v)" />
                <FieldSelect label="Vertical align" :model-value="selectedComponent.props.vAlign" :options="['top','middle','bottom']" @update:model-value="(v) => p('vAlign', v)" />
              </template>

              <!-- ═══ Events ═══ -->
              <div class="rounded-md border border-slate-700 bg-slate-800/40 p-2">
                <p class="mb-2 text-[10px] font-medium uppercase tracking-wide text-slate-400">Events</p>

                <!-- onPageLoad -->
                <div class="mb-2">
                  <label class="mb-0.5 block text-[9px] font-semibold text-slate-500">onPageLoad</label>
                  <EventActionEditor :actions="currentEvents.onPageLoad" :order-events="state.logic.orderEvents" :variables="state.logic.variables" :binding-pills="bindingPills" @update="(a) => setEventActions('onPageLoad', a)" />
                </div>

                <!-- onClick (button / card) -->
                <div v-if="['action-button','card-list-repeater'].includes(selectedComponent.type)" class="mb-2">
                  <label class="mb-0.5 block text-[9px] font-semibold text-slate-500">onClick</label>
                  <EventActionEditor :actions="currentEvents.onClick" :order-events="state.logic.orderEvents" :variables="state.logic.variables" :binding-pills="bindingPills" @update="(a) => setEventActions('onClick', a)" />
                </div>

                <!-- onChange (input / combo) -->
                <div v-if="['text-input','combo-box','radio-group','checkbox-group','date-picker'].includes(selectedComponent.type)">
                  <label class="mb-0.5 block text-[9px] font-semibold text-slate-500">onChange</label>
                  <EventActionEditor :actions="currentEvents.onChange" :order-events="state.logic.orderEvents" :variables="state.logic.variables" :binding-pills="bindingPills" @update="(a) => setEventActions('onChange', a)" />
                </div>
              </div>

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
                <FieldSelect label="Active Panel" :model-value="selectedComponent.props.activePanel" :options="panelOptions" @update:model-value="(v) => p('activePanel', v)" />
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
                <FieldText label="Status Text" :model-value="selectedComponent.props.status" @update:model-value="(v) => p('status', v)" />
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
                <FieldText label="Button Text" :model-value="selectedComponent.props.text" @update:model-value="(v) => p('text', v)" />
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
            </div>
          </div>
          <div v-else class="flex h-full items-center justify-center">
            <p class="text-center text-sm text-slate-400">Click a component on the canvas<br />to edit its properties.</p>
          </div>
        </div>
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

    <!-- JSON Export Modal -->
    <div v-if="showExport" class="fixed inset-0 z-40 flex items-center justify-center bg-slate-900/50 p-4" @click.self="showExport = false">
      <div class="w-full max-w-4xl overflow-hidden rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-700 px-4 py-3">
          <h3 class="text-sm font-semibold text-slate-100">Builder JSON Export</h3>
          <button class="rounded border border-slate-600 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800" @click="showExport = false">Close</button>
        </div>
        <pre class="max-h-[70vh] overflow-auto bg-slate-950 p-4 text-xs text-emerald-300">{{ jsonExport }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, h, watch, provide } from "vue";
import BuilderNode from "./BuilderNode.vue";
import { COMPONENT_CATALOG, COLS, CANVAS_WIDTH, CELL_SIZE, MOCK_API_DATA, CONTAINER_TYPES } from "../data/componentCatalog";
import { useBuilderStore } from "../stores/builderStore";
import { PREVIEW_CTX } from "../runtime/previewContext";
import { getPath } from "../runtime/runtimeEngine";

const store = useBuilderStore();
const {
  state, selectedId, previewMode, selectedComponent, rootComponents, canvasRows,
  deselectAll, deleteComponent, addComponent, updateProp, typeLabel,
  rebuildRuntimeVars, seedFieldValues, runAllPageLoadTriggers, runPreviewTrigger,
  runtimeVars, fieldValues, loadingByComponent,
  addLogicVariable, removeLogicVariable, updateLogicVariable,
  addOrderEvent, removeOrderEvent,
  updateGridPosRect, updateComponentParent
} = store;

provide(PREVIEW_CTX, { runPreviewTrigger, runtimeVars, fieldValues, loadingByComponent });

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
    out.push({ value: c.id, label: `${typeLabel(c.type)} — ${c.id}` });
  }
  return out;
});

function onParentChange(ev) {
  const c = selectedComponent.value;
  if (!c) return;
  updateComponentParent(c.id, ev.target.value || null);
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

/* ─── Events (per-component) ─── */
const currentEvents = computed(() => {
  const ev = selectedComponent.value?.props?.events;
  return {
    onPageLoad: ev?.onPageLoad ?? [],
    onClick: ev?.onClick ?? [],
    onChange: ev?.onChange ?? []
  };
});

function setEventActions(trigger, actions) {
  const c = selectedComponent.value;
  if (!c) return;
  updateProp("events", { ...(c.props.events || {}), [trigger]: actions });
}

/* ─── EventActionEditor sub-component ─── */
const EventActionEditor = {
  props: {
    actions: { type: Array, default: () => [] },
    orderEvents: { type: Array, default: () => [] },
    variables: { type: Array, default: () => [] },
    bindingPills: { type: Array, default: () => [] }
  },
  emits: ["update"],
  setup(props, { emit }) {
    function addAction() {
      emit("update", [...props.actions, { type: "orderEvent", eventId: "", params: "", resultVariable: "", resultPath: "" }]);
    }
    function removeAction(idx) {
      const next = [...props.actions];
      next.splice(idx, 1);
      emit("update", next);
    }
    function updateAction(idx, patch) {
      const next = props.actions.map((a, i) => i === idx ? { ...a, ...patch } : a);
      emit("update", next);
    }
    return () => {
      const items = props.actions.map((action, idx) => {
        const typeSelect = h("select", {
          class: "w-full rounded border border-slate-600 bg-slate-900 px-1 py-1 text-[10px] text-slate-200",
          value: action.type || "orderEvent",
          onChange: (e) => updateAction(idx, { type: e.target.value })
        }, [
          h("option", { value: "orderEvent" }, "Order Event"),
          h("option", { value: "setVariable" }, "Set Variable"),
          h("option", { value: "navigate" }, "Navigate")
        ]);

        let details;
        if (action.type === "setVariable") {
          details = h("div", { class: "mt-1 space-y-1" }, [
            h("select", {
              class: "w-full rounded border border-slate-600 bg-slate-900 px-1 py-1 font-mono text-[10px] text-slate-200",
              value: action.variable || "",
              onChange: (e) => updateAction(idx, { variable: e.target.value })
            }, [
              h("option", { value: "" }, "— variable —"),
              ...props.variables.map((v) => h("option", { key: v.id, value: v.name }, v.name))
            ]),
            h("input", {
              class: "w-full rounded border border-slate-600 bg-slate-900 px-1.5 py-1 font-mono text-[10px] text-slate-200",
              value: action.value || "",
              placeholder: "Value (e.g. $input.value or literal)",
              onInput: (e) => updateAction(idx, { value: e.target.value })
            })
          ]);
        } else if (action.type === "navigate") {
          details = h("input", {
            class: "mt-1 w-full rounded border border-slate-600 bg-slate-900 px-1.5 py-1 text-[10px] text-slate-200",
            value: action.target || "",
            placeholder: "Target screen",
            onInput: (e) => updateAction(idx, { target: e.target.value })
          });
        } else {
          details = h("div", { class: "mt-1 space-y-1" }, [
            h("select", {
              class: "w-full rounded border border-violet-500/30 bg-violet-500/10 px-1 py-1 font-mono text-[10px] text-violet-200",
              value: action.eventId || "",
              onChange: (e) => updateAction(idx, { eventId: e.target.value })
            }, [
              h("option", { value: "" }, "— select order event —"),
              ...props.orderEvents.map((oe) =>
                h("option", { key: oe.id, value: oe.id }, `${oe.eventCode || oe.id} — ${oe.name}`)
              )
            ]),
            h("input", {
              class: "w-full rounded border border-slate-600 bg-slate-900 px-1.5 py-1 font-mono text-[10px] text-slate-200",
              value: action.params || "",
              placeholder: "Override params (optional)",
              onInput: (e) => updateAction(idx, { params: e.target.value })
            }),
            h("div", { class: "flex gap-1" }, [
              h("input", {
                class: "min-w-0 flex-1 rounded border border-slate-600 bg-slate-900 px-1.5 py-1 font-mono text-[10px] text-slate-200",
                value: action.resultPath || "",
                placeholder: "Result path",
                onInput: (e) => updateAction(idx, { resultPath: e.target.value })
              }),
              h("select", {
                class: "min-w-0 flex-1 rounded border border-slate-600 bg-slate-900 px-1 py-1 font-mono text-[10px] text-slate-200",
                value: action.resultVariable || "",
                onChange: (e) => updateAction(idx, { resultVariable: e.target.value })
              }, [
                h("option", { value: "" }, "→ variable"),
                ...props.variables.map((v) => h("option", { key: v.id, value: v.name }, v.name))
              ])
            ])
          ]);
        }

        return h("div", { key: idx, class: "mb-1.5 rounded border border-slate-600/60 bg-slate-900/50 p-1.5" }, [
          h("div", { class: "flex items-center gap-1" }, [
            h("span", { class: "shrink-0 text-[9px] text-slate-500" }, `#${idx + 1}`),
            typeSelect,
            h("button", {
              type: "button",
              class: "shrink-0 text-[10px] text-red-400 hover:text-red-300",
              onClick: () => removeAction(idx)
            }, "✕")
          ]),
          details
        ]);
      });

      return h("div", {}, [
        ...items,
        h("button", {
          type: "button",
          class: "mt-1 w-full rounded border border-dashed border-slate-600 py-1 text-[10px] text-slate-400 hover:border-slate-500 hover:text-slate-300",
          onClick: addAction
        }, "+ Add Action")
      ]);
    };
  }
};

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
const isDataPreviewOpen = ref(false);
const activeDataPath = ref("");
const dataPreviewViewMode = ref("json");
const expandedDataPaths = ref(new Set(["apiData", "state"]));

const jsonExport = computed(() => {
  const exportData = {
    _meta: {
      version: "1.0.0",
      schema: "no-code-ui-builder",
      exportedAt: new Date().toISOString(),
      gridConfig: { cellSize: CELL_SIZE, cols: COLS, canvasWidth: CANVAS_WIDTH }
    },
    screenId: state.screenName.toLowerCase().replace(/\s+/g, "_"),
    screenName: state.screenName,
    logic: JSON.parse(JSON.stringify(state.logic)),
    components: state.components.map((c) => ({
      id: c.id,
      compId: c.compId,
      parentId: c.parentId,
      type: c.type,
      layout: { ...c.layout },
      props: JSON.parse(JSON.stringify(c.props)),
      _binding: {
        fieldId: c.props.fieldId,
        dataPath: c.props.dataPath || c.props.dataSourcePath || null,
        valuePath: c.props.valuePath || null,
        params: c.props.params || null
      }
    }))
  };
  return JSON.stringify(exportData, null, 2);
});

const nodeTreeItems = computed(() => {
  const byParent = new Map();
  for (const c of state.components) {
    const key = c.parentId ?? "__root__";
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(c);
  }
  for (const [, items] of byParent) items.sort((a, b) => (a.layout.y - b.layout.y) || (a.layout.x - b.layout.x));
  const out = [];
  function walk(parentId, depth) {
    for (const c of (byParent.get(parentId ?? "__root__") || [])) {
      out.push({ id: c.id, depth, label: `${typeLabel(c.type)} (${c.id})` });
      walk(c.id, depth + 1);
    }
  }
  walk(null, 0);
  return out;
});

function normalizePath(path) { return String(path || "").trim().replace(/^@/, ""); }

function pathWithParents(path) {
  const clean = normalizePath(path);
  if (!clean) return [];
  const parts = clean.split(".").filter(Boolean);
  return Array.from({ length: parts.length }, (_, i) => parts.slice(0, i + 1).join("."));
}

const dataPathItems = computed(() => {
  const set = new Set();
  function collectPaths(value, prefix) {
    if (!prefix) return;
    set.add(prefix);
    if (value == null) return;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item === "object" && !Array.isArray(item))
          for (const key of Object.keys(item)) set.add(`${prefix}.${key}`);
      }
      return;
    }
    if (typeof value !== "object") return;
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

const dataPathTreeItemMap = computed(() => {
  const map = new Map();
  for (const item of dataPathTreeItems.value) map.set(item.path, item);
  return map;
});

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
  if (next.has(path)) next.delete(path); else next.add(path);
  expandedDataPaths.value = next;
}

function p(key, value) { updateProp(key, value); }

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

function resolveDataPath(path) {
  if (!path) return null;
  const clean = normalizePath(path);
  if (clean.startsWith("state.")) {
    return getPath(runtimeVars, clean.slice("state.".length));
  }
  const keys = clean.split(".").filter(Boolean);
  let current = MOCK_API_DATA;
  for (const key of keys) {
    if (current == null || typeof current !== "object") return null;
    current = current[key];
  }
  return current ?? null;
}

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

const panelOptions = computed(() => {
  const comp = selectedComponent.value;
  if (!comp?.props?.panels) return [];
  return String(comp.props.panels).split(",").map((s) => s.trim()).filter(Boolean);
});

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

/* ─── Field Components ─── */
const inputClass = "h-8 w-full rounded-md border border-slate-600 bg-slate-800 px-2 text-xs text-slate-100 focus:border-blue-400 focus:outline-none";

function toHexColor(value) {
  const fallback = "#ffffff";
  const raw = String(value || "").trim();
  if (!raw) return fallback;
  if (/^#([0-9a-fA-F]{3})$/.test(raw)) return `#${raw.slice(1).split("").map((c) => c + c).join("").toLowerCase()}`;
  if (/^#([0-9a-fA-F]{6})$/.test(raw)) return raw.toLowerCase();
  const m = raw.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*[\d.]+\s*)?\)$/i);
  if (!m) return fallback;
  const cl = (n) => Math.max(0, Math.min(255, Math.round(Number(n) || 0)));
  return `#${cl(m[1]).toString(16).padStart(2, "0")}${cl(m[2]).toString(16).padStart(2, "0")}${cl(m[3]).toString(16).padStart(2, "0")}`;
}

const FieldText = {
  props: { label: String, modelValue: [String, Number] },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    return () => h("label", { class: "block text-xs text-slate-300" }, [
      h("span", { class: "mb-1 block font-medium" }, props.label),
      h("input", { class: inputClass, value: props.modelValue ?? "", onInput: (e) => emit("update:modelValue", e.target.value) })
    ]);
  }
};
const FieldNumber = {
  props: { label: String, modelValue: [String, Number] },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    return () => h("label", { class: "block text-xs text-slate-300" }, [
      h("span", { class: "mb-1 block font-medium" }, props.label),
      h("input", { type: "number", class: inputClass, value: props.modelValue ?? 0, onInput: (e) => emit("update:modelValue", Number(e.target.value)) })
    ]);
  }
};
const FieldSelect = {
  props: { label: String, modelValue: String, options: Array },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    return () => h("label", { class: "block text-xs text-slate-300" }, [
      h("span", { class: "mb-1 block font-medium" }, props.label),
      h("select", { class: inputClass, value: props.modelValue, onChange: (e) => emit("update:modelValue", e.target.value) },
        (props.options || []).map((o) => h("option", { key: o, value: o }, o))
      )
    ]);
  }
};
const FieldColor = {
  props: { label: String, modelValue: String },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    return () => h("div", { class: "block text-xs text-slate-300" }, [
      h("span", { class: "mb-1 block font-medium" }, props.label),
      h("div", { class: "flex items-center gap-2" }, [
        h("div", { class: "relative h-8 w-8 shrink-0 overflow-hidden rounded border border-slate-600" }, [
          h("div", { class: "h-full w-full", style: { backgroundColor: toHexColor(props.modelValue) } }),
          h("input", { type: "color", class: "absolute inset-0 h-full w-full cursor-pointer opacity-0", value: toHexColor(props.modelValue), onInput: (e) => emit("update:modelValue", e.target.value) })
        ]),
        h("input", { class: `${inputClass} font-mono`, value: props.modelValue || "#ffffff", placeholder: "#ffffff", onInput: (e) => emit("update:modelValue", e.target.value) })
      ])
    ]);
  }
};
const FieldCheck = {
  props: { label: String, modelValue: Boolean },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    return () => h("label", { class: "flex cursor-pointer items-center gap-2 text-xs text-slate-300" }, [
      h("input", { type: "checkbox", class: "accent-blue-600", checked: props.modelValue, onChange: (e) => emit("update:modelValue", e.target.checked) }),
      h("span", { class: "font-medium" }, props.label)
    ]);
  }
};
</script>

<style scoped>
.canvas-grid {
  background-color: #111827;
  background-image:
    linear-gradient(to right, rgba(100, 116, 139, 0.15) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(100, 116, 139, 0.15) 1px, transparent 1px);
  background-size: 10px 10px;
}
</style>
