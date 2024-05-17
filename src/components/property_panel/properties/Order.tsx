import { Button } from "@/common-ui/Button";
import { Image } from "@/common-ui/Image";
import { TooltipButton } from "@/common-ui/TooltipButton";
import { directionOptions } from "@/constants";
import { bringElementTo } from "@/lib/shapes";

interface Props {
    fabricRef: React.RefObject<fabric.Canvas | null>;
}

export const Order = (props: Props) => {
    return (
        <div className='prose flex flex-col p-5 border-b border-primary-grey-200'>
            <h3 className=" prose-base">Layer</h3>
            <ul className=" text-slate-900 flex flex-row p-0 justify-center gap-2">
                {
                    directionOptions.map((item: any) => (
                        <li
                            key={item.label}
                            onClick={() => { }}
                            className={`
                            group flex justify-center items-center m-0 p-0
                        `}
                        >
                            {
                                <TooltipButton
                                    tooltip={item.label}
                                    variant={"outline"}
                                    className={'relative w-12 h-12 bg-gray-100 hover:bg-gray-300'}
                                    onClick={(e) => {
                                        if (props.fabricRef.current) {
                                            bringElementTo({ direction: item.value, canvas: props.fabricRef.current })
                                        }
                                    }}
                                >
                                    <Image
                                        src={item.icon}
                                        alt={item.label}
                                        fill
                                    />
                                </TooltipButton>
                            }
                        </li>
                    ))
                }
            </ul>
        </div>
    );
}