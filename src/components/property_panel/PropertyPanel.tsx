import React, { useMemo, useRef } from "react";
import { AttributeType, EditingAttribute, ShapeEditingAttribute } from "@/types/canvas.type";
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
import { ReservableObject } from "@/types/editorObject.type";
import HtmlPreview from "./properties/HtmlPreview";
import { Updater } from "use-immer";
import { Separator } from "@/common-ui/ui/separator";
import VenueData from "./properties/VenueData";
import { VenueEditingAttributes } from "@/types/venue.type";


export type RightSidebarProps = {
  editingElementUiAttributes: EditingAttribute | null;
  setEditingElementUiAttributes: Updater<EditingAttribute | null>
  fabricRef: React.RefObject<fabric.Canvas | null>;
  keyboardEventDisableRef: React.MutableRefObject<boolean>;
  exportToCustomJsonFormat: () => void;
  createHtmlPreview: () => string;
  // htmlPreviewHandler: () => void;
};

const PropertyPanel = ({
  editingElementUiAttributes,
  setEditingElementUiAttributes,
  fabricRef,
  keyboardEventDisableRef,
  exportToCustomJsonFormat,
  createHtmlPreview,
  // htmlPreviewHandler,
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
          ( editingElementUiAttributes.type === "SectorEditingAttribute" ) &&
          <SectorData
            fabricRef={fabricRef}
            editingElementUiAttributes={editingElementUiAttributes as SectorEditingAttribute}
            handleInputChange={handleInputChange}
            keyboardEventDisableRef={keyboardEventDisableRef}
          />
        }

        { ( editingElementUiAttributes ) &&
          ( editingElementUiAttributes.type === "SeatEditingAttribute" ) &&
          <SeatData
            fabricRef={fabricRef}
            editingElementUiAttributes={editingElementUiAttributes as SeatEditingAttributes}
            handleInputChange={handleInputChange}
            keyboardEventDisableRef={keyboardEventDisableRef}
          />
        }

       { ( editingElementUiAttributes ) &&
         ( editingElementUiAttributes.type === "VenueEditingAttribute" ) &&
          <VenueData
            fabricRef={fabricRef}
            editingElementUiAttributes={editingElementUiAttributes as VenueEditingAttributes}
            handleInputChange={handleInputChange}
            keyboardEventDisableRef={keyboardEventDisableRef}
          />
        }


        { ( editingElementUiAttributes ) &&
          ( 
            (editingElementUiAttributes.type === AttributeType.ShapeEditingAttribute) ||
            (editingElementUiAttributes.type === AttributeType.SeatEditingAttribute)  ||
            (editingElementUiAttributes.type === AttributeType.SectorEditingAttribute)
          ) 
           &&
          <Color
            inputRef={colorInputRef}
            editingElementUiAttributes={editingElementUiAttributes as ShapeEditingAttribute}
            placeholder="color"
            attributeType="fill"
            handleInputChange={handleInputChange}
          />
        }

        { (editingElementUiAttributes) &&
          <Order fabricRef={fabricRef} />
        }

        <Separator />

        <HtmlPreview
          createHtmlPreview={createHtmlPreview}
        // htmlHandler={htmlPreviewHandler} 
        />

        <Export handleExport={exportToCustomJsonFormat} />


      </section>
    ),
    [editingElementUiAttributes]
  ); // only re-render when editingElementUiAttributes changes

  return memoizedContent;
};

export { PropertyPanel };