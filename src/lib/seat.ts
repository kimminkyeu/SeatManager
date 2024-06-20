import { modifyObject } from "./shapes";
import { ModifyShape } from "@/types/canvas.type";

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