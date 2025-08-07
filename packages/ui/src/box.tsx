import { BaseProps } from "./base";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BoxProps extends BaseProps {}

export function Box({ id, className, children, ...styleProps }: BoxProps) {
   return (
      <div id={id} className={className} style={{ ...styleProps }}>
         {children}
      </div>
   );
}
