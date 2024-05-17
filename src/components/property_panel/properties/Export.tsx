import { Button } from "@/common-ui/Button";
import { Checkbox } from "@/common-ui/ui/checkbox";

const Export = () => (
  <div className='flex flex-col gap-3 px-5 py-5 border-b'>
    <h3 className='text-[10px] uppercase'>Export</h3>
    <Button
      variant='outline'
      className='w-full border border-primary-grey-100 hover:bg-primary-green hover:text-primary-black'
      onClick={() => alert("export")}
    >
      Export to JSON
    </Button>
  </div>
);

export default Export;