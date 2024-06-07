
export const TOOL_VALUE = {
  panning: "panning",
  select: "select",
  delete: "delete",
  group: "group",
  ungroup: "ungroup",
  circle: FabricObjectTypeConstants.FABRIC_CIRCLE,
  text: FabricObjectTypeConstants.FABRIC_TEXT,
  image: FabricObjectTypeConstants.FABRIC_IMAGE,
  seat: SeatMapObjectTypeConstants.SEAT,
  sector: SeatMapObjectTypeConstants.SECTOR,
}

interface ShapeSize {
  circle: {
    radius: {
      default: number
    }
  }
}

export const EDITMODE_BACKGROUND_COLOR: string = "#d9d9d9";
export const DEFAULT_BACKGROUND_COLOR: string = "#F2F2F2";

export const GRID_COLOR: string = "#c2c2c2";

export const PREVIEW_OPACITY: number = 0.3;

export const SEAT_WIDTH = 40;
export const SEAT_HEIGHT = 40;

export const SHAPE_SIZE : ShapeSize = {
  circle: {
    radius: {
      default: 20
    }
  }
}

export const DEFAULTS = {
  SEAT_SIZE: 40
}

export const COLORS = {
  venue: {
    default: "#000000",

  },
  object: {
    default: "#83c3b8",
    // selected: "#FFAA00",
  },
  text : {
    default: "#000000",
  }
};

import { FabricObjectTypeConstants, SeatMapObjectTypeConstants } from "@/lib/type-check";
import * as svgs from "@/svgs/import";
import { ToolElement } from "@/types/canvas.type";

export const TOOL_ELEMENT_SELECT: ToolElement = {
  icon: svgs.select,
  name: "Select",
  value: TOOL_VALUE.select,
};

export const TOOL_ELEMENT_PANNING: ToolElement = {
   icon: svgs.panning,
    name: "Panning",
    value: TOOL_VALUE.panning,
};

export const TOOL_ELEMENT_CIRCLE: ToolElement = {
    icon: svgs.circle,
    name: "Circle",
    value: TOOL_VALUE.circle,
};

export const TOOL_ELEMENT_TEXT: ToolElement = {
    icon: svgs.text,
    name: "Text",
    value: TOOL_VALUE.text,
};

export const TOOL_ELEMENT_IMAGE: ToolElement = {
    icon: svgs.image,
    name: "Image",
    value: TOOL_VALUE.image,
};

export const TOOL_ELEMENT_GROUP: ToolElement = {
    icon: svgs.group,
    name: "Group",
    value: TOOL_VALUE.group,
};

export const TOOL_ELEMENT_UNGROUP: ToolElement = {
    icon: svgs.ungroup,
    name: "Ungroup",
    value: TOOL_VALUE.ungroup,
};

export const TOOL_ELEMENT_DELETE: ToolElement = {
    icon: svgs.delete,
    name: "Delete",
    value: TOOL_VALUE.delete,
};

export const TOOL_ELEMENT_SECTOR: ToolElement = {
    icon: svgs.sector,
    name: "Generate Sector",
    value: TOOL_VALUE.sector,
};

/**
 * this is navigation elements setting.
*/
export const ToolElementsInNavbar: Array<ToolElement> = [
  TOOL_ELEMENT_PANNING,
  TOOL_ELEMENT_SELECT,
  // TOOL_ELEMENT_CIRCLE,
  TOOL_ELEMENT_SECTOR, // Sector Creation
  TOOL_ELEMENT_IMAGE,
  TOOL_ELEMENT_TEXT,
  TOOL_ELEMENT_GROUP,
  TOOL_ELEMENT_UNGROUP,
  TOOL_ELEMENT_DELETE,
];

// ---------------------------------------------------------------------
export const TOOL_ELEMENT_DEFAULT: ToolElement = TOOL_ELEMENT_SELECT; // select
// ---------------------------------------------------------------------

export const directionOptions = [
  { label: "Bring to Front", value: "front", icon: svgs.front, shortcuts: "ctrl + ]" },
  { label: "Send to Back", value: "back", icon: svgs.back, shortcuts: "ctrl + [" },
];

export const fontFamilyOptions = [
  { value: "Helvetica", label: "Helvetica" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Comic Sans MS", label: "Comic Sans MS" },
  { value: "Brush Script MT", label: "Brush Script MT" },
];

export const fontSizeOptions = [
  {
    value: "10",
    label: "10",
  },
  {
    value: "12",
    label: "12",
  },
  {
    value: "14",
    label: "14",
  },
  {
    value: "16",
    label: "16",
  },
  {
    value: "18",
    label: "18",
  },
  {
    value: "20",
    label: "20",
  },
  {
    value: "22",
    label: "22",
  },
  {
    value: "24",
    label: "24",
  },
  {
    value: "26",
    label: "26",
  },
  {
    value: "28",
    label: "28",
  },
  {
    value: "30",
    label: "30",
  },
  {
    value: "32",
    label: "32",
  },
  {
    value: "34",
    label: "34",
  },
  {
    value: "36",
    label: "36",
  },
];

export const fontWeightOptions = [
  {
    value: "400",
    label: "Normal",
  },
  {
    value: "500",
    label: "Semibold",
  },
  {
    value: "600",
    label: "Bold",
  },
];

export const alignmentOptions = [
  { 
    value: "left", 
    label: "Align Left", 
    icon: svgs.align_left
  },
  {
    value: "horizontalCenter",
    label: "Align Horizontal Center",
    icon: svgs.align_horizontal_center
  },
  { 
    value: "right", 
    label: "Align Right", 
    icon: svgs.align_right
  },
  { 
    value: "top", 
    label: "Align Top", 
    icon: svgs.align_top
  },
  {
    value: "verticalCenter",
    label: "Align Vertical Center",
    icon: svgs.align_vertical_center
  },
  { 
    value: "bottom", 
    label: "Align Bottom", 
    icon: svgs.align_bottom 
  },
];

export const shortcuts = [
  {
    key: "2",
    name: "Undo",
    shortcut: "⌘ + Z",
  },
  {
    key: "3",
    name: "Redo",
    shortcut: "⌘ + Y",
  }
];