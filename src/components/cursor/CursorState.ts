const enum CursorMode {
    DISABLED,
    ACTIVE,
}

type CursorPosition = {
    x: number;
    y: number;
}

class CursorState { 

    public isActive(): boolean { 
        return (this.mode === CursorMode.ACTIVE);
    };

    public getPosition() {
        return this.position;
    }

    public getX() {
        return this.getPosition().x;
    }

    public getY() {
        return this.getPosition().y;
    }

    private position: CursorPosition;
    private mode: CursorMode;

    constructor(postion: CursorPosition, mode: CursorMode) {
        this.position = postion;
        this.mode = mode;
    }
}

class CursorStateFactory {
    public static createDisabledState(): CursorState {
        return new CursorState(
            { x: -100, y: -100 },
            CursorMode.DISABLED
        );
    }

    public static createActiveState(position?: CursorPosition): CursorState {
        return new CursorState(
            position ?? { x: -100, y: -100 },
            CursorMode.ACTIVE
        )
    }
}


export { CursorState, CursorMode, type CursorPosition, CursorStateFactory }