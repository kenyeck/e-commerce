import { BaseProps } from "./base";

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface StackProps extends BaseProps {}

export function Stack({ id, className, children, ...styleProps }: StackProps) {
   return <div id={id} className={className} style={{ display: 'flex', ...styleProps }}>{children}</div>;
}

