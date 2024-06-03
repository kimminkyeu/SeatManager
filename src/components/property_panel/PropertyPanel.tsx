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
import { Venue, VenueEditingAttributes } from "@/types/venue.type";
import Submit from "./properties/Submit";
import { SeatMapJsonCompressedFormat, SeatMapJsonForFrontendRendering } from "@/types/export.type";
import { createHtmlView_MimicFrontend, createSeatMapV1, renderTags_MimicServer, setSeatmapPreviewPageEvent_v1, setSeatmapPreviewPageEvent_v2 } from "@/lib/export";
import { Assert } from "@/lib/assert";


export type RightSidebarProps = {
  keyboardEventDisableRef: React.MutableRefObject<boolean>;
  editingElementUiAttributes: EditingAttribute | null;
  setEditingElementUiAttributes: Updater<EditingAttribute | null>

  fabricRef: React.RefObject<fabric.Canvas | null>;
  venueRef: React.MutableRefObject<Venue | null>

  exportToCustomJsonFormat: () => void;
  exportToCustomCompressedJsonFormat: Function;
  createHtmlPreview: () => string;
  createHtmlPreviewWithCompressedData: Function;
  createJsonObjectFromCanvas: () => SeatMapJsonForFrontendRendering;
  createCompressedJsonObjectFromCanvas: () => SeatMapJsonCompressedFormat;
};

const PropertyPanel = ({
  keyboardEventDisableRef,

  editingElementUiAttributes,
  setEditingElementUiAttributes,

  fabricRef,
  venueRef,

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


        {/* ---------------------------------------------- */}
        <Export
          handleExport={exportToCustomJsonFormat}
          label="JSON으로 내보내기 (비압축)"
        />
        <HtmlPreview
          createHtmlPreview={createHtmlPreview}
          label="HTML 미리보기 (비압축)"
        />
        <Submit
          createJsonFromCanvas={createJsonObjectFromCanvas}
          label="서버로 제출하기 (비압축)"
        />


        {/* ---------------------------------------------- */}
        <Export
          handleExport={exportToCustomCompressedJsonFormat}
          label="JSON으로 내보내기 (압축v1)"
        />
        <HtmlPreview
          createHtmlPreview={createHtmlPreviewWithCompressedData}
          label="HTML 미리보기 (압축v1)"
        />
        {/* <Submit 
          createJsonFromCanvas={createCompressedJsonObjectFromCanvas} 
          label="서버로 제출하기 V2(압축)"
        /> */}


        {/* ---------------------------------------------- */}
        <Export
          label="JSON으로 내보내기 (압축v2)"
          handleExport={() => {
            Assert.NonNull(fabricRef.current);
            Assert.NonNull(venueRef.current);
            const seatMap = createSeatMapV1(fabricRef.current, venueRef.current)
            console.log(seatMap);
          }}
        />
        <HtmlPreview
          label="HTML 미리보기 (압축v2)"
          createHtmlPreview={() => {
            Assert.NonNull(fabricRef.current);
            Assert.NonNull(venueRef.current);
            const seatMap = createSeatMapV1(fabricRef.current, venueRef.current);
            const renderedTags = renderTags_MimicServer(seatMap);
            const html = createHtmlView_MimicFrontend(renderedTags);
            setTimeout(() => {
              setSeatmapPreviewPageEvent_v2(renderedTags);
            }, 50);
            return html;
          }}
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