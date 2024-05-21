import { Label } from "@/common-ui/Label";
import { Input } from "@/common-ui/ui/input";
import { Separator } from "@/common-ui/ui/separator";
import { Slider } from "@/common-ui/ui/slider"
import { SectorEditingAttribute } from "@/types/sector.type";


const SeatDataOptions
  : {
    label: string,
    property: (keyof SectorEditingAttribute),
    controlType: string,
  }[] = [
    { label: "ID", property: "sectorId", controlType: "input" },
    { label: "gap X", property: "sectorGapX", controlType: "slider" },
    { label: "gap Y", property: "sectorGapY", controlType: "slider" },
  ];

type Props = {
  editingElementUiAttributes: (SectorEditingAttribute);
  handleInputChange: (property: string, value: string | number) => void;
  keyboardEventDisableRef: React.MutableRefObject<boolean>;
  fabricRef: React.RefObject<fabric.Canvas | null>;
};

const SectorData = ({
  editingElementUiAttributes,
  handleInputChange,
  keyboardEventDisableRef,
}: Props) => {

  return (
    <section className='prose p-5 flex flex-col border-b border-primary-grey-200'>
      <div className='my-2 gap-2 flex flex-row items-center'>
        <h3 className=" m-0">
          {`구역명 :`}
        </h3>
        <h3 className="m-0" style={{color: editingElementUiAttributes.fill}}>
          {`${editingElementUiAttributes.sectorId}`}
        </h3>
      </div>
      <div className='flex flex-col gap-4'>
        {SeatDataOptions.map((item) => (
          <div
            key={item.property}
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
                value={(editingElementUiAttributes.sectorId)}
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
                id={item.property}
                defaultValue={[editingElementUiAttributes[(item.property as keyof SectorEditingAttribute)] as number]}
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