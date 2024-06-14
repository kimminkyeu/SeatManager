import { FabricObjectType, SeatMapObjectType } from "@/lib/type-check";
import { LabeldSeatMapObject } from "./LabeldSeatMapObject.type";
import { IGroupOptions, IObjectOptions, ITextOptions } from "fabric/fabric-impl";
import { EditingAttribute } from "./canvas.type";

/**
 * @description
 * fabric.js의 toObject 메소드를 재정의하기 위한 인터페이스
 */
export interface FabricToObjectMethodOverride {
    toObject(propertiesToInclude?: string[] | undefined): any;
    get seatMapObjectProperty() : any;
    get seatMapObjectType(): any;
}



export interface EditingStateExtractable {
    /**
    * @interface EditingStateExtractable
    * @description 
    * UI와 연동할 수 있는 State 값을 생성할 수 있도록 하는 Interface method입니다.
    */
    extractEditingState(): EditingAttribute;
}

export abstract class EditableSeatMapObject extends LabeldSeatMapObject implements FabricToObjectMethodOverride, EditingStateExtractable {
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
    public abstract extractEditingState(): any;

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