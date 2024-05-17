import { Button } from "@/common-ui/Button";

type ExportProps = {
  label: String;
  handleExport: React.MouseEventHandler<HTMLButtonElement>;
}

const Export = ({label, handleExport}: ExportProps) => (
  <div className='flex flex-col gap-3 px-5 py-3'>
    <h3 className='text-[10px] uppercase'>Export</h3>
    <Button
      variant='outline'
      className='w-full border border-primary-grey-100 hover:bg-primary-green hover:text-primary-black'
      onClick={handleExport}
    >
      {label}
    </Button>
  </div>
);

export default Export;
