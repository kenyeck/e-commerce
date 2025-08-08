import { BaseProps } from './base';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface StackProps extends BaseProps {}

export function Stack({ id, className, children, ...styleProps }: StackProps) {
   const stackStyles = className ? {} : { ...styleProps };
   return (
      <div id={id} className={`flex ${className}`} style={stackStyles}>
         {children}
      </div>
   );
}
