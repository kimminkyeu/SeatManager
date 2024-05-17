import { ReactElement, useState, useEffect, useRef } from "react";
import { fabric } from 'fabric';

import { handleCanvasMouseDown, handleCanvasObjectScaling, handleCanvasSelectionCreated, handleCanvasSelectionUpdated, handleCanvasZoom, handleCanvasResize, initializeFabric } from '@/lib/canvas';
import { Canvas } from "@/components/Canvas";
import { PropertyPanel } from "@/components/property_panel/PropertyPanel";
import { EditingAttribute, ShapeEditingAttribute, ToolElement } from "@/types/canvas.type";
import { Navbar } from "@/components/Navbar";
import { TOOL_ELEMENT_PANNING, TOOL_ELEMENT_SELECT, TOOL_ELEMENT_TEXT, TOOL_ELEMENT_DEFAULT, TOOL_VALUE, TOOL_ELEMENT_SECTOR, SEAT_WIDTH, SEAT_HEIGHT, } from "@/constants";
import { createShape, handleImageUpload } from "@/lib/shapes";
import { handleDelete, groupActiveSelection, handleKeyDown, ungroupActiveSelection } from "@/lib/key-events";
import { undo, redo } from "@/lib/history";
import { Assert } from "@/lib/assert";
import { createSector } from "@/lib/sector";
import { useImmer } from "use-immer";

// TODO: Panning + zoom 하면 마우스 포인터 이상해지는 문제 해결하기
// TODO: Sector는 외곽선 색 + section text 표기를 같이 보여주자.
// TODO: Export to Json같은 중요 버튼은 색을 주황색으로 주기


// 추가적으로, https://github.com/fkhadra/react-contexify 이 라이브러리 써서 Custum Context Menu 구현합시다.
// 아니면 https://github.com/anandsimmy/custom-context-menu/blob/main/src/MyCusomtContextMenu.js#L4 이 코드 참고해서 직접 해도 되고..
// Source code from https://github.com/adrianhajdin/figma_clone/blob/main/app/App.tsx

