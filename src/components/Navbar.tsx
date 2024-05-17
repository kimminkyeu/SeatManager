import { ToolElementsInNavbar } from "@/constants";
import { ToolElement } from "@/types/canvas.type";
import { Image } from "@/common-ui/Image";
import { TooltipButton } from "@/common-ui/TooltipButton";
import { Checkbox } from "@/common-ui/ui/checkbox";

export type NavbarProps = {
    activeToolUiState: ToolElement | null;
    imageInputRef: React.MutableRefObject<HTMLInputElement | null>;
    handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    setActiveEditorToolTo: (element: ToolElement) => void;
    toggleGridView: () => void;
};

function Navbar({ activeToolUiState, imageInputRef, handleImageUpload, setActiveEditorToolTo, toggleGridView }: NavbarProps) {

    const isActive = (value: string | Array<ToolElement>) =>
        (activeToolUiState && activeToolUiState.value === value) ||
        (Array.isArray(value) && value.some((val) => val?.value === activeToolUiState?.value));

    return (
        <>
            <ul className=" flex flex-row p-3 gap-3 justify-center border-b text-gray-900">
                {
                    ToolElementsInNavbar.map((item: ToolElement | any) => (
                        <li
                            key={item.name}
                            onClick={() => {
                                if (Array.isArray(item.value)) { // if is dropdown.
                                    return;
                                }
                                if (item.value === "image") {
                                    // handleImageUpload()
                                }
                                setActiveEditorToolTo(item);
                            }}
                            className={`flex justify-center items-center
                              `}
                        >
                            {
                                <TooltipButton
                                    tooltip={item.name}
                                    variant={"ghost"}
                                    className={`relative w-12 h-12 p-3 prose
                                                        ${isActive(item.value) ? " bg-gray-400 hover:bg-gray-500" : "hover:bg-gray-200"}`
                                    }
                                >
                                    <Image
                                        src={item.icon}
                                        alt={item.name}
                                        fill
                                        className={`${isActive(item.value) ? "invert" : ""}`}
                                    />
                                </TooltipButton>
                            }
                        </li>
                    ))
                }
                <div className=" border-l-2 border-gray-300 px-6 flex items-center space-x-2">
                    <Checkbox id="show-grid" defaultChecked onCheckedChange={toggleGridView}/>
                    <label
                        htmlFor="show-grid"
                        className="prose-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                        Grid
                    </label>
                </div>
            </ul>
            {/* for image upload */}
            <input
                type="file"
                className="hidden"
                ref={imageInputRef}
                accept="image/*"
                onChange={handleImageUpload}
            /> 
        </>
    )
}

export { Navbar };