import { CSSProperties } from "react";

export interface BaseProps extends CSSProperties {
   className?: string;
   id?: string;
   children?: React.ReactNode;
}
