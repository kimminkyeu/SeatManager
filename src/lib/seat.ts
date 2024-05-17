import { fabric } from "fabric";
import { createRectangle, createShape, createText, modifyObject } from "./shapes";
import { COLORS, PREVIEW_OPACITY, SEAT_HEIGHT, SEAT_WIDTH } from "@/constants";
import { ModifyShape } from "@/types/canvas.type";
import { Assert } from "./assert";
import { v4 as uuidv4 } from 'uuid';
import { Seat, SeatData } from "@/types/seat.type";

export const createSeat = (
    shapeType: string,
    pointer?: PointerEvent,
    isPreview?: boolean,
    initialSeatData?: SeatData
): Seat<any> => {

    const seat = createShape(shapeType, pointer, isPreview) as unknown as Seat<any>;

    seat.seatRow = initialSeatData?.seatRow;
    seat.seatCol = initialSeatData?.seatCol;

    return seat;
}

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