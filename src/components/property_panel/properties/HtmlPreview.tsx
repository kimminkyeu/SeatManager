
// const HtmlPreview = ({
//   handleHtmlPreview,
// }: HtmlPreviewProps
// ) => (
//   <div className='flex flex-col gap-3 px-5 py-5 border-b'>
//     <h3 className='text-[10px] uppercase'>Export</h3>
//     <Button
//       variant='outline'
//       className='w-full border border-primary-grey-100 hover:bg-primary-green hover:text-primary-black'
//       onClick={() => handleHtmlPreview()}
//     >
//       Export
//     </Button>
//   </div>
// );


import { Button } from "@/common-ui/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/common-ui/ui/dialog"
import { Input } from "@/common-ui/ui/input"
import { Label } from "@/common-ui/ui/label"
import { DangerousInnerHtml } from "@/components/DangerousInnerHTML";
import { Assert } from "@/lib/assert";
import { Separator } from "@radix-ui/react-select";
import { useEffect, useLayoutEffect, useState } from "react";

 interface HtmlPreviewProps {
  createHtmlPreview: Function;
}

export function HtmlPreview({
  createHtmlPreview
}: HtmlPreviewProps) {

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [script, setScript] = useState<string>("");

  // 웹펙으로 preview.script 파일을 localhost에 올렸다. 이걸 이제 실행하도록 하면 된다.

  useLayoutEffect(() => {
    (async () => {
      // TODO: change url later... (WEBPACK...)
      const res = await fetch("http://localhost:8081/preview.script", {
        method: 'GET',
      });
      if (res.ok) {
        const text = await res.text();
        setScript(text);
      }
    })();
  }, []);

  return (
    <div className=" px-5 py-2">
      <Dialog 
        onOpenChange={() => { setIsOpen(prev => !prev) }}
      >
        <DialogTrigger asChild>
          <Button
            variant="outline"
            className=" w-full"
          >
            Preview HTML
          </Button>
        </DialogTrigger>
        {/* <DialogContent className=" sm:max-w-[90vh] h-3/4"> */}
        <DialogContent className=" w-4/5 min-h-[90vh] ">
          <DialogHeader>
            <DialogTitle>HTML Preview</DialogTitle>
            <DialogDescription className=" prose-xl">
                {"아래 검은색 점선 영역이 HTML <Div>로 변환한 렌더링한 결과입니다."}
                <br/>
                {"좌석을 클릭해보세요!"}
            </DialogDescription>
          </DialogHeader>
          <DangerousInnerHtml
            className=" 
             py-4
             w-full
             h-full
             overflow-auto
             "
            script={script}
            markup={(isOpen ? createHtmlPreview() : "")}
          />
          {/* <div> */}
            {/** on hover, show info of tag */}
          {/* </div> */}
          {/* <Separator /> */}
          {/* <div> */}
            {/** on hover, show info of tag */}
          {/* </div> */}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default HtmlPreview;