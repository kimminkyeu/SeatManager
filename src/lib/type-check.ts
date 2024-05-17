import { TOOL_VALUE } from "@/constants";
import { EditorObject } from "@/types/sector.type"
import { fabric } from "fabric";

export const ObjectType = {
    SECTOR: "sector",
    SEAT: "seat",
    FABRIC_GROUP: "group",
    FABRIC_TEXT: "i-text",
    FABRIC_IMAGE: "image",
    FABRIC_CIRCLE: "circle",
    FABRIC_TRIANGLE: "triangle",
    FABRIC_RECT: "rect",
    FABRIC_PATH: "path",
    FABRIC_ACTIVE_SELECTION: "activeSelection"
    // ...
}

export class ObjectUtil {
    public static getType(object: fabric.Object) {
        if ("editorObjectType" in object) {
            return (object as EditorObject).editorObjectType;
        }
        return object.type;
    }
}