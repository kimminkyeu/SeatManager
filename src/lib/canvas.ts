import { fabric } from "fabric";
import { v4 as uuid4 } from "uuid";

import {
  CanvasMouseDown,
  CanvasMouseMove,
  CanvasMouseUp,
  CanvasObjectModified,
  CanvasObjectScaling,
  // CanvasPathCreated,
  CanvasSelectionCreated,
  CanvasSelectionUpdated,
  EditingAttribute,
  RenderCanvas,
  ShapeEditingAttribute,
} from "@/types/canvas.type";
import { DEFAULT_BACKGROUND_COLOR, TOOL_VALUE } from "@/constants";
import { createShape } from "./shapes";
import { Assert } from "./assert";
import { createSectorPreview } from "./sector";
import { Seat } from "@/types/seat.type";
import { Sector } from "@/types/sector.type";
import { SeatMapObjectTypeConstants, SeatMapUtil } from "./type-check";
import { EditableSeatMapObject } from "@/types/editorObject.type";

// initialize fabric canvas
export const initializeFabric = ({
  htmlCanvasElementId,
  fabricRef,
  canvasRef,
}: {
  htmlCanvasElementId: string;
  fabricRef: React.MutableRefObject<fabric.Canvas | null>;
  canvasRef: React.MutableRefObject<HTMLCanvasElement | null>;
}) => {
  // get canvas element
  const canvasElement = document.getElementById(htmlCanvasElementId);

  // create fabric canvas
  const fabricCanvas = new fabric.Canvas(canvasRef.current, {
    width: canvasElement?.clientWidth,
    height: canvasElement?.clientHeight,
    preserveObjectStacking: true, // preserve order
    backgroundColor: DEFAULT_BACKGROUND_COLOR,
  });

  // set canvas reference to fabricRef so we can use it later anywhere outside canvas listener
  fabricRef.current = fabricCanvas;

  return fabricCanvas;
};

// instantiate creation of custom fabric object/shape and add it to canvas
export const handleCanvasMouseDown = ({
  options,
  fabricCanvas,
  previewCanvas,
  selectedToolValueRef,
  lastModifiedObjectRef,
  isPanningRef,
  lastMousePointerRef,
  isSectorCreatingRef,
  previewSeatShapeRef,
}: CanvasMouseDown) => {

  Assert.NonNull(selectedToolValueRef.current, "선택된 툴은 반드시 있어야 합니다.");

  const pointer = fabricCanvas.getPointer(options.e);
  const target = fabricCanvas.findTarget(options.e, false);
  const event = options.e;
  const elem = document.getElementById("fabric-canvas");
  Assert.NonNull(elem);
  const currentX = event.clientX - elem.getBoundingClientRect().x;
  const currentY = event.clientY - elem.getBoundingClientRect().y;

  let createdObj: fabric.Object | null | undefined = null;

  switch (selectedToolValueRef.current) {

     case (TOOL_VALUE.panning):
      isPanningRef.current = true;
      lastMousePointerRef.current = { x: currentX, y: currentY };
      fabricCanvas.setCursor("grabbing");
      break; // *****************************************************

    case (TOOL_VALUE.select): 
      if ((target) &&
        ((selectedToolValueRef.current === target.type) || ("activeSelection" === target.type))
      ) {
        fabricCanvas.setActiveObject(target);
        target.setCoords();
        lastModifiedObjectRef.current = target;
      }
      break; // *****************************************************

    case (TOOL_VALUE.text):
      createdObj = createShape(
        TOOL_VALUE.text,
        pointer as any
      );
      break; // *****************************************************

    case (TOOL_VALUE.sector):
      isSectorCreatingRef.current = true;
      lastMousePointerRef.current = { x: currentX, y: currentY };

      // Create sector preview on mouse click
      const sectorPreviewShape = createSectorPreview(pointer as any);
      if (sectorPreviewShape) {
        previewCanvas.add(sectorPreviewShape);
        sectorPreviewShape.setCoords();
        previewSeatShapeRef.current = sectorPreviewShape;
      }
      break; // *****************************************************

    default: // create single seat
      Assert.Never("아직 미구현된 기능입니다.");
      // createdObj = new Seat(selectedToolValueRef.current, 0, 0);
      // createdSeat = createSeat(
      //   selectedToolValueRef.current,
      //   pointer as any
      // );
      break; // *****************************************************
  }

  if (createdObj) {
    createdObj.selectable = false; // make it unselectable
    fabricCanvas.add(createdObj);
    lastModifiedObjectRef.current = createdObj;
  }
};


// update shape in storage when object is modified
export const handleCanvasObjectModified = ({
  options,
}: CanvasObjectModified) => {

  const target = options.target;
  if (!target) {
    return;
  }
};


/**
 * TODO: 구현 필요!!!
 * @deprecated 현재 구현중입니다... (복수개 선택시 Attribute)
 */
export const createEditingAttribute_MultipleSelection = (sources: fabric.Object[]): (EditingAttribute | null) => {
  //...
  return createEditingAttribute(sources[0]);
}


