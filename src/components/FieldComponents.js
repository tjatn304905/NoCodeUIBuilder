import { h } from "vue";

const inputClass = "h-8 w-full rounded-md border border-slate-600 bg-slate-800 px-2 text-xs text-slate-100 focus:border-blue-400 focus:outline-none";

function toHexColor(value) {
  const fallback = "#ffffff";
  const raw = String(value || "").trim();
  if (!raw) return fallback;
  if (/^#([0-9a-fA-F]{3})$/.test(raw))
    return `#${raw.slice(1).split("").map((c) => c + c).join("").toLowerCase()}`;
  if (/^#([0-9a-fA-F]{6})$/.test(raw)) return raw.toLowerCase();
  const m = raw.match(/^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)(?:\s*,\s*[\d.]+\s*)?\)$/i);
  if (!m) return fallback;
  const cl = (n) => Math.max(0, Math.min(255, Math.round(Number(n) || 0)));
  return `#${cl(m[1]).toString(16).padStart(2, "0")}${cl(m[2]).toString(16).padStart(2, "0")}${cl(m[3]).toString(16).padStart(2, "0")}`;
}

export const FieldText = {
  props: { label: String, modelValue: [String, Number] },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    return () => h("label", { class: "block text-xs text-slate-300" }, [
      h("span", { class: "mb-1 block font-medium" }, props.label),
      h("input", { class: inputClass, value: props.modelValue ?? "", onInput: (e) => emit("update:modelValue", e.target.value) })
    ]);
  }
};

export const FieldNumber = {
  props: { label: String, modelValue: [String, Number], min: Number, max: Number },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    return () => h("label", { class: "block text-xs text-slate-300" }, [
      h("span", { class: "mb-1 block font-medium" }, props.label),
      h("input", {
        type: "number", class: inputClass,
        value: props.modelValue ?? 0,
        min: props.min, max: props.max,
        onInput: (e) => emit("update:modelValue", Number(e.target.value))
      })
    ]);
  }
};

export const FieldSelect = {
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

export const FieldColor = {
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

export const FieldCheck = {
  props: { label: String, modelValue: Boolean },
  emits: ["update:modelValue"],
  setup(props, { emit }) {
    return () => h("label", { class: "flex cursor-pointer items-center gap-2 text-xs text-slate-300" }, [
      h("input", { type: "checkbox", class: "accent-blue-600", checked: props.modelValue, onChange: (e) => emit("update:modelValue", e.target.checked) }),
      h("span", { class: "font-medium" }, props.label)
    ]);
  }
};
