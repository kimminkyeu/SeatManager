import { Gradient, IGroupOptions, IObjectOptions, Pattern } from "fabric/fabric-impl";
import { ShapeEditingAttribute, EditingAttribute } from "./canvas.type";
import { COLORS, SEAT_HEIGHT, SEAT_WIDTH } from "@/constants";
import { Seat } from "./seat.type";
import { fabric } from "fabric";
import { Assert } from "@/lib/assert";
import { createText } from "@/lib/shapes";
import { createShapeEditingAttribute } from "@/lib/canvas";
import { ObjectType, ObjectUtil } from "@/lib/type-check";
import { Capturable, EditorObject, ExportAdjustment } from "./editorObject.type";

export interface SectorEditingAttribute extends ShapeEditingAttribute {
    sectorId: string;
    sectorGapX: number;
    sectorGapY: number;
}

export class Sector extends EditorObject implements Capturable {
    // ----------------------------------------
    private _sectorId: string; // sectorId
    private _gapX: number = 0; // sectorId
    private _gapY: number = 0; // sectorId
    private _seatRowCount: number = 0; 
    private _seatColCount: number = 0;
    private _gapPrev: number = 0; // temporal value for slider
    private _anglePrev: number = 0; // temporal value for slider
    // private _textObject: fabric.Text; // description text
    private _sectorColor: string;
    // ---------------------------------------- 

    // data format for Right sidebar's React.State
    public toEditingAttibute(): EditingAttribute {
        const shapeAttribute = createShapeEditingAttribute(this as fabric.Object);
        const sectorAttribute = (shapeAttribute as SectorEditingAttribute);
        sectorAttribute.sectorId = this._sectorId;
        sectorAttribute.sectorGapX = this._gapX;
        sectorAttribute.sectorGapY = this._gapY;
        sectorAttribute.fill = this.fill;
        return sectorAttribute;
    }

    public get sectorId() {
        return this._sectorId;
    }

    public get sectorGapX() {
        return this._gapX;
    }
    public get sectorGapY() {
        return this._gapY;
    }

    public get sectorRows() {
        return this._seatRowCount;
    }

    public get sectorCols() {
        return this._seatColCount;
    }

    public get fill() {
        return this._sectorColor;
    }

    // ---------------------------------------------------------------------
    // for ( editing attribute input change --> instance update )
    public set fill(color: string) {
        this._sectorColor = color;
        this.getSeats().forEach((seat: Seat) => {
            seat.changeFillColor(color);
        })
    }
 

    // for ( editing attribute input change --> instance update )
    public set sectorId(id: string) {
        this._sectorId = id;
    }

    // for ( editing attribute input change --> instance update )
    public set sectorGapX(x: number) {
        console.log("Sector: set sectorGapX() called");
        this._applyGapXandUpdate(x);
    }

    // for ( editing attribute input change --> instance update )
    public set sectorGapY(y: number) {
        console.log("Sector: set sectorGapY() called");
        this._applyGapYandUpdate(y);
    } 

    // for ( toObject() data --> new instance  )
    public override get editorObjectData() {
        console.log("Sector: get editorObjectData() called");
        // return states that need to be restored while copied.
        return {
            gapX: this.sectorGapX,
            gapY: this.sectorGapY,
            rows: this.sectorRows,
            cols: this.sectorCols,
        };
    }

    // MUST OVERRIDE TO CALL toObject() CHAIN !!!
    public override toObject() {
        console.log("Sector : toObject() called");
        return super.toObject([
            // NOTE: OBJECT 에서 객체를 복구할 때 반드시 필요한 데이터를 여기에 포함시킵니다.
            "editorObjectData"
        ]);
    }

    public override toSVG(reviver?: Function | undefined): string {
        console.log("Sector : toSVG() called");
        const SVG = super.toSVG(reviver);
        return SVG;
    }

    public override toHTML(adjustment?: ExportAdjustment): string {
        let htmlTag = "";
        const raw2: Sector = (this.constructNewCopy());
        raw2.setOptions({
            left: raw2.left! - raw2.width!/2,
            top: raw2.top! - raw2.height!/2,
        });

        const destroyed = raw2.destroy();
        (destroyed as Sector).getSeats().forEach((obj: fabric.Object) => {
            if (ObjectType.SEAT === ObjectUtil.getType(obj)) {
                Assert.True(obj instanceof Seat);
                const seat = obj as Seat;
                htmlTag += (seat.toHTML(adjustment) + '\n');
            }
        });
        return htmlTag;
    }

    // ---------------------------------------------------------------------
    public getSeats(): Seat[] {
        let seats: Seat[] = [];
        this.getObjects().forEach((o: fabric.Object) => {
            if (ObjectType.SEAT === ObjectUtil.getType(o)) {
                Assert.True(o instanceof Seat);
                seats.push(o as Seat);
            }
        })
        return seats;
    }

