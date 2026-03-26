/**
 * Demo Templates — Pre-defined JSON builder states for Telecom scenarios.
 * Each template follows the unified schema: { screenInfo, logic, components }
 */

import { DEFAULT_CONTAINER_BG } from "./componentCatalog";

/* ─────────────────────────────────────────────
 * Template A: Customer Lookup
 * ───────────────────────────────────────────── */
export const TEMPLATE_CUSTOMER_LOOKUP = {
  screenInfo: { name: "Customer Lookup", version: "1.0" },
  logic: {
    variables: [
      { id: "lv_1", name: "searchResults", type: "array", initialValue: "[]" },
      { id: "lv_2", name: "selectedCustomer", type: "object", initialValue: "{}" }
    ],
    orderEvents: [
      {
        id: "oe_1",
        eventCode: "CUST_SEARCH",
        name: "Customer Search",
        requestDtoJson: '{\n  "customer_name": "",\n  "phone": "",\n  "plan_type": ""\n}',
        requestMapping: "customer_name:$cust_name.value, phone:$cust_phone.value, plan_type:$plan_filter.value",
        onSuccessVariable: "searchResults",
        onSuccessPath: "data.list"
      }
    ],
    activeScreen: "default"
  },
  components: [
    /* ── Header ── */
    { id: "cmp_1", compId: "tpl-a-001", type: "container", parentId: null, layout: { x: 0, y: 0, w: 40, h: 6 }, props: { fieldId: "header_section", label: "Container (Section)", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, showBorder: true, showBackground: true, padding: 6, bgColor: "#0f172a" } },
    { id: "cmp_2", compId: "tpl-a-002", type: "label", parentId: "cmp_1", layout: { x: 0, y: 0, w: 30, h: 3 }, props: { fieldId: "title_main", label: "Label", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, text: "Customer Lookup", preset: "h2", customFontSize: 0, color: "#f1f5f9", fontWeight: "bold", icon: "user" } },
    { id: "cmp_3", compId: "tpl-a-003", type: "status-badge", parentId: "cmp_1", layout: { x: 30, y: 0, w: 8, h: 3 }, props: { fieldId: "sys_status", label: "Status Badge", hAlign: "right", vAlign: "middle", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, status: "Online", tone: "success" } },
    { id: "cmp_4", compId: "tpl-a-004", type: "label", parentId: "cmp_1", layout: { x: 0, y: 3, w: 38, h: 2 }, props: { fieldId: "subtitle", label: "Label", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, text: "Search customer accounts by name, phone, or plan type", preset: "small", customFontSize: 0, color: "#64748b", fontWeight: "normal", icon: "none" } },

    /* ── Search Section ── */
    { id: "cmp_10", compId: "tpl-a-010", type: "container", parentId: null, layout: { x: 0, y: 7, w: 40, h: 16 }, props: { fieldId: "search_section", label: "Container (Section)", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, showBorder: true, showBackground: true, padding: 6, bgColor: DEFAULT_CONTAINER_BG } },
    { id: "cmp_11", compId: "tpl-a-011", type: "label", parentId: "cmp_10", layout: { x: 0, y: 0, w: 38, h: 3 }, props: { fieldId: "search_title", label: "Label", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, text: "Search Filters", preset: "h3", customFontSize: 0, color: "#f1f5f9", fontWeight: "bold", icon: "search" } },
    { id: "cmp_12", compId: "tpl-a-012", type: "text-input", parentId: "cmp_10", layout: { x: 0, y: 3, w: 18, h: 4 }, props: { fieldId: "cust_name", label: "Customer Name", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, placeholder: "Enter customer name", maxLength: 120, inputType: "text", mask: "" } },
    { id: "cmp_13", compId: "tpl-a-013", type: "text-input", parentId: "cmp_10", layout: { x: 20, y: 3, w: 18, h: 4 }, props: { fieldId: "cust_phone", label: "Phone Number", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, placeholder: "010-0000-0000", maxLength: 13, inputType: "tel", mask: "000-0000-0000" } },
    { id: "cmp_14", compId: "tpl-a-014", type: "combo-box", parentId: "cmp_10", layout: { x: 0, y: 8, w: 18, h: 4 }, props: { fieldId: "plan_filter", label: "Plan Type", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, options: "All, 5G Premium, 5G Standard, LTE Basic, LTE Plus" } },
    { id: "cmp_15", compId: "tpl-a-015", type: "action-button", parentId: "cmp_10", layout: { x: 0, y: 12, w: 12, h: 3 }, props: { fieldId: "btn_search", label: "Action Button", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [{ type: "orderEvent", eventId: "oe_1", params: "", resultVariable: "searchResults", resultPath: "" }], onChange: [] }, text: "Search", actionType: "api-call", icon: "search", colorPreset: "primary", params: "customer_name:$cust_name.value, phone:$cust_phone.value", customBgColor: "#3b82f6", customTextColor: "#ffffff" } },
    { id: "cmp_16", compId: "tpl-a-016", type: "action-button", parentId: "cmp_10", layout: { x: 13, y: 12, w: 12, h: 3 }, props: { fieldId: "btn_reset", label: "Action Button", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, text: "Reset", actionType: "navigate", icon: "refresh", colorPreset: "secondary", params: "", customBgColor: "#3b82f6", customTextColor: "#ffffff" } },

    /* ── Customer Info (Super Section) ── */
    { id: "cmp_20", compId: "tpl-a-020", type: "container", parentId: null, layout: { x: 0, y: 24, w: 40, h: 14 }, props: { fieldId: "info_section", label: "Container (Section)", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, showBorder: true, showBackground: true, padding: 6, bgColor: DEFAULT_CONTAINER_BG } },
    { id: "cmp_21", compId: "tpl-a-021", type: "label", parentId: "cmp_20", layout: { x: 0, y: 0, w: 26, h: 3 }, props: { fieldId: "info_title", label: "Label", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, text: "Customer Information", preset: "h3", customFontSize: 0, color: "#f1f5f9", fontWeight: "bold", icon: "folder" } },
    { id: "cmp_22", compId: "tpl-a-022", type: "status-badge", parentId: "cmp_20", layout: { x: 30, y: 0, w: 8, h: 3 }, props: { fieldId: "cust_badge", label: "Status Badge", hAlign: "right", vAlign: "middle", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, status: "Active", tone: "success" } },
    { id: "cmp_23", compId: "tpl-a-023", type: "data-fact", parentId: "cmp_20", layout: { x: 0, y: 4, w: 18, h: 4 }, props: { fieldId: "cust_plan", label: "Current Plan", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, value: "5G Premium", displayMode: "side-by-side", dataPath: "@apiData.user.plan", valuePath: "", bgColor: DEFAULT_CONTAINER_BG } },
    { id: "cmp_24", compId: "tpl-a-024", type: "data-fact", parentId: "cmp_20", layout: { x: 20, y: 4, w: 18, h: 4 }, props: { fieldId: "cust_balance", label: "Balance", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, value: "89,000", displayMode: "side-by-side", dataPath: "@apiData.user.balance", valuePath: "", bgColor: DEFAULT_CONTAINER_BG } },
    { id: "cmp_25", compId: "tpl-a-025", type: "data-fact", parentId: "cmp_20", layout: { x: 0, y: 9, w: 18, h: 4 }, props: { fieldId: "acc_id", label: "Account ID", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, value: "ACC-2024-0042", displayMode: "side-by-side", dataPath: "@apiData.account.id", valuePath: "", bgColor: DEFAULT_CONTAINER_BG } },
    { id: "cmp_26", compId: "tpl-a-026", type: "data-fact", parentId: "cmp_20", layout: { x: 20, y: 9, w: 18, h: 4 }, props: { fieldId: "credit_rating", label: "Credit Rating", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, value: "A+", displayMode: "side-by-side", dataPath: "@apiData.account.credit", valuePath: "", bgColor: DEFAULT_CONTAINER_BG } },

    /* ── Divider ── */
    { id: "cmp_30", compId: "tpl-a-030", type: "divider", parentId: null, layout: { x: 0, y: 39, w: 40, h: 1 }, props: { fieldId: "divider_1", label: "Divider", hAlign: "center", vAlign: "middle", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, color: "#334155", orientation: "horizontal", thickness: 1 } },

    /* ── Subscription History (Data Grid) ── */
    { id: "cmp_31", compId: "tpl-a-031", type: "label", parentId: null, layout: { x: 0, y: 40, w: 30, h: 3 }, props: { fieldId: "grid_title", label: "Label", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, text: "Subscription History", preset: "h3", customFontSize: 0, color: "#f1f5f9", fontWeight: "bold", icon: "list" } },
    { id: "cmp_32", compId: "tpl-a-032", type: "data-grid", parentId: null, layout: { x: 0, y: 43, w: 40, h: 14 }, props: { fieldId: "sub_history_grid", label: "Data Grid", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, columns: [{ header: "Name", field: "name" }, { header: "Status", field: "status" }, { header: "Plan", field: "plan" }, { header: "Amount", field: "amount" }], selectionMode: "single", isEditable: false, allowAddRow: false, allowDeleteRow: false, isReadOnly: true, pagination: true, pageSize: 10, dataSourcePath: "@apiData.response.customers" } }
  ]
};


