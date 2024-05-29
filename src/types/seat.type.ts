// import { createSeat } from "@/lib/seat";
import { EditingAttribute, ModifyShape, ShapeEditingAttribute } from "./canvas.type";
import { fabric } from "fabric";
import { IGroupOptions, IObjectOptions, IObservable } from "fabric/fabric-impl";
import { Assert } from "@/lib/assert";
import { COLORS, SEAT_HEIGHT, SEAT_WIDTH } from "@/constants";
import { createShapeEditingAttribute } from "@/lib/canvas";
import { ObjectType } from "@/lib/type-check";
import { createShape, createText } from "@/lib/shapes";
import { Capturable, ExportableEditorObject, PositionAdjustment, SeatExportable } from "./editorObject.type";
import { SeatMappingData } from "./export.type";

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

    // --------------------------------------------------------------------------
    public override toSVG(reviver?: Function | undefined): string {
        console.log("Seat : toSVG() called");
        // this._textObject.excludeFromExport = true;
        this.remove(this._textObject);
        const SVG = super.toSVG();
        this.add(this._textObject);
        // this._textObject.excludeFromExport = false;
        return SVG;
    }

    public override toTagsAndMappingData(adjustment?: PositionAdjustment | undefined): { tags: string[]; mappingData: SeatMappingData[]; } {
        return {
            tags: [this.toHTML(adjustment)],
            mappingData: [
                {
                    id: this.getObjectId(),
                    row: this.seatRow,
                    col: this.seatCol,
                    fill: this.fill, // 색상
                }
            ]
        };
    }

    public override toHTML(adjustment?: PositionAdjustment): string {

        const rawShape = (this.constructNewCopy() as Seat);

        // center 기준 위치 조정.
        if (adjustment) {
            const adjustedLeft = (rawShape.left) ? (rawShape.left - (adjustment.left ?? 0)) : rawShape.left;
            const adjustedTop = (rawShape.top) ? (rawShape.top - (adjustment.top ?? 0)) : rawShape.top;

            rawShape.setOptions({
                left: adjustedLeft,
                top: adjustedTop,
            });
        } 

        return ( // 중요! copy한 shape의 id가 아닌 this의 id를 이용한다.
            `<a href="#" id="${this.getObjectId()}">` + rawShape.toSVG() + "</a>"
        );
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