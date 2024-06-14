import { EditableSeatMapObject } from "./EditableSeatMapObject.type";


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

export function isExportable(object: any): object is ExportableSeatMapObject  {
    return (object instanceof ExportableSeatMapObject);
 }


// Seat, Sector, etc...
export abstract class ExportableSeatMapObject extends EditableSeatMapObject implements SeatMapExportable {
    public abstract exportAsSeatMapFormat(adjustment?: PositionAdjustment): any; 
}