function Editor(): ReactElement {

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fabricCanvasRef = useRef<fabric.Canvas | null>(null);

    const previewCanvasRef = useRef<fabric.StaticCanvas | null>(null);
    const previewSeatShapeRef = useRef<fabric.Object | null>(null);

    const gridCanvasRef = useRef<fabric.StaticCanvas | null>(null);
    const [isGridViewOn, setIsGridViewOn] = useState<boolean>(true);

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

    // 섹터 편집 / 일반 그룹 편집 / 일반 단일 도형 편집시 오른쪽 패널 전환을 위한 도구
    // EditingElementAttributes is an object that contains the attributes of the selected element in the canvas.
    const [editingElementAttributes, setEditingElementAttributes] = useImmer<EditingAttribute | null>(null);

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
        setIsGridViewOn((prev) => !prev);
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

            case TOOL_VALUE.select:
                selectedToolValueRef.current = TOOL_VALUE.select;
                setActiveToolUiState(TOOL_ELEMENT_SELECT); // re-render navbar
                break;

            case TOOL_VALUE.sector: // 섹터 생성
                selectedToolValueRef.current = TOOL_VALUE.sector;
                setObjectSelectable(fabricCanvasRef.current, false);
                setActiveToolUiState(TOOL_ELEMENT_SECTOR); // re-render navbar
                break;

            // ---- Tool: Single Object Creation (Text, Shape) -----------------------------
            default:
                selectedToolValueRef.current = toolElem?.value as string;
                setObjectSelectable(fabricCanvasRef.current, false);

                // Create preview shape
                const selectedPreviewShape = createShape(selectedToolValueRef.current, undefined, true);
                if (selectedPreviewShape) {
                    previewCanvasRef.current.add(selectedPreviewShape);
                    previewSeatShapeRef.current = selectedPreviewShape;
                }
                setActiveToolUiState(toolElem); // re-render navbar
                break;
        }
    };


    useEffect(() => {
        // -----------------------------------------------------------------------
        // init fabric canvas
        const fabricCanvas: fabric.Canvas = initializeFabric({
            htmlCanvasElementId: "fabric-canvas",
            canvasRef,
            fabricRef: fabricCanvasRef
        });

        // -----------------------------------------------------------------------
        // init preview canvas
        const previewCanvas = new fabric.StaticCanvas("preview-canvas", {
            width: fabricCanvas.width,
            height: fabricCanvas.height,
            defaultCursor: "none",
        });
        previewCanvasRef.current = previewCanvas;

        // -----------------------------------------------------------------------
        // init grid canvas
        const gridCanvas = new fabric.StaticCanvas("grid-canvas", {
            width: fabricCanvas.width,
            height: fabricCanvas.height,
            defaultCursor: "none",
        });
        gridCanvasRef.current = gridCanvas;
        const gridUnitSize = 50;
        const unitScale = 2;
        const gridMaxLength = gridCanvasRef.current.getWidth() * unitScale;
        const gridColor = "#c2c2c2";
        const start = -(gridMaxLength / 4);
        for (let i = 0; i < (gridMaxLength / gridUnitSize) + 1; ++i) {
            gridCanvasRef.current.add(new fabric.Line([start + i * gridUnitSize, start + 0, start + i * gridUnitSize, start + gridMaxLength], { type: 'line', stroke: gridColor, selectable: false }));
            gridCanvasRef.current.add(new fabric.Line([start + 0, start + i * gridUnitSize, start + gridMaxLength, start + i * gridUnitSize], { type: 'line', stroke: gridColor, selectable: false }))
        }


        // -----------------------------------------------------------------------
        // // init data canvas
        // const dataCanvas = new fabric.StaticCanvas("data-canvas", {
        //     width: fabricCanvas.width,
        //     height: fabricCanvas.height,
        //     defaultCursor: "none",
        // });
        // dataCanvasRef.current = dataCanvas;

        // -----------------------------------------------------------------------
        // fabric default tool setting
        setActiveToolUiState(TOOL_ELEMENT_DEFAULT);
        Assert.True(typeof TOOL_ELEMENT_DEFAULT.value === "string", "초기 설정 도구는 value가 string 타입이여야 합니다.");
        selectedToolValueRef.current = TOOL_ELEMENT_DEFAULT.value as string;

        // -----------------------------------------------------------------------
        // fabric canvas group selection setting
        fabric.Group.prototype.lockScalingX = true;
        fabric.Group.prototype.lockScalingY = true;
        fabric.Group.prototype.setControlsVisibility({
            mt: false,
            tr: false,
            tl: false,
            mb: false,
            ml: false,
            mr: false,
            bl: false,
            br: false
        })

        // -----------------------------------------------------------------
        fabricCanvas.on("selection:created", function (options: fabric.IEvent) {
            console.log(`fabric: [selection:created]`);
            handleCanvasSelectionCreated({
                options,
                setEditingElementAttributes,
            })
            setActiveEditorToolTo(TOOL_ELEMENT_DEFAULT);
            keyboardEventDisableRef.current = false;
        });

        fabricCanvas.on("selection:updated", function (options: fabric.IEvent) {
            console.log(`fabric: [selection:updated]`);
            // console.dir(options.selected);
            handleCanvasSelectionUpdated({
                options,
                setEditingElementAttributes,
            })
            setActiveEditorToolTo(TOOL_ELEMENT_DEFAULT);
            keyboardEventDisableRef.current = false;
        })

        fabricCanvas.on("selection:cleared", function (options: fabric.IEvent) {
            console.log(`fabric: [selection:cleard]`);
            setEditingElementAttributes(null);
            keyboardEventDisableRef.current = false;
        });

        // -----------------------------------------------------------------
        // After event
        fabricCanvas.on("object:modified", (options) => {
            console.log("fabric: [object:modified]");
            // storageManager.persist(options.target); // update object to storage
        });

        fabricCanvas.on("object:added", (options) => {
            console.log("fabric: [object:added]");
            // storageManager.persist(options.target); // update object to storage
        });

        fabricCanvas.on("object:removed", (options) => {
            console.log("fabric: [object:removed]");
            // storageManager.persist(options.target); // update object to storage
        });

        // -----------------------------------------------------------------
        // On-Going event
        fabricCanvas.on("object:scaling", (options) => {
            console.log("fabric: [object:scaling]");
            handleCanvasObjectScaling({
                options,
                setEditingElementAttributes,
            });
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
                        previewSector.set({ width: width, height: height });

                        // 2. change section hint Text (Row*Col)
                        const rowCount = Math.ceil(width / SEAT_WIDTH);
                        const colCount = Math.ceil(height / SEAT_HEIGHT);
                        (previewSector.item(1) as any).set("text", `${rowCount}×${colCount}`);

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
                    const sector = createSector(TOOL_VALUE.circle, lastMousePointerRef.current, pointer, false);

                    isSectorCreatingRef.current = false; // turn off sector creating mode.
                    previewSeatShapeRef.current = null; // unset preview shape ref
                    previewCanvasRef.current?.clear(); // remove current preview shape from preview-canvas
                    setActiveEditorToolTo(TOOL_ELEMENT_DEFAULT); // 도구 초기화

                    if (sector) {
                        lastModifiedObjectRef.current = sector; // record last modified object for further use...
                        fabricCanvasRef.current.add(sector).requestRenderAll();
                        fabricCanvasRef.current.setActiveObject(sector); // 강제 선택
                        sector.setCoords();
                    }
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
                    setActiveEditorToolTo={setActiveEditorToolTo}
                    imageInputRef={imageInputRef}
                    toggleGridView={toggleGridView}
                    handleImageUpload={(e: any) => {
                        e.stopPropagation(); // prevent the default behavior of the input element

                        handleImageUpload({
                            file: e.target.files[0],
                            canvas: fabricCanvasRef as any,
                        });
                    }}
                />
                <section className='flex flex-row w-full h-full justify-between'>
                    <div className="relative w-full h-full ">
                        <Canvas
                            id="fabric-canvas"
                            className=" w-full h-full "
                            ref={canvasRef}
                        />
                        <canvas
                            id="preview-canvas"
                            className=" pointer-events-none absolute top-0 left-0 right-0"
                        />
                        <canvas
                            hidden={(false === isGridViewOn)}
                            id="grid-canvas"
                            className=" pointer-events-none absolute top-0 left-0 right-0"
                        />
                        {/* <canvas
                            id="data-canvas"
                            className=" pointer-events-none absolute top-0 left-0 right-0"
                        /> */}
                    </div>
                    <PropertyPanel
                        editingElementAttributes={editingElementAttributes}
                        setEditingElementAttributes={setEditingElementAttributes}
                        fabricRef={fabricCanvasRef}
                        keyboardEventDisableRef={keyboardEventDisableRef}
                    />
                </section>
            </div>

        </>
    );
}

export { Editor };