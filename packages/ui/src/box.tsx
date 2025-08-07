import { CSSProperties } from 'react';

export interface BoxProps extends CSSProperties {
   className?: string;
   children: React.ReactNode;
}
export function Box({ children, ...styleProps }: BoxProps) {
   return <div style={{ ...styleProps }}>{children}</div>;
}
