import { Gradient, IGroupOptions, IObjectOptions, Pattern } from "fabric/fabric-impl";
import { ShapeEditingAttribute, EditingAttribute } from "./canvas.type";
import { COLORS, DEFAULTS, SEAT_HEIGHT, SEAT_WIDTH } from "@/constants";
import { Seat, CircleSeatObjectData } from "./seat.type";
import { fabric } from "fabric";
import { Assert } from "@/lib/assert";
import { createText } from "@/lib/shapes";
import { createShapeEditingAttribute } from "@/lib/canvas";
import { FabricObjectType, FabricObjectTypeConstants, SeatMapObjectTypeConstants, SeatMapUtil } from "@/lib/type-check";
import { EditableStateExtractable, PositionAdjustment, FabricObjectEventReaction, ExportableSeatMapObject, SeatMapObjectOptions } from "./editorObject.type";
import { cloneDeep } from "lodash";
import { SeatExport, SeatMappingData, SectorExport } from "./export.type";

// Omit : https://stackoverflow.com/questions/48215950/exclude-property-from-type
export interface SectorEditingAttribute extends Omit<ShapeEditingAttribute, 'type'> {
    type: 'SectorEditingAttribute';
    sectorId: string;
    sectorGapX: number;
    sectorGapY: number;
}

export class Sector extends ExportableSeatMapObject implements EditableStateExtractable {

    private static readonly _staticFontSize: number = 12;

    // ----------------------------------------
    private _sectorId: string; // sectorId
    private _seatRowCount: number = 0; 
    private _seatColCount: number = 0;

    private _sectorColor: string;

    private _gapX: number = 0; // sectorId
    private _gapY: number = 0; // sectorId
    private _gapPrev: number = 0; // temporal value for slider
    private _anglePrev: number = 0; // temporal value for slider

    // ---------------------------------------- 
    public get sectorId() {
        return this._sectorId;
    }

