// import Image from "next/image";

import { ShapesMenuProps } from "@/types/canvas.type";

import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/common-ui/DropdownMenu"
import { Button } from "@/common-ui/Button";
import { Image } from "@/common-ui/Image";

const ShapesMenu = ({
  item,
  ToolElement,
  handleToolElement,
  handleImageUpload,
  imageInputRef,
}: ShapesMenuProps) => {
  const isDropdownElem = item.value.some((elem: any) => elem?.value === ToolElement.value);

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="no-ring">
          <Button className="relative h-20 w-20 object-contain" onClick={() => handleToolElement(item)}>
            <Image
              src={isDropdownElem ? ToolElement.icon : item.icon}
              alt={item.name}
              fill
              className={isDropdownElem ? "invert" : ""}
            />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="mt-5 flex flex-col gap-y-1 border-none bg-primary-black py-4 text-white">
          {item.value.map((elem) => (
            <Button
              key={elem?.name}
              onClick={() => {
                handleToolElement(elem);
              }}
              className={`flex h-fit justify-between gap-10 rounded-none px-5 py-3 focus:border-none ${
                ToolElement.value === elem?.value ? "bg-primary-green" : "hover:bg-primary-grey-200"
              }`}
            >
              <div className="group flex items-center gap-2">
                <Image
                  fill //?
                  src={elem?.icon as string}
                  alt={elem?.name as string}
                  width={20}
                  height={20}
                  className={ToolElement.value === elem?.value ? "invert" : ""}
                />
                <p
                  className={`text-sm  ${
                    ToolElement.value === elem?.value ? "text-primary-black" : "text-white"
                  }`}
                >
                  {elem?.name}
                </p>
              </div>
            </Button>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

export default ShapesMenu;
