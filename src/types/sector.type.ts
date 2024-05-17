import { IGroupOptions, IObjectOptions } from "fabric/fabric-impl";
import { ShapeEditingAttribute, FabricObjectWithId, EditingAttribute, WithObjectId } from "./canvas.type";
import { SEAT_HEIGHT, SEAT_WIDTH } from "@/constants";
import { Seat, SeatData } from "./seat.type";
import { createSeat } from "@/lib/seat";
import { fabric } from "fabric";
import { Assert } from "@/lib/assert";
import { createShape, createText } from "@/lib/shapes";
import { createEditingAttribute, createShapeEditingAttribute } from "@/lib/canvas";
import { v4 as uuidv4 } from 'uuid';
import { ObjectType } from "@/lib/type-check";

/**
* Export to Editing Attribute
*/
export interface Capturable {
    toEditingAttibute(): EditingAttribute;
    toObject(propertiesToInclude?: string[] | undefined): any; // ???
    toJSON(): any;
}

/**
 * Every Editor object is a group object. (including text...)
 */
export abstract class EditorObject extends WithObjectId(fabric.Group) {

    private readonly _editorObjectType: string; /* IMPORTANT */

    constructor(editorObjectType: string, options?: IGroupOptions) {
        super(undefined, options);
        this._editorObjectType = editorObjectType;
    }

    public get editorObjectType() {
        return this._editorObjectType;
    }

    public override toObject(propertiesToInclude?: string[] | undefined) {
        console.log("EditorObject : toObject() called");
        propertiesToInclude?.push("editorObjectType");
        return super.toObject(propertiesToInclude);
    }
}

export interface SectorEditingAttribute extends ShapeEditingAttribute {
    sectorId: string;
    sectorGapX: number;
    sectorGapY: number;
}

export class Sector extends EditorObject implements Capturable {
    // ----------------------------------------
    private _sectorId: string; // sectorId
    private _gapX: number; // sectorId
    private _gapY: number; // sectorId
    private _seatRowCount: number;
    private _seatColCount: number;
    private _gapPrev: number = 0; // temporal value for slider
    private _textObject: fabric.Text;
    // ---------------------------------------- 

    public toEditingAttibute(): EditingAttribute {
        const shapeAttribute = createShapeEditingAttribute(this as fabric.Object);
        const sectorAttribute = (shapeAttribute as SectorEditingAttribute);
        sectorAttribute.sectorId = this.sectorId;
        sectorAttribute.sectorGapX = this._gapX;
        sectorAttribute.sectorGapY = this._gapY;
        // TODO: color 변경시 내부 Seat까지 전부 변경되도록 처리해야 한다. 
        return sectorAttribute;
    }

    // ---------------------------------------------------------------------
    public set sectorId(id: string) {
        this._sectorId = id;
        this._textObject.text = `Sector [ ${this._sectorId} ]`;
        this.addWithUpdate();
    }

    public set sectorGapX(x: number) {
        this._applyGapXandUpdate(x);
    }

    public set sectorGapY(y: number) {
        this._applyGapYandUpdate(y);
    }

    public get sectorId() {
        return this._sectorId;
    }

    public get gap() {
        return { x: this._gapX, y: this._gapY };
    }

    public get seatCount() {
        // TODO: Calculate seat count
        return { row: this._seatRowCount, col: this._seatColCount };
    }

    public override toObject() {
        console.log("Sector : toObject() called");
        return super.toObject([
            // NOTE: OBJECT 에서 객체를 복구할 때 반드시 필요한 데이터를 여기에 포함시킵니다.
            "gap",
            "seatCount",
            // ---------------------------------------------------------------------
        ]);
    }

    public override toJSON(): any {
        alert("Sector.toJSON() called");
    }

    // ---------------------------------------------------------------------
    public getSeats(): Seat<any>[] {
        let seats: Seat<any>[] = [];
        this.getObjects().forEach((o) => {
            if ( "seatRow" in o ) {
                seats.push(o);
            }
        })
        return seats;
    }

    // ---------------------------------------------------------------------
    constructor (
        shapeType: string,
        sectorId: string,
        rows: number,
        cols: number,
        gapX?: number,
        gapY?: number,
        options?: IGroupOptions
    ) {
        super(ObjectType.SECTOR, options);

        // this.shapeType = shapeType;
        this._sectorId = sectorId;
        this._gapX = gapX ?? 0;
        this._gapY = gapY ?? 0;
        this._seatRowCount = rows;
        this._seatColCount = cols;

        const leftPos = (options?.left ?? 0) + (SEAT_WIDTH / 2);
        const topPos = (options?.top ?? 0) + (SEAT_HEIGHT / 2);
        for (let row = 0; row < rows; ++row) {
            for (let col = 0; col < cols; ++col) {
                this._addNewSeatWithUpdate(
                    shapeType,
                    {
                        x: leftPos + (col * (SEAT_WIDTH + this._gapX)),
                        y: topPos + (row * (SEAT_HEIGHT + this._gapY)),
                    }, {
                        seatRow: row + 1, // start with 1
                        seatCol: col + 1,
                    },
                    {
                        fill: options?.fill,
                    })
            }
        }
        const text = createText(
            `Sector [${this._sectorId}]`, 
        {
            x: (options?.left ?? 0), 
            y: (options?.top ?? 0) - 20
        } as any,
        {
            fontSize: 14,
        }
        );
        this._textObject = text;
        this.addWithUpdate(text);
    }

    private _addNewSeatWithUpdate(
        shapeType: string,
        position: {x: number, y: number},
        seatData: SeatData,
        options?: IObjectOptions,
    ) {
        const seat = createSeat(shapeType, position as any, false, seatData) as fabric.Object;
        seat.setOptions(options); // pass fabric object option
        this.addWithUpdate(seat);
        // TODO: update row / col 
    }

    private _applyGapXandUpdate(newGapX: number) {
        this._gapPrev = this._gapX;
        this._gapX = newGapX;
        this.getSeats().forEach((obj: Seat<any>) => {
            Assert.NonNull(obj.left);
            // Assert.NonNull(obj.seatCol, "Sector의 자식 객체는 반드시 Seat이여야 합니다.");
            obj.set({ // 1번 Col 객체는 변화하지 않아야 한다.
                left: obj.left + ((obj.seatCol - 1) * (this._gapX - this._gapPrev)),
            })
        });
        this.addWithUpdate(); // update group bounds
    }

    private _applyGapYandUpdate(newGapY: number) {
        this._gapPrev = this._gapY;
        this._gapY = newGapY;
        this.getSeats().forEach((obj: Seat<any>) => {
            Assert.NonNull(obj.top);
            // Assert.NonNull(obj.seatRow, "Sector의 자식 객체는 반드시 Seat이여야 합니다.");
            obj.set({ // 1번 Row 객체는 변화하지 않아야 한다.
                top: obj.top + ((obj.seatRow - 1) * (this._gapY - this._gapPrev)),
            })
        });
        this.addWithUpdate(); // update group bounds
    }
}