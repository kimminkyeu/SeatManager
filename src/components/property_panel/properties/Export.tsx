import { Button } from "@/common-ui/ui/button";
import { DownloadIcon } from '@radix-ui/react-icons'

interface ExportProps {
  handleExport: Function;
}

const Export = ({
  handleExport,
}: ExportProps
) => (
  <div className='flex flex-col gap-3 px-5 py-2'>
    <Button
      variant='destructive'
      className='w-full'
      onClick={() => handleExport()}
    >
      <DownloadIcon className=" mr-2 h-4 w-4" /> JSON으로 내보내기
    </Button>
  </div>
);

export default Export;