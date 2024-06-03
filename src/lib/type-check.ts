import { TOOL_VALUE } from "@/constants";
import { EditableObject, ExportableEditorObject } from "@/types/editorObject.type";
import { fabric } from "fabric";

export const ObjectType = {
    // -----------------------------------------------
    SECTOR: "sector", // is also an editor object
    SEAT: "seat", // is also an editor object
    VENUE: "venue", // artboard
    ASSET: "asset", // image ...
    // -----------------------------------------------
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
        if (object instanceof EditableObject) {
            return (object as EditableObject).editableObjectType; // seat, sector... etc
        }
        return object.type; // return fabricJs native type (rect, i-text, etc...)
    }
}