import { CursorSVG } from "@/components/cursor/CursorSVG";

type Props = {
    x: number;
    y: number;
    color?: string;
    message?: string;
    show?: boolean;
}

const CUSOR_DEFAULT_COLOR = "#000000";

function Cursor(props: Props) {

    if (false == props.show) { // null or false
        return false;
    }
    return (
        <div
            className='absolute left-0 top-0'
            style={{ pointerEvents: 'none', transform: `translateX(${props.x}px) translateY(${props.y}px)` }}
        >
            <CursorSVG color={ props.color ?? CUSOR_DEFAULT_COLOR } />

            {props.message && (
                <div
                    className='absolute left-2 top-5 rounded-3xl px-4 py-2'
                    style={{ backgroundColor: props.color, borderRadius: 20 }}
                >
                    <p className='whitespace-nowrap text-sm leading-relaxed text-black'>
                        {props.message}
                    </p>
                </div>
            )}
        </div>
    );
 }

export { Cursor };