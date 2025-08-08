import { BaseProps } from './base';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface CardProps extends BaseProps {}

export function Card({ id, className, children, ...styleProps }: CardProps) {
   const cardStyles = className ? {} : { ...styleProps };
   return (
      <div
         id={id}
         className={`border border-gray-300 mt-4 shadow-lg p-5 rounded-lg ${className ?? ''}`}
         style={cardStyles}
      >
         {children}
      </div>
   );
}
