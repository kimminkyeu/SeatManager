import { fabric } from "fabric";
import { v4 as uuidv4 } from "uuid";

import { FabricObjectWithId } from "@/types/canvas.type";
import { bringElementTo, createShape } from "./shapes";
import _ from "lodash";
import { COLORS, TOOL_ELEMENT_DEFAULT } from "@/constants";
import { Sector } from "@/types/sector.type";
import { Assert } from "./assert";
import { ObjectType, ObjectUtil } from "./type-check";
import { createSeat } from "./seat";

export const handleSelectAll = (canvas: fabric.Canvas) => {
    canvas.discardActiveObject();
    const sel = new fabric.ActiveSelection(canvas.getObjects(), {
        canvas: canvas,
    });
    canvas.setActiveObject(sel);
    canvas.requestRenderAll();
};

export const selectMultipeObjects = (canvas: fabric.Canvas, objects: fabric.Object[]) => {
    canvas.discardActiveObject();
    const sel = new fabric.ActiveSelection(objects, {
        canvas: canvas,
    });
    canvas.setActiveObject(sel);
    canvas.requestRenderAll();
}

export const groupActiveSelection = (canvas: fabric.Canvas) => {
    const activeObjects = canvas.getActiveObjects();

    // do nothing if single object
    if (activeObjects.length <= 1) {
        return;
    }

    canvas.remove(...activeObjects);
    canvas.discardActiveObject();

    const newGroup = new fabric.Group();
    activeObjects.forEach(obj => {
        newGroup.addWithUpdate(_.cloneDeep(obj));
    })

    canvas.add(newGroup);
    canvas.setActiveObject(newGroup);
    canvas.renderAll();
}

export const ungroupActiveSelection = (canvas: fabric.Canvas) => {
    const activeObjects = canvas.getActiveObjects();

    /**
     * if current active selection is section, disable Ungroup.
     * 섹션 비그룹화는 마우스 더블 클릭을 통해서만 편집 가능하다.
     * NOTE: 선택된 개체중 한개라도 섹션이 존재하면, Ungroup 기능을 명시적으로 막는다.
     */
    if (activeObjects.some((e: fabric.Object) => (e instanceof Sector))) {
        alert("선택된 개체중 Sector가 포함되어 있습니다.\nSector는 그룹을 해제할 수 없습니다.\n편집하려면, Section Edit 버튼이나 더블클릭을 눌러주세요.");
        return;
    }

    canvas.remove(...activeObjects);
    canvas.discardActiveObject();

    // do ungroup
    const sel = new fabric.ActiveSelection(undefined, { canvas: canvas });
    activeObjects.forEach(obj => {
        if (obj instanceof fabric.Group) {
            (obj as fabric.Group).destroy().getObjects().forEach(obj => {
                const deepCopy = _.cloneDeep(obj);
                canvas.add(deepCopy);
                sel.addWithUpdate(deepCopy);
            });
        } else {
            const deepCopy = _.cloneDeep(obj);
            canvas.add(deepCopy);
            sel.addWithUpdate(deepCopy);
        }
    });
    canvas.setActiveObject(sel);
    canvas.renderAll();
}


const getRandomBetween = (min: number, max: number) => {
    return Math.random() * (max - min) + min;
}

export const handleCopy = (canvas: fabric.Canvas) => {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length > 0) {
        const serializedObjects = activeObjects.map((obj) => {
            return obj.toObject(); // 이 친구는 객체의 함수들이 다 제외된다....
        });
        // Store the serialized objects in the clipboard
        const string = JSON.stringify(serializedObjects);
        localStorage.setItem("fabric-clipboard", string);
    }

    return activeObjects;
};


