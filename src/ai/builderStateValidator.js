import { COMPONENT_CATALOG, CONTAINER_TYPES, COLS } from "../data/componentCatalog";

const ALLOWED_TYPES = new Set(COMPONENT_CATALOG.flatMap((g) => g.items.map((i) => i.type)));

function isPlainObject(v) {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

function toInt(v) {
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return null;
  return Math.trunc(n);
}

function ensureEvents(props) {
  const events = props?.events;
  if (!isPlainObject(events)) {
    props.events = { onPageLoad: [], onClick: [], onChange: [] };
    return;
  }
  props.events.onPageLoad = Array.isArray(events.onPageLoad) ? events.onPageLoad : [];
  props.events.onClick = Array.isArray(events.onClick) ? events.onClick : [];
  props.events.onChange = Array.isArray(events.onChange) ? events.onChange : [];
}

function findDescriptor(type) {
  for (const group of COMPONENT_CATALOG) {
    const found = group.items.find((i) => i.type === type);
    if (found) return found;
  }
  return null;
}

function mergeDefaultProps(type, props) {
  const desc = findDescriptor(type);
  const base = desc?.defaultProps ?? {};
  const out = isPlainObject(props) ? { ...base, ...props } : { ...base };
  // Ensure nested objects/strings expected by UI exist.
  if (!isPlainObject(out.events)) out.events = { onPageLoad: [], onClick: [], onChange: [] };
  ensureEvents(out);
  if (out.hiddenCon === undefined) out.hiddenCon = "";
  if (out.readonlyCon === undefined) out.readonlyCon = "";
  if (type === "data-fact" && (!out.bgColor || String(out.bgColor).trim() === "")) out.bgColor = undefined;
  return out;
}

function normalizeComponent(comp, idToExists, idx, issues) {
  const errors = [];

  if (!isPlainObject(comp)) {
    errors.push(`components[${idx}] must be an object`);
    return { ok: false, errors: errors };
  }

  const type = comp.type;
  if (!ALLOWED_TYPES.has(type)) errors.push(`components[${idx}].type "${type}" is not allowed`);

  const id = typeof comp.id === "string" && comp.id.trim() ? comp.id : `cmp_ai_${idx + 1}`;
  const compId = typeof comp.compId === "string" && comp.compId.trim() ? comp.compId : `${type}_${id}`;

  let parentId = comp.parentId ?? null;
  if (parentId === "") parentId = null;
  if (parentId != null) {
    if (typeof parentId !== "string") errors.push(`components[${idx}].parentId must be a string or null`);
    else if (!idToExists.has(parentId)) errors.push(`components[${idx}].parentId "${parentId}" does not exist`);
    else if (!CONTAINER_TYPES.has(idToExists.get(parentId).type)) errors.push(`components[${idx}].parentId must be a container component`);
  }

  const layout = comp.layout;
  const x = toInt(layout?.x);
  const y = toInt(layout?.y);
  const w = toInt(layout?.w);
  const h = toInt(layout?.h);
  if (x == null || y == null || w == null || h == null) errors.push(`components[${idx}].layout must be numeric x/y/w/h`);
  if (w != null && w < 1) errors.push(`components[${idx}].layout.w must be >= 1`);
  if (h != null && h < 1) errors.push(`components[${idx}].layout.h must be >= 1`);
  if (x != null && x < 0) errors.push(`components[${idx}].layout.x must be >= 0`);
  if (y != null && y < 0) errors.push(`components[${idx}].layout.y must be >= 0`);
  if (w != null && x != null && x + w > COLS) errors.push(`components[${idx}].layout.w overflows canvas grid`);

  const normalizedLayout = x == null || y == null || w == null || h == null
    ? { x: 0, y: 0, w: 1, h: 1 }
    : { x, y, w, h };

  const props = mergeDefaultProps(type, comp.props);

  // Minimal identity props expected by UI.
  if (props.fieldId == null && type) {
    props.fieldId = `${type.replaceAll("-", "_")}_${id}`;
  }
  if (props.label == null && type) {
    props.label = type.split("-").map((s) => s[0]?.toUpperCase() + s.slice(1)).join(" ");
  }

  if (errors.length) {
    issues.push(...errors);
    return { ok: false, errors, normalized: null };
  }

  return {
    ok: true,
    normalized: {
      id,
      compId,
      type,
      parentId,
      layout: normalizedLayout,
      props
    }
  };
}

export function validateAndNormalizeBuilderState(input) {
  const issues = [];

  if (!isPlainObject(input)) return { ok: false, issues: ["Root must be an object"] };

  const screenInfo = isPlainObject(input.screenInfo) ? input.screenInfo : {};
  const screenName = typeof screenInfo.name === "string" && screenInfo.name.trim() ? screenInfo.name.trim() : "AI Screen";
  const logicIn = input.logic ?? {};

  const logic = isPlainObject(logicIn)
    ? {
      variables: Array.isArray(logicIn.variables) ? logicIn.variables : [],
      orderEvents: Array.isArray(logicIn.orderEvents) ? logicIn.orderEvents : [],
      activeScreen: typeof logicIn.activeScreen === "string" ? logicIn.activeScreen : "default"
    }
    : { variables: [], orderEvents: [], activeScreen: "default" };

  const componentsIn = Array.isArray(input.components) ? input.components : null;
  if (!componentsIn) return { ok: false, issues: ["components must be an array"] };
  if (componentsIn.length > 500) issues.push("Too many components (limit 500).");

  // Pre-build id map so parentId validation can be done in 1 pass.
  const idToExists = new Map();
  for (let i = 0; i < componentsIn.length; i++) {
    const c = componentsIn[i];
    const id = isPlainObject(c) ? (typeof c.id === "string" ? c.id : null) : null;
    const type = isPlainObject(c) ? c.type : null;
    if (id && typeof type === "string") idToExists.set(id, { type });
  }

  const normalizedComponents = [];
  for (let i = 0; i < componentsIn.length; i++) {
    const res = normalizeComponent(componentsIn[i], idToExists, i, issues);
    if (!res.ok) continue;
    normalizedComponents.push(res.normalized);
  }

  // If we had id collisions or parent validation issues, we treat as failure.
  const hasAny = issues.length > 0;
  if (hasAny) return { ok: false, issues };

  // Ensure ids are unique after normalization.
  const ids = new Set();
  for (const c of normalizedComponents) {
    if (ids.has(c.id)) return { ok: false, issues: ["Duplicate component id detected."] };
    ids.add(c.id);
  }

  return {
    ok: true,
    normalized: {
      screenInfo: { name: screenName, version: "1.0" },
      logic,
      components: normalizedComponents
    }
  };
}

