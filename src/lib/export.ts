import { Venue } from "@/types/venue.type";
import { FabricObjectTypeConstants, SeatMapObjectTypeConstants, SeatMapUtil } from "./type-check";
import { Assert } from "./assert";
import { CircleShapeExport, ImageExport, ImageHtmlTag, RectangleShapeExport, SeatHtmlTag, SeatMap, SeatMapJsonForFrontendRendering, SeatMappingData, SectorExport, ShapeExport, eShapeExportType } from "@/types/export.type";
import { cloneDeep } from "lodash";
import { fabric } from "fabric";
import { ExportableSeatMapObject } from "@/types/editorObject.type";

export const saveStringToLocalDisk = (fileName: string, content: string) => {
    // Create element with <a> tag
    const link = document.createElement("a");

    // Create a blog object with the file content which you want to add to the file
    const file = new Blob([content], { type: 'application/json' });

    // Add file content in the object URL
    link.href = URL.createObjectURL(file);

    // Add file name
    link.download = fileName;

    // Add click event to <a> tag to save file.
    link.click();
    URL.revokeObjectURL(link.href);
}

// *********************************************************
// FINAL VERSION
export function createSeatMapV1(
    canvas: fabric.Canvas,
    venue: Venue,
): SeatMap {

    Assert.NonNull(venue.width, "venue의 width가 null입니다.");
    Assert.NonNull(venue.height, "venue의 height가 null입니다.");

    const sectors: SectorExport[] = [];
    const images: ImageExport[] = [];

    canvas.forEachObject((object: fabric.Object) => {
        const type = SeatMapUtil.getType(object);

        switch(type) {
            // ------------------------------------
            case (SeatMapObjectTypeConstants.VENUE):
                break;

            // ------------------------------------
            case (SeatMapObjectTypeConstants.SECTOR):
                Assert.True(object instanceof ExportableSeatMapObject);
                const sector = (object as ExportableSeatMapObject).exportAsSeatMapFormat({
                    left: venue.left,
                    top: venue.top
                });
                sectors.push(sector);
                break;

            // ------------------------------------
            case (SeatMapObjectTypeConstants.SEAT):
                Assert.True(object instanceof ExportableSeatMapObject);
                Assert.Never(
                    "Seat은 반드시 Sector(구역)에 소속되어야 합니다. \
                               Canvas 안에 개별적인 Seat가 존재해선 안됩니다!"
                );
                break;

            // ------------------------------------
            case (FabricObjectTypeConstants.FABRIC_IMAGE):
                const img = (object as fabric.Image);

                const prevLeft = img.left;
                const prevTop = img.top;

                const adjustedLeft = (img.left) ? (img.left - (venue.left ?? 0)) : img.left;
                const adjustedTop = (img.top) ? (img.top - (venue.top ?? 0)) : img.top;

                img.setOptions({ left: adjustedLeft, top: adjustedTop }); // 위치 임시 조정.

                Assert.NonNull(img.left);
                Assert.NonNull(img.top);

                images.push({
                    type: FabricObjectTypeConstants.FABRIC_IMAGE,
                    x: img.left,
                    y: img.top,
                    width: img.getScaledWidth(),
                    height: img.getScaledHeight(),
                    base64Jpeg: img.toDataURL({format: 'jpeg'}),

                    angle: img.angle,
                })
                img.setOptions({ left: prevLeft, top: prevTop }); // 위치 원상 복구.
                break;

            // ------------------------------------
            default:
                /**
                 * Sector, Seat, Image가 아닌 farbic navive type은 애초에 그릴 수 없다. 
                 * ( ex. fabric.Group, Circle, Freeform, Path, etc.. )
                 */
                Assert.Never(`지원하지 않는 타입입니다. type:${type}`);
        }
    });

    const seatMap: SeatMap = {
        venueId: venue.venueId,
        width: venue.width,
        height: venue.height,
        sectors: sectors,
        images: images,
    }
    return seatMap;
}

// generate tags array and mapping data for frontend.
// 이 함수는 실제론 서버에서 수행될 예정입니다.
export function renderTags_MimicServer(seatMap: SeatMap)
: SeatMapJsonForFrontendRendering {

    const seatTags: Array<SeatHtmlTag> = [];
    const seatMappings: Array<SeatMappingData> = [];
    const backgroundImageTags: Array<ImageHtmlTag> = [];

    seatMap.sectors.forEach((sector) => {
        sector.seats.forEach((seat) => {

            const shapeTypeEnum = seat.seatShape.type;
            switch(shapeTypeEnum) {

                case FabricObjectTypeConstants.FABRIC_CIRCLE:
                    const circle = (seat.seatShape as CircleShapeExport);
                    seatTags.push(`<circle 
                                                id="${seat.seatId}" 
                                                cx="${circle.cx}" 
                                                cy="${circle.cy}" 
                                                r="${circle.r}" 
                                                fill="${circle.fill}" 
                                                />\n`);
                    seatMappings.push({
                        seatId: seat.seatId,
                        seatRow: seat.seatRow,
                        seatCol: seat.seatCol,
                        sectorId: sector.sectorId,
                    })
                    break;

                case FabricObjectTypeConstants.FABRIC_RECT:
                    const rect = (seat.seatShape as RectangleShapeExport);
                    seatTags.push(`<rect
                                                id="${seat.seatId}" 
                                                x="${rect.x}" 
                                                y="${rect.y}" 
                                                width="${rect.width}" 
                                                height="${rect.height}" 
                                                rx="${rect.rx}"
                                                ry="${rect.ry}"
                                                fill="${rect.fill}" 
                                                transform="rotate(${rect.angle})"
                                                />\n`);
                    break;
                
                default:
                    Assert.Never(`지원하지 않는 seat shape type 입니다. type:${seat.seatShape.type}`);
                    break;
            }
        });
    });

    seatMap.images.forEach((image) => {
        backgroundImageTags.push(`<image 
                                    href="${image.base64Jpeg}"
                                    x="${image.x}"
                                    y="${image.y}"
                                    width="${image.width}"
                                    height="${image.height}"
                                    transform="rotate(${image.angle})"
                                    />\n`);
    })

    const mimicRender: SeatMapJsonForFrontendRendering = {
        venue: {
            venueId: seatMap.venueId,
            divElementWidth: seatMap.width,
            divElementHeight: seatMap.height,
        },
        seats: seatTags,
        images: backgroundImageTags,
        mapping: seatMappings,
    }

    return mimicRender;
}

