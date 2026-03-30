export const CELL_SIZE = 10;
export const CANVAS_WIDTH = 1280;
export const COLS = CANVAS_WIDTH / CELL_SIZE;

/** Default fill when Container has showBackground */
export const DEFAULT_CONTAINER_BG = "#1e293b";

/** Data Fact panel background (dark UI, matches sections) */
export const DEFAULT_DATA_FACT_BG = DEFAULT_CONTAINER_BG;

export const MOCK_API_DATA = {
  apiData: {
    user: {
      name: "Kim Min-jun",
      phone: "010-1234-5678",
      email: "minjun.kim@example.com",
      status: "Active",
      plan: "5G Premium",
      balance: "89,000",
      address: "Seoul, Gangnam-gu",
      joinDate: "2023-01-15"
    },
    account: {
      id: "ACC-2024-0042",
      type: "Premium",
      credit: "A+",
      dueDate: "2024-03-25"
    },
    response: {
      customers: [
        { name: "Kim Min-jun", status: "Active", plan: "5G Premium", amount: "89,000" },
        { name: "Lee Su-jin", status: "Pending", plan: "LTE Basic", amount: "45,000" },
        { name: "Park Ji-ho", status: "Active", plan: "5G Standard", amount: "75,000" }
      ],
      products: [
        { title: "5G Premium", price: "89,000", badge: "5G" },
        { title: "LTE Basic", price: "45,000", badge: "LTE" },
        { title: "5G Standard", price: "75,000", badge: "5G" }
      ]
    }
  }
};

export const COMPONENT_CATALOG = [
  {
    group: "Containers",
    items: [
      {
        type: "container",
        label: "Container (Section)",
        defaultSize: { w: 64, h: 32 },
        defaultProps: {
          showBorder: true,
          showBackground: true,
          padding: 12,
          bgColor: DEFAULT_CONTAINER_BG
        }
      },
      {
        type: "accordion",
        label: "Accordion",
        defaultSize: { w: 64, h: 32 },
        defaultProps: {
          title: "Payment Method",
          panels: "Cash, Card, Installment",
          activePanel: "Cash"
        }
      }
    ]
  },
  {
    group: "Inputs",
    items: [
      {
        type: "text-input",
        label: "Base Input (Masked)",
        defaultSize: { w: 32, h: 8 },
        defaultProps: { placeholder: "Enter value", maxLength: 120, inputType: "text", mask: "" }
      },
      {
        type: "combo-box",
        label: "Combo Box",
        defaultSize: { w: 32, h: 8 },
        defaultProps: { options: "Plan A, Plan B, Plan C" }
      },
      {
        type: "radio-group",
        label: "Radio Group",
        defaultSize: { w: 48, h: 8 },
        defaultProps: { options: "Yes, No" }
      },
      {
        type: "checkbox-group",
        label: "Checkbox Group",
        defaultSize: { w: 48, h: 8 },
        defaultProps: { options: "Option A, Option B, Option C" }
      },
      {
        type: "date-picker",
        label: "Date Picker",
        defaultSize: { w: 32, h: 8 },
        defaultProps: { placeholder: "YYYY-MM-DD", dateFormat: "YYYY-MM-DD" }
      }
    ]
  },
  {
    group: "Displays",
    items: [
      {
        type: "label",
        label: "Label",
        defaultSize: { w: 48, h: 6 },
        defaultProps: {
          text: "Title or description",
          preset: "body",
          customFontSize: 0,
          color: "#e2e8f0",
          fontWeight: "normal",
          icon: "none"
        }
      },
      {
        type: "data-fact",
        label: "Data Fact",
        defaultSize: { w: 32, h: 8 },
        defaultProps: { value: "N/A", displayMode: "side-by-side", dataPath: "", valuePath: "", bgColor: DEFAULT_DATA_FACT_BG }
      },
      {
        type: "status-badge",
        label: "Status Badge",
        defaultSize: { w: 24, h: 4 },
        defaultProps: { status: "Active", tone: "success" }
      },
      {
        type: "divider",
        label: "Divider",
        defaultSize: { w: 64, h: 2 },
        defaultProps: { color: "#cbd5e1", orientation: "horizontal", thickness: 1, hAlign: "center", vAlign: "middle" }
      },
      {
        type: "data-grid",
        label: "Data Grid",
        defaultSize: { w: 96, h: 28 },
        defaultProps: {
          columns: [
            { header: "Name", field: "name" },
            { header: "Status", field: "status" },
            { header: "Plan", field: "plan" },
            { header: "Amount", field: "amount" }
          ],
          selectionMode: "single",
          isEditable: false,
          allowAddRow: false,
          allowDeleteRow: false,
          isReadOnly: true,
          pagination: true,
          pageSize: 10,
          dataSourcePath: "@apiData.response.customers"
        }
      },
      {
        type: "card-list-repeater",
        label: "Card List Repeater",
        defaultSize: { w: 40, h: 44 },
        defaultProps: {
          dataSourcePath: "@apiData.response.products",
          cardTitle: "5G Standard",
          cardBadge: "5G",
          cardPrice: "75,000",
          cardPriceUnit: "Won/Month",
          cardDescription: "High-speed 5G data plan with unlimited streaming and premium content access.",
          cardFacts: "Data: 210GB, Voice: Unlimited, SMS: Unlimited, Tethering: 30GB",
          cardButtonText: "Select Plan",
          accentColor: "#3b82f6",
          cardWidth: 240,
          cardHeight: 0
        }
      }
    ]
  },
  {
    group: "Actions",
    items: [
      {
        type: "action-button",
        label: "Action Button",
        defaultSize: { w: 24, h: 8 },
        defaultProps: {
          text: "Submit",
          actionType: "submit",
          icon: "none",
          params: "",
          colorPreset: "primary",
          customBgColor: "#3b82f6",
          customTextColor: "#ffffff"
        }
      }
    ]
  }
];

export const CONTAINER_TYPES = new Set(["container", "accordion", "card-list-repeater", "data-grid"]);
