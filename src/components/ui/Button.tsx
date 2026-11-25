import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'lime';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      disabled,
      icon,
      iconPosition = 'left',
      className = '',
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-xl';

    const variants = {
      // Verde césped principal
      primary:
        'bg-turf-600 hover:bg-turf-700 active:bg-turf-800 text-white shadow-sm focus:ring-turf-500',
      // Azul noche sobrio
      secondary:
        'bg-navy-900 hover:bg-navy-800 active:bg-navy-950 text-white shadow-sm focus:ring-navy-600',
      // Borde neutro
      outline:
        'border border-navy-200 bg-white hover:bg-navy-50 text-navy-700 active:bg-navy-100 focus:ring-turf-500',
      // Fantasma sin fondo
      ghost:
        'text-navy-600 hover:bg-navy-100 hover:text-navy-900 active:bg-navy-200 focus:ring-navy-400',
      // Peligro / destrucción
      danger:
        'bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-sm focus:ring-rose-500',
      // Lima destacado (exclusivo para llamadas a la acción estelares)
      lime:
        'bg-limeAccent-400 hover:bg-limeAccent-500 active:bg-limeAccent-600 text-navy-950 font-bold shadow focus:ring-limeAccent-400',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5',
      md: 'text-sm px-4 py-2.5 gap-2',
      lg: 'text-base px-5 py-3 gap-2.5 font-semibold',
    };

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {!isLoading && icon && iconPosition === 'left' && (
          <span className="shrink-0">{icon}</span>
        )}
        <span>{children}</span>
        {!isLoading && icon && iconPosition === 'right' && (
          <span className="shrink-0">{icon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