export function createHtmlView_MimicFrontend(jsonFromServer: SeatMapJsonForFrontendRendering) {
    let html = `<svg 
                    style="
                        width:${jsonFromServer.venue.divElementWidth}px; height:${jsonFromServer.venue.divElementHeight}px; 
                        border: 2px dashed;
                        "
                    id="${jsonFromServer.venue.venueId}"
                >`;

    jsonFromServer.images.forEach((imageTags: string) => {
        html += imageTags;
    });
    jsonFromServer.seats.forEach((seatHtmlTags: string) => {
        html += seatHtmlTags;
    });
    html += "</svg>";

    return html;
}


export function setSeatmapPreviewPageEvent_v2(json: SeatMapJsonForFrontendRendering): void {

    const DEFAULT_COLOR = "#CCDE11";
    const SELECTED_COLOR = "#CD2121";

    const div = document.getElementById("preview-selected-seat-info");
    div && (div.innerText = `구역: [  ?  ] - 좌석: [ ? ]행 [ ? ]열`); // initial text

    // <use> tag 로 z-index 대체
    const svg = document.getElementById(json.venue.venueId);
    // const useTag = document.createElementNS("http://www.w3.org/2000/svg", "use");
    // svg?.appendChild(useTag);

    json.mapping.forEach((seat) => {

        const seatElem = document.getElementById(seat.seatId);

        if (seatElem) {
           
            const originalFill = seatElem.getAttribute("fill");

            let originalX = null;
            let originalY = null;

            if (seatElem.tagName === "circle") {
                originalX = seatElem.getAttribute("cx");
                originalY = seatElem.getAttribute("cy");
            }

            // animation
            // seatElem.style.transition = "transform .2s";
            // seatElem.style.transformOrigin = "center";

            seatElem.onmouseover = () => {
                // z-index
                // useTag.setAttributeNS("http://www.w3.org/1999/xlink", 'href', `#${seat.seatId}`);
                seatElem.style.cursor = "pointer";    
                seatElem.style.transform = `
                                            translate(${originalX}px, ${originalY}px)
                                            scale(1.2) \
                                            translate(-${originalX}px, -${originalY}px) \
                                            `;

                seatElem.setAttribute("fill", SELECTED_COLOR);
                // seatElem.classList.add("toggle");
                div && (div.innerText = `구역: [${seat.sectorId}] - 좌석: [${seat.seatRow}]행 [${seat.seatCol}]열`);
            }

            seatElem.onmouseout = () => {

                // z-index
                // useTag.setAttributeNS("http://www.w3.org/1999/xlink", 'href', `#${seat.seatId}`);
                seatElem.style.cursor = "default";
                seatElem.style.transform = `
                                            translate(${originalX}px, ${originalY}px)
                                            scale(1.0) \
                                            translate(-${originalX}px, -${originalY}px) \
                                            `;

                seatElem.setAttribute("fill", originalFill ?? DEFAULT_COLOR);
                // seatElem.classList.remove("toggle");

                let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                text.textContent = `${seat.seatRow}`;
                div && (div.innerText = `구역: [  ?  ] - 좌석: [ ? ]행 [ ? ]열`);
            };
        }
    });
}


/**
 * @deprecated
 * 이건 mappingData에 fill이 포함되어 있던 구버전.
 */
export function setSeatmapPreviewPageEvent_v1(json: SeatMapJsonForFrontendRendering): void {

    const div = document.getElementById("preview-selected-seat-info");

    Array.from(json.mapping).forEach((seatData: SeatMappingData) => {
        const seatElem = document.getElementById(seatData.seatId);

        div && (div.innerText = `구역: [  ?  ] - 좌석: [ ? ]행 [ ? ]열`);

        if (seatElem) {
            const c = seatElem.getElementsByTagName('circle').item(0);

            seatElem.onmouseover = () => {
                if (c) {
                    if (false === c.classList.contains("toggle")) {
                        c.style.fill = "#CD2121";
                        c.classList.add("toggle");
                    } else {
                        // c.style.fill = seatData.fill;
                        c.classList.remove("toggle");
                    }
                }
                div && (div.innerText = `구역: [${seatData.sectorId}] - 좌석: [${seatData.seatRow}]행 [${seatData.seatCol}]열`);
            }

            seatElem.onmouseout = () => {
                if (c) {
                    if (false === c.classList.contains("toggle")) {
                        c.style.fill = "#CD2121";
                        c.classList.add("toggle");
                    } else {
                        // c.style.fill = seatData.fill;
                        c.classList.remove("toggle");
                    }

                    let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    text.textContent = `${seatData.seatRow}`;
                }
                div && (div.innerText = `구역: [  ?  ] - 좌석: [ ? ]행 [ ? ]열`);
            };
        }
    });
}