import { Label } from "@/common-ui/Label";
import { Input } from "@/common-ui/ui/input";
import { Slider } from "@/common-ui/ui/slider"
import { SectorEditingAttribute } from "@/types/sector.type";


const SeatDataOptions
  : {
    label: string,
    property: (keyof SectorEditingAttribute),
    controlType: string,
  }[] = [
    { label: "sector-id", property: "sectorId", controlType: "input" },
    { label: "gap X", property: "sectorGapX", controlType: "slider" },
    { label: "gap Y", property: "sectorGapY", controlType: "slider" },
  ];

type Props = {
  editingElementAttributes: (SectorEditingAttribute);
  handleInputChange: (property: string, value: string | number) => void;
  keyboardEventDisableRef: React.MutableRefObject<boolean>;
  fabricRef: React.RefObject<fabric.Canvas | null>;
};

const SectorData = ({
  editingElementAttributes,
  handleInputChange,
  keyboardEventDisableRef,
}: Props) => {

  // const getInitialInputValue = (attributeProperty: keyof SectorEditingAttribute) => {
  //   if (!editingElementAttributes) {
  //     return undefined;
  //   }
  //   const propertyValue = editingElementAttributes[attributeProperty];
  //   if (propertyValue === undefined) {
  //     return undefined;
  //   }
  //   return propertyValue;
  // }

  return (
    <section className='prose p-5 flex flex-col border-b border-primary-grey-200'>
      <h3 className=" prose-base">Sector</h3>
      <div className='flex flex-col gap-4'>
        {SeatDataOptions.map((item) => (
          <div
            key={item.label}
            className='flex flex-1 items-center gap-2 rounded-sm'
          >
            <Label htmlFor={item.property} className=' text-[12px] min-w-12'>
              {item.label}
            </Label>

            {("input" === item.controlType) &&
              <Input
                className='input-ring'
                type={
                  (item.property === "sectorId") ? ('text') : ('number')
                }
                id={item.property}
                value={(editingElementAttributes.sectorId)}
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
            }

            {("slider" === item.controlType) &&
                <Slider
                  defaultValue={[editingElementAttributes[(item.property as keyof SectorEditingAttribute)] as number]}
                  min={0}
                  max={100}
                  step={1}
                  onValueChange={(numbers: number[]) => handleInputChange(item.property, numbers[0])}
                />
            }
          </div>
        ))}
      </div>
    </section>
  );
}

export default SectorData;