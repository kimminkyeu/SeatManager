
/**
 * Venue는 Canvas에서 한개만 존재하고, 생성하거나 삭제할 수 없습니다.
 * Venue의 외곽지역이 곧 Canvas의 외곽입니다.
 */

import { FabricObjectTypeConstants, SeatMapObjectTypeConstants } from "@/lib/type-check";
import { Assert } from "@/lib/assert";
import { EditableSeatMapObject } from "./EditableSeatMapObject.type";
import { SeatMapObjectOptions } from "./LabeldSeatMapObject.type";


// Omit : https://stackoverflow.com/questions/48215950/exclude-property-from-type
export interface VenueEditingAttributes {
    type: 'VenueEditingAttribute';
    venueId: string;
    // ...
}

/**
 * @description
 * Venue는 외곽선과 텍스트를 그룹으로 갖지만, 내부 Sector들을 그룹으로 갖지는 않는다.
 */
export class Venue extends EditableSeatMapObject {

    private static readonly _staticFontSize: number = 20;

    private _venueId: string;
    // private _sectors: Sector[] = [];
    // private _textObject: fabric.Text;
    // private _borderObject: fabric.Object;

    // ------------------------------------------------------------------------
    public get venueId() {
        return this._venueId;
    }

    public set venueId(id: string) {
        this._venueId = id;
        this.updateInnerTextContent(`Venue: ${id}`);
    }

    // ------------------------------------------------------------------------
    // data format for Right sidebar's React.State
    public override extractEditingState() {
        return {
            type: "VenueEditingAttribute",
            venueId: this._venueId,
        } as VenueEditingAttributes;
    }

    /**
     * @deprecated 현재는 사용 금지이나, 나중에 추가될 예정임.
     */
    public override get seatMapObjectProperty(): any {
        Assert.Never("김민규","Venue는 현재는 Edit 기능 + 복붙 기능 없기 때문에, object로 변환할 필요가 없습니다.");
        return null;
    }

    /**
     * @deprecated 현재는 사용 금지이나, 나중에 추가될 예정임.
     */
    public override toObject(propertiesToInclude?: string[] | undefined) {
        Assert.Never("김민규","Venue는 현재는 Edit 기능 + 복붙 기능 없기 때문에, object로 변환할 필요가 없습니다.");
        return null;
    }

    // ------------------------------------------------------------------------
    public override afterRotating(): void {}

    public override afterScaling(): void {
        // hide text while scaling
        this.updateInnerTextVisibility(false);
    }

    public override afterModified(): void {
        // recreate inner text object
        Assert.NonNull(this._innerLabelText,"김민규");

        this.removeWithUpdate(this._innerLabelText);
        const text = this._createInternalFabricObject(
            FabricObjectTypeConstants.FABRIC_TEXT,
            {
                text: `Venue: ${this._venueId}`,
                fontSize: Venue._staticFontSize,
            } as fabric.ITextOptions,
        );
        this.add(text); // update bounding box

        this._innerLabelText = text as fabric.Text;

        this._innerLabelText.setOptions({
            left: -(this.width! / 2) + (Venue._staticFontSize),
            top: -(this.height! / 2) + (Venue._staticFontSize),
        });

        this.addWithUpdate();
    }

    // ------------------------------------------------------------------------
    constructor(
        venueId: string,
        width: number,
        height: number,
        options?: SeatMapObjectOptions,
    ) {
        super(
            SeatMapObjectTypeConstants.VENUE,
            FabricObjectTypeConstants.FABRIC_RECT,
            {
                groupOptions: {
                    left: options?.left,
                    top: options?.top,
                    lockRotation: true,
                    opacity: 0.8,
                    originX: 'left',
                    originY: 'top',
                },
                innerShapeOptions: {
                    width: width,
                    height: height,
                    strokeWidth: 1,
                    strokeDashArray: [5, 5],
                    stroke: "black",
                    fill: options?.fill ?? 'rgba(0,0,0,0)', // default fill is transparent color
                },
                innerTextOptions: {
                    text: `Venue: ${venueId}`,
                    fontSize: Venue._staticFontSize,
                    // originX: 'left',
                    // originY: 'top',
                    left: options?.left ? options?.left + (Venue._staticFontSize) : 0,
                    top: options?.top ? options?.top + (Venue._staticFontSize) : 0,
                }, 
                controlVisibilityOptions: {
                    mtr: false, // hide rotation
                    mt: true,
                    tr: true,
                    tl: true,
                    mb: true,
                    ml: true,
                    mr: true,
                    bl: true,
                    br: true
                }
            }
        );

        this._venueId = venueId;
        this.afterModified();
    }
}