import {
  TEMPLATE_CUSTOMER_LOOKUP,
  TEMPLATE_MOBILE_SIGNUP,
  TEMPLATE_PRODUCT_SHOWCASE
} from "../data/demoTemplates";

function deepClone(v) {
  return JSON.parse(JSON.stringify(v));
}

const TEMPLATE_ORDER_CREATION = deepClone(TEMPLATE_MOBILE_SIGNUP);
TEMPLATE_ORDER_CREATION.screenInfo.name = "Order Creation";

const TEMPLATE_CUSTOMER_DETAIL = deepClone(TEMPLATE_CUSTOMER_LOOKUP);
TEMPLATE_CUSTOMER_DETAIL.screenInfo.name = "Customer Detail";

const TEMPLATE_SIMPLE_DASHBOARD = deepClone(TEMPLATE_PRODUCT_SHOWCASE);
TEMPLATE_SIMPLE_DASHBOARD.screenInfo.name = "Simple Dashboard";

const DEMO_AI_TEMPLATES = [
  { key: "subscriber-search", screenName: "Subscriber Search", data: TEMPLATE_CUSTOMER_LOOKUP },
  { key: "order-creation", screenName: "Order Creation", data: TEMPLATE_ORDER_CREATION },
  { key: "customer-detail", screenName: "Customer Detail", data: TEMPLATE_CUSTOMER_DETAIL },
  { key: "simple-dashboard", screenName: "Simple Dashboard", data: TEMPLATE_SIMPLE_DASHBOARD },
];

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomPick(list) {
  return list[randomInt(0, list.length - 1)];
}

function pickTemplateByPrompt(userPrompt) {
  const text = String(userPrompt ?? "").toLowerCase();

  if (text.includes("가입") || text.includes("신청") || text.includes("개통") || text.includes("order")) {
    return DEMO_AI_TEMPLATES.find((t) => t.key === "order-creation");
  }
  if (text.includes("조회") || text.includes("검색") || text.includes("search") || text.includes("find")) {
    return DEMO_AI_TEMPLATES.find((t) => t.key === "subscriber-search");
  }
  if (text.includes("상세") || text.includes("detail") || text.includes("고객")) {
    return DEMO_AI_TEMPLATES.find((t) => t.key === "customer-detail");
  }
  if (text.includes("대시보드") || text.includes("dashboard") || text.includes("통계")) {
    return DEMO_AI_TEMPLATES.find((t) => t.key === "simple-dashboard");
  }
  return randomPick(DEMO_AI_TEMPLATES);
}

function buildScreenName(baseName, userPrompt) {
  const text = String(userPrompt ?? "").trim();
  if (!text) return baseName;

  if (text.includes("가입")) return `${baseName} - Signup`;
  if (text.includes("조회")) return `${baseName} - Lookup`;
  if (text.includes("상세")) return `${baseName} - Detail`;
  if (text.includes("대시보드")) return `${baseName} - Dashboard`;
  return baseName;
}

/**
 * AI generation stages with cumulative progress (0–100).
 */
export const AI_STAGES = [
  { id: "analyze",   label: "Analyzing prompt…",         progress: 10 },
  { id: "schema",    label: "Designing screen structure…", progress: 28 },
  { id: "layout",    label: "Optimizing layout…",         progress: 48 },
  { id: "fields",    label: "Placing components…",        progress: 65 },
  { id: "logic",     label: "Wiring events & logic…",     progress: 80 },
  { id: "validate",  label: "Validating output…",         progress: 93 },
  { id: "done",      label: "Done",                        progress: 100 },
];

/**
 * Demo fake AI generator (no real LLM/network call).
 * @param {string} userPrompt
 * @param {{ onStage?: (stage: typeof AI_STAGES[number]) => void }} [opts]
 * @returns {Promise<{screenInfo: object, logic: object, components: Array}>}
 */
export function generateScreenFromPrompt(userPrompt, opts = {}) {
  const { onStage } = opts;
  const selected = pickTemplateByPrompt(userPrompt) ?? randomPick(DEMO_AI_TEMPLATES);

  // Total fake generation time: 2.8–4.5 s  (spread across stages)
  const totalMs = randomInt(2800, 4500);
  const stagesWithoutLast = AI_STAGES.slice(0, -1);

  return new Promise((resolve) => {
    let elapsed = 0;

    stagesWithoutLast.forEach((stage, i) => {
      // Distribute time roughly proportional to progress gaps
      const gap = AI_STAGES[i + 1].progress - stage.progress;
      const delay = Math.round((gap / 100) * totalMs * randomInt(85, 115) / 100);
      elapsed += delay;

      setTimeout(() => {
        onStage?.(stage);
      }, elapsed - delay); // fire at start of each stage
    });

    // Fire all stage start times correctly
    let acc = 0;
    stagesWithoutLast.forEach((stage, i) => {
      setTimeout(() => onStage?.(stage), acc);
      const gap = AI_STAGES[i + 1].progress - stage.progress;
      acc += Math.round((gap / 100) * totalMs);
    });

    setTimeout(() => {
      onStage?.(AI_STAGES[AI_STAGES.length - 1]);
      const out = deepClone(selected.data);
      out.screenInfo = {
        ...(out.screenInfo || {}),
        name: buildScreenName(selected.screenName, userPrompt),
        version: "1.0"
      };
      resolve(out);
    }, totalMs);
  });
}