/* ─────────────────────────────────────────────
 * Template B: Mobile Signup
 * ───────────────────────────────────────────── */
export const TEMPLATE_MOBILE_SIGNUP = {
  screenInfo: { name: "Mobile Signup", version: "1.0" },
  logic: {
    variables: [
      { id: "lv_1", name: "formData", type: "object", initialValue: "{}" },
      { id: "lv_2", name: "isSubmitted", type: "boolean", initialValue: "false" }
    ],
    orderEvents: [
      {
        id: "oe_1",
        eventCode: "SIGNUP_SUBMIT",
        name: "Submit Signup",
        requestDtoJson: '{\n  "full_name": "",\n  "phone": "",\n  "email": "",\n  "address": "",\n  "plan": ""\n}',
        requestMapping: "full_name:$full_name.value, phone:$phone_input.value, email:$email_input.value, address:$address_input.value",
        onSuccessVariable: "isSubmitted",
        onSuccessPath: ""
      }
    ],
    activeScreen: "default"
  },
  components: [
    /* ── Header ── */
    { id: "cmp_1", compId: "tpl-b-001", type: "container", parentId: null, layout: { x: 0, y: 0, w: 40, h: 6 }, props: { fieldId: "header_section", label: "Container (Section)", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, showBorder: true, showBackground: true, padding: 6, bgColor: "#0f172a" } },
    { id: "cmp_2", compId: "tpl-b-002", type: "label", parentId: "cmp_1", layout: { x: 0, y: 0, w: 30, h: 3 }, props: { fieldId: "title_main", label: "Label", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, text: "Mobile Signup", preset: "h2", customFontSize: 0, color: "#f1f5f9", fontWeight: "bold", icon: "user" } },
    { id: "cmp_3", compId: "tpl-b-003", type: "label", parentId: "cmp_1", layout: { x: 0, y: 3, w: 38, h: 2 }, props: { fieldId: "subtitle", label: "Label", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, text: "Register a new mobile subscriber — fill out the form and choose a payment method", preset: "small", customFontSize: 0, color: "#64748b", fontWeight: "normal", icon: "none" } },

    /* ── Personal Info Section ── */
    { id: "cmp_10", compId: "tpl-b-010", type: "container", parentId: null, layout: { x: 0, y: 7, w: 40, h: 20 }, props: { fieldId: "personal_section", label: "Container (Section)", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, showBorder: true, showBackground: true, padding: 6, bgColor: DEFAULT_CONTAINER_BG } },
    { id: "cmp_11", compId: "tpl-b-011", type: "label", parentId: "cmp_10", layout: { x: 0, y: 0, w: 38, h: 3 }, props: { fieldId: "personal_title", label: "Label", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, text: "Personal Information", preset: "h3", customFontSize: 0, color: "#f1f5f9", fontWeight: "bold", icon: "user" } },
    { id: "cmp_12", compId: "tpl-b-012", type: "text-input", parentId: "cmp_10", layout: { x: 0, y: 3, w: 18, h: 4 }, props: { fieldId: "full_name", label: "Full Name", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, placeholder: "Enter full name", maxLength: 120, inputType: "text", mask: "" } },
    { id: "cmp_13", compId: "tpl-b-013", type: "text-input", parentId: "cmp_10", layout: { x: 20, y: 3, w: 18, h: 4 }, props: { fieldId: "phone_input", label: "Phone Number", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, placeholder: "010-0000-0000", maxLength: 13, inputType: "tel", mask: "000-0000-0000" } },
    { id: "cmp_14", compId: "tpl-b-014", type: "text-input", parentId: "cmp_10", layout: { x: 0, y: 8, w: 18, h: 4 }, props: { fieldId: "email_input", label: "Email Address", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, placeholder: "user@example.com", maxLength: 200, inputType: "email", mask: "" } },
    { id: "cmp_15", compId: "tpl-b-015", type: "date-picker", parentId: "cmp_10", layout: { x: 20, y: 8, w: 18, h: 4 }, props: { fieldId: "birth_date", label: "Date of Birth", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, placeholder: "YYYY-MM-DD", dateFormat: "YYYY-MM-DD" } },
    { id: "cmp_16", compId: "tpl-b-016", type: "text-input", parentId: "cmp_10", layout: { x: 0, y: 13, w: 38, h: 4 }, props: { fieldId: "address_input", label: "Address", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, placeholder: "Street, City, Province, Postal Code", maxLength: 300, inputType: "text", mask: "" } },

    /* ── Plan Selection ── */
    { id: "cmp_20", compId: "tpl-b-020", type: "container", parentId: null, layout: { x: 0, y: 28, w: 40, h: 12 }, props: { fieldId: "plan_section", label: "Container (Section)", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, showBorder: true, showBackground: true, padding: 6, bgColor: DEFAULT_CONTAINER_BG } },
    { id: "cmp_21", compId: "tpl-b-021", type: "label", parentId: "cmp_20", layout: { x: 0, y: 0, w: 38, h: 3 }, props: { fieldId: "plan_title", label: "Label", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, text: "Select Plan", preset: "h3", customFontSize: 0, color: "#f1f5f9", fontWeight: "bold", icon: "star" } },
    { id: "cmp_22", compId: "tpl-b-022", type: "combo-box", parentId: "cmp_20", layout: { x: 0, y: 3, w: 18, h: 4 }, props: { fieldId: "plan_select", label: "Plan Type", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, options: "5G Premium, 5G Standard, LTE Basic, LTE Plus" } },
    { id: "cmp_23", compId: "tpl-b-023", type: "radio-group", parentId: "cmp_20", layout: { x: 20, y: 3, w: 18, h: 4 }, props: { fieldId: "contract_period", label: "Contract Period", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, options: "12 Months, 24 Months, No Contract" } },
    { id: "cmp_24", compId: "tpl-b-024", type: "checkbox-group", parentId: "cmp_20", layout: { x: 0, y: 8, w: 38, h: 3 }, props: { fieldId: "addons", label: "Add-ons", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, options: "VoLTE, International Roaming, Data Plus, Insurance" } },

    /* ── Payment Accordion ── */
    { id: "cmp_30", compId: "tpl-b-030", type: "accordion", parentId: null, layout: { x: 0, y: 41, w: 40, h: 16 }, props: { fieldId: "payment_accordion", label: "Accordion", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, title: "Payment Methods", panels: "Credit Card, Bank Transfer, Auto-Pay Settings", activePanel: "Credit Card" } },

    /* ── Divider ── */
    { id: "cmp_35", compId: "tpl-b-035", type: "divider", parentId: null, layout: { x: 0, y: 58, w: 40, h: 1 }, props: { fieldId: "divider_1", label: "Divider", hAlign: "center", vAlign: "middle", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, color: "#334155", orientation: "horizontal", thickness: 1 } },

    /* ── Submit ── */
    { id: "cmp_40", compId: "tpl-b-040", type: "action-button", parentId: null, layout: { x: 0, y: 60, w: 40, h: 3 }, props: { fieldId: "btn_submit", label: "Action Button", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [{ type: "orderEvent", eventId: "oe_1", params: "", resultVariable: "isSubmitted", resultPath: "" }], onChange: [] }, text: "Submit Signup Application", actionType: "submit", icon: "check", colorPreset: "primary", params: "", customBgColor: "#3b82f6", customTextColor: "#ffffff" } }
  ]
};


