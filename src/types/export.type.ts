


/**
 * @field venue     
 * 공연장의 이름, 전체 엘리먼트의 width, height. (div 사이즈 결정에 사용)
 * 
 * @field seats     
 * 클릭 가능한 좌석 <a id={?}/> 엘리먼트 배열.
 * 
 * @field images
 * 좌석 배치도에 포함된 이미지 엘리먼트 배열 (Ex. 배경 이미지)
 * 
 * @field mapping   
 * html 좌석 tag에 매칭되는 id 문자열과 row, col 정보들 (--IMPORTANT--)
 */

import { CircleSeatObjectData } from "./seat.type";

// 이건 서버용이다. 그저 테스트용임.
export interface SeatMapJsonForFrontendRendering {
    venue   : { venueId: string, divElementWidth: number, divElementHeight: number };
    seats   : Array<SeatHtmlTag>;
    images  : Array<ImageHtmlTag>
    mapping : Array<SeatMappingData>;
}

// 오직 필요한 데이터만 수집 (일단 원형 데이터만...)
export interface SeatMapJsonCompressedFormat {
    venue   : { id: string, width: number, height: number };
    seats   : Array<CircleSeatObjectData>;
    // TODO: 이미지도 여기에 추가.
    // 매핑 정보는 여기엔 필요가 없다.
}

export type SeatMappingData = { 
    seatId  : string,            /* 좌석 Unique 식별자  */
    seatRow : number,            /* 구역 내 행 번호     */
    seatCol : number,            /* 구역 내 열 번호     */
    sectorId? : string,      /* 구역 이름.         */
    // fill : string, // 좌석 색상. --> removed!!
    /* price: number, */     /* Ex. 좌석 금액      */
    /* type: number,  */     /* Ex. 좌석 등급      */
};

export type SeatHtmlTag = string; 
export type ImageHtmlTag = string;


// ---------------------------------------------------------------------
export enum eShapeExportType {
    CIRCLE,
    RECTANGLE,
    IMAGE,
    // ...
}

export interface ShapeExport {
    // type: eShapeExportType
    type: string,
}

export interface HTMLSelectable extends ShapeExport {
    fill: string; // base color to be rendered
    // onSelect: () => void;
}

export interface CircleShapeExport extends HTMLSelectable {
    cx: number; // center x
    cy: number; // center y
    r: number;  // radius
}

export interface RectangleShapeExport extends HTMLSelectable {
    x: number;
    y: number;
    width: number;
    height: number;

    rx?: number; // Optional
    ry?: number; // Optional
    angle?: number; // Optional
}

export interface ImageExport extends ShapeExport {
    x: number;
    y: number;
    width: number;
    height: number;
    base64Jpeg: string; // encoded base64 image

    // opacity: number;
    // scaleX: number; // img.toDataURL 할때, scaleX값 기준으로 다운 샘플링이 자동으로 적용된다.
    // scaleY: number;

    angle?: number;
}

export interface SeatExport<BaseShape extends HTMLSelectable> {
    seatId: string;
    seatRow: number;
    seatCol: number; 
    seatShape: BaseShape;
}

export interface SectorExport {
    sectorId: string;
    seats: SeatExport<HTMLSelectable & {}>[];
    // price: number; // 섹터는 모두 같은 가격을 가진다.
}

export interface SeatMap {
    venueId: string;
    width: number;
    height: number;
    sectors: SectorExport[];
    images: ImageExport[];
}

// ----------------------------------------------------




