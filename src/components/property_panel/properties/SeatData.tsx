import { Label } from "@/common-ui/Label";
import { Input } from "@/common-ui/ui/input";
import { SeatEditingAttributes } from "@/types/seat.type";


const SeatDataOptions 
: { 
  label: string, 
  property: (keyof SeatEditingAttributes),
}[] = [
  // { label: "seat-id", property: "seatId" }, // check SeatEditingAttributes
  { label: "row", property: "seatRow" },
  { label: "column", property: "seatCol" },
  ];

type Props = {
  editingElementUiAttributes: (SeatEditingAttributes);
  handleInputChange: (property: string, value: string | number) => void;
  keyboardEventDisableRef: React.MutableRefObject<boolean>;
  fabricRef: React.RefObject<fabric.Canvas | null>;
};

const SeatData = ({
  editingElementUiAttributes,
  handleInputChange,
  keyboardEventDisableRef,
  // fabricRef,
}: Props) => {

  const getInitialInputValue = (attributeProperty: keyof SeatEditingAttributes) => {
    const UNDEFINED = "";
    if ( !editingElementUiAttributes ) {
      return UNDEFINED;
    }
    const propertyValue = editingElementUiAttributes[attributeProperty];
    if ( !propertyValue ) {
      return UNDEFINED;
    }
    return propertyValue;
  }
  return (
    <section className='prose p-5 flex flex-col border-b border-primary-grey-200'>
      <h3 className=" prose-base">Seat</h3>
      <div className='flex flex-col gap-4'>
        {SeatDataOptions.map((item, index) => (
          <div
            key={item.label}
            className='flex flex-1 items-center gap-2 rounded-sm'
          >
            <Label htmlFor={item.label} className=' text-[12px] min-w-12'>
              {item.label}
            </Label>
            <Input
              className='input-ring'
              type={
                  ('number')
              }
              id={item.property}
              value={ getInitialInputValue(item.property) }
              placeholder={"?"}
              min={1}
              onChange={(e) => handleInputChange(item.property, e.target.value)}
              onFocus={(e) => {
                console.log("keyboard event off");
                keyboardEventDisableRef.current = true;
              }}
              onBlur={(e) =>  {
                console.log("keyboard event on");
                keyboardEventDisableRef.current = false;
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default SeatData;