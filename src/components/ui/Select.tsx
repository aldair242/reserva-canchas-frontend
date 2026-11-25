import React from 'react';

export interface Option {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: Option[];
  placeholder?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder,
      className = '',
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-xs font-semibold text-navy-700 tracking-wide"
          >
            {label}
          </label>
        )}
        <div className="relative rounded-xl shadow-sm">
          <select
            ref={ref}
            id={selectId}
            disabled={disabled}
            className={`w-full rounded-xl border text-sm transition-colors duration-150 py-2.5 px-3.5 bg-white text-navy-900 appearance-none
              ${
                error
                  ? 'border-rose-400 text-rose-900 focus:border-rose-500 focus:ring-rose-500 focus:ring-1'
                  : 'border-navy-200 hover:border-navy-300 focus:border-turf-600 focus:ring-turf-600 focus:ring-1'
              }
              ${disabled ? 'bg-navy-50 text-navy-400 cursor-not-allowed' : ''}
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          {/* Indicador de flecha desplegable accesible */}
          <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 pointer-events-none text-navy-400">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {error && <p className="text-xs text-rose-600 font-medium mt-1">{error}</p>}
        {!error && helperText && <p className="text-xs text-navy-500 mt-1">{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = 'Select';
