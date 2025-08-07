import { HTMLProps } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface HorizontalLineProps extends HTMLProps<HTMLHRElement> {}

export function HorizontalLine({
   id,
   className = 'border-gray-300',
   ...styleProps
}: HorizontalLineProps) {
   const lineStyleProps = className ? {} : { ...styleProps };
   return (
      <div className="py-2">
         <hr id={id} className={className} {...lineStyleProps} />
      </div>
   );
}
