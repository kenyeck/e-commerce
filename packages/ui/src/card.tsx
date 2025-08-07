import { CSSProperties } from "react";

interface CardProps extends CSSProperties {
   children: React.ReactNode;
}

export function Card({ children, ...styleProps }: CardProps) {
   return (
      <div
         style={{
            border: '1px solid #e0e0e0',
            borderRadius: '8px',
            padding: '20px',
            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            minWidth: '500px',
            ...styleProps
         }}
      >
         {children}
      </div>
   );
}
