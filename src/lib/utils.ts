import { ExportableSeatMapObject } from "@/types/ExportableSeatMapObject.type";
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

function isExportable(object: any): object is ExportableSeatMapObject  {
  return (object instanceof ExportableSeatMapObject);
}
