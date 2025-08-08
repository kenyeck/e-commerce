import { BaseProps } from "./base";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BoxProps extends BaseProps {}

export function Box({ id, className, children, ...styleProps }: BoxProps) {
   const boxStyles = className ? {} : { ...styleProps };
   return (
      <div id={id} className={className} style={boxStyles}>
         {children}
      </div>
   );
}
