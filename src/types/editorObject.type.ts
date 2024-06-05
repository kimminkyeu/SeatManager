import { IGroupOptions } from "fabric/fabric-impl";
import { fabric } from "fabric";
import { v4 as uuidv4 } from 'uuid';
import { EditingAttribute } from "./canvas.type";
import { SeatMappingData } from "./export.type";


// Mixin type
// https://devblogs.microsoft.com/typescript/announcing-typescript-2-2/

export type Constructable = new (...args: any[]) => object;

export function WithObjectId<BC extends Constructable>(Base: BC) {
  return class extends Base {
      private readonly _objectId = uuidv4();
      public getObjectId() {
          return this._objectId;
      }
  };
}

/**
* @interface Capturable
* @description 
* 편집 UI와 연동할 수 있는 Editing Attribute을 생성할 수 있도록 하는 Interface입니다.
*/
export interface Capturable { 
    toEditingAttibute(): EditingAttribute;
    toObject(propertiesToInclude?: string[] | undefined): any; // ???
    get editorObjectData() : any;
    get editableObjectType(): any;
}

export interface PositionAdjustment {
    left?: number, // canvas 위치가 아닌 Venue 위치 기준으로 조정해서 export 할 경우.
    top?: number,
}

export interface SeatExportable {
    /**
     * @description
     * 서버에 저장하기 위한 최소 데이터로 serialize export
     * 
     * @param adjustment
     * Export할 때 오브젝트의 position 시작 기준점을 적용할 수 있습니다.
     * 예를 들어, adjustment-leftStart가 10라면, 원래 left가 30일 경우 20으로 수정합니다.
     *
     */
    export(adjustment?: PositionAdjustment): any; // FINAL VERSION!
}

export interface Updatable {
    /** 
     * @description
     * Callback to be called on fabric's "object:modified" event.
     */
    onModified(): void;

    /** 
    * @description
    * Callback to be called on fabric's "object:scaling" event. 
    */
    onScaling(): void;

    /** 
    * @description
    * Callback to be called on fabric's "object:rotating" event. 
    */
    onRotating(): void;
}

/**
 * @description 
 * Editable object is a (fabric-group object with id).
 * this includes capabillity to export as React State.
 */
export abstract class EditableObject extends WithObjectId(fabric.Group) implements Capturable, Updatable {
   // Derived class ** MUST **  implement toEditingAttribute
    public abstract toEditingAttibute(): any;

    // Derived class ** MUST ** implement editorObjectData getter
    public abstract get editorObjectData(): any;

    // Derived class * Can * implement toObject() function
    public override toObject(propertiesToInclude?: string[] | undefined): any {
        propertiesToInclude?.push("editableObjectType");
        propertiesToInclude?.push("baseShape");
        return super.toObject(propertiesToInclude);
    }

    public get editableObjectType() {
        return this._editorObjectType;
    }

    public get baseShape() {
        return this._baseShape;
    }

    // Derived class * Can * implement onModified function
    public onModified(): void {};

    // Derived class * Can * implement onModified function
    public onScaling(): void {};

    // Derived class * Can * implement onModified function
    public onRotating(): void {};

    // -------------------------------------------------------
    private readonly _baseShape: string; // circle, triangle...etc
    private readonly _editorObjectType: string; /* sector, seat, ...etc... IMPORTANT */

    constructor(editableObjectType: string, baseShape: string, options?: IGroupOptions) {
        super(undefined, options);
        this._editorObjectType = editableObjectType;
        this._baseShape = baseShape;
    }
}

export abstract class ExportableEditorObject extends EditableObject implements SeatExportable {

    /**
     * @deprecated
     * 레거시 함수입니다. 이제 사용하지 않습니다.
     */
    public abstract toTagsAndMappingData(adjustment?: PositionAdjustment): { tags: Array<string>, mappingData: Array<SeatMappingData> };

    /**
    * @deprecated
    * 레거시 함수입니다. 이제 사용하지 않습니다.
    */
    public abstract toCompressedObjectData(adjustment?: PositionAdjustment): any;


    public abstract export(adjustment?: PositionAdjustment): any; // FINAL VERSION!
}