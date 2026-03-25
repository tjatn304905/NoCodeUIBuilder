<template>
  <div class="box-border h-[100dvh] w-full overflow-hidden bg-slate-950 p-3 text-slate-200">
    <div class="grid h-full w-full min-w-0 grid-cols-[minmax(240px,280px)_minmax(0,1fr)_minmax(260px,320px)] gap-3">
      <!-- Workflow Left Panel -->
      <aside class="flex flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
        <div class="grid grid-cols-3 gap-1 border-b border-slate-700 p-2">
          <button class="rounded-md px-2 py-1.5 text-xs transition-colors" :class="leftTab === 'library' ? 'bg-slate-700 text-slate-100' : 'text-slate-300 hover:bg-slate-800'" @click="leftTab = 'library'">Library</button>
          <button class="rounded-md px-2 py-1.5 text-xs transition-colors" :class="leftTab === 'nodes' ? 'bg-slate-700 text-slate-100' : 'text-slate-300 hover:bg-slate-800'" @click="leftTab = 'nodes'">Nodes</button>
          <button class="rounded-md px-2 py-1.5 text-xs transition-colors" :class="leftTab === 'data' ? 'bg-slate-700 text-slate-100' : 'text-slate-300 hover:bg-slate-800'" @click="leftTab = 'data'">Data</button>
        </div>
        <div class="min-h-0 flex-1 overflow-y-auto p-3">
          <template v-if="leftTab === 'library'">
            <div v-for="group in COMPONENT_CATALOG" :key="group.group" class="mb-4">
              <p class="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">{{ group.group }}</p>
              <div class="space-y-2">
                <button
                  v-for="item in group.items"
                  :key="item.type"
                  :draggable="!previewMode"
                  class="flex w-full items-center justify-between rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-left text-xs text-slate-200 transition-colors"
                  :class="previewMode ? 'cursor-not-allowed opacity-50' : 'hover:border-blue-400 hover:bg-slate-700'"
                  @dragstart="onPaletteDragStart($event, item.type)"
                >
                  <span>{{ item.label }}</span>
                  <span class="text-slate-400">+</span>
                </button>
              </div>
            </div>
          </template>

          <template v-else-if="leftTab === 'nodes'">
            <p v-if="!nodeTreeItems.length" class="text-xs text-slate-500">No nodes on canvas.</p>
            <div v-else class="space-y-1">
              <button
                v-for="node in nodeTreeItems"
                :key="node.id"
                class="flex w-full items-center rounded-md border px-2 py-1.5 text-left text-xs transition-colors"
                :style="{ paddingLeft: `${8 + node.depth * 14}px` }"
                :class="selectedId === node.id ? 'border-blue-400 bg-blue-500/20 text-blue-200' : 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700'"
                @click="onSelectNode(node.id)"
              >
                <span class="truncate">{{ node.label }}</span>
              </button>
            </div>
          </template>

          <template v-else>
            <p class="mb-2 text-[11px] uppercase tracking-wide text-slate-500">Connected Data Sources</p>
            <p v-if="!visibleDataPathTreeItems.length" class="text-xs text-slate-500">No data paths detected yet.</p>
            <div v-else class="space-y-1">
              <button
                v-for="item in visibleDataPathTreeItems"
                :key="item.path"
                class="flex w-full items-center gap-1 rounded-md border px-2 py-1.5 text-left text-xs font-mono transition-colors"
                :style="{ paddingLeft: `${8 + item.depth * 14}px` }"
                :class="activeDataPath === item.path ? 'border-cyan-500 bg-cyan-500/15 text-cyan-200' : 'border-slate-700 bg-slate-800 text-cyan-300 hover:border-cyan-500 hover:bg-slate-700'"
                @click="onOpenDataPreview(item.path)"
              >
                <span
                  class="inline-flex h-4 w-4 items-center justify-center rounded text-[10px] text-slate-300 hover:bg-slate-700"
                  @click.stop="toggleDataTree(item.path)"
                >
                  {{ item.hasChildren ? (expandedDataPaths.has(item.path) ? "▾" : "▸") : "·" }}
                </span>
                <span class="truncate">{{ item.label }}</span>
              </button>
            </div>
          </template>
        </div>
      </aside>

      <!-- Canvas -->
      <main class="flex min-h-0 flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
        <header class="flex items-center justify-between border-b border-slate-700 px-4 py-3">
          <div>
            <h1 class="text-base font-semibold text-slate-100">{{ state.screenName }}</h1>
            <p class="text-xs text-slate-400">{{ COLS }}-col · {{ CELL_SIZE }}px square grid</p>
          </div>
          <div class="flex items-center gap-2">
            <button
              class="rounded-md border px-3 py-1.5 text-xs transition-colors"
              :class="previewMode ? 'border-blue-400 bg-blue-500/20 text-blue-200' : 'border-slate-600 text-slate-200 hover:bg-slate-800'"
              @click="previewMode = !previewMode"
            >
              {{ previewMode ? "Exit Preview" : "Preview" }}
            </button>
            <button class="rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-900 hover:bg-white" @click="showExport = true">
              JSON Export
            </button>
          </div>
        </header>

        <div class="relative flex-1 overflow-auto bg-slate-950 p-4" @click="deselectAll()">
          <div class="mx-auto" :style="{ width: `${CANVAS_WIDTH}px` }">
            <div
              class="relative rounded-xl border border-slate-700 bg-slate-900"
              :class="previewMode ? '' : 'canvas-grid'"
              :style="{ height: canvasRows * CELL_SIZE + 'px' }"
              @click.stop="deselectAll()"
              @dragover.prevent
              @drop.prevent="onCanvasDrop"
            >
              <BuilderNode
                v-for="comp in rootComponents"
                :key="comp.id"
                :component="comp"
                :cols="COLS"
                :rows="canvasRows"
                @open-data-preview="onOpenDataPreview"
              />
            </div>
          </div>
        </div>
      </main>

      <!-- Property Editor -->
      <aside class="flex flex-col overflow-hidden rounded-xl border border-slate-700 bg-slate-900">
        <div class="border-b border-slate-700 p-4">
          <h2 class="text-sm font-semibold text-slate-100">Property Editor</h2>
          <p class="mt-1 text-xs text-slate-400">
            {{ selectedComponent ? typeLabel(selectedComponent.type) : 'Select a component to edit.' }}
          </p>
        </div>
        <div class="h-[calc(100%-73px)] overflow-y-auto p-4">
          <div v-if="selectedComponent" :key="selectedComponent.id">
            <div class="mb-3 flex items-center justify-between rounded-md border border-slate-700 bg-slate-800 px-2 py-1.5">
              <span class="text-xs font-medium text-slate-100">{{ typeLabel(selectedComponent.type) }}</span>
              <button
                class="rounded px-1.5 py-0.5 text-[10px] text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
                @click="deleteComponent(selectedComponent.id)"
              >
                Delete
              </button>
            </div>

            <div class="space-y-3">
              <!-- Common -->
              <FieldText label="Field ID" :model-value="selectedComponent.props.fieldId" @update:model-value="(v) => p('fieldId', v)" />
              <FieldText v-if="selectedComponent.type !== 'label'" label="Label" :model-value="selectedComponent.props.label" @update:model-value="(v) => p('label', v)" />
              <FieldSelect label="H-Align" :model-value="selectedComponent.props.alignment" :options="['left','center','right']" @update:model-value="(v) => p('alignment', v)" />
              <FieldSelect label="V-Align" :model-value="selectedComponent.props.valign" :options="['top','middle','bottom']" @update:model-value="(v) => p('valign', v)" />

              <div class="rounded-md border border-slate-700 bg-slate-800 p-2">
                <p class="mb-1 text-[10px] font-medium uppercase tracking-wide text-slate-400">Grid Position</p>
                <div class="grid grid-cols-4 gap-1 text-[11px] text-slate-300">
                  <span>X: {{ selectedComponent.layout.x }}</span>
                  <span>Y: {{ selectedComponent.layout.y }}</span>
                  <span>W: {{ selectedComponent.layout.w }}</span>
                  <span>H: {{ selectedComponent.layout.h }}</span>
                </div>
              </div>

              <!-- Container (Section) -->
              <template v-if="selectedComponent.type === 'container'">
                <FieldCheck label="Show border" :model-value="selectedComponent.props.showBorder" @update:model-value="(v) => p('showBorder', v)" />
                <FieldCheck label="Show background" :model-value="selectedComponent.props.showBackground" @update:model-value="(v) => p('showBackground', v)" />
                <FieldNumber label="Padding (px)" :model-value="selectedComponent.props.padding" @update:model-value="(v) => p('padding', v)" />
                <FieldColor
                  v-if="selectedComponent.props.showBackground !== false"
                  label="Background color"
                  :model-value="selectedComponent.props.bgColor"
                  @update:model-value="(v) => p('bgColor', v)"
                />
              </template>

              <!-- Label (universal text) -->
              <template v-if="selectedComponent.type === 'label'">
                <FieldText label="Text" :model-value="selectedComponent.props.text" @update:model-value="(v) => p('text', v)" />
                <FieldSelect
                  label="Icon"
                  :model-value="selectedComponent.props.icon"
                  :options="['none','folder','user','settings','star','list','chart']"
                  @update:model-value="(v) => p('icon', v)"
                />
                <FieldSelect label="Preset" :model-value="selectedComponent.props.preset" :options="['h1','h2','h3','body','small']" @update:model-value="(v) => p('preset', v)" />
                <FieldNumber label="Custom font size (0 = preset)" :model-value="selectedComponent.props.customFontSize" @update:model-value="(v) => p('customFontSize', v)" />
                <FieldColor label="Color" :model-value="selectedComponent.props.color" @update:model-value="(v) => p('color', v)" />
                <FieldSelect label="Font weight" :model-value="selectedComponent.props.fontWeight" :options="['normal','bold','extrabold']" @update:model-value="(v) => p('fontWeight', v)" />
              </template>

              <!-- Accordion -->
              <template v-if="selectedComponent.type === 'accordion'">
                <FieldText label="Accordion Title" :model-value="selectedComponent.props.title" @update:model-value="(v) => p('title', v)" />
                <FieldText label="Panels (comma-separated)" :model-value="selectedComponent.props.panels" @update:model-value="(v) => p('panels', v)" />
                <FieldSelect
                  label="Active Panel"
                  :model-value="selectedComponent.props.activePanel"
                  :options="panelOptions"
                  @update:model-value="(v) => p('activePanel', v)"
                />
              </template>

              <!-- Text Input -->
              <template v-if="selectedComponent.type === 'text-input'">
                <FieldText label="Placeholder" :model-value="selectedComponent.props.placeholder" @update:model-value="(v) => p('placeholder', v)" />
                <FieldSelect label="Input Type" :model-value="selectedComponent.props.inputType" :options="['text','number','email','tel','password']" @update:model-value="(v) => p('inputType', v)" />
                <FieldNumber label="Max Length" :model-value="selectedComponent.props.maxLength" @update:model-value="(v) => p('maxLength', v)" />
                <FieldText label="Input Mask (e.g. 000-0000-0000)" :model-value="selectedComponent.props.mask" @update:model-value="(v) => p('mask', v)" />
              </template>

              <!-- Combo / Radio -->
              <template v-if="selectedComponent.type === 'combo-box' || selectedComponent.type === 'radio-group'">
                <FieldText label="Options (comma-separated)" :model-value="selectedComponent.props.options" @update:model-value="(v) => p('options', v)" />
              </template>

              <!-- Data Fact -->
              <template v-if="selectedComponent.type === 'data-fact'">
                <FieldText label="Value" :model-value="selectedComponent.props.value" @update:model-value="(v) => p('value', v)" />
                <FieldSelect label="Display" :model-value="selectedComponent.props.displayMode" :options="['side-by-side','stacked']" @update:model-value="(v) => p('displayMode', v)" />
                <FieldText label="Data Path (@apiData.user.phone)" :model-value="selectedComponent.props.dataPath" @update:model-value="(v) => p('dataPath', v)" />
                <FieldColor label="Background Color" :model-value="selectedComponent.props.bgColor" @update:model-value="(v) => p('bgColor', v)" />
              </template>

              <!-- Status Badge -->
              <template v-if="selectedComponent.type === 'status-badge'">
                <FieldText label="Status Text" :model-value="selectedComponent.props.status" @update:model-value="(v) => p('status', v)" />
                <FieldSelect label="Tone" :model-value="selectedComponent.props.tone" :options="['default','success','warning','error']" @update:model-value="(v) => p('tone', v)" />
              </template>

              <!-- Divider -->
              <template v-if="selectedComponent.type === 'divider'">
                <FieldColor label="Color" :model-value="selectedComponent.props.color" @update:model-value="(v) => p('color', v)" />
                <FieldNumber label="Vertical Padding (px)" :model-value="selectedComponent.props.paddingY" @update:model-value="(v) => p('paddingY', v)" />
              </template>

              <!-- Button -->
              <template v-if="selectedComponent.type === 'action-button'">
                <FieldText label="Button Text" :model-value="selectedComponent.props.text" @update:model-value="(v) => p('text', v)" />
                <FieldSelect label="Action Type" :model-value="selectedComponent.props.actionType" :options="['submit','navigate','api-call','open-modal']" @update:model-value="(v) => p('actionType', v)" />
                <FieldSelect
                  label="Icon"
                  :model-value="selectedComponent.props.icon"
                  :options="['none','search','plus','edit','delete','check','arrow','download','refresh','save']"
                  @update:model-value="(v) => p('icon', v)"
                />
                <FieldSelect
                  label="Color Preset"
                  :model-value="selectedComponent.props.colorPreset"
                  :options="['primary','secondary','success','danger','warning','dark','custom']"
                  @update:model-value="(v) => p('colorPreset', v)"
                />
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
                  <div v-if="availableFieldIds.length" class="mt-2 rounded border border-blue-500/25 bg-blue-500/10 p-1.5">
                    <p class="mb-1 text-[9px] font-medium text-blue-300/90">Available Field IDs:</p>
                    <div class="flex flex-wrap gap-1">
                      <span v-for="fid in availableFieldIds" :key="fid" class="rounded border border-slate-600 bg-slate-900 px-1.5 py-0.5 font-mono text-[9px] text-cyan-200/90">
                        ${{ fid }}.value
                      </span>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Data Grid -->
              <template v-if="selectedComponent.type === 'data-grid'">
                <FieldText label="Data Source Path" :model-value="selectedComponent.props.dataSourcePath" @update:model-value="(v) => p('dataSourcePath', v)" />
                <div class="rounded-md border border-slate-700 bg-slate-800/40 p-2">
                  <div class="mb-2 flex items-center justify-between gap-2">
                    <p class="text-[10px] font-medium uppercase tracking-wide text-slate-400">Column Definitions</p>
                    <button type="button" class="shrink-0 rounded border border-cyan-500/35 bg-cyan-500/15 px-2 py-0.5 text-[10px] font-medium text-cyan-200 hover:bg-cyan-500/25" @click="addGridColumn">+ Add</button>
                  </div>
                  <div class="space-y-1.5">
                    <div v-for="(col, ci) in gridColumns" :key="ci" class="flex items-center gap-1">
                      <input :value="col.header" placeholder="Header" class="h-7 w-1/2 rounded border border-slate-600 bg-slate-900 px-1.5 text-[11px] text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30" @input="(e) => updateGridColumn(ci, 'header', e.target.value)" />
                      <input :value="col.field" placeholder="field" class="h-7 w-1/2 rounded border border-slate-600 bg-slate-900 px-1.5 font-mono text-[11px] text-slate-200 placeholder:text-slate-500 focus:border-cyan-500/50 focus:outline-none focus:ring-1 focus:ring-cyan-500/30" @input="(e) => updateGridColumn(ci, 'field', e.target.value)" />
                      <button type="button" class="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-transparent text-red-400 hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-300" title="Remove column" @click="removeGridColumn(ci)">✕</button>
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
                <FieldText label="Data Source Path" :model-value="selectedComponent.props.dataSourcePath" @update:model-value="(v) => p('dataSourcePath', v)" />
                <FieldText label="Card Title" :model-value="selectedComponent.props.cardTitle" @update:model-value="(v) => p('cardTitle', v)" />
                <FieldText label="Card Badge" :model-value="selectedComponent.props.cardBadge" @update:model-value="(v) => p('cardBadge', v)" />
                <FieldText label="Card Price" :model-value="selectedComponent.props.cardPrice" @update:model-value="(v) => p('cardPrice', v)" />
                <FieldText label="Price Unit" :model-value="selectedComponent.props.cardPriceUnit" @update:model-value="(v) => p('cardPriceUnit', v)" />
                <FieldText label="Description" :model-value="selectedComponent.props.cardDescription" @update:model-value="(v) => p('cardDescription', v)" />
                <FieldText label="Facts (Key: Val, ...)" :model-value="selectedComponent.props.cardFacts" @update:model-value="(v) => p('cardFacts', v)" />
                <FieldText label="Button Text" :model-value="selectedComponent.props.cardButtonText" @update:model-value="(v) => p('cardButtonText', v)" />
                <FieldColor label="Accent Color" :model-value="selectedComponent.props.accentColor" @update:model-value="(v) => p('accentColor', v)" />
              </template>

              <!-- Date Picker -->
              <template v-if="selectedComponent.type === 'date-picker'">
                <FieldText label="Placeholder" :model-value="selectedComponent.props.placeholder" @update:model-value="(v) => p('placeholder', v)" />
                <FieldSelect label="Date Format" :model-value="selectedComponent.props.dateFormat" :options="['YYYY-MM-DD','DD/MM/YYYY','MM/DD/YYYY','YYYY.MM.DD']" @update:model-value="(v) => p('dateFormat', v)" />
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
              <button
                type="button"
                class="rounded px-2 py-0.5 text-[11px] transition-colors"
                :class="dataPreviewViewMode === 'json' ? 'bg-slate-700 text-slate-100' : 'text-slate-300 hover:bg-slate-700'"
                @click="dataPreviewViewMode = 'json'"
              >
                JSON
              </button>
              <button
                type="button"
                class="rounded px-2 py-0.5 text-[11px] transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                :class="dataPreviewViewMode === 'table' ? 'bg-slate-700 text-slate-100' : 'text-slate-300 hover:bg-slate-700'"
                :disabled="!canShowTable"
                @click="dataPreviewViewMode = 'table'"
              >
                Table
              </button>
            </div>
            <button type="button" class="rounded border border-slate-600 px-2 py-1 text-xs text-slate-200 hover:bg-slate-800" @click="closeDataPreview">Close</button>
          </div>
        </div>
        <div class="max-h-[70vh] overflow-auto">
          <table v-if="activePreviewMode === 'table'" class="w-full min-w-full border-collapse text-xs">
            <thead class="sticky top-0 z-[1] bg-slate-800 text-slate-300">
              <tr>
                <th v-for="col in previewColumns" :key="col" class="border-b border-r border-slate-700 px-2 py-1.5 text-left font-semibold">{{ col }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(row, ri) in previewRows" :key="ri" class="odd:bg-slate-900 even:bg-slate-800/70">
                <td v-for="col in previewColumns" :key="`${ri}-${col}`" class="max-w-[260px] border-b border-r border-slate-800 px-2 py-1 align-top text-slate-200">
                  {{ formatCellValue(row[col]) }}
                </td>
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
import { computed, ref, h } from "vue";
import BuilderNode from "./BuilderNode.vue";
import { COMPONENT_CATALOG, COLS, CANVAS_WIDTH, CELL_SIZE, MOCK_API_DATA } from "../data/componentCatalog";
import { useBuilderStore } from "../stores/builderStore";

const store = useBuilderStore();
const {
  state,
  selectedId,
  previewMode,
  selectedComponent,
  rootComponents,
  canvasRows,
  deselectAll,
  deleteComponent,
  addComponent,
  updateProp,
  typeLabel
} = store;

const showExport = ref(false);
const leftTab = ref("library");
const isDataPreviewOpen = ref(false);
const activeDataPath = ref("");
const dataPreviewViewMode = ref("json");
const expandedDataPaths = ref(new Set(["apiData"]));
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
    components: state.components.map((c) => ({
      id: c.id,
      type: c.type,
      parentId: c.parentId,
      layout: { ...c.layout },
      props: { ...c.props },
      _binding: {
        fieldId: c.props.fieldId,
        dataPath: c.props.dataPath || c.props.dataSourcePath || null,
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
  for (const [, items] of byParent) {
    items.sort((a, b) => (a.layout.y - b.layout.y) || (a.layout.x - b.layout.x));
  }
  const out = [];
  function walk(parentId, depth) {
    const key = parentId ?? "__root__";
    const children = byParent.get(key) || [];
    for (const c of children) {
      out.push({ id: c.id, depth, label: `${typeLabel(c.type)} (${c.id})` });
      walk(c.id, depth + 1);
    }
  }
  walk(null, 0);
  return out;
});

function normalizePath(path) {
  return String(path || "").trim().replace(/^@/, "");
}

function pathWithParents(path) {
  const clean = normalizePath(path);
  if (!clean) return [];
  const parts = clean.split(".").filter(Boolean);
  const result = [];
  for (let i = 1; i <= parts.length; i++) {
    result.push(parts.slice(0, i).join("."));
  }
  return result;
}

const dataPathItems = computed(() => {
  const set = new Set();

  // Always expose full mock data tree in Data tab.
  function collectPaths(value, prefix) {
    if (!prefix) return;
    set.add(prefix);
    if (value == null) return;
    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item === "object" && !Array.isArray(item)) {
          for (const key of Object.keys(item)) set.add(`${prefix}.${key}`);
        }
      }
      return;
    }
    if (typeof value !== "object") return;
    for (const key of Object.keys(value)) {
      collectPaths(value[key], `${prefix}.${key}`);
    }
  }

  collectPaths(MOCK_API_DATA.apiData, "apiData");

  // Keep currently connected paths and their parents.
  for (const c of state.components) {
    const p = c.props || {};
    for (const path of [p.dataPath, p.dataSourcePath]) {
      for (const item of pathWithParents(path)) set.add(item);
    }
  }
  return [...set].sort((a, b) => {
    const da = a.split(".").length;
    const db = b.split(".").length;
    if (da !== db) return da - db;
    return a.localeCompare(b);
  });
});

