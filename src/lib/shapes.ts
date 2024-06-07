import { fabric } from "fabric";
import { v4 as uuidv4 } from "uuid";

import {
  ElementDirection,
  ImageUpload,
  ModifyShape,
} from "@/types/canvas.type";
import { PREVIEW_OPACITY, COLORS, SHAPE_SIZE, TOOL_VALUE } from "@/constants";
import { Assert } from "./assert";
import { ICircleOptions, IObjectOptions, IRectOptions, ITextOptions } from "fabric/fabric-impl";
import { Sector, SectorEditingAttribute } from "@/types/sector.type";
import { FabricObjectType, FabricObjectTypeConstants, SeatMapObjectTypeConstants, SeatMapUtil } from "./type-check";
import { Seat } from "@/types/seat.type";

export const createCircle = (
  pointer?: PointerEvent, 
  option?: ICircleOptions,
) => {
  const circle = new fabric.Circle({
    radius: SHAPE_SIZE.circle.radius.default,
    left: pointer?.x,
    top: pointer?.y,
    // fill: COLORS.object.default,
    opacity: option?.opacity ?? 1,
    // originX: 'center',
    // originY: 'center',
    hasControls: false,
    objectId: uuidv4(),
    ...option,
  } as any);

  return circle;
};

export const createRectangle = (
  pointer?: PointerEvent, 
  option?: IRectOptions,
) => {
  const rect = new fabric.Rect({
    left: pointer?.x,
    top: pointer?.y,
    opacity: option?.opacity ?? 1,
    width: option?.width ?? 100, // default size is 100
    height: option?.height ?? 100,
    // fill: COLORS.object.default,
    objectId: uuidv4(),
    ...option,
  } as any);

  return rect;
};

export const createText = (
  text: string, 
  pointer?: PointerEvent, 
  option?: ITextOptions,
) => {
  return new fabric.IText(text, {
    left: pointer?.x,
    top: pointer?.y,
    opacity: option?.opacity ?? 1,
    fill: "black",
    fontFamily: "Helvetica",
    fontSize: 24,
    fontWeight: "400",
    objectId: uuidv4(),
    ...option,
  } as fabric.ITextOptions);
};

export function createShape (
  shapeType: FabricObjectType,
  pointer?: PointerEvent,
  options?: IObjectOptions,
) {

  switch (shapeType) {

    case FabricObjectTypeConstants.FABRIC_CIRCLE:
      return createCircle(pointer, options);

    case FabricObjectTypeConstants.FABRIC_TEXT:
      return createText("double click to type...", pointer, options);

    case FabricObjectTypeConstants.FABRIC_RECT:
      return createRectangle(pointer, options);
  
    default:
      Assert.Never(`지원하지 않는 Shape입니다: ${shapeType}`);
  }
};

export const handleImageUpload = ({
  file,
  canvas,
}: ImageUpload) => {
  const reader = new FileReader();

  reader.onload = () => {
    fabric.Image.fromURL(reader.result as string, (img) => {
      img.scaleToWidth(200);
      img.scaleToHeight(200);

      canvas.current.add(img);

      // @ts-ignore
      img.objectId = uuidv4();

      canvas.current.requestRenderAll();
    });
  };

  reader.readAsDataURL(file);
};

const modifyShapeInternal = (obj: fabric.Object, property: string, value: any) => {
  if (property === "width") {
    obj.set("scaleX", 1);
    obj.set("width", value);
    return;
  } 
  if (property === "height") {
    obj.set("scaleY", 1);
    obj.set("height", value);
    return;
  }
  if (false === (property in obj)) {
    return;
  }
  if (obj[property as keyof object] === value) {
    return;
  }
  obj.set(property as keyof object, value);
}

export const modifyObject = ({
  canvas,
  property,
  value,
}: ModifyShape) => {

  canvas.getActiveObjects().forEach((selectedElement) => {

    if (!selectedElement || selectedElement?.type === "activeSelection") {
      return;
    }

    switch (SeatMapUtil.getType(selectedElement)) {

      case (FabricObjectTypeConstants.FABRIC_GROUP):
        modifyShapeInternal(selectedElement, property, value);
        (selectedElement as fabric.Group)
          .getObjects()
          .forEach(obj => {
            modifyShapeInternal(obj, property, value);
          })
        break;
 
      default: // just shape
        modifyShapeInternal(selectedElement, property, value);
        break;
    }
    canvas.requestRenderAll();
  })
};

export const bringElementTo = ({
  direction,
  canvas,
}: ElementDirection) => {

  console.log(`bringElementTo( ${direction} )`);

  if (!canvas) {
    return;
  }

  // get the selected element. If there is no selected element or there are more than one selected element, return
  const selectedElement = canvas.getActiveObject();

  if (!selectedElement || selectedElement?.type === "activeSelection") return;

  // bring the selected element to the front
  if (direction === "front") {
    canvas.bringToFront(selectedElement);
  } else if (direction === "back") {
    canvas.sendToBack(selectedElement);
  }
  canvas.renderAll();
};