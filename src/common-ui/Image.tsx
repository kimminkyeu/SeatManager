import React, { useEffect } from "react";

interface ImageProps extends React.HTMLProps<HTMLImageElement> {
    fill?: boolean;
}

function Image(
    { fill, ...parentProps }: ImageProps
) {

    return (
        <img
            className={fill ? "object-fill" : "object-cover"}
            {...parentProps}
        />
    )
}

export { Image };