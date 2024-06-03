import { ReactElement, useState, useEffect, useRef } from "react";
import { fabric } from 'fabric';

import { handleCanvasMouseDown, handleCanvasObjectScaling, handleCanvasSelectionCreated, handleCanvasSelectionUpdated, handleCanvasZoom, handleCanvasResize, initializeFabric } from '@/lib/canvas';
import { Canvas } from "@/components/Canvas";
import { PropertyPanel } from "@/components/property_panel/PropertyPanel";
import { EditingAttribute, ShapeEditingAttribute, ToolElement } from "@/types/canvas.type";
import { Navbar } from "@/components/Navbar";
import { TOOL_ELEMENT_PANNING, TOOL_ELEMENT_SELECT, TOOL_ELEMENT_TEXT, TOOL_ELEMENT_DEFAULT, TOOL_VALUE, TOOL_ELEMENT_SECTOR, SEAT_WIDTH, SEAT_HEIGHT, PREVIEW_OPACITY, COLORS, GRID_COLOR, DEFAULT_BACKGROUND_COLOR, EDITMODE_BACKGROUND_COLOR, } from "@/constants";
import { createShape, handleImageUpload } from "@/lib/shapes";
import { handleDelete, groupActiveSelection, handleKeyDown, ungroupActiveSelection } from "@/lib/key-events";
import { undo, redo } from "@/lib/history";
import { Assert } from "@/lib/assert";
import { useImmer } from "use-immer";
import { ObjectType, ObjectUtil } from "@/lib/type-check";
import { Sector } from "@/types/sector.type";
import { ExportableEditorObject, PositionAdjustment, EditableObject } from "@/types/editorObject.type";

import "@/preview.script";
import { Venue } from "@/types/venue.type";
import { CircleSeatObjectData, Seat } from "@/types/seat.type";
import _ from "lodash";
import { SeatHtmlTag, ImageHtmlTag, SeatMapJsonFormat, SeatMappingData, SeatMapJsonCompressedFormat } from "@/types/export.type";
import { saveStringToLocalDisk } from "@/lib/export";
import SeatData from "./property_panel/properties/SeatData";

// 추가적으로, https://github.com/fkhadra/react-contexify 이 라이브러리 써서 Custum Context Menu 구현합시다.
// 아니면 https://github.com/anandsimmy/custom-context-menu/blob/main/src/MyCusomtContextMenu.js#L4 이 코드 참고해서 직접 해도 되고..
// Source code from https://github.com/adrianhajdin/figma_clone/blob/main/app/App.tsx

