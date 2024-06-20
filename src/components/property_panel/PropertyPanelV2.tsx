import { EditableSeatMapObject, EditingState_V2 } from "@/types/EditableSeatMapObject.type"
import { ReactElement, useEffect, useState } from "react"


export interface EditingPanelProps {
    // editingState: EditingState_V2,
    canvasRef: React.RefObject<fabric.Canvas | null>;
    keyboardEventDisableRef: React.MutableRefObject<boolean>;
}


export function EditingPanelV2({ canvasRef, keyboardEventDisableRef }: EditingPanelProps): ReactElement {

    const [editState, setEditState] = useState<EditingState_V2 | null>(null);

    const isEditableWithUI = (object: fabric.Object): object is EditableSeatMapObject => {
        return (object instanceof EditableSeatMapObject);
    }

    const handleSelection = ( selectedObject: fabric.Object ) => {
        let newState = null; // 편집창 미표시
        if (true === isEditableWithUI(selectedObject)) {
            newState = selectedObject.extractEditingState_V2(); // 편집창 상태
        }
        setEditState(newState);
    }

    useEffect(() => {
        canvasRef.current?.on("selection:created", function (options: fabric.IEvent) {
            if (!options?.selected) {
                return;
            }
            const selectedElement = options?.selected[0] as fabric.Object;
            // if only one element is selected, set element attributes
            if (selectedElement && options.selected.length === 1) {
                handleSelection(selectedElement);
            }
        });
    }, [canvasRef.current]);

    return (
        <div className=" border-2 border-blue-700">
            {
                editState?.map((element, index) => (
                    <div key={index}>
                        <label htmlFor={element.label}>{element.label}</label>
                        <input id={element.label}
                            type={'text'}
                            defaultValue={element.getValue()}
                            onChange={(e) => element.setValue(e.target.value)}
                            onFocus={(e) => { keyboardEventDisableRef.current = true; }}
                            onBlur={(e) => { keyboardEventDisableRef.current = false; }}
                        />
                    </div>
                ))
            }
        </div>
    );
}
