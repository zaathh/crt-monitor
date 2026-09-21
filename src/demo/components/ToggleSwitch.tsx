import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  id?: string;
}

export const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, id }) => {
  return (
    <label className="modern-toggle-wrap" onClick={(e) => e.stopPropagation()}>
      <input
        type="checkbox"
        id={id}
        className="modern-toggle-input"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="modern-toggle-slider"></span>
    </label>
  );
};
