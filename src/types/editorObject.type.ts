import { IGroupOptions } from "fabric/fabric-impl";
import { fabric } from "fabric";
import { v4 as uuidv4 } from 'uuid';
import { EditingAttribute } from "./canvas.type";


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
* Export to Editing Attribute
*/
export interface Capturable { 
    toEditingAttibute(): EditingAttribute;
    toObject(propertiesToInclude?: string[] | undefined): any; // ???
    get editorObjectData() : any;
    get editorObjectType(): any;
}

export interface ExportAdjustment {
    leftStart?: number, // canvas 위치가 아닌 수정된 위치로 export 할 경우.
    topStart?: number,
}

export interface Exportable {
    /**
     * @param adjustment 
     * Export할 때 오브젝트의 position 시작 기준점을 적용할 수 있습니다.
     * 예를 들어, adjustment-leftStart가 10라면, 원래 left가 30일 경우 20으로 수정합니다.
     * 
     */
    toHTML(adjustment?: ExportAdjustment): string;
}

export interface Updatable {
    onUpdate(): void; // Callback to be called on fabric's "object:modified" event.
    onScale(): void;
    onRotate(): void;
}

/**
 * Every Editor object is a group object. (including text...)
 * T : Editing Attribute type
 */
export abstract class EditorObject extends WithObjectId(fabric.Group) implements Capturable, Exportable, Updatable {

    private readonly _baseShape: string; // circle, triangle...etc
    private readonly _editorObjectType: string; /* sector, seat, ...etc... IMPORTANT */

    constructor(editorObjectType: string, baseShape: string, options?: IGroupOptions) {
        super(undefined, options);
        this._editorObjectType = editorObjectType;
        this._baseShape = baseShape;
    }

    // Derived class ** MUST ** implement toHTML
    public abstract toHTML(adjustment?: ExportAdjustment): string;

    // Derived class ** MUST **  implement toEditingAttribute
    public abstract toEditingAttibute(): any;

    // Derived class ** MUST ** implement editorObjectData getter
    public abstract get editorObjectData(): any;

    // Derived class * can * implement onUpdate function
    public onUpdate(): void {};

    // Derived class * can * implement onUpdate function
    public onScale(): void {};

    // Derived class * can * implement onUpdate function
    public onRotate(): void {};

    // Derived class * can * implement toObject function
    public override toObject(propertiesToInclude?: string[] | undefined): any {
        console.log("EditorObject : toObject() called");
        propertiesToInclude?.push("editorObjectType");
        propertiesToInclude?.push("baseShape");
        return super.toObject(propertiesToInclude);
    } 
    public get editorObjectType() {
        return this._editorObjectType;
    }

    public get baseShape() {
        return this._baseShape;
    }
}

