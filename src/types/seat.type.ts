// import { createSeat } from "@/lib/seat";
import { EditingAttribute, ModifyShape, ShapeEditingAttribute } from "./canvas.type";
import { fabric } from "fabric";
import { Circle, IGroupOptions, IObjectOptions, IObservable, Rect } from "fabric/fabric-impl";
import { Assert } from "@/lib/assert";
import { COLORS, SEAT_HEIGHT, SEAT_WIDTH } from "@/constants";
import { createShapeEditingAttribute } from "@/lib/canvas";
import { ObjectType, ObjectUtil } from "@/lib/type-check";
import { createShape, createText } from "@/lib/shapes";
import { Capturable, ExportableEditorObject, PositionAdjustment, SeatExportable } from "./editorObject.type";
import { CircleShapeExport, RectangleShapeExport, SeatExport, SeatMappingData, eShapeExportType } from "./export.type";

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

export class Seat extends ExportableEditorObject implements Capturable {
    // -----------------------------------------------------------------
    private _seatRow: number;
    private _seatCol: number;
    private _textObject: fabric.Text; // description text
    private _shapeObject: fabric.Object;

    // --------------------------------------------------------------------------
    public get seatRow() {
        return this._seatRow;
    }

    public get seatCol() {
        return this._seatCol;
    }

    public get fill() {
        return (this._shapeObject.fill as string);
    }

    public set fill(color: string) {
        this._shapeObject.setOptions({
            fill: color,
        });
    }
 
    // for ( editing attribute input change --> instance update )
    public set seatRow(n: number) {
        this._seatRow = n;
        this._textObject.text = this._createLabel();
        this.addWithUpdate();
    }

    // for ( editing attribute input change --> instance update )
    public set seatCol(n: number) {
        this._seatCol = n;
        this._textObject.text = this._createLabel();
        this.addWithUpdate();
    }

    // --------------------------------------------------------------------------
    public override toEditingAttibute(): EditingAttribute {
        const shapeAttribute = createShapeEditingAttribute(this as fabric.Object) as EditingAttribute;
        const SeatEditingAttribute = (shapeAttribute as SeatEditingAttributes);
        SeatEditingAttribute.type = "SeatEditingAttribute";
        SeatEditingAttribute.seatRow = this._seatRow;
        SeatEditingAttribute.seatCol = this._seatCol;
        SeatEditingAttribute.fill = this.fill;
        return shapeAttribute;
    }

