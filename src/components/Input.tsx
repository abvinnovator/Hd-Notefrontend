import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  name: string;
  error?: string;
}

const Input: React.FC<InputProps> = ({
  label,
  name,
  error,
  className = '',
  ...props
}) => {
  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        id={name}
        name={name}
        {...props} // ✅ all other props (type, value, onChange, placeholder, maxLength, etc.)
        className={`mt-1 appearance-none block w-full px-3 py-2 rounded-md shadow-sm placeholder-gray-400 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed 
          ${error
            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'}
        `}
      />
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Input;
