


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

export interface SeatMapJsonFormat {
    venue   : { id: string, width: number, height: number };
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
    id  : string,            /* 좌석 Unique 식별자  */
    row : number,            /* 구역 내 행 번호     */
    col : number,            /* 구역 내 열 번호     */
    fill : string, // 좌석 색상.
    sectorId? : string,      /* 구역 이름.         */
    /* price: number, */     /* Ex. 좌석 금액      */
    /* type: number,  */     /* Ex. 좌석 등급      */
};

export type SeatHtmlTag = string; 
export type ImageHtmlTag = string;