// import { createSeat } from "@/lib/seat";
import { EditingAttribute, ModifyShape, ShapeEditingAttribute } from "./canvas.type";
import { fabric } from "fabric";
import { Circle, ICircleOptions, IGroupOptions, IObjectOptions, IObservable, IRectOptions, IShadowOptions, Rect } from "fabric/fabric-impl";
import { Assert } from "@/lib/assert";
import { createShapeEditingAttribute } from "@/lib/canvas";
import { FabricObjectType, FabricObjectTypeConstants, SeatMapObjectTypeConstants, SeatMapUtil } from "@/lib/type-check";
import { createShape, createText } from "@/lib/shapes";
import { EditableStateExtractable, PositionAdjustment, FabricObjectEventReaction, ExportableSeatMapObject, SeatMapObject, SeatMapObjectOptions } from "./editorObject.type";
import { CircleShapeExport, RectangleShapeExport, SeatExport, SeatMappingData, eShapeExportType } from "./export.type";
import { DEFAULTS } from "@/constants";

export interface CircleSeatObjectData {
    cx: number;
    cy: number;
    r: number;
    fill: string;
    seatId: string;
    seatRow: number;
    seatCol: number;
    sectorId?: string;
}


// Omit : https://stackoverflow.com/questions/48215950/exclude-property-from-type
export interface SeatEditingAttributes extends Omit<ShapeEditingAttribute, 'type'> {
    type: "SeatEditingAttribute";
    seatRow?: number | undefined,
    seatCol?: number | undefined,
}

export class Seat extends ExportableSeatMapObject {
    // -----------------------------------------------------------------
    private _seatRow: number;
    private _seatCol: number;

    // --------------------------------------------------------------------------
    public get seatRow() {
        return this._seatRow;
    }

    public get seatCol() {
        return this._seatCol;
    }

    public get fill() {
        return (this._innerShape.fill as string);
    }

    public set fill(color: string) {
        this._innerShape.setOptions({ fill: color });
    }
 
    // for ( editing attribute input change --> instance update )
    public set seatRow(n: number) {
        this._seatRow = n;
        this.updateInnerTextContent(Seat._createLabel(this._seatRow, this._seatCol));
    }

    // for ( editing attribute input change --> instance update )
    public set seatCol(n: number) {
        this._seatCol = n;
        this.updateInnerTextContent(Seat._createLabel(this._seatRow, this._seatCol));
    }

    // --------------------------------------------------------------------------
    public override extractEditableState(): EditingAttribute {
        const shapeAttribute = createShapeEditingAttribute(this as fabric.Object) as EditingAttribute;
        const SeatEditingAttribute = (shapeAttribute as SeatEditingAttributes);
        SeatEditingAttribute.type = "SeatEditingAttribute";
        SeatEditingAttribute.seatRow = this._seatRow;
        SeatEditingAttribute.seatCol = this._seatCol;
        SeatEditingAttribute.fill = this.fill;
        return shapeAttribute;
    }

    // for ( toObject() data --> new instance  )
    public override get seatMapObjectProperty() {
        console.log("Seat: get seatMapObjectProperty() called");
        // return states that need to be restored while copied.
        return {
            row: this._seatRow,
            col: this._seatCol,
        };
    }

    // MUST OVERRIDE TO CALL toObject() CHAIN !!!
    public override toObject() {
        console.log("Seat : toObject() called");
        return super.toObject([
            // NOTE: OBJECT 에서 객체를 복구할 때 반드시 필요한 데이터를 여기에 포함시킵니다.
            "seatMapObjectProperty"
        ]);
    }

