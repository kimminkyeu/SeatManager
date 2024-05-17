import { fabric } from "fabric";
import { COLORS, PREVIEW_OPACITY, SEAT_HEIGHT, SEAT_WIDTH, TOOL_VALUE } from "@/constants";
import { createRectangle, createText } from "./shapes";
import { Assert } from "./assert";
import { Sector } from "@/types/sector.type";


export const createSector = (
    shapeType: string, 
    startPos: { x: number, y: number },
    endPos?: { x: number, y: number },
    isPreview?: boolean
) => {

    // -------------------------------------------------
    if (isPreview) { // create sector preview object
        const outerRect = createRectangle(startPos as any, {
            //   fill: 'transparent', 
            opacity: PREVIEW_OPACITY,
            width: 0, height: 0,
            originX: 'center',
            originY: 'center',
            stroke: COLORS.object.default,
            strokeWidth: 4,
        });
        /**
         * innerSeats 도형은 shapeType 기반으로 설정하기
         * const innerSeats = createCircle(...) --> 
         */
        const innerText = createText("hello", startPos as any, {
            opacity: PREVIEW_OPACITY,
            originX: 'center',
            originY: 'center'
        });
        // const sectorPreview = new fabric.Group([outerRect, innerText], {
        const sectorPreview = new fabric.Group([outerRect, innerText], {
            left: startPos?.x,
            top: startPos?.y,
            originX: 'left',
            originY: 'top',
            lockScalingX: false,
            lockScalingY: false,
        });
        return sectorPreview; // ---------------------------------------------------
    }
    /**
     *       if not a preview, then return created sector.
     *       이때, 객체 타입을 따로 지정해줘야, 좌석간 Gap 수정등을 할 수 있음.
     *       leftGap, RightGap, 휘는 각도, 순번 표기 등등... 여기 많은 정보가 들어갈 예정.
     */
    Assert.NonNull(endPos, "실제 Sector를 생성함에 있어서 endPos가 반드시 필요합니다.");

    const width = endPos.x - startPos.x;
    const height = endPos.y - startPos.y;
    const seatRowCount = Math.ceil(height / SEAT_HEIGHT);
    const seatColCount = Math.ceil(width / SEAT_WIDTH);

    if ( (seatRowCount < 2) || (seatColCount < 2) ) {
        alert("sector는 2x2 이상 배치부터 생성 가능합니다.")
        return null;
    }

    return new Sector(
        shapeType,
        "NULL",
        seatRowCount,
        seatColCount,
        0,
        0,
        {
            left: startPos.x,
            top: startPos.y,
            fill: COLORS.object.default,
        }
    );
}
