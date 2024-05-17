import { createSeat } from "@/lib/seat";
import { FabricObjectWithId, ModifyShape, ShapeEditingAttribute } from "./canvas.type";
import { fabric } from "fabric";
import { IObjectOptions, IObservable } from "fabric/fabric-impl";
import { Assert } from "@/lib/assert";
import { SEAT_HEIGHT, SEAT_WIDTH } from "@/constants";
import { Capturable, EditorObject } from "./sector.type";

/**
 * Seat --------------------------------------------------
 */

export interface SeatEditingAttributes extends ShapeEditingAttribute {
  seatRow?: number | undefined,
  seatCol?: number | undefined,
}

export type Seat<T extends fabric.Object> = FabricObjectWithId<T> & SeatData;

export interface SeatData {
  seatRow?: number | undefined,
  seatCol?: number | undefined,
}

// export class Seat extends EditorObject implements Capturable {
//   // ---------------------
//   private seatRow: number;
//   private seatCol: number;

//   public toEditingAttibute() {
    
//   }
// }