import React, { useMemo, useRef } from "react";
import { EditingAttribute, RightSidebarProps } from "@/types/canvas.type";
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

const PropertyPanel = ({
  editingElementAttributes,
  setEditingElementAttributes,
  fabricRef,
  keyboardEventDisableRef,
}: RightSidebarProps) => {

  const colorInputRef = useRef(null);

  const handleInputChange = (property: string, value: string | number) => {

    setEditingElementAttributes(
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

        { /* Show if editingElement is a Section Object */
        // TODO: change this logic...
        // TODO: EditingElementAttribute 을 아예 클래스를 만들자.
        // 그리고 이게 어떤 editing인지 내부에 힌트를 집어넣어서 분기를 타자...
          ( editingElementAttributes ) &&
          ( "sectorId" in editingElementAttributes ) &&
          <SectorData
            fabricRef={fabricRef}
            editingElementAttributes={editingElementAttributes as SectorEditingAttribute}
            handleInputChange={handleInputChange}
            keyboardEventDisableRef={keyboardEventDisableRef}
          />
        }

        { /* Show if editingElement is a Seat Object */
          ( editingElementAttributes ) &&
          ( "seatRow" in editingElementAttributes ) &&
          <SeatData
            fabricRef={fabricRef}
            editingElementAttributes={editingElementAttributes as SeatEditingAttributes}
            handleInputChange={handleInputChange}
            keyboardEventDisableRef={keyboardEventDisableRef}
          />
        }

        {/* show if text object. */}
        {/* <Text
          fontFamily={editingElementAttributes.fontFamily}
          fontSize={editingElementAttributes.fontSize}
          fontWeight={editingElementAttributes.fontWeight}
          handleInputChange={handleInputChange}
        /> */}

        { /* Show if editingElement has "fill" property */
         ( editingElementAttributes ) &&
         ( "fill" in editingElementAttributes ) &&
          <Color
            inputRef={colorInputRef}
            editingElementAttributes={editingElementAttributes}
            placeholder="color"
            attributeType="fill"
            handleInputChange={handleInputChange}
          />
        }

        {
         ( editingElementAttributes ) &&
          <Order
            fabricRef={fabricRef}
          />
        }

        <Export 
        />

      </section>
    ),
    [editingElementAttributes]
  ); // only re-render when editingElementAttributes changes

  return memoizedContent;
};

export { PropertyPanel };