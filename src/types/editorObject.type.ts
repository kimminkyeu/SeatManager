import { ICircleOptions, IGroupOptions, IObjectOptions, ITextOptions } from "fabric/fabric-impl";
import { fabric } from "fabric";
import { v4 as uuidv4 } from 'uuid';
import { EditingAttribute } from "./canvas.type";
import { FabricObjectType, FabricObjectTypeConstants, SeatMapObjectType } from "@/lib/type-check";
import { Assert } from "@/lib/assert";
import { text } from "@/svgs/import";


// Mixin type
// https://devblogs.microsoft.com/typescript/announcing-typescript-2-2/

export type Constructable = new (...args: any[]) => object;

export function WithObjectId<BC extends Constructable>(Base: BC) {

  return class extends Base {

      private readonly _objectId = uuidv4();

      public get objectId() { return this._objectId; }
  };
}


export interface EditableStateExtractable {
    /**
    * @interface EditableStateExtractable
    * @description 
    * UI와 연동할 수 있는 State 값을 생성할 수 있도록 하는 Interface method입니다.
    */
    extractEditableState(): EditingAttribute;
}

/**
 * @description
 * fabric.js의 toObject 메소드를 재정의하기 위한 인터페이스
 */
export interface FabricToObjectMethodOverride {
    toObject(propertiesToInclude?: string[] | undefined): any;
    get seatMapObjectProperty() : any;
    get seatMapObjectType(): any;
}

export interface PositionAdjustment {
    left?: number, // canvas 위치가 아닌 Venue 위치 기준으로 조정해서 export 할 경우.
    top?: number,
}

export interface SeatMapExportable {
    /**
     * @description
     * 서버에 저장하기 위한 최소 데이터로 serialize export
     * 
     * @param adjustment
     * Export할 때 오브젝트의 position 시작 기준점을 적용할 수 있습니다.
     * 예를 들어, adjustment-leftStart가 10라면, 원래 left가 30일 경우 20으로 수정합니다.
     *
     */
    exportAsSeatMapFormat(adjustment?: PositionAdjustment): any; // FINAL VERSION!
}

export interface FabricObjectEventReaction {
    /** 
     * @description
     * Callback to be called on fabric's "object:modified" event.
     */
    AfterFabricObjectModifiedEvent(): void;

    /** 
    * @description
    * Callback to be called on fabric's "object:scaling" event. 
    */
    AfterFabricObjectScalingEvent(): void;

    /** 
    * @description
    * Callback to be called on fabric's "object:rotating" event. 
    */
    AfterFabricObjectRotatingEvent(): void;
}

export interface SeatMapObjectOptions {
    radius?: number,
    width?: number,
    height?: number,
    left?: number, // pos x
    top?: number, // pos y
    angle?: number, // angle
    fill?: string, // color rgb
}

/**
 * 
 */
export abstract class SeatMapObject extends WithObjectId(fabric.Group) implements FabricObjectEventReaction {

    // -------------------------------------------------------
    private static readonly DEAULT_LABEL_FONT_SIZE = 15;

    // -------------------------------------------------------
    // FabricObjectEventReaction
    public AfterFabricObjectModifiedEvent(): void { 
        console.log("AfterObjectModified()");
    };

    public AfterFabricObjectScalingEvent(): void { 
        console.log("AfterObjectScaling()");
    };

    public AfterFabricObjectRotatingEvent(): void { 
        console.log("AfterObjectRotating()");
    };

    // -------------------------------------------------------
    // Shape & Labeled Text
    protected readonly _seatMapObjectType: string; /* sector, seat, ...etc... IMPORTANT */
    protected _innerShape?: fabric.Object; // circle, triangle...etc
    protected _innerLabelText?: fabric.Text; // label hint

    constructor(
        seatMapObjectType: SeatMapObjectType, 
        innerShapeType: FabricObjectType, 
        options? : {
            innerShapeOptions?: IObjectOptions, 
            innerTextOptions?: ITextOptions 
            groupOptions?: IGroupOptions, 
            controlVisibilityOptions?: {
                bl?: boolean | undefined;
                br?: boolean | undefined;
                mb?: boolean | undefined;
                ml?: boolean | undefined;
                mr?: boolean | undefined;
                mt?: boolean | undefined;
                tl?: boolean | undefined;
                tr?: boolean | undefined;
                mtr?: boolean | undefined;
            }
        }) {

        super(undefined, options?.groupOptions);

        this._seatMapObjectType = seatMapObjectType;

        if (options?.innerShapeOptions) {
            this._innerShape = this._createInternalFabricObject(
                innerShapeType,
                options?.innerShapeOptions
            );
            this.addWithUpdate(this._innerShape);
        };
        if (options?.innerTextOptions) {
            this._innerLabelText = this._createInternalFabricObject(
                FabricObjectTypeConstants.FABRIC_TEXT,
                options?.innerTextOptions
            ) as fabric.Text;
            this.add(this._innerLabelText);
        };

        this.setOptions(options?.groupOptions);
        this.setControlsVisibility(options?.controlVisibilityOptions);
    }

    

