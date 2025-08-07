import { BaseProps } from './base';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface CardProps extends BaseProps {}

export function Card({ id, className, children, ...styleProps }: CardProps) {
   return (
      <div
         id={id}
         className={className}
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
