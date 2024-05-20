import { Button } from "@/common-ui/ui/button";
import { Checkbox } from "@/common-ui/ui/checkbox";


interface ExportProps {
  handleExport: Function;
}

const Export = ({
  handleExport,
}: ExportProps
) => (
  <div className='flex flex-col gap-3 px-5 py-2'>
    <h3>Export</h3>
    <Button
      variant='outline'
      className='w-full'
      onClick={() => handleExport()}
    >
      Export Map
    </Button>
  </div>
);

export default Export;