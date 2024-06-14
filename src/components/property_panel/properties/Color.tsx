import { Label } from "@/common-ui/Label";
import { ShapeEditingAttribute } from "@/types/canvas.type";
import { debounce } from "lodash";

type Props = {
  // inputRef: any;
  editingElementUiAttributes: (ShapeEditingAttribute);
  placeholder: string;
  attributeType: string;
  handleInputChange: (property: string, value: string | number) => void;
};

const Color = ({
  // inputRef,
  editingElementUiAttributes,
  attributeType,
  handleInputChange,
}: Props) => (
  <div className='prose flex flex-col border-b border-primary-grey-200 p-5'>
    {/* ---------------------------------------------------------- */}
    <h3 className=" prose-base">Fill</h3>
    <div
      className='flex items-center gap-2 border border-primary-grey-200'
      // onClick={() => inputRef.current.click()}
    >
      <input
        type='color'
        defaultValue={editingElementUiAttributes.fill}
        // ref={inputRef}
        onChange={ 
          debounce((e) => handleInputChange("fill", e.target.value),100)
        }
      />
      <Label className='flex-1'>{editingElementUiAttributes.fill ?? "?"}</Label>
    </div>
  </div>
);

export default Color;