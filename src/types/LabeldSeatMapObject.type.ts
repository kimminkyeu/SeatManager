import { fabric } from "fabric";
import { Constructable, WithObjectId } from "./WithObjectId.type";
import { FabricObjectType, FabricObjectTypeConstants, SeatMapObjectType } from "@/lib/type-check";
import { ICircleOptions, IGroupOptions, IObjectOptions, ITextOptions } from "fabric/fabric-impl";
import { Assert } from "@/lib/assert";
import { v4 as uuidv4 } from 'uuid';

/**
 * 
 */
export interface FabricEventResponsive {
    /** 
     * @description
     * Callback to be called after fabric's "object:modified" event.
     */
    afterModified(): void;

    /** 
    * @description
    * Callback to be called after fabric's "object:scaling" event. 
    */
    afterScaling(): void;

    /** 
    * @description
    * Callback to be called after fabric's "object:rotating" event. 
    */
    afterRotating(): void;
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
export abstract class LabeldSeatMapObject extends WithObjectId(fabric.Group) implements FabricEventResponsive 
    {
    // -------------------------------------------------------
    private static readonly DEAULT_LABEL_FONT_SIZE = 15;

    // FabricEventResponsive
    // -------------------------------------------------------
    // protected readonly eventResponse = new FabricEventResponse();
    public afterModified(): void {};
    public afterScaling(): void {};
    public afterRotating(): void {};

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
            Assert.NonNull(this._innerShape.type,"김민규");
            Assert.True(this._innerShape.type in FabricObjectTypeConstants,"김민규");
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
    protected updateInnerTextContent(text: string) {
        // this._innerLabelText.text = text;
        this._innerLabelText?.set({ text: text });
        // this.addWithUpdate();
    }

    protected updateInnerTextAngle(angle: number) {
        this._innerLabelText?.set({ angle: angle });
    }

    protected updateInnerTextVisibility(visible: boolean) {
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
                    "김민규",
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
                    "김민규",
                    "rect 오브젝트 생성시 width를 반드시 option에 기입해주세요.",
                )
                Assert.True(
                    options?.height !== undefined,
                    "김민규",
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
                    fontSize: LabeldSeatMapObject.DEAULT_LABEL_FONT_SIZE,
                    fontWeight: "400",
                    originX: 'center',
                    originY: 'center',
                    hasControls: false,
                    ...options,
                });
            // ------------------------------------------------------------------
            default:
                Assert.Never("김민규",`지원하지 않는 Shape입니다: ${shapeType}`);
                return {} as never;
        }
    }
}