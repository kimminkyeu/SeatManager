import { Updater } from "use-immer";
import { SeatEditingAttributes } from "./seat.type";
import { SectorEditingAttribute } from "./sector.type";
import { fabric } from "fabric";
import { v4 as uuidv4 } from 'uuid';

export interface ShapeEditingAttribute {
  width: string;
  height: string;
  fontSize: string;
  fontFamily: string;
  fontWeight: string;
  fill: string;
  stroke: string;
};


export type ToolElement = {
  icon: string;
  name: string;
  value: string | Array<ToolElement>;
};


export type ModifyShape = {
  canvas: fabric.Canvas;
  property: string;
  value: string | number;
};

export type ElementDirection = {
  canvas: fabric.Canvas;
  direction: string;
};

export type ImageUpload = {
  file: File;
  canvas: React.MutableRefObject<fabric.Canvas>;
};

export type EditingAttribute = SectorEditingAttribute | SeatEditingAttributes | ShapeEditingAttribute;

export type ShapesMenuProps = {
  item: {
    name: string;
    icon: string;
    value: Array<ToolElement>;
  };
  ToolElement: any;
  handleToolElement: any;
  handleImageUpload: any;
  imageInputRef: any;
};


export type CanvasMouseDown = {
  options: fabric.IEvent<MouseEvent>;
  fabricCanvas: fabric.Canvas;
  previewCanvas: fabric.StaticCanvas;
  selectedToolValueRef: React.MutableRefObject<string | null>;
  lastModifiedObjectRef: React.MutableRefObject<fabric.Object | null>;
  isPanningRef: React.MutableRefObject<boolean>;
  isSectorCreatingRef: React.MutableRefObject<boolean>;
  lastMousePointerRef: React.MutableRefObject<{x: number, y:number}>;
  previewSeatShapeRef: React.MutableRefObject<fabric.Object | null>;
};

export type CanvasMouseMove = {
  options: fabric.IEvent;
  canvas: fabric.Canvas;
  selectedToolValueRef: React.MutableRefObject<string | null>;
};

export type CanvasMouseUp = {
  canvas: fabric.Canvas;
  isPanningRef: React.MutableRefObject<boolean>;
  isSectorCreatingRef: React.MutableRefObject<boolean>;
};

export type CanvasObjectModified = {
  options: fabric.IEvent;
};

// export type CanvasPathCreated = {
//   options: (fabric.IEvent & { path: FabricObjectWithId<fabric.Path> }) | any;
// };

export type CanvasSelectionCreated = {
  options: fabric.IEvent;
  setEditingElementUiAttributes: Updater<EditingAttribute | null>
};

export type CanvasSelectionUpdated = {
  options: fabric.IEvent;
  setEditingElementUiAttributes: Updater<EditingAttribute | null>
};

export type CanvasObjectScaling = {
  options: fabric.IEvent;
  setEditingElementUiAttributes: Updater<EditingAttribute | null>
};

export type RenderCanvas = {
  fabricRef: React.MutableRefObject<fabric.Canvas | null>;
  canvasObjects: any;
};