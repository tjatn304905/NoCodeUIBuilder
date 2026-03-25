import { MOCK_API_DATA } from "../data/componentCatalog";

export function getPath(obj, dotPath) {
  if (obj == null || dotPath == null) return undefined;
  const keys = String(dotPath).split(".").filter(Boolean);
  let cur = obj;
  for (const k of keys) {
    if (cur == null || typeof cur !== "object") return undefined;
    cur = cur[k];
  }
  return cur;
}

export function resolveDataSource(path, runtimeState = {}) {
  if (!path) return null;
  const clean = String(path).trim().replace(/^@/, "");
  if (clean.startsWith("state.")) {
    return getPath(runtimeState, clean.slice("state.".length));
  }
  const keys = clean.split(".").filter(Boolean);
  let obj = MOCK_API_DATA;
  for (const key of keys) {
    if (obj == null || typeof obj !== "object") return null;
    obj = obj[key];
  }
  return obj ?? null;
}

export function parseInitialValue(type, raw) {
  const s = String(raw ?? "");
  switch (type) {
    case "number":
      return Number(s) || 0;
    case "boolean":
      return s === "true";
    case "array":
    case "object":
      try { return JSON.parse(s || (type === "array" ? "[]" : "{}")); }
      catch { return type === "array" ? [] : {}; }
    default:
      return s;
  }
}

/**
 * Resolve expressions: $fieldId.value, @state.x.y, {{expr}}, literal
 */
export function resolveExpression(expr, ctx) {
  if (expr == null) return "";
  let s = String(expr).trim();
  const moustache = s.match(/^\{\{\s*(.+?)\s*\}\}$/);
  if (moustache) s = moustache[1].trim();

  const fv = ctx.fieldValues || {};
  const rv = ctx.runtimeVars || {};

  const fieldRef = s.match(/^\$([a-zA-Z_][a-zA-Z0-9_]*)\.value$/);
  if (fieldRef) return fv[fieldRef[1]] ?? "";

  if (s.startsWith("@state.")) return getPath(rv, s.slice("@state.".length));
  if (s.startsWith("$state.")) return getPath(rv, s.slice("$state.".length));
  if (s.startsWith("state.")) return getPath(rv, s.slice("state.".length));

  if (/^-?\d+(\.\d+)?$/.test(s)) return Number(s);
  if (s === "true") return true;
  if (s === "false") return false;
  if ((s.startsWith("[") && s.endsWith("]")) || (s.startsWith("{") && s.endsWith("}"))) {
    try { return JSON.parse(s); } catch { /* fallthrough */ }
  }
  return s;
}

export function parseParamString(str, ctx) {
  const out = {};
  if (!str || !String(str).trim()) return out;
  for (const part of String(str).split(",")) {
    const idx = part.indexOf(":");
    if (idx < 0) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = resolveExpression(v, ctx);
  }
  return out;
}

/**
 * Build request payload: predefined DTO JSON template + mapping expressions.
 * Mapping values override template keys (same key wins).
 */
export function buildOrderEventRequestBody(orderEvent, ctx, action) {
  const mappingStr = action.params || orderEvent.requestMapping || "";
  const mapped = parseParamString(mappingStr, ctx);
  let base = {};
  const raw = orderEvent.requestDtoJson != null ? String(orderEvent.requestDtoJson).trim() : "";
  if (raw) {
    try {
      const t = JSON.parse(raw);
      if (t && typeof t === "object" && !Array.isArray(t)) base = { ...t };
    } catch { /* invalid template ignored */ }
  }
  return { ...base, ...mapped };
}

/**
 * Order Event: API route/method are fixed off-screen. Only DTO shape + field mapping matter here.
 * Preview does not call HTTP; merged payload is treated as the synthetic "response" for state mapping.
 */
export async function executeOrderEvent(action, ctx, orderEvent) {
  if (!orderEvent) return;
  const data = buildOrderEventRequestBody(orderEvent, ctx, action);

  let mapPath = (action.resultPath != null && String(action.resultPath).trim() !== "")
    ? action.resultPath
    : orderEvent.onSuccessPath || "";
  mapPath = String(mapPath).trim();
  if (/^res(ponse)?\.?/i.test(mapPath)) mapPath = mapPath.replace(/^res(ponse)?\.?/i, "");
  const value = mapPath ? getPath(data, mapPath) : data;

  const varName = action.resultVariable || orderEvent.onSuccessVariable;
  if (varName && ctx.runtimeVars) ctx.runtimeVars[varName] = value;
}

export async function runAction(action, ctx, orderEvents) {
  const type = action.type || action.action;

  if (type === "setVariable") {
    const name = action.variable || action.variableName;
    if (!name || !ctx.runtimeVars) return;
    ctx.runtimeVars[name] = resolveExpression(action.value ?? "", ctx);
    return;
  }

  if (type === "navigate") {
    const target = action.target || action.screenId || action.screen || "";
    if (ctx.onNavigate) ctx.onNavigate(target);
    return;
  }

  if (type === "callApi" || type === "orderEvent") {
    const oe = orderEvents.find((e) => e.id === action.apiId || e.id === action.eventId || e.eventCode === action.eventCode);
    if (!oe) return;
    await executeOrderEvent(action, ctx, oe);
  }
}

export async function runActionChain(actions, ctx, orderEvents) {
  if (!Array.isArray(actions) || !actions.length) return;
  for (const a of actions) {
    await runAction(a, ctx, orderEvents);
  }
}

/** When true, component should be hidden (HIDDEN_CON) or read-only (READONLY_CON). */
export function evaluateLogicCon(expr, ctx) {
  if (expr == null || !String(expr).trim()) return false;
  const v = resolveExpression(expr, ctx);
  if (v === true || v === 1) return true;
  if (v === false || v === 0 || v === "" || v == null) return false;
  if (typeof v === "string") {
    const s = v.trim().toLowerCase();
    if (s === "true" || s === "yes" || s === "1") return true;
    if (s === "false" || s === "no" || s === "0") return false;
  }
  return Boolean(v);
}
