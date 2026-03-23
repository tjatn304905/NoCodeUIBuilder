export const COLS = 16;
export const CANVAS_WIDTH = 1280;
export const COL_WIDTH = CANVAS_WIDTH / COLS;
export const ROW_HEIGHT = 40;

export const COMPONENT_CATALOG = [
  {
    group: "Containers",
    items: [
      {
        type: "section-box",
        label: "Section Box",
        defaultSize: { w: 8, h: 8 },
        defaultProps: { title: "Section Title", icon: "folder" }
      },
      {
        type: "grid-stack",
        label: "Grid Stack",
        defaultSize: { w: 8, h: 6 },
        defaultProps: { title: "Stack Group" }
      }
    ]
  },
  {
    group: "Inputs",
    items: [
      {
        type: "text-input",
        label: "Text Input",
        defaultSize: { w: 4, h: 2 },
        defaultProps: { placeholder: "Enter value", maxLength: 120, inputType: "text" }
      },
      {
        type: "combo-box",
        label: "Combo Box",
        defaultSize: { w: 4, h: 2 },
        defaultProps: { options: "Plan A, Plan B, Plan C" }
      },
      {
        type: "radio-group",
        label: "Radio Group",
        defaultSize: { w: 6, h: 2 },
        defaultProps: { options: "Yes, No" }
      },
      {
        type: "address-picker",
        label: "Address Picker",
        defaultSize: { w: 8, h: 2 },
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
        defaultSize: { w: 4, h: 2 },
        defaultProps: { value: "N/A", displayMode: "side-by-side" }
      },
      {
        type: "status-badge",
        label: "Status Badge",
        defaultSize: { w: 3, h: 1 },
        defaultProps: { status: "Active", tone: "success" }
      },
      {
        type: "divider",
        label: "Divider",
        defaultSize: { w: 8, h: 1 },
        defaultProps: {}
      }
    ]
  },
  {
    group: "Advanced",
    items: [
      {
        type: "card-list-repeater",
        label: "Card List Repeater",
        defaultSize: { w: 8, h: 6 },
        defaultProps: { dataSourcePath: "customer.services" }
      }
    ]
  },
  {
    group: "Actions",
    items: [
      {
        type: "primary-button",
        label: "Primary Button",
        defaultSize: { w: 3, h: 2 },
        defaultProps: { text: "Submit", actionType: "submit" }
      },
      {
        type: "secondary-button",
        label: "Secondary Button",
        defaultSize: { w: 3, h: 2 },
        defaultProps: { text: "Cancel", actionType: "navigate" }
      }
    ]
  }
];

export const CONTAINER_TYPES = new Set(["section-box", "grid-stack", "card-list-repeater"]);