export const handlePaste = (
    canvas: fabric.Canvas,
) => {

    Assert.True(
        (canvas && (canvas instanceof fabric.Canvas)),
        "canvas가 유효한 Fabric Canvas가 아닙니다!",
    );

    // Retrieve serialized objects from the clipboard
    const clipboardData = localStorage.getItem("fabric-clipboard");

    if (clipboardData) {
        try {
            const parsedObjects = JSON.parse(clipboardData);
            const offset = getRandomBetween(0, 20);
            parsedObjects.forEach((objData: fabric.Object) => {

                let objects: fabric.Object[] = [];

                fabric.util.enlivenObjects(
                    [objData],
                    (enlivenedObjects: fabric.Object[]) => {
                        enlivenedObjects.forEach((obj) => {

                            switch (ObjectUtil.getType(obj)) {

                                case (ObjectType.SECTOR):
                                    const casted = (obj as Sector);
                                    objects.push(new Sector(
                                        ObjectType.FABRIC_CIRCLE,
                                        "NULL",
                                        casted.seatCount.row,
                                        casted.seatCount.col,
                                        casted.gap.x,
                                        casted.gap.y,
                                        {
                                            left: (obj.left) ? (obj.left + offset) : (canvas.getCenter().left),
                                            top: (obj.top) ? (obj.top + offset) : (canvas.getCenter().top),
                                            fill: obj.fill,
                                            angle: obj.angle,
                                        }
                                    ));
                                    break;

                                case (ObjectType.FABRIC_GROUP):
                                    const group = (obj as fabric.Group);
                                    group.forEachObject((obj: FabricObjectWithId<any>) => {
                                        obj.objectId = uuidv4(); // set child item's object id
                                    });
                                    obj.set({
                                        left: (obj.left) ? (obj.left + offset) : (canvas.getCenter().left),
                                        top: (obj.top) ? (obj.top + offset) : (canvas.getCenter().top),
                                        hasControls: false,
                                        objectId: uuidv4(),
                                    } as FabricObjectWithId<any>);
                                    objects.push(obj);
                                    break;

                                default:
                                    obj.set({
                                        left: (obj.left) ? (obj.left + offset) : (canvas.getCenter().left),
                                        top: (obj.top) ? (obj.top + offset) : (canvas.getCenter().top),
                                        hasControls: false,
                                        objectId: uuidv4(),
                                    } as FabricObjectWithId<any>);
                                    objects.push(obj);
                                    break;
                            } // ---------------------------- end of switch-case

                        }); // ------------------------------ end of forEach

                        canvas.add(...objects);
                        selectMultipeObjects(canvas, objects);
                        canvas.renderAll();
                    },
                    "fabric"
                );
            });
        } catch (error) {
            console.error("클립보드에서 객체를 불러오는 도중 오류가 발생했습니다.", error);
        }
    }
};

export const handleDelete = (
    canvas: fabric.Canvas,
) => {
    const activeObjects = canvas.getActiveObjects();
    if (!activeObjects || activeObjects.length === 0) {
        return;
    }

    if (activeObjects.length > 0) {
        activeObjects.forEach((obj: FabricObjectWithId<any>) => {

            // 그룹은 objectId가 없기 때문에...
            // if (!obj.objectId) {
            //   return;
            // }

            canvas.remove(obj);
        });
    }
    canvas.discardActiveObject();
    canvas.requestRenderAll();
};

// create a handleKeyDown function that listen to different keydown events
export const handleKeyDown = ({
    e,
    canvas,
    undo,
    redo,
    disable,
    setActiveEditorToolTo,
}: {
    e: KeyboardEvent;
    canvas: fabric.Canvas | any;
    undo: () => void;
    redo: () => void;
    disable: boolean;
    setActiveEditorToolTo: Function
}) => {

    if (disable) { // do nothing
        console.log("keyboard event handler disableed")
        return;
    }

    // Check if the key pressed is ctrl/cmd + c (copy)
    if ((e?.ctrlKey || e?.metaKey) && e.code === "KeyC") {
        handleCopy(canvas);
    }

    // Check if the key pressed is ctrl/cmd + v (paste)
    if ((e?.ctrlKey || e?.metaKey) && e.code === "KeyV") {
        handlePaste(canvas);
    }

    // Check if the key pressed is delete/backspace (delete)
    if (e.code === "Backspace" || e.code === "Delete") {
        handleDelete(canvas);
    }

    // check if the key pressed is ctrl/cmd + x (cut)
    if ((e?.ctrlKey || e?.metaKey) && e.code === "KeyX") {
        handleCopy(canvas);
        handleDelete(canvas);
    }

    // check if the key pressed is ctrl/cmd + z (undo)
    if ((e?.ctrlKey || e?.metaKey) && e.code === "KeyZ") {
        undo();
    }

    // check if the key pressed is ctrl/cmd + y (redo)
    if ((e?.ctrlKey || e?.metaKey) && e.code === "KeyY") {
        redo();
    }

    // group objects
    if ((e?.ctrlKey || e?.metaKey) && e.code === "KeyG") {
        e.preventDefault();
        groupActiveSelection(canvas);
    }

    // ungroup objects
    if ((e?.ctrlKey || e?.metaKey) && e?.shiftKey && e.code === "KeyG") {
        e.preventDefault();
        ungroupActiveSelection(canvas);
    }

    // select all in canvas
    if ((e?.ctrlKey || e?.metaKey) && e.code === "KeyA") {
        e.preventDefault();
        handleSelectAll(canvas);
    }

    // bring to front
    if ((e?.ctrlKey || e?.metaKey) && e.code === "BracketRight") {
        bringElementTo({ direction: "front", canvas });
    }

    // bring to back
    if ((e?.ctrlKey || e?.metaKey) && e.code === "BracketLeft") {
        bringElementTo({ direction: "back", canvas });
    }

    if (e.code === "Escape" && !e.shiftKey) {
        e.preventDefault();
        setActiveEditorToolTo(TOOL_ELEMENT_DEFAULT);
    }

    if (e.code === "Slash" && !e.shiftKey) {
        e.preventDefault();
    }
};
