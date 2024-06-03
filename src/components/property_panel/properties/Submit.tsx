import { submitSeatmapToServer } from "@/api/submit";
import { Button } from "@/common-ui/ui/button";
import { DownloadIcon } from '@radix-ui/react-icons'

interface SubmitProps {
  createJsonFromCanvas: Function;
  label: string;
}

const Submit = ({
  createJsonFromCanvas,
  label,
}: SubmitProps
) => (
  <div className='flex flex-col gap-3 px-5 py-2'>
    <Button
      variant='destructive'
      className='w-full'
      onClick={() => {

        // 1. get Json
        const json = createJsonFromCanvas();
        // console.log(json);
        // 2. submit to server
        submitSeatmapToServer(json);
      }}
    >
      <DownloadIcon className=" mr-2 h-4 w-4" /> {label}
    </Button>
  </div>
);

export default Submit;