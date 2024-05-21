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
import { DangerousInnerHtml } from "@/components/DangerousInnerHTML";
import { useEffect, useLayoutEffect, useState } from "react";
import { EyeOpenIcon } from "@radix-ui/react-icons";
import { isObject } from "lodash";

 interface HtmlPreviewProps {
  createHtmlPreview: Function;
  // htmlHandler: () => void;
}

export function HtmlPreview({
  createHtmlPreview,
  // htmlHandler
}: HtmlPreviewProps) {

  const [isOpen, setIsOpen] = useState<boolean>(false);
  // const [script, setScript] = useState<string>("");


  // 웹펙으로 preview.script 파일을 localhost에 올렸다. 이걸 이제 실행하도록 하면 된다.
  /*
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
  */

  // useEffect(() => {
  //   htmlHandler();
  // }, [isOpen]);

  return (
    <div className=" px-5 py-2">
      <Dialog 
        onOpenChange={() => { 
          setIsOpen(prev => !prev);
        }}
      >
        <DialogTrigger asChild>
          <Button
            className=" w-full"
          >
            <EyeOpenIcon className=" mr-2 h-4 w-4"/> 예약화면 미리보기
          </Button>
        </DialogTrigger>
        <DialogContent className=" w-4/5 min-h-[90vh] ">
          <DialogHeader>
            <DialogTitle>HTML Preview</DialogTitle>
            <DialogDescription className=" prose-xl">
                {"아래 검은색 점선 영역이 HTML <Div>로 변환한 렌더링한 결과입니다."}
                <br/>
                {"커서를 가져다 올려보세요!"}
            </DialogDescription>
          </DialogHeader>

          {/* 좌석정보 */}
          <div
            className=" prose-2xl font-bold text-red-600"
            id="preview-selected-seat-info"
          />

          <DangerousInnerHtml
            className=" 
             py-4
             w-full
             h-full
             overflow-auto
             "
            // script={script}
            // markup={(isOpen ? (createHtmlPreview() + /* run test here */ htmlHandler()) : "")}
            markup={(isOpen ? (createHtmlPreview()) : "")}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default HtmlPreview;