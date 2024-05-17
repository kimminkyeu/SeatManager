import { fabric } from "fabric";
import { v4 as uuidv4 } from "uuid";

import {
  FabricObjectWithId,
  ElementDirection,
  ImageUpload,
  ModifyShape,
} from "@/types/canvas.type";
import { PREVIEW_OPACITY, COLORS, SHAPE_SIZE, TOOL_VALUE } from "@/constants";
import { Assert } from "./assert";
import { ICircleOptions, IRectOptions, ITextOptions } from "fabric/fabric-impl";
import { EditorObject, Sector, SectorEditingAttribute } from "@/types/sector.type";
import { ObjectType, ObjectUtil } from "./type-check";

export const createCircle = (
  pointer?: PointerEvent, 
  option?: ICircleOptions,
) => {
  const circle = new fabric.Circle({
    radius: SHAPE_SIZE.circle.radius.default,
    left: pointer?.x,
    top: pointer?.y,
    fill: COLORS.object.default,
    opacity: option?.opacity ?? 1,
    originX: 'center',
    originY: 'center',
    hasControls: false,
    objectId: uuidv4(),
    ...option,
  } as FabricObjectWithId<fabric.Circle>);

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
    fill: COLORS.object.default,
    objectId: uuidv4(),
    ...option,
  } as FabricObjectWithId<fabric.Rect>);

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
  shapeType: string,
  pointer?: PointerEvent,
  isPreview?: boolean
) {

  const opacity = (isPreview ? PREVIEW_OPACITY : 1);

  switch (shapeType) {

    case TOOL_VALUE.circle:
      return createCircle(pointer, { opacity: opacity });

    case TOOL_VALUE.text:
      return createText("double click to type...", pointer, { opacity: opacity });
  
    default:
      Assert.Never("shape이 아닌 것이 생성할 수 없습니다!");
      return null;
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

    switch (ObjectUtil.getType(selectedElement)) {

      /**
       * getter setter를 깔끔하게 정리하니까, 아래 코드가 정돈되긴 하네...
       */
      case (ObjectType.SECTOR):
        Assert.True(selectedElement instanceof Sector);
        const sector = (selectedElement as Sector);
        modifyShapeInternal(sector, property, value);
        sector.getSeats().forEach((seat) => {
          modifyShapeInternal(seat, property, value);
        })
        break;

      case (ObjectType.SEAT):
        Assert.Never("아직 미구현된 기능입니다. 현재 Seat은 일반 객체입니다.")
        // TODO: implement seat object?
        break;

      case (ObjectType.FABRIC_GROUP):
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