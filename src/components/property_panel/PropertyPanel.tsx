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
import { ExportableEditorObject } from "@/types/editorObject.type";
import HtmlPreview from "./properties/HtmlPreview";
import { Updater } from "use-immer";
import { Separator } from "@/common-ui/ui/separator";
import VenueData from "./properties/VenueData";
import { VenueEditingAttributes } from "@/types/venue.type";
import Submit from "./properties/Submit";
import { SeatMapJsonCompressedFormat, SeatMapJsonFormat } from "@/types/export.type";


export type RightSidebarProps = {
  editingElementUiAttributes: EditingAttribute | null;
  setEditingElementUiAttributes: Updater<EditingAttribute | null>
  fabricRef: React.RefObject<fabric.Canvas | null>;
  keyboardEventDisableRef: React.MutableRefObject<boolean>;
  exportToCustomJsonFormat: () => void;
  exportToCustomCompressedJsonFormat: Function;
  createHtmlPreview: () => string;
  createHtmlPreviewWithCompressedData: Function;
  createJsonObjectFromCanvas: () => SeatMapJsonFormat;
  createCompressedJsonObjectFromCanvas: () => SeatMapJsonCompressedFormat;
};

const PropertyPanel = ({
  editingElementUiAttributes,
  setEditingElementUiAttributes,
  fabricRef,
  keyboardEventDisableRef,
  exportToCustomJsonFormat,
  exportToCustomCompressedJsonFormat,
  createHtmlPreview,
  createHtmlPreviewWithCompressedData,
  createJsonObjectFromCanvas,
  createCompressedJsonObjectFromCanvas
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
          label="HTML 미리보기 (비압축)"
        />

        <Export
          handleExport={exportToCustomJsonFormat}
          label="JSON으로 내보내기"
        />


        <Submit
          createJsonFromCanvas={createJsonObjectFromCanvas}
          label="서버로 제출하기 V1(SVG)"
        />


        {/* ---------------------------------------------- */}
        <Export
          handleExport={exportToCustomCompressedJsonFormat}
          label="압축 Export 테스트"
        />
        <HtmlPreview
          createHtmlPreview={createHtmlPreviewWithCompressedData}
          label="압축 HTML 변환"
        />
        {/* <Submit 
          createJsonFromCanvas={createCompressedJsonObjectFromCanvas} 
          label="서버로 제출하기 V2(압축)"
        /> */}

      </section>
    ),
    [editingElementUiAttributes]
  ); // only re-render when editingElementUiAttributes changes

  return memoizedContent;
};

export { PropertyPanel };