const dataPathTreeItems = computed(() => {
  const all = new Set(dataPathItems.value);
  const roots = [...all].filter((p) => !p.includes(".")).sort((a, b) => a.localeCompare(b));
  const out = [];

  function walk(path, depth) {
    const prefix = `${path}.`;
    const children = [...all]
      .filter((p) => p.startsWith(prefix) && !p.slice(prefix.length).includes("."))
      .sort((a, b) => a.localeCompare(b));
    out.push({
      path,
      depth,
      label: path.split(".").at(-1) || path,
      hasChildren: children.length > 0
    });
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

const visibleDataPathTreeItems = computed(() => {
  return dataPathTreeItems.value.filter((item) => {
    const parts = item.path.split(".");
    if (parts.length <= 1) return true;
    for (let i = 1; i < parts.length; i++) {
      const parent = parts.slice(0, i).join(".");
      if (!expandedDataPaths.value.has(parent)) return false;
    }
    return true;
  });
});

function toggleDataTree(path) {
  const item = dataPathTreeItemMap.value.get(path);
  if (!item?.hasChildren) return;
  const next = new Set(expandedDataPaths.value);
  if (next.has(path)) next.delete(path);
  else next.add(path);
  expandedDataPaths.value = next;
}

function p(key, value) {
  updateProp(key, value);
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
  const rawX = (event.clientX - rect.left) / CELL_SIZE;
  const rawY = (event.clientY - rect.top) / CELL_SIZE;
  addComponent(type, null, rawX, rawY, COLS);
}

function onSelectNode(id) {
  store.selectComponent(id);
}

function resolveDataPath(path) {
  if (!path) return null;
  const cleanPath = normalizePath(path);
  const keys = cleanPath.split(".").filter(Boolean);
  let current = MOCK_API_DATA;
  for (const key of keys) {
    if (current == null || typeof current !== "object") return null;
    current = current[key];
  }
  return current ?? null;
}

const previewData = computed(() => resolveDataPath(activeDataPath.value));

const canShowTable = computed(() => Array.isArray(previewData.value));
const activePreviewMode = computed(() => {
  if (dataPreviewViewMode.value === "table" && canShowTable.value) return "table";
  return "json";
});

const previewColumns = computed(() => {
  if (!Array.isArray(previewData.value)) return [];
  const cols = new Set();
  for (const row of previewData.value) {
    if (row && typeof row === "object" && !Array.isArray(row)) {
      for (const key of Object.keys(row)) cols.add(key);
    }
  }
  return [...cols];
});

const previewRows = computed(() => {
  if (!Array.isArray(previewData.value)) return [];
  return previewData.value.map((item) => {
    if (item && typeof item === "object" && !Array.isArray(item)) return item;
    return { value: item };
  });
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
  for (let i = 1; i < parts.length; i++) {
    next.add(parts.slice(0, i).join("."));
  }
  expandedDataPaths.value = next;
}

function closeDataPreview() {
  isDataPreviewOpen.value = false;
}

const panelOptions = computed(() => {
  const comp = selectedComponent.value;
  if (!comp || !comp.props?.panels) return [];
  return String(comp.props.panels).split(",").map((s) => s.trim()).filter(Boolean);
});

const availableFieldIds = computed(() => {
  return state.components
    .filter((c) => c.props?.fieldId && c.id !== selectedComponent.value?.id)
    .map((c) => c.props.fieldId);
});

const parsedParams = computed(() => {
  const comp = selectedComponent.value;
  if (!comp || !comp.props?.params) return [];
  return String(comp.props.params)
    .split(",")
    .map((s) => {
      const [key, ...rest] = s.split(":");
      return { key: key?.trim() || "", value: rest.join(":").trim() || "" };
    })
    .filter((pm) => pm.key);
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

const inputClass = "h-8 w-full rounded-md border border-slate-600 bg-slate-800 px-2 text-xs text-slate-100 focus:border-blue-400 focus:outline-none";

function toHexColor(value) {
  const fallback = "#ffffff";
  const raw = String(value || "").trim();
  if (!raw) return fallback;

  if (/^#([0-9a-fA-F]{3})$/.test(raw)) {
    return `#${raw.slice(1).split("").map((c) => c + c).join("").toLowerCase()}`;
  }
  if (/^#([0-9a-fA-F]{6})$/.test(raw)) return raw.toLowerCase();

  const rgbaMatch = raw.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*[\d.]+\s*)?\)$/i);
  if (!rgbaMatch) return fallback;

  const clamp = (n) => Math.max(0, Math.min(255, Math.round(Number(n) || 0)));
  const r = clamp(rgbaMatch[1]).toString(16).padStart(2, "0");
  const g = clamp(rgbaMatch[2]).toString(16).padStart(2, "0");
  const b = clamp(rgbaMatch[3]).toString(16).padStart(2, "0");
  return `#${r}${g}${b}`;
}

const FieldText = {
  props: { label: String, modelValue: [String, Number] },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    return () =>
      h("label", { class: "block text-xs text-slate-300" }, [
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
      h("label", { class: "block text-xs text-slate-300" }, [
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
      h("label", { class: "block text-xs text-slate-300" }, [
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

const FieldColor = {
  props: { label: String, modelValue: String },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    return () =>
      h("div", { class: "block text-xs text-slate-300" }, [
        h("span", { class: "mb-1 block font-medium" }, props.label),
        h("div", { class: "flex items-center gap-2" }, [
          h("div", { class: "relative h-8 w-8 shrink-0 overflow-hidden rounded border border-slate-600" }, [
            h("div", {
              class: "h-full w-full",
              style: { backgroundColor: toHexColor(props.modelValue) }
            }),
            h("input", {
              type: "color",
              class: "absolute inset-0 h-full w-full cursor-pointer opacity-0",
              value: toHexColor(props.modelValue),
              onInput: (e) => emit("update:modelValue", e.target.value)
            })
          ]),
          h("input", {
            class: `${inputClass} font-mono`,
            value: props.modelValue || "#ffffff",
            placeholder: "#ffffff",
            onInput: (e) => emit("update:modelValue", e.target.value)
          })
        ])
      ]);
  }
};

const FieldCheck = {
  props: { label: String, modelValue: Boolean },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    return () =>
      h("label", { class: "flex cursor-pointer items-center gap-2 text-xs text-slate-300" }, [
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
  background-color: #111827;
  background-image:
    linear-gradient(to right, rgba(100, 116, 139, 0.34) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(100, 116, 139, 0.34) 1px, transparent 1px);
  background-size: 20px 20px;
}
</style>
