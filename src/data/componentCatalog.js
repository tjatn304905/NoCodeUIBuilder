export const CELL_SIZE = 20;
export const CANVAS_WIDTH = 1280;
export const COLS = CANVAS_WIDTH / CELL_SIZE;

export const COMPONENT_CATALOG = [
  {
    group: "Containers",
    items: [
      {
        type: "section-box",
        label: "Section Box",
        defaultSize: { w: 32, h: 16 },
        defaultProps: { title: "Section Title", icon: "folder" }
      }
    ]
  },
  {
    group: "Inputs",
    items: [
      {
        type: "text-input",
        label: "Text Input",
        defaultSize: { w: 16, h: 4 },
        defaultProps: { placeholder: "Enter value", maxLength: 120, inputType: "text" }
      },
      {
        type: "combo-box",
        label: "Combo Box",
        defaultSize: { w: 16, h: 4 },
        defaultProps: { options: "Plan A, Plan B, Plan C" }
      },
      {
        type: "radio-group",
        label: "Radio Group",
        defaultSize: { w: 24, h: 4 },
        defaultProps: { options: "Yes, No" }
      },
      {
        type: "address-picker",
        label: "Address Picker",
        defaultSize: { w: 32, h: 4 },
        defaultProps: { buttonLabel: "Search" }
      }
    ]
  },
  {
    group: "Displays",
    items: [
      {
        type: "data-fact",
        label: "Data Fact",
        defaultSize: { w: 16, h: 4 },
        defaultProps: { value: "N/A", displayMode: "side-by-side" }
      },
      {
        type: "status-badge",
        label: "Status Badge",
        defaultSize: { w: 12, h: 2 },
        defaultProps: { status: "Active", tone: "success" }
      },
      {
        type: "divider",
        label: "Divider",
        defaultSize: { w: 32, h: 2 },
        defaultProps: {}
      }
    ]
  },
  {
    group: "Advanced",
    items: [
      {
        type: "data-grid",
        label: "Data Grid",
        defaultSize: { w: 48, h: 14 },
        defaultProps: {
          columns: "Name:name, Status:status, Plan:plan, Amount:amount",
          selectionMode: "single",
          isEditable: false,
          allowAddRow: false,
          allowDeleteRow: false,
          isReadOnly: true,
          pagination: true,
          pageSize: 10,
          dataSourcePath: "api.response.customers"
        }
      },
      {
        type: "card-list-repeater",
        label: "Card List Repeater",
        defaultSize: { w: 20, h: 22 },
        defaultProps: {
          dataSourcePath: "api.response.products",
          cardTitle: "5G Standard",
          cardBadge: "5G",
          cardPrice: "75,000",
          cardPriceUnit: "Won/Month",
          cardDescription: "High-speed 5G data plan with unlimited streaming and premium content access.",
          cardFacts: "Data: 210GB, Voice: Unlimited, SMS: Unlimited, Tethering: 30GB",
          cardButtonText: "Select Plan",
          accentColor: "blue"
        }
      }
    ]
  },
  {
    group: "Actions",
    items: [
      {
        type: "primary-button",
        label: "Primary Button",
        defaultSize: { w: 12, h: 4 },
        defaultProps: { text: "Submit", actionType: "submit" }
      },
      {
        type: "secondary-button",
        label: "Secondary Button",
        defaultSize: { w: 12, h: 4 },
        defaultProps: { text: "Cancel", actionType: "navigate" }
      }
    ]
  }
];

export const CONTAINER_TYPES = new Set(["section-box", "card-list-repeater"]);