/* ─────────────────────────────────────────────
 * Template C: Product Showcase
 * ───────────────────────────────────────────── */
export const TEMPLATE_PRODUCT_SHOWCASE = {
  screenInfo: { name: "Product Showcase", version: "1.0" },
  logic: {
    variables: [
      { id: "lv_1", name: "selectedPlan", type: "string", initialValue: "" },
      { id: "lv_2", name: "productList", type: "array", initialValue: "[]" }
    ],
    orderEvents: [
      {
        id: "oe_1",
        eventCode: "LOAD_PRODUCTS",
        name: "Load Products",
        requestDtoJson: "{}",
        requestMapping: "",
        onSuccessVariable: "productList",
        onSuccessPath: ""
      }
    ],
    activeScreen: "default"
  },
  components: [
    /* ── Header ── */
    { id: "cmp_1", compId: "tpl-c-001", type: "container", parentId: null, layout: { x: 0, y: 0, w: 40, h: 7 }, props: { fieldId: "header_section", label: "Container (Section)", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, showBorder: true, showBackground: true, padding: 6, bgColor: "#0f172a" } },
    { id: "cmp_2", compId: "tpl-c-002", type: "label", parentId: "cmp_1", layout: { x: 0, y: 0, w: 30, h: 3 }, props: { fieldId: "title_main", label: "Label", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, text: "Product Showcase", preset: "h2", customFontSize: 0, color: "#f1f5f9", fontWeight: "bold", icon: "star" } },
    { id: "cmp_3", compId: "tpl-c-003", type: "status-badge", parentId: "cmp_1", layout: { x: 30, y: 0, w: 8, h: 3 }, props: { fieldId: "live_badge", label: "Status Badge", hAlign: "right", vAlign: "middle", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, status: "Live", tone: "success" } },
    { id: "cmp_4", compId: "tpl-c-004", type: "label", parentId: "cmp_1", layout: { x: 0, y: 3, w: 38, h: 3 }, props: { fieldId: "subtitle", label: "Label", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, text: "Browse our latest 5G and LTE plans — pick the one that suits your lifestyle", preset: "small", customFontSize: 0, color: "#64748b", fontWeight: "normal", icon: "none" } },

    /* ── Featured Badge ── */
    { id: "cmp_10", compId: "tpl-c-010", type: "container", parentId: null, layout: { x: 0, y: 8, w: 40, h: 8 }, props: { fieldId: "featured_section", label: "Container (Section)", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, showBorder: true, showBackground: true, padding: 6, bgColor: DEFAULT_CONTAINER_BG } },
    { id: "cmp_11", compId: "tpl-c-011", type: "label", parentId: "cmp_10", layout: { x: 0, y: 0, w: 20, h: 3 }, props: { fieldId: "featured_title", label: "Label", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, text: "Featured Plan", preset: "h3", customFontSize: 0, color: "#f1f5f9", fontWeight: "bold", icon: "star" } },
    { id: "cmp_12", compId: "tpl-c-012", type: "data-fact", parentId: "cmp_10", layout: { x: 0, y: 3, w: 12, h: 4 }, props: { fieldId: "feat_plan_name", label: "Plan", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, value: "5G Standard", displayMode: "stacked", dataPath: "", valuePath: "", bgColor: DEFAULT_CONTAINER_BG } },
    { id: "cmp_13", compId: "tpl-c-013", type: "data-fact", parentId: "cmp_10", layout: { x: 13, y: 3, w: 12, h: 4 }, props: { fieldId: "feat_price", label: "Price", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, value: "75,000 Won/mo", displayMode: "stacked", dataPath: "", valuePath: "", bgColor: DEFAULT_CONTAINER_BG } },
    { id: "cmp_14", compId: "tpl-c-014", type: "status-badge", parentId: "cmp_10", layout: { x: 26, y: 3, w: 12, h: 3 }, props: { fieldId: "feat_badge", label: "Status Badge", hAlign: "left", vAlign: "middle", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, status: "5G", tone: "success" } },

    /* ── Divider ── */
    { id: "cmp_19", compId: "tpl-c-019", type: "divider", parentId: null, layout: { x: 0, y: 17, w: 40, h: 1 }, props: { fieldId: "divider_1", label: "Divider", hAlign: "center", vAlign: "middle", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, color: "#334155", orientation: "horizontal", thickness: 1 } },

    /* ── Card List Repeater: 5G Standard ── */
    { id: "cmp_20", compId: "tpl-c-020", type: "label", parentId: null, layout: { x: 0, y: 19, w: 30, h: 3 }, props: { fieldId: "plans_title", label: "Label", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, text: "Available Plans", preset: "h3", customFontSize: 0, color: "#f1f5f9", fontWeight: "bold", icon: "list" } },
    { id: "cmp_21", compId: "tpl-c-021", type: "card-list-repeater", parentId: null, layout: { x: 0, y: 22, w: 40, h: 18 }, props: { fieldId: "plan_cards", label: "Card List Repeater", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, dataSourcePath: "@apiData.response.products", cardTitle: "5G Standard", cardBadge: "5G", cardPrice: "75,000", cardPriceUnit: "Won/Month", cardDescription: "High-speed 5G data plan with unlimited streaming and premium content access.", cardFacts: "Data: 210GB, Voice: Unlimited, SMS: Unlimited, Tethering: 30GB", cardButtonText: "Select Plan", accentColor: "#3b82f6", cardWidth: 240, cardHeight: 0 } },

    /* ── Divider ── */
    { id: "cmp_25", compId: "tpl-c-025", type: "divider", parentId: null, layout: { x: 0, y: 41, w: 40, h: 1 }, props: { fieldId: "divider_2", label: "Divider", hAlign: "center", vAlign: "middle", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, color: "#334155", orientation: "horizontal", thickness: 1 } },

    /* ── Compare Grid ── */
    { id: "cmp_30", compId: "tpl-c-030", type: "label", parentId: null, layout: { x: 0, y: 43, w: 30, h: 3 }, props: { fieldId: "compare_title", label: "Label", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, text: "Plan Comparison", preset: "h3", customFontSize: 0, color: "#f1f5f9", fontWeight: "bold", icon: "chart" } },
    { id: "cmp_31", compId: "tpl-c-031", type: "data-grid", parentId: null, layout: { x: 0, y: 46, w: 40, h: 14 }, props: { fieldId: "compare_grid", label: "Data Grid", hAlign: "left", vAlign: "top", hiddenCon: "", readonlyCon: "", events: { onPageLoad: [], onClick: [], onChange: [] }, columns: [{ header: "Plan", field: "title" }, { header: "Price", field: "price" }, { header: "Badge", field: "badge" }], selectionMode: "single", isEditable: false, allowAddRow: false, allowDeleteRow: false, isReadOnly: true, pagination: false, pageSize: 10, dataSourcePath: "@apiData.response.products" } }
  ]
};


/* ─────────────────────────────────────────────
 * Registry – used by the template selector
 * ───────────────────────────────────────────── */
export const DEMO_TEMPLATES = [
  { key: "customer-lookup",  label: "Template A: Customer Lookup",  data: TEMPLATE_CUSTOMER_LOOKUP },
  { key: "mobile-signup",    label: "Template B: Mobile Signup",    data: TEMPLATE_MOBILE_SIGNUP },
  { key: "product-showcase", label: "Template C: Product Showcase", data: TEMPLATE_PRODUCT_SHOWCASE }
];
