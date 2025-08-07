import { CSSProperties } from 'react';
import { BaseProps } from './base';

const commonButtonStyles: CSSProperties = {
   padding: '10px 20px',
   borderRadius: '5px',
   cursor: 'pointer'
};

const primaryButtonStyles: CSSProperties = {
   ...commonButtonStyles,
   backgroundColor: '#0070f3',
   color: 'white',
   border: 'none'
};

const secondaryButtonStyles: CSSProperties = {
   ...commonButtonStyles,
   backgroundColor: 'transparent',
   color: 'gray',
   border: '1px solid #e0e0e0'
};

export interface ButtonProps extends BaseProps {
   variant?: 'primary' | 'secondary';
   onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
   disabled?: boolean;
}

export function Button({
   id,
   className,
   variant = 'secondary',
   onClick = () => {},
   disabled = false,
   children,
   ...styleProps
}: ButtonProps) {

   const buttonStyles = className ? {} : { ...(variant == 'primary' ? primaryButtonStyles : secondaryButtonStyles), ...styleProps };
   return (
      <button
         id={id}
         className={className}
         style={buttonStyles}
         onClick={onClick}
         disabled={disabled}
      >
         {children}
      </button>
   );
}
