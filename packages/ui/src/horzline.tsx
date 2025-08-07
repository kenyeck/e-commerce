import { HTMLProps } from "react";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface HorizontalLineProps extends HTMLProps<HTMLHRElement> {}

export function HorizontalLine({ id, className, ...styleProps }: HorizontalLineProps) {
   return <hr id={id} className={className} {...styleProps} />;
}
