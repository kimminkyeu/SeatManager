import { SeatMapObject } from "@/types/editorObject.type";
import { fabric } from "fabric";

export const FabricObjectTypeConstants = {
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
        if (object instanceof SeatMapObject) {
            return (object as SeatMapObject).seatMapObjectType; // seat, sector... etc
        }
        return object.type; // return fabricJs native type (rect, i-text, etc...)
    }
}