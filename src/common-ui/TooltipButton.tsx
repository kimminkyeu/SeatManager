import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@radix-ui/react-tooltip"
import { Button, ButtonProps, buttonVariants } from "./Button"
import React from "react"

interface TooltipButtonProps extends ButtonProps {
    tooltip: string,
}

const TooltipButton = React.forwardRef<HTMLButtonElement, TooltipButtonProps>(
    ({ tooltip, ...props }, ref) => {
        return (
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button {...props} ref={ref}/>
                    </TooltipTrigger>
                    <TooltipContent>
                        <p>{tooltip}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        )
    });

export { TooltipButton, buttonVariants }