    public override exportAsSeatMapFormat(adjustment?: PositionAdjustment): SeatExport<any> | never {
        const innerShape = this._cloneAsDestoryedShapeObject(adjustment);

        switch (innerShape.type) {
            /** 
             *  NOTE: 현재는 Circle, Rectangle 좌석만 지원합니다.
             */
            // ---------------------------------------------
            case (FabricObjectTypeConstants.FABRIC_CIRCLE):
                const innerCircle = (innerShape as Circle);
                const exported_1: SeatExport<CircleShapeExport> = {
                    seatId: this.objectId,
                    seatRow: this.seatRow,
                    seatCol: this.seatCol,
                    seatShape: {
                        type: eShapeExportType.CIRCLE,
                        fill: innerCircle.fill as string,
                        cx: innerCircle.getCenterPoint().x,
                        cy: innerCircle.getCenterPoint().y,
                        r: innerCircle.getRadiusX(),
                    }
                };
                return exported_1;

            // ---------------------------------------------
            case (FabricObjectTypeConstants.FABRIC_RECT):
                const innerRect = (innerShape as Rect);

                Assert.NonNull(innerRect.left, "좌석 내부 도형의 left가 null입니다");
                Assert.NonNull(innerRect.top, "좌석 내부 도형의 top이 null입니다");
                Assert.NonNull(innerRect.width, "좌석 내부 도형의 width가 null입니다");
                Assert.NonNull(innerRect.height, "좌석 내부 도형의 height가 null입니다");

                const exported_2: SeatExport<RectangleShapeExport> = {
                    seatId: this.objectId,
                    seatRow: this.seatRow,
                    seatCol: this.seatCol,
                    seatShape: {
                        type: eShapeExportType.RECTANGLE,
                        fill: innerRect.fill as string,
                        x: innerRect.left,
                        y: innerRect.top,
                        width: innerRect.width,
                        height: innerRect.height,

                        rx: innerRect.rx,
                        ry: innerRect.ry,
                        angle: innerRect.angle,
                    }
                };
                return exported_2;

            // ---------------------------------------------
            default:
                Assert.Never(`지원하지 않는 좌석 Shape입니다. shape: ${innerShape.type}`);
                return {} as never;
        }
    }

    /**
     * @description
     * Seat을 깊은 복사한 후, Group에 묶여있던 위치 속성값을 해제(destroy)하고 내부 Shape을 반환합니다.
     */
    private _cloneAsDestoryedShapeObject(adjustment?: PositionAdjustment): fabric.Object {

        const copiedSeat = (this.constructNewCopy() as Seat);
        // center 기준 위치 조정.
        if (adjustment) {
            const adjustedLeft = (copiedSeat.left) ? (copiedSeat.left - (adjustment.left ?? 0)) : copiedSeat.left;
            const adjustedTop = (copiedSeat.top) ? (copiedSeat.top - (adjustment.top ?? 0)) : copiedSeat.top;

            copiedSeat.setOptions({
                left: adjustedLeft,
                top: adjustedTop,
            });
        }
        return (copiedSeat.destroy() as Seat)._innerShape; 
    }

    // --------------------------------------------------------------------------
    public override AfterFabricObjectModifiedEvent() {
        this.updateTextAngleToCurrentViewAngle();
    }

    public constructNewCopy() {
        return new Seat(
            this.innerShapeType,
            this.seatRow,
            this.seatCol,
            {
                fill: this.fill,
                angle: this.angle,
                left: this.left,
                top: this.top,
            },
        )
    }

    constructor (
        shapeType: FabricObjectType,
        row: number,
        col: number,
        options?: SeatMapObjectOptions
    ) {
        super(
            SeatMapObjectTypeConstants.SEAT,
            shapeType,
            {
                innerShapeOptions: {
                    fill: options?.fill,
                    radius: options?.radius, // 이건 circle용이라서... 분리되어 있다.
                    width: options?.width,
                    height: options?.height,
                } as ICircleOptions | IObjectOptions, // TODO: circle, rect 같으 도형의 option은 함께 묶어주자...
                innerTextOptions: {
                    text: Seat._createLabel(row, col),
                },
                groupOptions: {
                    angle: options?.angle,
                    left: options?.left,
                    top: options?.top,
                    lockScalingX: true,
                    lockScalingY: true,
                    lockRotation: true,
                },
                controlVisibilityOptions: {
                    mtr: false, // disable rotation
                    mt: false,
                    tr: false,
                    tl: false,
                    mb: false,
                    ml: false,
                    mr: false,
                    bl: false,
                    br: false,
                }
            });

        this._seatRow = row;
        this._seatCol = col;

        this.updateTextAngleToCurrentViewAngle();
    }

    private static _createLabel(row: number, col: number): string {
        return `${row ?? "?"}-${col ?? "?"}`;
    }

    /**
     * @description
     * label text의 각도를 현재 view와 수평한 각도로 변경합니다.
     * 물체 회전에 관계없이 텍스트는 항상 사용자 시점과 수평을 이루도록 하기 위한 함수입니다.
     */
    public updateTextAngleToCurrentViewAngle() {
        if (this.angle) {
            const textAngle = ((360 - (this.angle)) % 360);
            this.updateInnerTextAngle(textAngle);
            return;
        }
    }
}