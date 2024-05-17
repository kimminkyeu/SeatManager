import React, { ForwardedRef, ReactElement, useCallback, useEffect } from "react";
import { CursorPosition, CursorState, CursorStateFactory } from "./cursor/CursorState";

interface CanvasProps extends React.HTMLProps<HTMLCanvasElement> {
    id: string;
    // ...
}

const Canvas = React.forwardRef(

    function Canvas(
        { id, className, ...parentProps }: CanvasProps,
        ref: ForwardedRef<HTMLCanvasElement>,
    )
        : ReactElement {
            return (
                <div
                    id={id}
                    className={`${className} relative`}
                >
                    <canvas
                        ref={ref}
                        {...parentProps}
                    />
                </div>
            );
    }
);

export { Canvas };