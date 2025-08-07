import { CSSProperties } from "react";

interface StackProps extends CSSProperties {
   children: React.ReactNode;
}

export function Stack({ children, ...styleProps }: StackProps) {
   return <div style={{ display: 'flex', ...styleProps }}>{children}</div>;
}

