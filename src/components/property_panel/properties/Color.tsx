import { Label } from "@/common-ui/Label";
import { EditingAttribute, ShapeEditingAttribute } from "@/types/canvas.type";
import { debounce } from "lodash";

type Props = {
  inputRef: any;
  editingElementUiAttributes: (ShapeEditingAttribute);
  placeholder: string;
  attributeType: string;
  handleInputChange: (property: string, value: string | number) => void;
};

const Color = ({
  inputRef,
  editingElementUiAttributes,
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
        defaultValue={editingElementUiAttributes.fill}
        ref={inputRef}
        onChange={ debounce( // NOTE: debounce 처리를 통해 실시간 변경을 막는다.
          (e) => handleInputChange("fill", e.target.value),
           100)
        }
      />
      <Label className='flex-1'>{editingElementUiAttributes.fill ?? "?"}</Label>
    </div>
    {/* ---------------------------------------------------------- */}
    {/* <h3 className='text-[10px] uppercase'>stroke</h3>
    <div
      className='flex items-center gap-2 border border-primary-grey-200'
      onClick={() => inputRef.current.click()}
    >
      <input
        disabled={editingElementUiAttributes === null}
        type='color'
        value={editingElementUiAttributes ? editingElementUiAttributes.stroke : "#AAAAAA"}
        ref={inputRef}
        onChange={(e) => handleInputChange("stroke", e.target.value)}
      />
      <Label className='flex-1 text-slate-500'>{editingElementUiAttributes ? editingElementUiAttributes.fill : "?"}</Label>
    </div> */}
    {/* ---------------------------------------------------------- */}
  </div>
);

export default Color;