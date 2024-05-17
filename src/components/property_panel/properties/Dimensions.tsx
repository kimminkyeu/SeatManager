import { Label } from "@/common-ui/Label";
import { Input } from "@/common-ui/ui/input";
import { ShapeEditingAttribute } from "@/types/canvas.type";

const dimensionsOptions = [
  { label: "W", property: "width" },
  { label: "H", property: "height" },
];

type Props = {
  editingElementAttributes: (ShapeEditingAttribute | null);
  // isEditingRef: React.MutableRefObject<boolean>;
  handleInputChange: (property: string, value: string) => void;
};

const Dimensions = ({ 
  editingElementAttributes, 
  // isEditingRef, 
  handleInputChange 
}: Props) => (
  <section className='flex flex-col border-b border-primary-grey-200'>
    <div className='flex flex-col gap-4 px-6 py-3'>
      {dimensionsOptions.map((item) => (
        <div
          key={item.label}
          className='flex flex-1 items-center gap-3 rounded-sm'
        >
          <Label htmlFor={item.property} className='text-[10px] font-bold'>
            {item.label}
          </Label>
          <Input
            className='input-ring'
           // ---------------------------------------------
            disabled={(null === editingElementAttributes)}
           // ---------------------------------------------
            type='number'
            id={item.property}
            value={editingElementAttributes ? editingElementAttributes[(item.property as keyof ShapeEditingAttribute)] : 0}
            placeholder={"?"}
            min={1}
            onChange={(e) => handleInputChange(item.property, e.target.value)}
            // onBlur={(e) => {
            //   isEditingRef.current = false
            // }}
          />
        </div>
      ))}
    </div>
  </section>
);

export default Dimensions;