    public get sectorGapX(): number | undefined {
        return this._gapX;
    }
    public get sectorGapY(): number | undefined {
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

    // for ( editing attribute input change --> instance update )
    public set fill(color: string) {
        this._sectorColor = color;
        this.getSeats().forEach((seat: Seat) => {
            seat.fill = color;
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

    // ---------------------------------------------------------------------
    // data format for Right sidebar's React.State
    public override extractEditableState(): EditingAttribute {
        const shapeAttribute = createShapeEditingAttribute(this as fabric.Object) as EditingAttribute;
        const sectorAttribute = (shapeAttribute as SectorEditingAttribute);
        sectorAttribute.type = "SectorEditingAttribute";
        sectorAttribute.sectorId = this._sectorId;
        sectorAttribute.sectorGapX = this._gapX ?? 0;
        sectorAttribute.sectorGapY = this._gapY ?? 0;
        sectorAttribute.fill = this.fill;
        return sectorAttribute;
    }

    // for ( toObject() data --> new instance  )
    public override get seatMapObjectProperty() {
        console.log("Sector: get seatMapObjectProperty() called");
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
        // fabric native toObject 에서 this["foo"]... 이런식으로 뽑아온다.
        return super.toObject([
            // NOTE: OBJECT 에서 객체를 복구할 때 반드시 필요한 데이터를 여기에 포함시킵니다.
            "seatMapObjectProperty"
        ]);
    }

    public override exportAsSeatMapFormat(adjustment?: PositionAdjustment): SectorExport {
        const seats: Array<SeatExport<any>> = [];

        this._collectDataFromEachSeat(
            seat => seats.push(seat.exportAsSeatMapFormat(adjustment))
        )

        const exported: SectorExport = {
            sectorId: this.sectorId,
            seats: seats,
            // price: this.price,
        }
        return exported;
    }

    // ---------------------------------------------------------------------
    public override AfterFabricObjectModifiedEvent(): void {
        console.log("Sector AfterFabricObjectModifiedEvent()");
        // change text angle.
        if (this.angle) {
            this.getSeats().forEach((seat: Seat) => {
                seat.AfterFabricObjectModifiedEvent();
            })
        }
    }

    // ---------------------------------------------------------------------
    public getSeats(): Seat[] {
        let seats: Seat[] = [];
        this.getObjects().forEach((o: fabric.Object) => {
            if (SeatMapObjectTypeConstants.SEAT === SeatMapUtil.getType(o)) {
                Assert.True(o instanceof Seat);
                seats.push(o as Seat);
            }
        })
        return seats;
    }

    // NOTE: 현재 개발중입니다.
    public addSeatWithUpdate(seat: Seat) {
        // row, col이 잘 작성되어 있는게 매우 중요한데.. 
        this._seatRowCount = 0; // 매우 중요.
        this._seatColCount = 0; // 매우 중요.
        // 왜내면 나중에 html로 변환할때, Sector.constructNew를 호출하거든.
        // row col 이 0이면, 좌석이 동적으로 생성된게 아닌거다!
        this.addWithUpdate(seat);
    }

    public constructNewCopy(): Sector {
        return new Sector(
            this.innerShapeType,
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
                width: this.width,
                height: this.height,
                // canvas: this.canvas,
            }
        );
    }

    constructor(
        shapeType: FabricObjectType,
        sectorId: string,
        rowsToGenerate?: number,
        colsToGenerate?: number,
        gapX?: number,
        gapY?: number,
        options?: SeatMapObjectOptions
    ) {
        super(
            SeatMapObjectTypeConstants.SECTOR, 
            shapeType, 
            {
                groupOptions: {
                    lockScalingX: true,
                    lockScalingY: true,
                    left: options?.left,
                    top: options?.top,
                },
                // innerShapeOptions: {
                //     width: options?.width,
                //     height: options?.height,
                //     strokeWidth: 1,
                //     stroke: options?.fill ?? `#000000`,
                //     originX: 'left',
                //     originY: 'top',
                //     fill: `rgba(0,0,0,0)`, // default fill is transparent color
                // },
                // innerTextOptions: {
                //     text: `Sector: ${sectorId}`,
                //     originX: 'left',
                //     originY: 'top',
                // },
                controlVisibilityOptions: {
                    mtr: true, // show rotation
                    mt: false,
                    tr: false,
                    tl: false,
                    mb: false,
                    ml: false,
                    mr: false,
                    bl: false,
                    br: false,
                }
            }
        );

        if (rowsToGenerate) { this._seatRowCount = rowsToGenerate; }
        if (colsToGenerate) { this._seatColCount = colsToGenerate; }
        if (gapX) { this._gapX = gapX; }
        if (gapY) { this._gapY = gapY; }

        this._sectorId = sectorId;
        this._sectorColor = (options?.fill ?? COLORS.object.default) as string;

        // ---------------------------------------------------
        // generate inner seats
        const leftPos = (options?.left ?? 0);
        const topPos = (options?.top ?? 0);

        if (rowsToGenerate && colsToGenerate) {
            for (let row = 0; row < rowsToGenerate; ++row) {
                for (let col = 0; col < colsToGenerate; ++col) {
                    const seat = new Seat(
                        FabricObjectTypeConstants.FABRIC_CIRCLE, // TODO: 기본값은 CIRCLE
                        row + 1, // start with 1
                        col + 1,
                        {
                            radius: DEFAULTS.SEAT_SIZE / 2,
                            width: DEFAULTS.SEAT_SIZE,
                            height: DEFAULTS.SEAT_SIZE,
                            // left: leftPos + (DEFAULTS.SEAT_SIZE/2) + (col * (DEFAULTS.SEAT_SIZE + this._gapX)),
                            // top: topPos + (DEFAULTS.SEAT_SIZE/2) + (row * (DEFAULTS.SEAT_SIZE + this._gapY)),
                            left: leftPos + (col * (DEFAULTS.SEAT_SIZE + this._gapX)),
                            top: topPos + (row * (DEFAULTS.SEAT_SIZE + this._gapY)),
                            fill: this._sectorColor,
                        });
                    this.addWithUpdate(seat);
                }
            }
        }
    }

    // ---------------------------------------------------------------------
    private _applyGapXandUpdate(newGapX: number) {

        this._gapPrev = this._gapX;
        this._gapX = newGapX;

        // let lastWidth = 0;

        if (this.angle !== undefined) {
            this._anglePrev = this.angle;
        }
        this.setOptions({
            angle: 0,
            originX: "left",
            originY: "top",
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
            originX: "left",
            originY: "top",
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
            // originX: "center",
            // originY: "center",
        });
    }

    /**
     * @deprecated
     * 사용 이유와 목적이 불분명. 제거할 것.
     * @description
     * 편집모드를 거치는 과정에서 seatRow seatCol 개수는 0이 됩니다.
     * 따라서 편집모드를 거쳤다면 true를 반환합니다.
     */
    private _isEditedSector() {
        return (this._seatRowCount === 0 || this._seatColCount === 0);
    }

    private _collectDataFromEachSeat(
        collector: (seat: Seat) => void, // for html tag
    ) {

        // (1) 이 경우는 편집모드를 거친 Sector.
        // if (true === this._isEditedSector()) {
            const raw = cloneDeep(this)
            const dest = raw.destroy() as Sector;
            dest.getSeats().forEach((obj: fabric.Object) => {
                if (SeatMapObjectTypeConstants.SEAT === SeatMapUtil.getType(obj)) {
                    Assert.True(obj instanceof Seat);
                    collector(obj as Seat);
                }
            });
            return;
        // }

        // (1) 이 경우는 편집모드를 거치지 않은 Sector
        // const raw2: Sector = (this.constructNewCopy());
        // raw2.setOptions({
        //     left: raw2.left! - raw2.width! / 2,
        //     top: raw2.top! - raw2.height! / 2,
        // });

        // const destroyed = raw2.destroy();
        // (destroyed as Sector).getSeats().forEach((obj: fabric.Object) => {
        //     if (SeatMapObjectTypeConstants.SEAT === SeatMapUtil.getType(obj)) {
        //         Assert.True(obj instanceof Seat);
        //         collector(obj as Seat);
        //     }
        // });
        // return;
    }
}