    // for ( toObject() data --> new instance  )
    public override get editorObjectData() {
        console.log("Seat: get editorObjectData() called");
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
            "editorObjectData"
        ]);
    }

    public override export(adjustment?: PositionAdjustment): SeatExport<any> | never {
        const innerShape = this._cloneAsDestoryedShapeObject(adjustment);

        switch (innerShape.type) {
            /** 
             *  NOTE: 현재는 Circle, Rectangle 좌석만 지원합니다.
             */
            // ---------------------------------------------
            case (ObjectType.FABRIC_CIRCLE):
                const innerCircle = (innerShape as Circle);
                const exported_1: SeatExport<CircleShapeExport> = {
                    seatId: this.getObjectId(),
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
            case (ObjectType.FABRIC_RECT):
                const innerRect = (innerShape as Rect);

                Assert.NonNull(innerRect.left, "좌석 내부 도형의 left가 null입니다");
                Assert.NonNull(innerRect.top, "좌석 내부 도형의 top이 null입니다");
                Assert.NonNull(innerRect.width, "좌석 내부 도형의 width가 null입니다");
                Assert.NonNull(innerRect.height, "좌석 내부 도형의 height가 null입니다");

                const exported_2: SeatExport<RectangleShapeExport> = {
                    seatId: this.getObjectId(),
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
     * @deprecated
     */
    public override toCompressedObjectData(adjustment?: PositionAdjustment): CircleSeatObjectData {
        const raw = this._getRawShapeCircleDestroyed(adjustment);
        Assert.True(raw.getRadiusX() === raw.getRadiusY(), "일단 둘이 같은 형태여야 한다...");

        const compressedCircle = {
            cx: raw.getCenterPoint().x,
            cy: raw.getCenterPoint().y,
            r: raw.getRadiusX(),
            fill: raw.fill as string,
            seatRow: this.seatRow,
            seatCol: this.seatCol,
            seatId: this.getObjectId(),
        }
        return compressedCircle;
    }

    /**
     * @deprecated
     */
    public override toTagsAndMappingData(adjustment?: PositionAdjustment | undefined): { tags: string[]; mappingData: SeatMappingData[]; } {
        return {
            tags: [this._toSVG_internal(adjustment)],
            mappingData: [
                {
                    seatId: this.getObjectId(),
                    seatRow: this.seatRow,
                    seatCol: this.seatCol,
                    // fill: this.fill, // 색상
                }
            ]
        };
    }

    // toSVG는 이미 고정된 파라미터가 있기 때문에... 새롭게 정의
    private _toSVG_internal(adjustment?: PositionAdjustment): string {

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
        const destroyed = copiedSeat.destroy() as Seat;

        console.log(destroyed._shapeObject.toObject());

        return ( // 중요! copy한 shape의 id가 아닌 this의 id를 이용한다.
            `<a href="#" id="${this.getObjectId()}">` + destroyed._shapeObject.toSVG() + "</a>"
        );
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
        return (copiedSeat.destroy() as Seat)._shapeObject; 
    }

    /**
     * @deprecated
     */
    private _getRawShapeCircleDestroyed(adjustment?: PositionAdjustment): fabric.Circle {
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
        const destroyed = copiedSeat.destroy() as Seat;
        return destroyed._shapeObject as fabric.Circle;
    }

    // --------------------------------------------------------------------------
    public override onRotating(): void {}

    public override onScaling(): void {}

    public override onModified() {
        console.log("Seat: onModified()");

        // reset angle of seat.
        const sectorAngle = this.group?.angle;
        const seatAngle = this.angle;

        if (sectorAngle) { // if parent is sector + angle exists.
            const textAngle = ((360 - (sectorAngle)) % 360);
            this._textObject.set({angle: textAngle});
            return;
        }
        if (seatAngle) {
            const textAngle = ((360 - (seatAngle)) % 360);
            this._textObject.set({angle: textAngle});
            return;
        }
    }

    // ---------------------------------------------------------------------
    public changeFillColor(color: string) {
        this._shapeObject.setOptions({ fill: color });
    }

    public constructNewCopy() {
        return new Seat(
            this.baseShape,
            this.seatRow,
            this.seatCol,
            {
                fill: this.fill,
                angle: this.angle,
                left: this.left,
                top: this.top,
                originX: this.originX,
                originY: this.originY,
            },
        )
    }

    constructor (
        shapeType: string,
        row: number,
        col: number,
        options?: IGroupOptions
    ) {
        super(ObjectType.SEAT, shapeType);
        this._seatRow = row;
        this._seatCol = col;
        this.lockScalingX = true;
        this.lockScalingY = true;
        this.lockRotation = true; // lock

        this.setControlsVisibility({
            mtr: false, // disable rotation
            mt: false,
            tr: false,
            tl: false,
            mb: false,
            ml: false,
            mr: false,
            bl: false,
            br: false,
        })

        const shape = createShape(
            shapeType,
            undefined,
            {
                originX: 'center',
                originY: 'center',
                fill: options?.fill ?? COLORS.object.default,
            }
        );
        Assert.NonNull(shape, `지원하지 않는 shapeType ${shapeType} 입니다.`);
        this._shapeObject = shape;

        const text = createText(
            this._createLabel(),
            undefined,
            {
                originX: 'center',
                originY: 'center',
                fontSize: 15,
                fill: "#000000",
            }
        );
        this._textObject = text;

        this.add(shape, text);
        this.addWithUpdate();
        if (options) {
            this.setOptions(options); // 객체 다 추가하고나서 option 대입 (ex. Angle 전체 적용)
        }
        this.onModified();
    }

    private _createLabel(): string {
        return `${this._seatRow?.toString() ?? "?"}-${this._seatCol?.toString() ?? "?"}`;
        // return `${this._seatCol?.toString() ?? "?"}`;
    }

}