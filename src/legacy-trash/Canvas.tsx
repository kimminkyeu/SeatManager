// import { ReactElement, useCallback, useEffect } from "react";
// import { CursorPosition, CursorState, CursorStateFactory } from "./cursor/CursorState";

type CustomCursor = {
    customCursorState: CursorState;
    setCustomCursorState: React.Dispatch<React.SetStateAction<CursorState>>;
}

type CanvasProps = {
    canvasRef: React.RefObject<HTMLCanvasElement>;
    cursor: CustomCursor;
    className?: string;
}

function Canvas({ canvasRef, cursor, className } : CanvasProps) 
: ReactElement  {
    const { customCursorState, setCustomCursorState } = cursor;

    const getCurrentPointerPosition = (e: React.PointerEvent): CursorPosition => {
        const currentX = e.clientX - e.currentTarget.getBoundingClientRect().x;
        const currentY = e.clientY - e.currentTarget.getBoundingClientRect().y;
        return { x: currentX, y: currentY };
    }

    // NOTE: 커서가 마우스를 따라오는 속도가 느린 문제 = 이벤트가 프레임보다 더 빠르게 발생해서, 렌더링이 딜레이되는 문제.
    const handlePointerMove = useCallback((e: React.PointerEvent) => {
        e.preventDefault();

        if (customCursorState.isActive()) {
            setCustomCursorState(
                CursorStateFactory.createActiveState(
                    getCurrentPointerPosition(e)
                ));
        } else {
            console.log("[ handlePointerMove() ] : custom cursor is currently disabled.");
        }
    }, [customCursorState]);

    const handlePointerEnter = useCallback((e: React.PointerEvent) => {
        e.preventDefault();

        console.log("handlePointerEnter");
        setCustomCursorState(
            CursorStateFactory.createActiveState(
                getCurrentPointerPosition(e)
            ));
    }, [customCursorState]);

    const handlePointerLeave = useCallback((e: React.PointerEvent) => {
        e.preventDefault();
        console.log("handlePointerLeave");
        setCustomCursorState(CursorStateFactory.createDisabledState());
    }, [customCursorState])

    const handlePointerDown = useCallback((e: React.PointerEvent) => {
        // e.preventDefault(); --> 이거 끄니까 propagation이 되네...?

        console.log("handlePointerDown");
    }, [customCursorState]);

    const handlePointerUp = useCallback((e: React.PointerEvent) => {
        // e.preventDefault(); --> 이거 끄니까 propagation이 되네...?

        console.log("handlePointerUp");
    }, [customCursorState]);

    useEffect(() => {
        // console.log("Re-render");
    }, [customCursorState]);


    return (
        <div
            id="fabric-canvas"
            className={` ${className} relative bg-slate-100`}
            // onContextMenu={(e) => {
            //     e.preventDefault()
            // }}
            // onPointerMove={handlePointerMove}
            // onPointerEnter={handlePointerEnter}
            // onPointerLeave={handlePointerLeave}
            // onPointerUp={handlePointerUp}
            // onPointerDown={handlePointerDown}
            style={{
                // cursor: customCursorState.isActive() ? "none" : "auto",
            }}
        >
            <canvas ref={canvasRef} />

            {/* <Cursor
                x={customCursorState.getX()}
                y={customCursorState.getY()}
                message="cursor message"
                show={customCursorState.isActive()}
            /> */}
        </div>
    );
}

export { Canvas };