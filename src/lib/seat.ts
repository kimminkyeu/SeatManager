import { fabric } from "fabric";
import { createRectangle, createShape, createText, modifyObject } from "./shapes";
import { COLORS, PREVIEW_OPACITY, SEAT_HEIGHT, SEAT_WIDTH } from "@/constants";
import { ModifyShape } from "@/types/canvas.type";
import { Assert } from "./assert";
import { v4 as uuidv4 } from 'uuid';
// import { Seat } from "@/types/seat.type";
// import { IObjectOptions } from "fabric/fabric-impl";

// /**
//  * @deprecated Seat 클래스 사용하는 것으로 변경합니다.
//  */
// export const createSeat = (
//     shapeType: string,
//     pointer?: PointerEvent,
//     seatRowNum?: number,
//     seatColNum?: number,
//     options?: IObjectOptions,
// ): Seat => {

//     const seat = createShape(shapeType, pointer, options) as unknown as Seat;

//     seat.seatRow = seatRowNum;
//     seat.seatCol = seatColNum;

//     return seat;
// }

export const modifyCanvasObject = ({
    canvas,
    property,
    value,
}: ModifyShape) => {

    modifyObject({
        canvas,
        property,
        value,
    });
}