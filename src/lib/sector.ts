import { fabric } from "fabric";
import { COLORS, PREVIEW_OPACITY, SEAT_HEIGHT, SEAT_WIDTH, TOOL_VALUE } from "@/constants";
import { createRectangle, createText } from "./shapes";
import { Assert } from "./assert";
import { Sector } from "@/types/sector.type";

export const createSectorPreview = (
    startPos: { x: number, y: number },
): fabric.Group => {
    const outerRect = createRectangle(startPos as any, {
        //   fill: 'transparent', 
        opacity: PREVIEW_OPACITY,
        width: 0, height: 0,
        originX: 'center',
        originY: 'center',
        stroke: COLORS.object.default,
        strokeWidth: 4,
    });
    /**
     * innerSeats 도형은 shapeType 기반으로 설정하기
     * const innerSeats = createCircle(...) --> 
     */
    const innerText = createText("hello", startPos as any, {
        opacity: PREVIEW_OPACITY,
        originX: 'center',
        originY: 'center'
    });
    // const sectorPreview = new fabric.Group([outerRect, innerText], {
    const sectorPreview = new fabric.Group([outerRect, innerText], {
        left: startPos?.x,
        top: startPos?.y,
        originX: 'left',
        originY: 'top',
        lockScalingX: false,
        lockScalingY: false,
    });
    return sectorPreview;
}