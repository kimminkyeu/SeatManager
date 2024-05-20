
/**
 * Venue는 Canvas에서 한개만 존재하고, 생성하거나 삭제할 수 없습니다.
 * Venue의 외곽지역이 곧 Canvas의 외곽입니다.
 */

import { ObjectType } from "@/lib/type-check";
import { EditorObject } from "./editorObject.type";
import { Assert } from "@/lib/assert";
import { Sector } from "./sector.type";
import { IGroupOptions } from "fabric/fabric-impl";
import { createShape, createText } from "@/lib/shapes";
import { COLORS } from "@/constants";

// Venue는 외곽선과 텍스트를 그룹으로 갖지만, 내부 Sector들을 그룹으로 갖지는 않는다.
export interface VenuEditingAttribute {
    venueId: string;
    // ...
}

export class Venue extends EditorObject {

    private static readonly _shapeType = ObjectType.FABRIC_RECT;
    private static readonly _staticFontSize: number = 20;

    private _venueId: string;
    private _sectors: Sector[] = [];
    private _textObject: fabric.Text;
    private _borderObject: fabric.Object;

    // data format for Right sidebar's React.State
    public override toEditingAttibute() {
        return {
            venueId: this._venueId,
        }
    }

    public get venueId() {
        return this._venueId;
    }

    public set venueId(id: string) {
        this._venueId = id;
        this._textObject.text = `Venue: ${id}`;
        this.addWithUpdate();
    }

    constructor(
        venueId: string,
        width: number,
        height: number,
        options?: IGroupOptions,
    ) {
        super(ObjectType.VENUE, Venue._shapeType);

        this._venueId = venueId;

        this.opacity = 0.8,

        this.originX = 'left';
        this.originY = 'top';
        this.lockMovementX = true;
        this.lockMovementY = true;
        this.lockScalingX = false;
        this.lockScalingY = false;
        this.lockRotation = true;
        this.setControlsVisibility({
            mtr: false, // hide rotation
            mt: true,
            tr: true,
            tl: true,
            mb: true,
            ml: true,
            mr: true,
            bl: true,
            br: true
        })

        const shape = createShape(
            Venue._shapeType,
            undefined,
            {
                width: width,
                height: height,
                strokeWidth: 1,
                strokeDashArray: [5, 5],
                stroke: "black",
                fill: options?.fill ?? 'rgba(0,0,0,0)', // default fill is transparent color
            }
        );
        Assert.NonNull(shape, `지원하지 않는 shapeType ${Venue._shapeType} 입니다.`);
        this._borderObject = shape;

        const text = createText(
            `Venue: ${this._venueId}`,
            undefined,
            {
                fontSize: Venue._staticFontSize,
            }
        );
        this._textObject = text;

        this.add(shape, text); // update group bounds

        this.addWithUpdate(); // update bounding box

        // 위치는 addWithUpdate 호출 후에 갱신.
        this._textObject.setOptions({
            left: this.left ? this.left + (Venue._staticFontSize) : 0,
            top: this.top ? this.top + (Venue._staticFontSize) : 0,
        })

        if (options) {
            this.setOptions({options}); // 객체 다 추가하고나서 option 대입 (ex. Angle 전체 적용)
        }
    }

    /**
     * @deprecated  아직 개발 중입니다. 쓰지 마세요.
     */
    public override toHTML(): string {

        let htmlTag = ""; // 내부에 객체들을 집어넣지 않고 있다.
        htmlTag += `<svg id="${this._venueId}" style=\"width:${this.width}px; height:${this.height}px\">`;
        this._sectors.forEach((sector: Sector) => {
            htmlTag += (sector.toHTML());
        })
        htmlTag += "</svg>";
        return htmlTag;
    }

    // for copy-paste ( toObject() data --> new instance  ) 
    public override get editorObjectData(): any {
        Assert.Never("Venue는 object로 변환할 필요가 없습니다.");
        return null;
    }

    public override toObject(propertiesToInclude?: string[] | undefined) {
        Assert.Never("Venue는 object로 변환할 필요가 없습니다.");
        return null;
    }

    public override onScale(): void {
        this._textObject.setOptions({
            visible: false,
        });
    }

    public override onUpdate(): void {
        // 흠.... 이게 맞을까...?
        this.removeWithUpdate(this._textObject);
        const text = createText(
            `Venue: ${this._venueId}`,
            undefined,
            {
                fontSize: Venue._staticFontSize,
            }
        );
        this.add(text); // update bounding box
        this._textObject = text;

        this._textObject.setOptions({
            left: -(this.width! / 2) + (Venue._staticFontSize),
            top: -(this.height! / 2) + (Venue._staticFontSize),
        });
        this.addWithUpdate();
    }
}