    public constructNewCopy(): Sector {
        return new Sector(
            this.baseShape,
            this.sectorId,
            this.sectorRows, // if 0, do not auto create seats.
            this.sectorCols, // if 0, do not auto create seats.
            this.sectorGapX,
            this.sectorGapY,
            {
                angle: this.angle,
                fill: this.fill,
                left: this.left,
                top: this.top,
                canvas: this.canvas,
            }
        );
    }

    public override onRotate(): void {}

    // ---------------------------------------------------------------------
    public override onUpdate(): void {
        console.log("Sector onUpdate()");
        // change text angle.
        if (this.angle) {
            this.getSeats().forEach((seat: Seat) => {
                seat.onUpdate();
            })
        }
    }

    // ---------------------------------------------------------------------
    constructor(
        shapeType: string,
        sectorId: string,
        rows?: number,
        cols?: number,
        gapX?: number,
        gapY?: number,
        options?: IGroupOptions
    ) {
        super(ObjectType.SECTOR, shapeType, options);

        this._sectorId = sectorId;

        if (gapX) {
            this._gapX = gapX;
        }
        if (gapY) {
            this._gapY = gapY;
        }
        if (rows) {
            this._seatRowCount = rows;
        }
        if (cols) {
            this._seatColCount = cols;
        }

        this._sectorColor = (options?.fill ?? COLORS.object.default) as string;
        this.lockScalingX = true;
        this.lockScalingY = true;
        this.lockRotation = false;
        this.originX = 'center';
        this.originY = 'center';

        this.setControlsVisibility({
            mtr: true, // show rotation
            mt: false,
            tr: false,
            tl: false,
            mb: false,
            ml: false,
            mr: false,
            bl: false,
            br: false,
        })

        const leftPos = (options?.left ?? 0);
        const topPos = (options?.top ?? 0);

        if (rows && cols) {
            for (let row = 0; row < rows; ++row) {
                for (let col = 0; col < cols; ++col) {
                    const seat = new Seat(
                        this.baseShape,
                        row + 1, // start with 1
                        col + 1,
                        {
                            angle: 0,
                            originX: "center",
                            originY: "center",
                            fill: this._sectorColor,
                            left: leftPos + (SEAT_WIDTH / 2) + (col * (SEAT_WIDTH + this._gapX)),
                            top: topPos + (SEAT_HEIGHT / 2) + (row * (SEAT_HEIGHT + this._gapY)),
                        });
                    this.addWithUpdate(seat);
                }
            }
        }
        if (options) {
            if (options.angle)
                this.set("angle", options.angle);
        }
    }

    // NOTE: 현재 개발중입니다.
    public addSeatWithUpdate(seat: Seat) {
        // row, col이 잘 작성되어 있는게 매우 중요한데.. 
        // 왜내면 나중에 html로 변환할때, Sector.constructNew를 호출하거든.
        // row col 이 0이면, 좌석이 동적으로 생성된게 아닌거다!
        this.addWithUpdate(seat);
    }

    private _applyGapXandUpdate(newGapX: number) {

        this._gapPrev = this._gapX;
        this._gapX = newGapX;

        if (this.angle !== undefined) {
            this._anglePrev = this.angle;
        }
        this.setOptions({
            angle: 0,
            originX: "left", // ?
            originY: "top", // ?
        });
        const seats = this.getSeats();
        seats.forEach((seat: Seat, idx: number) => {
            Assert.NonNull(seat.left, "obj.left값이 null이면 안됩니다.");
            Assert.NonNull(seat instanceof Seat, "Sector 내부 객체들은 모두 Seat객체여야 합니다.");
            const left = seat.left + ((seat.seatCol - 1) * (this._gapX - this._gapPrev));
            seat.setOptions({left: left});
        });

        this.addWithUpdate(); // update group bounds
        this.setOptions({
            angle: this._anglePrev,
            originX: "center",
            originY: "center",
        });
    }

    private _applyGapYandUpdate(newGapY: number) {
        this._gapPrev = this._gapY;
        this._gapY = newGapY;

        if (this.angle !== undefined) {
            this._anglePrev = this.angle;
        }
        this.setOptions({
            angle: 0,
            originX: "left", // ?
            originY: "top", // ?
        });

        this.getSeats().forEach((seat: Seat) => {
            Assert.NonNull(seat.top, "obj.top값이 null이면 안됩니다.");
            Assert.NonNull(seat instanceof Seat, "Sector 내부 객체들은 모두 Seat객체여야 합니다.");
            const top = seat.top + ((seat.seatRow - 1) * (this._gapY - this._gapPrev));
            seat.setOptions({top: top});
        });

        this.addWithUpdate(); // update group bounds
        this.setOptions({
            angle: this._anglePrev,
            originX: "center",
            originY: "center",
        });
    }
}