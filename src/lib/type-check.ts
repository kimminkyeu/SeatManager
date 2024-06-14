import { FabricEventResponsive, LabeldSeatMapObject } from "@/types/LabeldSeatMapObject.type";
import { fabric } from "fabric";

export const FabricObjectTypeConstants = {
    UNDEFINED: "undefined",
    FABRIC_GROUP: "group",
    FABRIC_TEXT: "i-text",
    FABRIC_IMAGE: "image",
    FABRIC_CIRCLE: "circle",
    FABRIC_TRIANGLE: "triangle",
    FABRIC_RECT: "rect",
    FABRIC_PATH: "path",
    FABRIC_ACTIVE_SELECTION: "activeSelection"
} as const;

type FabricObjectTypeKey = keyof typeof FabricObjectTypeConstants;

export type FabricObjectType = typeof FabricObjectTypeConstants[FabricObjectTypeKey];

export const SeatMapObjectTypeConstants = {
    SECTOR: "sector",
    SEAT: "seat",
    VENUE: "venue",
    ASSET: "asset",
} as const;


type SeatMapObjectTypeKey = keyof typeof SeatMapObjectTypeConstants;

export type SeatMapObjectType = typeof SeatMapObjectTypeConstants[SeatMapObjectTypeKey];

// -------------------------------------------------------------
export class SeatMapUtil {

    public static getType(object: fabric.Object) {
        if (object instanceof LabeldSeatMapObject) {
            return (object as LabeldSeatMapObject).seatMapObjectType; // seat, sector... etc
        }
        return object.type; // return fabricJs native type (rect, i-text, etc...)
    }
}

export function isResponsiveToFabricEvent(object: any)
    : object is FabricEventResponsive {
    if (object instanceof LabeldSeatMapObject) {
        return true
    }
    return false;
}