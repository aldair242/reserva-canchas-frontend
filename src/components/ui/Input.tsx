import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      startIcon,
      endIcon,
      className = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold text-navy-700 tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative rounded-xl shadow-sm">
          {startIcon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-navy-400">
              {startIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            className={`w-full rounded-xl border text-sm transition-colors duration-150 py-2.5 bg-white text-navy-900 placeholder:text-navy-400
              ${startIcon ? 'pl-10' : 'pl-3.5'}
              ${endIcon ? 'pr-10' : 'pr-3.5'}
              ${
                error
                  ? 'border-rose-400 text-rose-900 focus:border-rose-500 focus:ring-rose-500 focus:ring-1'
                  : 'border-navy-200 hover:border-navy-300 focus:border-turf-600 focus:ring-turf-600 focus:ring-1'
              }
              ${disabled ? 'bg-navy-50 text-navy-400 cursor-not-allowed' : ''}
              ${className}
            `}
            {...props}
          />
          {endIcon && (
            <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-navy-400">
              {endIcon}
            </div>
          )}
        </div>
        {error && (
          <p className="text-xs text-rose-600 font-medium flex items-center gap-1 mt-1">
            <span>{error}</span>
          </p>
        )}
        {!error && helperText && (
          <p className="text-xs text-navy-500 mt-1">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
