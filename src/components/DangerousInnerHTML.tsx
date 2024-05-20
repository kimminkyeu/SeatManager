import { useRef, useLayoutEffect, HTMLAttributes, useEffect } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
    markup: string;
    script: string;
}

// https://macarthur.me/posts/script-tags-in-react/
export function DangerousInnerHtml({ markup, script, ...props }: Props) {

	const elRef = useRef<HTMLDivElement>();

	useLayoutEffect(() => {
        const range = document.createRange();
        range.selectNode(elRef.current as any);
        const scriptWithTag = `<script id="__preview__">` + script + `</script>`;
        const total = markup + scriptWithTag;
        const documentFragment = range.createContextualFragment(total);

        // Inject the markup, triggering a re-run! 
        if (elRef.current) {
            elRef.current.innerHTML = "";
            elRef.current.append(documentFragment);
        }

        return () => {
            // const script = document.getElementById("__preview__");
            // console.log("removing script...", script);
            // if (elRef.current) {
            // elRef.current.remove();
            // documentFragment = null;
                // elRef.current.removeChild());
            // }
        }
    }, []);

   return (
        <div
            {...props}
            id="html-preview"
            ref={elRef as any}
            dangerouslySetInnerHTML={{ __html: markup }}
        />
    );
}