import { Label } from "@/common-ui/Label";
import { EditingAttribute, ShapeEditingAttribute } from "@/types/canvas.type";

type Props = {
  inputRef: any;
  editingElementAttributes: (ShapeEditingAttribute);
  placeholder: string;
  attributeType: string;
  handleInputChange: (property: string, value: string | number) => void;
};

const Color = ({
  inputRef,
  editingElementAttributes,
  attributeType,
  handleInputChange,
}: Props) => (
  <div className='prose flex flex-col border-b border-primary-grey-200 p-5'>
    {/* ---------------------------------------------------------- */}
    <h3 className=" prose-base">Fill</h3>
    <div
      className='flex items-center gap-2 border border-primary-grey-200'
      onClick={() => inputRef.current.click()}
    >
      <input
        type='color'
        value={editingElementAttributes.fill}
        ref={inputRef}
        onChange={(e) => handleInputChange("fill", e.target.value)}
      />
      <Label className='flex-1'>{editingElementAttributes.fill ?? "?"}</Label>
    </div>
    {/* ---------------------------------------------------------- */}
    {/* <h3 className='text-[10px] uppercase'>stroke</h3>
    <div
      className='flex items-center gap-2 border border-primary-grey-200'
      onClick={() => inputRef.current.click()}
    >
      <input
        disabled={editingElementAttributes === null}
        type='color'
        value={editingElementAttributes ? editingElementAttributes.stroke : "#AAAAAA"}
        ref={inputRef}
        onChange={(e) => handleInputChange("stroke", e.target.value)}
      />
      <Label className='flex-1 text-slate-500'>{editingElementAttributes ? editingElementAttributes.fill : "?"}</Label>
    </div> */}
    {/* ---------------------------------------------------------- */}
  </div>
);

export default Color;