function Editor(): ReactElement {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

    const previewCanvasRef = useRef<fabric.StaticCanvas | null>(null);
    const previewSeatShapeRef = useRef<fabric.Object | null>(null);

    const gridCanvasRef = useRef<fabric.StaticCanvas | null>(null);
    const [isGridViewOn, setIsGridViewOn] = useState<boolean>(false);

    // 라벨, 좌석 번호등의 시각화를 위한 캔버스
    // const dataCanvasRef = useRef<fabric.StaticCanvas | null>(null);

    const imageInputRef = useRef<HTMLInputElement>(null);

    // 현재 panning 중인지 확인하는 레퍼런스
    const isPanningRef = useRef<boolean>(false);
    // 가장 최근에 선택한 도구 ( shift 키 panning 기능을 위한 레퍼런스 )
    const lastSelectedToolValueRef = useRef<string | null>(null);
    // panning 시작시 최초 마우스 클릭 위치 저장 레퍼런스
    const lastMousePointerRef = useRef<{x: number, y: number}>({x:0, y:0});
    // 가장 마지막에 작업한 물체에 대한 레퍼런스
    const lastModifiedObjectRef = useRef<fabric.Object | null>(null);
    // sector를 생성중인 경우에 대한 레퍼런스
    const isSectorCreatingRef = useRef<boolean>(false);

    // 선택한 도구 
    const selectedToolValueRef = useRef<string | null>(null); // 그리기 도구에서 선택한 모형 레퍼런스
    const [activeToolUiState, setActiveToolUiState] = useState<ToolElement | null>(null); // 마우스로 그리기 도구 선택.
 
    // 키보드 이벤트를 임시로 막을 때 사용할 변수
    const keyboardEventDisableRef = useRef<boolean>(false);

    // 섹터 편집 / 일반 그룹 편집 / 일반 단일 도형 편집시 오른쪽 패널 전환 + 변경 시 객체에도 반영되기 위한 State
    const [editingElementUiAttributes, setEditingElementUiAttributes] = useImmer<EditingAttribute | null>(null);

    // 상세 편집 버튼을 현재 선택 오브젝트 상태에 따라 비활성화 하기 위한 State
    const [IsEditButtonClickableUiState, setIsEditButtonClickableUiState] = useImmer<boolean>(false);
    // 현재 상세 편집중일 경우 텍스트 내용을 변경하기 위한 State
    const [isInEditModeUiState, setIsEditModeUiState] = useImmer<boolean>(false);

    const isEditingModeRef = useRef<boolean>(false);

    const venueObjectRef = useRef<Venue | null>(null);

    // 편집 모드에서 현재 섹터와 연관된 Seat들을 저장하는 곳. 편집 모드를 끄면 Sector로 재구성하기 위함.
    const editingSeatsRef = useRef< Map<string, Seat> | null>(null);
    // 이건 기존 원본.
    const editingSectorRef = useRef<Sector | null>(null);

    // NOTE: 버전2. 압축 버전을 이용한 HTML 렌더링
    const createHtmlFromCanvasV2Compressed = (): string => {
        const json = createCompressedJsonObjectFromCanvas();

        let html = `<svg style=\"
        width:${json.venue.width}px; height:${json.venue.height}px; 
        border: 2px dashed;
        \">\n`;

        json.seats.forEach((seat: CircleSeatObjectData) => {
            const circle = `<circle id="${seat.seatId}" r="${seat.r}" cx="${seat.cx}" cy="${seat.cy}" fill="${seat.fill}" />\n`
            html += circle;
        })
        html += "</svg>";

        console.log(html);
        // --------------------------------------
        // run htmlPreviewHandler async
        setTimeout(() => {
            htmlPreviewHandlerV2(json);
        }, 50);
        // --------------------------------------

        return html;
    }

    const htmlPreviewHandlerV2 = (json: SeatMapJsonCompressedFormat): void => {
        const div = document.getElementById("preview-selected-seat-info");

        Array.from(json.seats).forEach((seatData: CircleSeatObjectData) => {
            const seatElem = document.getElementById(seatData.seatId);

            div && (div.innerText = `구역: [  ?  ] - 좌석: [ ? ]행 [ ? ]열`);
            if (seatElem) {
                seatElem.onmouseover = () => {
                    if (false === seatElem.classList.contains("toggle")) {
                        seatElem.style.fill = "#CD2121";
                        seatElem.classList.add("toggle");
                    } else {
                        seatElem.style.fill = seatData.fill;
                        seatElem.classList.remove("toggle");
                    }
                    div && (div.innerText = `구역: [${seatData.sectorId}] - 좌석: [${seatData.seatRow}]행 [${seatData.seatCol}]열`);
                }

                seatElem.onmouseout = () => {
                    if (false === seatElem.classList.contains("toggle")) {
                        seatElem.style.fill = "#CD2121";
                        seatElem.classList.add("toggle");
                    } else {
                        seatElem.style.fill = seatData.fill;
                        seatElem.classList.remove("toggle");
                    }
                    let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                    text.textContent = `${seatData.seatRow}`;
                    div && (div.innerText = `구역: [  ?  ] - 좌석: [ ? ]행 [ ? ]열`);
                };
            }
        });
    }

    // ----------------------------------------------------------
    const createHtmlFromCanvasV1 = (): string => {
        const json = createJsonObjectFromCanvas();

        let html = `<svg style=\"
                    width:${json.venue.width}px; height:${json.venue.height}px; 
                    border: 2px dashed;
                    \">`;

        json.images.forEach((imageTags: string) => {
            html += imageTags;
        });
        json.seats.forEach((seatHtmlTags: string) => {
            html += seatHtmlTags;
        });
        html += "</svg>";

        // --------------------------------------
        // run htmlPreviewHandler async
        setTimeout(() => {
            htmlPreviewHandlerV1(json);
        }, 50);
        // --------------------------------------

        return html;
    }


    // NOTE: 버전1. 비압축 버전을 이용한 HTML 렌더링
    const htmlPreviewHandlerV1 = (json: SeatMapJsonFormat): void => {

        const div = document.getElementById("preview-selected-seat-info");

        Array.from(json.mapping).forEach((seatData: SeatMappingData) => {
            const seatElem = document.getElementById(seatData.id);
            console.log(seatData.id, seatData.row, seatData.col, seatData.fill);

            div && (div.innerText = `구역: [  ?  ] - 좌석: [ ? ]행 [ ? ]열`);

            if (seatElem) {
                const c = seatElem.getElementsByTagName('circle').item(0);

                seatElem.onmouseover = () => {
                    if (c) {
                        if (false === c.classList.contains("toggle")) {
                            c.style.fill = "#CD2121";
                            c.classList.add("toggle");
                        } else {
                            c.style.fill = seatData.fill;
                            c.classList.remove("toggle");
                        }
                    }
                    div && (div.innerText = `구역: [${seatData.sectorId}] - 좌석: [${seatData.row}]행 [${seatData.col}]열`);
                }

                seatElem.onmouseout = () => {
                    if (c) {
                        if (false === c.classList.contains("toggle")) {
                            c.style.fill = "#CD2121";
                            c.classList.add("toggle");
                        } else {
                            c.style.fill = seatData.fill;
                            c.classList.remove("toggle");
                        }

                        let text = document.createElementNS("http://www.w3.org/2000/svg", "text");
                        text.textContent = `${seatData.row}`;
                    }
                    div && (div.innerText = `구역: [  ?  ] - 좌석: [ ? ]행 [ ? ]열`);
                };
            }
        });
    }

    const exportToCustomJsonFormat = () => {
        const jsonObject = createJsonObjectFromCanvas();
        const serialized = JSON.stringify(jsonObject, null, 4);
        const fileName = `venue_${jsonObject.venue.id}.json`;
        saveStringToLocalDisk(fileName, serialized);
    }

    const exportToCustomCompressedJsonFormat = () => {
        const jsonObject = createCompressedJsonObjectFromCanvas();
        const serialized = JSON.stringify(jsonObject, null, 4);
        const fileName = `venue_${jsonObject.venue.id}.json`;
        saveStringToLocalDisk(fileName, serialized);
    }

    const createCompressedJsonObjectFromCanvas = (): SeatMapJsonCompressedFormat => {
        const fabricCanvas = fabricCanvasRef.current;
        Assert.NonNull(fabricCanvas, "fabricCanvas 객체가 없습니다!");
        const venue = venueObjectRef.current;
        Assert.NonNull(venue, "fabricCanvas 객체가 없습니다!");

        const venueData = {
            id: venue.venueId,
            width: venue.width ?? 0,
            height: venue.height ?? 0,
        }

        const seatCompressedDataArray: Array<CircleSeatObjectData> = [];

        fabricCanvas.forEachObject((object: fabric.Object) => {

            const type = ObjectUtil.getType(object);

            // VENUE는 제외합니다. (only ExportableEditorObject objects)
            if (object instanceof ExportableEditorObject) {

                const ret = (object as ExportableEditorObject).toCompressedObjectData({
                    left: venue.left,
                    top: venue.top
                });
                seatCompressedDataArray.push(...ret);
                return;
            }

            if (ObjectType.FABRIC_IMAGE === type) {
                // center 기준 위치 조정.
                const adjustedLeft = (object.left) ? (object.left - (venue.left ?? 0)) : object.left;
                const adjustedTop = (object.top) ? (object.top - (venue.top ?? 0)) : object.top;

                // toSVG 위치 조정용.
                const img = (object as fabric.Image);
                const prevLeft = img.left;
                const prevTop = img.top;

                img.setOptions({ left: adjustedLeft, top: adjustedTop }); // 위치 임시 조정.
                console.log(img.toObject());
                img.setOptions({ left: prevLeft, top: prevTop }); // 위치 원상 복구.

                return;
            }
        });

        const resultingExportObject: SeatMapJsonCompressedFormat = {
            venue: venueData,
            seats: seatCompressedDataArray,
        };
        return resultingExportObject;
    }

    /**
     * @TODO 
     * Venue 경계선을 벗어난 오브젝트는 SVG로 export될 필요가 없지 않을까...?
     */
    const createJsonObjectFromCanvas = (): SeatMapJsonFormat => {
        const fabricCanvas = fabricCanvasRef.current;
        Assert.NonNull(fabricCanvas, "fabricCanvas 객체가 없습니다!");
        const venue = venueObjectRef.current;
        Assert.NonNull(venue, "fabricCanvas 객체가 없습니다!");

        const venueData = {
            id: venue.venueId,
            width: venue.width ?? 0,
            height: venue.height ?? 0,
        }
        const seatMappingArray      : Array<SeatMappingData>   = [];
        const seatHtmlTagArray      : Array<SeatHtmlTag>    = [];
        const imagesHtmlTagArray    : Array<string>         = [];
        
        fabricCanvas.forEachObject((object: fabric.Object) => {

            const type = ObjectUtil.getType(object);

            // VENUE는 제외합니다. (only ExportableEditorObject objects)
            if (object instanceof ExportableEditorObject) {

                const ret = (object as ExportableEditorObject).toTagsAndMappingData({
                    left: venue.left,
                    top: venue.top
                })
                seatMappingArray.push(...ret.mappingData);
                seatHtmlTagArray.push(...ret.tags);
                return;
            }

            // TODO: Fabric native 객체는 일단 아래와 같이 명시적으로 변환했지만,
            //       나중엔 Image도 EditorObject로 만들 예정이다.
            if (ObjectType.FABRIC_IMAGE === type) {

                // center 기준 위치 조정.
                const adjustedLeft = (object.left) ? (object.left - (venue.left ?? 0)) : object.left;
                const adjustedTop = (object.top) ? (object.top - (venue.top ?? 0)) : object.top;

                // toSVG 위치 조정용.
                const img = (object as fabric.Image);
                const prevLeft = img.left;
                const prevTop = img.top;

                img.setOptions({left: adjustedLeft, top: adjustedTop}); // 위치 임시 조정.
                imagesHtmlTagArray.push(img.toSVG());
                img.setOptions({left: prevLeft, top: prevTop}); // 위치 원상 복구.

                return;
            }
        });

        const resultingExportObject: SeatMapJsonFormat = {
            venue: venueData,
            seats: seatHtmlTagArray,
            images: imagesHtmlTagArray,
            mapping: seatMappingArray,
        };

        return resultingExportObject;
    }
  
    // --------------------------------------------------------------------
    const setObjectSelectable = (canvas: fabric.Canvas, _selectable: boolean) => {
        if (true === _selectable) {
            canvas.hoverCursor = "hover";
        } else {
            canvas.hoverCursor = "default";
        }
        canvas.selection = _selectable;
        canvas.forEachObject(function (o) {
            o.selectable = _selectable;
        });
    }

    const toggleGridView = () => {
        return setIsGridViewOn(prev => !prev);
    }

    const toggleEditingMode = () => {

        const canvas = fabricCanvasRef.current;
        Assert.NonNull(canvas);

        // toogle boolean ref
        isEditingModeRef.current = !isEditingModeRef.current;

        const isEditingMode = (true === isEditingModeRef.current);

        // isEditingModeRef 변화에 따라 UI 변경.
        setIsGridViewOn(!isEditingMode); 
        setIsEditModeUiState(isEditingMode); 
        
        // change background color if editing mode is on.
        const bg = (true === isEditingModeRef.current)
            ? (EDITMODE_BACKGROUND_COLOR)
            : (DEFAULT_BACKGROUND_COLOR);
        canvas.backgroundColor = bg;
        canvas.requestRenderAll();


        /**
         * 모든 오브젝트에 대해서...
         * 
         * 편집 대상이 아닌 모든 물체 = Opacity 작게 하거나 0으로 만들고, control 못하게 막기 
         * 참고: Lock @link http://fabricjs.com/fabric-intro-part-4
         * 
         * 편집 대상 섹터 = 편집용 객체로 변환
         * 그룹 해제 해서 각각 편집하고 삭제 가능.
         * 
         */
    
        // ---------------------------------------------------------
        // 1. 현재 선택된 Sector가 아닌 그 외 모든 물체는 Lock한다.
        let selectedSector = canvas.getActiveObject() as (Sector | null);

        canvas.forEachObject((obj: fabric.Object) => {
            const type = ObjectUtil.getType(obj);
            // Except selected sector.
            if (obj !== selectedSector) {
                obj.set({
                    selectable: (true === isEditingMode) ? (false) : (true),
                    evented: (true === isEditingMode) ? (false) : (true),
                    opacity: (true === isEditingMode) ? (0.35) : (1),
                })
            }
            if (obj !== selectedSector && ObjectType.VENUE === type) {
                (obj as Venue).visible = (true === isEditingMode) ? (false) : (true);
            }
        });
        canvas.selection = (true === isEditingMode) ? (false) : (true);
        canvas.discardActiveObject().renderAll();

        // ---------------------------------------------------------
        // 2. 편집 모드 활성화라면, 현재 선택된 Sector를 해체한다.
        if (true === isEditingMode) {
            Assert.NonNull(selectedSector);
            Assert.True(
                (ObjectType.SECTOR === ObjectUtil.getType(selectedSector)),
                "편집 대상 Object는 Sector여야 합니다."
            );

            editingSectorRef.current = selectedSector;
            editingSeatsRef.current = new Map<string, Seat>();

            const selection = new fabric.ActiveSelection(undefined, { canvas: canvas });
            canvas.remove(selectedSector);
            (selectedSector.destroy() as Sector).getSeats().forEach((seat: Seat) => {
                Assert.True(seat instanceof Seat);
                const copiedSeat = seat.constructNewCopy();
                canvas.add(copiedSeat);
                selection.addWithUpdate(copiedSeat);
                // 편집 모드 종료시 활용할 데이터.
                editingSeatsRef.current?.set(copiedSeat.getObjectId(), copiedSeat);
            });
            canvas.setActiveObject(selection).requestRenderAll();
            return;
        }

        // ---------------------------------------------------------
        // 3. 편집 모드를 종료한다면, 현재 편집중인 모든 좌석들을 하나의 섹터로 재구성 한다.
        if (false === isEditingMode) {
            Assert.NonNull(editingSectorRef.current);
            Assert.NonNull(editingSeatsRef.current);


            const newSector = new Sector(
                editingSectorRef.current.baseShape,
                editingSectorRef.current.sectorId,
            )
            editingSeatsRef.current?.forEach((seat: Seat) => {
                canvas.remove(seat);
                newSector.addSeatWithUpdate(seat);
            });
            canvas.add(newSector);

            // reset
            editingSeatsRef.current.clear();
            editingSeatsRef.current = null;
            editingSectorRef.current = null;

            // do others...
            lastModifiedObjectRef.current = newSector;

            // 섹터 재구성이 끝났다면, 이제 마무리.
            canvas.discardActiveObject().requestRenderAll(); // 선택 초기화
            setIsEditButtonClickableUiState(false); // 버튼 비활성화
        }
    }

    const setActiveEditorToolTo = (toolElem: ToolElement) => {

        console.log(`setActiveEditorToolTo( ${toolElem.value} )`);

        Assert.NonNull(fabricCanvasRef.current);
        Assert.NonNull(previewCanvasRef.current);
        Assert.NonNull(gridCanvasRef.current);
        Assert.NonNull(toolElem.value);

        // ---------------------------------------------------------------------
        // set-up initial state
        previewSeatShapeRef.current = null; // unset preview shape ref
        previewCanvasRef.current?.clear(); // remove current preview shape from preview-canvas
        selectedToolValueRef.current = null; // remove selected tool ref
        isPanningRef.current = false; // turn off panning mode flag
        fabricCanvasRef.current.isDrawingMode = false; // disable the drawing mode of canvas
        fabricCanvasRef.current.setCursor("default");
        setObjectSelectable(fabricCanvasRef.current, true);

        // ---------------------------------------------------------------------
        switch (toolElem?.value) {

            case TOOL_VALUE.select:
                selectedToolValueRef.current = TOOL_VALUE.select;
                setActiveToolUiState(TOOL_ELEMENT_SELECT); // re-render navbar
                break;
  
            case TOOL_VALUE.image:
                imageInputRef.current?.click(); // trigger the click event on the input element which opens the file dialog
                setActiveEditorToolTo(TOOL_ELEMENT_DEFAULT);
                break;

            case TOOL_VALUE.group:
                groupActiveSelection(fabricCanvasRef.current as any);
                setActiveEditorToolTo(TOOL_ELEMENT_DEFAULT);
                break;

            case TOOL_VALUE.ungroup:
                ungroupActiveSelection(fabricCanvasRef.current as any);
                setActiveEditorToolTo(TOOL_ELEMENT_DEFAULT);
                break;

            case TOOL_VALUE.delete:
                handleDelete(fabricCanvasRef.current as any); // delete it from the canvas
                setActiveEditorToolTo(TOOL_ELEMENT_DEFAULT);
                break;

            // -----------------------------------------------------------------------------
            case TOOL_VALUE.panning:
                setObjectSelectable(fabricCanvasRef.current, false);
                selectedToolValueRef.current = TOOL_VALUE.panning;
                setActiveToolUiState(TOOL_ELEMENT_PANNING); // re-render navbar
                break;

            case TOOL_VALUE.sector: // 섹터 생성
                fabricCanvasRef.current.discardActiveObject();
                selectedToolValueRef.current = TOOL_VALUE.sector;
                setObjectSelectable(fabricCanvasRef.current, false);
                setActiveToolUiState(TOOL_ELEMENT_SECTOR); // re-render navbar
                break;

            // ---- Tool: Single Object Creation (Text, Shape) -----------------------------
            default:
                // Assert.Never("현재 일반 객체 생성은 금지되어 있습니다. 개발중입니다.");

                selectedToolValueRef.current = toolElem?.value as string;
                setObjectSelectable(fabricCanvasRef.current, false);

                // Create preview shape
                const selectedPreviewShape = createShape(selectedToolValueRef.current, undefined, {opacity: PREVIEW_OPACITY});
                if (selectedPreviewShape) {
                    previewCanvasRef.current.add(selectedPreviewShape);
                    previewSeatShapeRef.current = selectedPreviewShape;
                }
                setActiveToolUiState(toolElem); // re-render navbar
                break;
        }
    };


    useEffect(() => {
        console.log("==== [ Canvas Re-rendered ] ===");

        const INITIAL_ZOOM_VALUE = 1.0;
        // const INITIAL_WIDTH = 3000;
        // const INITIAL_HEIGHT = 3000;
        // -----------------------------------------------------------------------
        // init fabric canvas
        const fabricCanvas: fabric.Canvas = initializeFabric({
            htmlCanvasElementId: "fabric-canvas",
            canvasRef,
            fabricRef: fabricCanvasRef,
        });
        fabricCanvas.setZoom(INITIAL_ZOOM_VALUE);
        // fabricCanvas.setDimensions({width:INITIAL_WIDTH, height:INITIAL_HEIGHT});

        // Set default behavior of group
        // fabric.Canvas.prototype.selection = false;
        fabric.Group.prototype.set({
            borderColor: '#ff00ff',
            cornerColor: '#ff0000',
            lockScalingX: true,
            lockScalingY: true,
        });
        // fabric.Group.prototype.setControlsVisibility({
        //     mtr: true, // show rotation
        //     mt: false,
        //     tr: false,
        //     tl: false,
        //     mb: false,
        //     ml: false,
        //     mr: false,
        //     bl: false,
        //     br: false
        // })

        // -----------------------------------------------------------------------
        // init preview canvas
        const previewCanvas = new fabric.StaticCanvas("preview-canvas", {
            width: fabricCanvas.width,
            height: fabricCanvas.height,
            defaultCursor: "none",
        });
        // previewCanvas.setDimensions({width:INITIAL_WIDTH, height:INITIAL_HEIGHT});
        previewCanvas.setZoom(INITIAL_ZOOM_VALUE);
        previewCanvasRef.current = previewCanvas;

        // -----------------------------------------------------------------------
        // init grid canvas
        const gridCanvas = new fabric.StaticCanvas("grid-canvas", {
            width: fabricCanvas.width,
            height: fabricCanvas.height,
            defaultCursor: "none",
        });
        gridCanvas.setZoom(INITIAL_ZOOM_VALUE);
        // gridCanvas.setDimensions({width:INITIAL_WIDTH, height:INITIAL_HEIGHT});
        gridCanvasRef.current = gridCanvas;
        const gridUnitSize = 30;
        const unitScale = 2;
        const gridMaxLength = gridCanvasRef.current.getWidth() * unitScale;
        const start = -(gridMaxLength / 4);
        for (let i = 0; i < (gridMaxLength / gridUnitSize) + 1; ++i) {
            gridCanvasRef.current.add(new fabric.Line([start + i * gridUnitSize, start + 0, start + i * gridUnitSize, start + gridMaxLength], { strokeWidth:1, type: 'line', stroke: GRID_COLOR, selectable: false }));
            gridCanvasRef.current.add(new fabric.Line([start + 0, start + i * gridUnitSize, start + gridMaxLength, start + i * gridUnitSize], { strokeWidth:1, type: 'line', stroke: GRID_COLOR, selectable: false }))
        }

        // -----------------------------------------------------------------------
        // fabric default tool setting
        setActiveToolUiState(TOOL_ELEMENT_DEFAULT);
        Assert.True(typeof TOOL_ELEMENT_DEFAULT.value === "string", "초기 설정 도구는 value가 string 타입이여야 합니다.");
        selectedToolValueRef.current = TOOL_ELEMENT_DEFAULT.value as string;

        // -----------------------------------------------------------------------
        // Create Venue Single Object (+ Disbale Copy-paste)
        Assert.NonNull(fabricCanvasRef.current, "fabric canvas가 null일 수 없습니다.");
        const venueWidth = fabricCanvasRef.current?.width;
        Assert.NonNull(venueWidth, "fabric canvas와 width가 null일 수 없습니다.");
        const venueHeight = fabricCanvasRef.current?.height;
        Assert.NonNull(venueHeight, "fabric canvas와 height가 null일 수 없습니다.");

        const venue = new Venue(
            "공연장 1", 
            venueWidth * 0.7,
            venueHeight * 0.8,
        )
        fabricCanvasRef.current.add(venue);
        fabricCanvasRef.current.centerObject(venue);
        fabricCanvasRef.current.requestRenderAll();
        venueObjectRef.current = venue;

        // -----------------------------------------------------------------
        fabricCanvas.on("selection:created", function (options: fabric.IEvent) {
            console.log(`fabric: [selection:created]`);
            handleCanvasSelectionCreated({ // for editing Attribute
                options,
                setEditingElementUiAttributes,
            })
            setActiveEditorToolTo(TOOL_ELEMENT_DEFAULT);
            keyboardEventDisableRef.current = false;

            // --------------------------------------------------
            // Activate Editing Mode Button ui (if condition fulfilled)
            const activeObjects = fabricCanvasRef.current?.getActiveObjects();

            // 에디팅 모드일땐 버튼 항상 활성화
            if (true === isEditingModeRef.current) {
                setIsEditButtonClickableUiState(true);
                return;
            }

            if ((false === isEditingModeRef.current) &&
                (activeObjects) &&
                (activeObjects?.length === 1)
            ) {
                const selectedElement = activeObjects[0];
                const selectedType = ObjectUtil.getType(selectedElement);
                const isEditable = ((selectedElement) && (ObjectType.SECTOR === selectedType));
                setIsEditButtonClickableUiState(isEditable);
                return;
            }
        });

        fabricCanvas.on("selection:updated", function (options: fabric.IEvent) {
            console.log(`fabric: [selection:updated]`);
            handleCanvasSelectionUpdated({ // for editing Attribute
                options,
                setEditingElementUiAttributes,
            })
            setActiveEditorToolTo(TOOL_ELEMENT_DEFAULT);
            keyboardEventDisableRef.current = false;

            // --------------------------------------------------
            // Activate Editing Mode Button ui (if condition fulfilled)
            const activeObjects = fabricCanvasRef.current?.getActiveObjects();

            // 에디팅 모드일땐 버튼 항상 활성화
            if (true === isEditingModeRef.current) {
                setIsEditButtonClickableUiState(true);
                return;
            }

            if ((false === isEditingModeRef.current) &&
                (activeObjects) &&
                (activeObjects?.length === 1)
            ) {
                const selectedElement = activeObjects[0];
                const selectedType = ObjectUtil.getType(selectedElement);
                const isEditable = ((selectedElement) && (ObjectType.SECTOR === selectedType));
                setIsEditButtonClickableUiState(isEditable);
                return;
            }
        })

        fabricCanvas.on("selection:cleared", function (options: fabric.IEvent) {
            console.log(`fabric: [selection:cleard]`);

            setEditingElementUiAttributes(null);

            // 현재 에디팅 모드일 경우엔 버튼을 비활성화해선 안된다.
            if (false === isEditingModeRef.current) {
                setIsEditButtonClickableUiState(false);
            }

            keyboardEventDisableRef.current = false;
        });

        // -----------------------------------------------------------------
        // After event
        fabricCanvas.on("object:modified", (options) => {
            console.log("fabric: [object:modified]");
            const target = options.target as fabric.Object;
            if (target instanceof EditableObject) {
                (target as EditableObject).onModified();
            }
        });

        fabricCanvas.on("object:added", (options) => {
            console.log("fabric: [object:added]");
        });

        fabricCanvas.on("object:removed", (options) => {
            console.log("fabric: [object:removed]");
            /**
             * @note 섹터 편집 모드에서 좌석이 삭제될 경우, 복구시 싱크를 맞춰야 한다.
             */
            if (true === isEditingModeRef.current) {
                const removed = options.target as ExportableEditorObject;
                Assert.NonNull(
                    editingSeatsRef.current,
                    "편집모드 중에는 editingSeatsRef가 반드시 존재해야 합니다!"
                );
                editingSeatsRef.current.delete(removed.getObjectId());
            }
        });

        fabricCanvas.on("object:rotating", (options) => {
            console.log("fabric: [object:rotating");
            // 내부 글자의 Angle을 회전시키기 위함.
            const target = options.target as fabric.Object;
            if (target instanceof EditableObject) {
                (target as EditableObject).onRotating();
            }
        })

        // -----------------------------------------------------------------
        // On-Going event
        fabricCanvas.on("object:scaling", (options) => {
            console.log("fabric: [object:scaling]");
            handleCanvasObjectScaling({
                options,
                setEditingElementUiAttributes,
            });
            const target = options.target as fabric.Object;
            if (target instanceof EditableObject) {
                (target as EditableObject).onScaling();
            }
        });

        fabricCanvas.on("object:moving", (options) => {}); 
        fabricCanvas.on("object:resizing", (options) => {});
        fabricCanvas.on("object:rotating", (options) => {});
        fabricCanvas.on("object:scaling", (options) => {});

        // -----------------------------------------------------------------
        // Mouse event
        fabricCanvas.on("mouse:over", function (options: fabric.IEvent) {});
        fabricCanvas.on("mouse:out", function (options: fabric.IEvent) {});

        fabricCanvas.on("mouse:move", function (options: fabric.IEvent) {

            const pointer = fabricCanvas.getPointer(options.e);

            switch (selectedToolValueRef.current) {

                case (TOOL_VALUE.panning):
                    fabricCanvasRef.current?.setCursor("grab");
                    if (true === isPanningRef.current && options.pointer) {
                        fabricCanvasRef.current?.setCursor("grabbing");
                        let vpt = fabricCanvasRef.current?.viewportTransform;
                        if (vpt) {
                            vpt[4] += options.pointer?.x - (lastMousePointerRef.current.x);
                            vpt[5] += options.pointer?.y - (lastMousePointerRef.current.y);
                        }
                        lastMousePointerRef.current = { x: options.pointer?.x, y: options.pointer?.y };
                        fabricCanvasRef.current?.requestRenderAll();
                        const viewPortTransform = fabricCanvasRef.current?.viewportTransform;
                        if (viewPortTransform) {
                            previewCanvasRef.current?.setViewportTransform(viewPortTransform).requestRenderAll();
                            gridCanvasRef.current?.setViewportTransform(viewPortTransform).requestRenderAll();
                        };
                    }
                    break; // ----------------------------------------------------------

                case (TOOL_VALUE.sector):
                    fabricCanvasRef.current?.setCursor("crosshair");
                    if (previewSeatShapeRef.current) { // mouse drag creation (마우스 끌기로 섹션 생성)

                        Assert.True(previewSeatShapeRef.current instanceof fabric.Group, "Preview 객체가 그룹이 아닙니다. 객체 생성 부분을 체크해주세요.");

                        // 1. update Section preview rectangle
                        const previewSector = (previewSeatShapeRef.current as fabric.Group); 
                        const width = pointer.x - lastMousePointerRef.current.x;
                        const height = pointer.y - lastMousePointerRef.current.y;
                        previewSector.item(0).set({ width: width, height: height });

                        // 2. change section hint Text (Row*Col)
                        const rowCount = Math.ceil(width / SEAT_WIDTH);
                        const colCount = Math.ceil(height / SEAT_HEIGHT);
                        (previewSector.item(1) as any).set("text", `${rowCount}×${colCount}`);

                        previewSector.set({ width: width, height: height });
                        previewCanvasRef.current?.requestRenderAll();
                    }
                    break; // ----------------------------------------------------------

                default: 
                    // 일반 도형 한개씩 찍는 모드는 Preview Shape이 마우스 위치를 따라가도록함.
                    previewSeatShapeRef.current?.set({ 
                        left: pointer.x,
                        top: pointer.y, 
                    }).setCoords().canvas?.renderAll();
                    // ...
                    break; // ----------------------------------------------------------
            }
        });

        fabricCanvas.on("mouse:down", (options: fabric.IEvent<MouseEvent>) => {

            lastSelectedToolValueRef.current = selectedToolValueRef.current;

            if (options.e.shiftKey) {
                /* Activate Temporal Panning */
                Assert.True(typeof TOOL_ELEMENT_PANNING.value === "string", "panning 설정의 value는 반드시 string이여야 합니다.");
                selectedToolValueRef.current = TOOL_ELEMENT_PANNING.value as string;
            }

            handleCanvasMouseDown({
                options,
                fabricCanvas,
                previewCanvas,
                selectedToolValueRef,
                lastModifiedObjectRef,
                isPanningRef,
                lastMousePointerRef,
                isSectorCreatingRef,
                previewSeatShapeRef 
            }); 
            fabricCanvasRef.current?.requestRenderAll();
        });

        fabricCanvas.on("mouse:up", (options) => {

            Assert.NonNull(fabricCanvasRef.current);

            const pointer = fabricCanvas.getPointer(options.e);

            switch (selectedToolValueRef.current) {

                case (TOOL_VALUE.sector):
                    /*
                     * create REAL sector object on Mouse Up.
                     */
                    const startPos = lastMousePointerRef.current;
                    const endPos = pointer;
                    const width = endPos.x - startPos.x;
                    const height = endPos.y - startPos.y;
                    const seatColCount = Math.ceil(width / SEAT_WIDTH);
                    const seatRowCount = Math.ceil(height / SEAT_HEIGHT);

                    if ((seatRowCount < 1) && (seatColCount < 1)) {
                        alert("sector는 좌석 1개 이상부터 배치부터 생성 가능합니다.")
                        setActiveEditorToolTo(TOOL_ELEMENT_DEFAULT);
                        return null;
                    }

                    const sector = new Sector(
                        ObjectType.FABRIC_CIRCLE,
                        "NULL",
                        seatRowCount,
                        seatColCount,
                        0,
                        0,
                        {
                            left: startPos.x,
                            top: startPos.y,
                            fill: COLORS.object.default,
                        }
                    );

                    isSectorCreatingRef.current = false; // turn off sector creating mode.
                    previewSeatShapeRef.current = null; // unset preview shape ref
                    previewCanvasRef.current?.clear(); // remove current preview shape from preview-canvas
                    setActiveEditorToolTo(TOOL_ELEMENT_DEFAULT); // 도구 초기화

                    lastModifiedObjectRef.current = sector; // record last modified object for further use...
                    fabricCanvasRef.current.add(sector).requestRenderAll();
                    fabricCanvasRef.current.setActiveObject(sector); // 강제 선택
                    sector.setCoords();
                    break; // -------------------------------------------------------------

                default:
                    // panning 모드는 도구 선택 없이 shift 키를 이용할 수 있기 때문에, 마우스를 올리면 꺼주기 
                    if (true === isPanningRef.current) {
                        fabricCanvasRef.current.setCursor("grab");
                        isPanningRef.current = false;
                    }
                    // 가장 최근에 선택했던 도구로 복구
                    selectedToolValueRef.current = lastSelectedToolValueRef.current;
                    break; // -------------------------------------------------------------
            }

        })

        fabricCanvas.on("mouse:wheel", (options: fabric.IEvent<WheelEvent>) => {

            if (options.e.deltaY > 0) {
                fabricCanvasRef.current?.setCursor("zoom-in");
            } else {
                fabricCanvasRef.current?.setCursor("zoom-out");
            }

            handleCanvasZoom({
                options,
                canvas: fabricCanvas,
            });
            fabricCanvasRef.current?.requestRenderAll();

            handleCanvasZoom({
                options,
                canvas: previewCanvas,
            });
            previewCanvasRef.current?.requestRenderAll();

            handleCanvasZoom({
                options,
                canvas: gridCanvas,
            })
            gridCanvasRef.current?.requestRenderAll();
        });

        // -----------------------------------------------------------------
        // Global window event
        const handleWindowResizeEvent = (e: UIEvent) => {
            // console.log("handleWindowResizeEvent()");
            handleCanvasResize({
                htmlCanvasElementId: "fabric-canvas",
                canvas: fabricCanvasRef.current,
            });
            previewCanvasRef.current?.setDimensions({
                width: (fabricCanvasRef.current?.width ?? 0),
                height: (fabricCanvasRef.current?.height ?? 0),
            });
            gridCanvasRef.current?.setDimensions({
                width: (fabricCanvasRef.current?.width ?? 0),
                height: (fabricCanvasRef.current?.height ?? 0),
            });
        }

        const handleWindowKeyEvent = (e: KeyboardEvent) => {
            // console.log("handleWindowKeyEvent()");
            
            handleKeyDown({
                e,
                canvas: fabricCanvasRef.current,
                undo,
                redo,
                disable: keyboardEventDisableRef.current,
                setActiveEditorToolTo,
            })
        }
        // add the window event listeners
        window.addEventListener("resize", handleWindowResizeEvent);
        window.addEventListener("keydown", handleWindowKeyEvent)

        return () => {
            /**
             * dispose is a method provided by Fabric that allows you to dispose
             * the canvas. It clears the canvas and removes all the event listeners
             */
            fabricCanvas.dispose();
            previewCanvas.dispose();
            gridCanvas.dispose();

            // remove the window event listeners
            window.removeEventListener("resize", handleWindowResizeEvent);
            window.removeEventListener("keydown", handleWindowKeyEvent);
        }
    }, [canvasRef]);

    return (
        <>
            <div className=' flex flex-col w-full h-[100vh]'  >
                <Navbar
                    activeToolUiState={activeToolUiState}
                    IsEditButtonClickableUiState={IsEditButtonClickableUiState}
                    toggleEditingMode={toggleEditingMode}
                    setActiveEditorToolTo={setActiveEditorToolTo}
                    imageInputRef={imageInputRef}
                    toggleGridView={toggleGridView}
                    isGridViewOn={isGridViewOn}
                    handleImageUpload={(e: any) => {
                        e.stopPropagation(); // prevent the default behavior of the input element

                        handleImageUpload({
                            file: e.target.files[0],
                            canvas: fabricCanvasRef as any,
                        });
                    }}
                    isInEditModeUiState={isInEditModeUiState}
                />
                <section className='flex flex-row w-full h-full justify-between'>
                    <div className="relative w-full h-full ">
                        <Canvas
                            id="fabric-canvas"
                            className=" w-full h-full z-10"
                            ref={canvasRef}
                        />
                        <canvas
                            id="preview-canvas"
                            className=" pointer-events-none absolute top-0 left-0 right-0 z-10"
                        />
                        <canvas
                            hidden={(false === isGridViewOn)}
                            id="grid-canvas"
                            className=" pointer-events-none absolute top-0 left-0 right-0 z-0"
                        />
                    </div>
                    <PropertyPanel
                        editingElementUiAttributes={editingElementUiAttributes}
                        setEditingElementUiAttributes={setEditingElementUiAttributes}
                        fabricRef={fabricCanvasRef}
                        keyboardEventDisableRef={keyboardEventDisableRef}
                        createHtmlPreview={createHtmlFromCanvasV1}
                        exportToCustomJsonFormat={exportToCustomJsonFormat}
                        createJsonObjectFromCanvas={createJsonObjectFromCanvas}
                        createCompressedJsonObjectFromCanvas={createCompressedJsonObjectFromCanvas}
                        createHtmlPreviewWithCompressedData={createHtmlFromCanvasV2Compressed}
                        exportToCustomCompressedJsonFormat={exportToCustomCompressedJsonFormat}
                    />
                </section>
            </div>

        </>
    );
}

export { Editor };