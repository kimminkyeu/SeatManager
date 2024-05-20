import React, { useMemo, useRef } from "react";
import { EditingAttribute } from "@/types/canvas.type";
import { bringElementTo } from "@/lib/shapes";

import Text from "@/components/property_panel/properties/Text";
import Color from "@/components/property_panel/properties/Color";
import Export from "@/components/property_panel/properties/Export";
import Dimensions from "@/components/property_panel/properties/Dimensions";
import SeatData from "./properties/SeatData";
import { modifyCanvasObject } from "@/lib/seat";
import { Order } from "./properties/Order";
import SectorData from "./properties/SectorData";
import { SectorEditingAttribute } from "@/types/sector.type";
import { SeatEditingAttributes } from "@/types/seat.type";
import { twJoin } from "tailwind-merge";
import { ObjectType, ObjectUtil } from "@/lib/type-check";
import { EditorObject } from "@/types/editorObject.type";
import HtmlPreview from "./properties/HtmlPreview";
import { Updater } from "use-immer";
import { Separator } from "@/common-ui/ui/separator";


export type RightSidebarProps = {
  editingElementUiAttributes: EditingAttribute | null;
  setEditingElementUiAttributes: Updater<EditingAttribute | null>
  fabricRef: React.RefObject<fabric.Canvas | null>;
  keyboardEventDisableRef: React.MutableRefObject<boolean>;
  exportToCustomFormat: () => void;
  createHtmlPreview: () => string;
};

const PropertyPanel = ({
  editingElementUiAttributes,
  setEditingElementUiAttributes,
  fabricRef,
  keyboardEventDisableRef,
  exportToCustomFormat,
  createHtmlPreview,
}: RightSidebarProps) => {

  const colorInputRef = useRef(null);

  const handleInputChange = (property: string, value: string | number) => {

    setEditingElementUiAttributes(
      (prev: EditingAttribute | null) => {
        if (prev) {
          return ({ ...prev, [property]: value });
        } else {
          return null;
        }
      }
    );

    modifyCanvasObject({
      canvas: fabricRef.current as fabric.Canvas,
      property,
      value,
    });
  };
  
  // memoize the content of the right sidebar to avoid re-rendering on every mouse actions
  const memoizedContent = useMemo(
    () => (
      <section className="
        flex flex-col 
      text-slate-900 shadow-xl
        h-full
        min-w-[227px] max-w-56 max-sm:hidden select-none
      ">

        { ( editingElementUiAttributes ) &&
          ( "sectorId" in editingElementUiAttributes ) &&
          <SectorData
            fabricRef={fabricRef}
            editingElementUiAttributes={editingElementUiAttributes as SectorEditingAttribute}
            handleInputChange={handleInputChange}
            keyboardEventDisableRef={keyboardEventDisableRef}
          />
        }

        { (editingElementUiAttributes) &&
          ("seatRow" in editingElementUiAttributes) &&
          <SeatData
            fabricRef={fabricRef}
            editingElementUiAttributes={editingElementUiAttributes as SeatEditingAttributes}
            handleInputChange={handleInputChange}
            keyboardEventDisableRef={keyboardEventDisableRef}
          />
        }

        { (editingElementUiAttributes) &&
          ("fill" in editingElementUiAttributes) &&
          <Color
            inputRef={colorInputRef}
            editingElementUiAttributes={editingElementUiAttributes}
            placeholder="color"
            attributeType="fill"
            handleInputChange={handleInputChange}
          />
        }

        { (editingElementUiAttributes) &&
          <Order fabricRef={fabricRef} />
        }
        <Separator />

        <Export handleExport={exportToCustomFormat} />
        <HtmlPreview createHtmlPreview={createHtmlPreview} />

      </section>
    ),
    [editingElementUiAttributes]
  ); // only re-render when editingElementUiAttributes changes

  return memoizedContent;
};

export { PropertyPanel };