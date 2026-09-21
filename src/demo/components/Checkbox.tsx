import React from 'react';

interface CheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({ checked, onChange, id }) => {
  return (
    <label className="modern-checkbox-wrap" onClick={(e) => e.stopPropagation()}>
      <input
        type="checkbox"
        id={id}
        className="modern-checkbox-input"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={`modern-checkbox-custom ${checked ? 'checked' : ''}`}>
        {checked && (
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#ffffff"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        )}
      </span>
    </label>
  );
};