export const createEditingAttribute = (source: fabric.Object): (EditingAttribute | null) => {

    switch (SeatMapUtil.getType(source)) {

      case (SeatMapObjectTypeConstants.SECTOR):
        /** Fall through */
      case (SeatMapObjectTypeConstants.SEAT):
        /** Fall through */
      case (SeatMapObjectTypeConstants.VENUE):
        return (source as EditableSeatMapObject).extractEditableState();

      case (SeatMapObjectTypeConstants.FABRIC_GROUP):
        // TODO: 그룹은 일단 첫번째 자식만 띄우지만, 나중엔 공통 요소를 띄우는 걸로 변경해도 될 것 같다..
        const objs = (source as fabric.Group).getObjects();
        return createShapeEditingAttribute(objs[0]);

      default: // Fabric Object
        return createShapeEditingAttribute(source);
    }
}

export const createShapeEditingAttribute = (source: fabric.Object): ShapeEditingAttribute => {
  const scaledWidth = source.scaleX
    ? source.width! * source.scaleX
    : source.width;
  const scaledHeight = source?.scaleY
    ? source.height! * source?.scaleY
    : source.height;
  let attribute: ShapeEditingAttribute = {
    type: "ShapeEditingAttribute",
    width: scaledWidth?.toFixed(0).toString() || "",
    height: scaledHeight?.toFixed(0).toString() || "",
    fill: source.fill?.toString() || "",
    stroke: source.stroke || "",
    // @ts-ignore
    fontSize: source?.fontSize || "",
    // @ts-ignore
    fontFamily: source?.fontFamily || "",
    // @ts-ignore
    fontWeight: source?.fontWeight || "",
  }
  return attribute;
}

export const handleCanvasSelectionUpdated = ({
  options,
  setEditingElementUiAttributes,
}: CanvasSelectionUpdated) => {
  
  if (!options?.selected) {
    return;
  }
  const selectedElement = options?.selected[0];
  if (selectedElement && options.selected.length === 1) { 
    let attribute = createEditingAttribute(selectedElement);
    setEditingElementUiAttributes(attribute);
    return;
  }

  // 
  // 여러 물체들이 선택된 경우. (TODO: 여러개일 경우 구현 필요.)
  // 
  if (selectedElement && (1 < options.selected.length)) {
    let attribute = createEditingAttribute_MultipleSelection(options.selected);
    setEditingElementUiAttributes(attribute);
    return;
  }
}

// set element attributes when element is selected
export const handleCanvasSelectionCreated = ({
  options,
  setEditingElementUiAttributes,
}: CanvasSelectionCreated) => {

  // if no element is selected, return
  if (!options?.selected) {
    return;
  }

  // get the selected element
  const selectedElement = options?.selected[0] as fabric.Object;

  /**
   * TODO: 만약 여러 물체가 선택되었다면, 어떻게 할 것인가??
   * 만약 그룹이라면, 어떻게 할 것인가?
   * 만약 섹터라면, 어떻게 할 것인가?
   */

  // if only one element is selected, set element attributes
  if (selectedElement && options.selected.length === 1) { 
    let attribute = createEditingAttribute(selectedElement);
    setEditingElementUiAttributes(attribute);
    return;
  }

  // 
  // 여러 물체들이 선택된 경우. (TODO: 여러개일 경우 구현 필요.)
  // 
  if (selectedElement && (1 < options.selected.length)) {
    let attribute = createEditingAttribute_MultipleSelection(options.selected);
    setEditingElementUiAttributes(attribute);
    return;
  }
};

// update element attributes when element is scaled
export const handleCanvasObjectScaling = ({
  options,
  setEditingElementUiAttributes,
}: CanvasObjectScaling) => {
  const selectedElement = options.target;

  // calculate scaled dimensions of the object
  const scaledWidth = selectedElement?.scaleX
    ? selectedElement?.width! * selectedElement?.scaleX
    : selectedElement?.width;

  const scaledHeight = selectedElement?.scaleY
    ? selectedElement?.height! * selectedElement?.scaleY
    : selectedElement?.height;

  setEditingElementUiAttributes((prev: any) => ({
    ...prev,
    width: scaledWidth?.toFixed(0).toString() || "",
    height: scaledHeight?.toFixed(0).toString() || "",
  }));
};

// resize canvas dimensions on window resize
export const handleCanvasResize = ({htmlCanvasElementId, canvas }: {htmlCanvasElementId: string, canvas: fabric.Canvas | fabric.StaticCanvas | null }) => {
  const canvasElement = document.getElementById(htmlCanvasElementId);

  if (!canvasElement || !canvas) {
    return;
  }

  canvas.setDimensions({
    width: canvasElement.clientWidth,
    height: canvasElement.clientHeight,
  });
};

// zoom canvas on mouse scroll
export const handleCanvasZoom = ({
  options,
  canvas,
}: {
  options: fabric.IEvent & { e: WheelEvent };
  canvas: fabric.Canvas | fabric.StaticCanvas;
}) => {
  const delta = options.e?.deltaY;
  let zoom = canvas.getZoom();

  // allow zooming to min 20% and max 100%
  const minZoom = 0.2;
  const maxZoom = 1;
  const zoomStep = 0.001;

  // calculate zoom based on mouse scroll wheel with min and max zoom
  zoom = Math.min(Math.max(minZoom, zoom + delta * zoomStep), maxZoom);

  // set zoom to canvas
  // zoomToPoint: http://fabricjs.com/docs/fabric.Canvas.html#zoomToPoint
  canvas.zoomToPoint({ x: options.e.offsetX, y: options.e.offsetY }, zoom);

  options.e.preventDefault();
  options.e.stopPropagation();
};