    /**
     * 내부 도형 객체의 타입을 반환합니다. (rect, circle, i-text, etc...)
     */
    public get innerShapeType(): FabricObjectType { 
        if (this._innerShape) {
            return this._innerShape.type as FabricObjectType; // WARN!
        }
        return FabricObjectTypeConstants.UNDEFINED;
    }

    /**
     *  SeatMap 객체의 타입을 반환합니다. (seat, sector, venue, etc...)
     */
    public get seatMapObjectType() { 
        return this._seatMapObjectType;
    } 

    // ------------------------------------------------------------------
    // Methods to Control
    public updateInnerTextContent(text: string) {
        // this._innerLabelText.text = text;
        this._innerLabelText?.set({ text: text });
        // this.addWithUpdate();
    }

    public updateInnerTextAngle(angle: number) {
        this._innerLabelText?.set({ angle: angle });
    }

    public updateInnerTextVisibility(visible: boolean) {
        this._innerLabelText?.set({ visible: visible });
    }

    /**
     * 현재는 Circle, Rect, Text만 지원합니다.
     */
    protected _createInternalFabricObject(shapeType: FabricObjectType, options?: IObjectOptions) {
        switch (shapeType) {
            // ------------------------------------------------------------------
            case FabricObjectTypeConstants.FABRIC_CIRCLE:
                const circleOpt = (options as ICircleOptions);
                Assert.True(
                    circleOpt?.radius !== undefined,
                    "circle 오브젝트 생성시 radius를 반드시 option에 기입해주세요.",
                )
                console.log(options);
                return new fabric.Circle({
                    fill: "#000000",
                    originX: 'center',
                    originY: 'center',
                    hasControls: false,
                    ...options,
                });

            // ------------------------------------------------------------------
            case FabricObjectTypeConstants.FABRIC_RECT:
                Assert.True(
                    options?.width !== undefined,
                    "rect 오브젝트 생성시 width를 반드시 option에 기입해주세요.",
                )
                Assert.True(
                    options?.height !== undefined,
                    "rect 오브젝트 생성시 height를 반드시 option에 기입해주세요.",
                )
                return new fabric.Rect({
                    fill: "#000000",
                    originX: 'center',
                    originY: 'center',
                    hasControls: false,
                    ...options,
                });

            // ------------------------------------------------------------------
            case FabricObjectTypeConstants.FABRIC_TEXT:
                const textOpt = (options as ITextOptions);
                const text = (textOpt.text ? textOpt.text : "empty text");
                return new fabric.Text(text, {
                    fill: "#000000",
                    fontFamily: "Helvetica",
                    fontSize: SeatMapObject.DEAULT_LABEL_FONT_SIZE,
                    fontWeight: "400",
                    originX: 'center',
                    originY: 'center',
                    hasControls: false,
                    ...options,
                });
            // ------------------------------------------------------------------
            default:
                Assert.Never(`지원하지 않는 Shape입니다: ${shapeType}`);
                return {} as never;
        }
    }
}

export abstract class EditableSeatMapObject extends SeatMapObject implements FabricToObjectMethodOverride, EditableStateExtractable {
    // ----------------------------------------------------------------
    // # FabricToObjectMethodOverride
    public override toObject(propertiesToInclude?: string[] | undefined): any {
        propertiesToInclude?.push("seatMapObjectProperty");
        return super.toObject(propertiesToInclude); // this already includes inner fabric shape type + text
    }

    // toObject로 추출한 객체를 다시 Fabric 객체로 복구할 때, obj["seatMapObjectProperty"] 로 해당 좌석 데이터를 얻어낸다.
    public abstract get seatMapObjectProperty(): any;

    // -------------------------------------------------------
    // # EditingStateExtractable
    public abstract extractEditableState(): any;

    // -------------------------------------------------------
    constructor(
        seatMapObjectType: SeatMapObjectType,
        innerShape: FabricObjectType,
        options?: {
            innerShapeOptions?: IObjectOptions,
            innerTextOptions?: ITextOptions
            groupOptions?: IGroupOptions,
            controlVisibilityOptions?: {
                bl?: boolean | undefined;
                br?: boolean | undefined;
                mb?: boolean | undefined;
                ml?: boolean | undefined;
                mr?: boolean | undefined;
                mt?: boolean | undefined;
                tl?: boolean | undefined;
                tr?: boolean | undefined;
                mtr?: boolean | undefined;
            }
        }
    ) {
        super(seatMapObjectType, innerShape, options);
    }
}

// Seat, Sector, etc...
export abstract class ExportableSeatMapObject extends EditableSeatMapObject implements SeatMapExportable {
    public abstract exportAsSeatMapFormat(adjustment?: PositionAdjustment): any; 
}