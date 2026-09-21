import React from 'react';

interface SliderRowProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  unit?: string;
  isPercent?: boolean;
  hint?: string;
  onChange: (val: number) => void;
}

export const SliderRow: React.FC<SliderRowProps> = ({
  label,
  min,
  max,
  step,
  value,
  unit = '',
  isPercent = false,
  hint,
  onChange
}) => {
  const displayValue = isPercent
    ? `${Math.round(value * 100)}%`
    : step < 0.1
    ? value.toFixed(2)
    : `${value}${unit}`;

  const percent = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));

  return (
    <div className="modern-slider-row">
      <div className="modern-slider-top">
        <span className="modern-slider-label">{label}</span>
        <span className="modern-slider-value">{displayValue}</span>
      </div>
      {hint && <span className="modern-slider-hint">{hint}</span>}
      <div className="modern-slider-track-wrap">
        <input
          type="range"
          className="modern-slider-input"
          min={min}
          max={max}
          step={step}
          value={value}
          style={{
            background: `linear-gradient(to right, #22c55e 0%, #22c55e ${percent}%, #1e2530 ${percent}%, #1e2530 100%)`
          }}
          onChange={(e) => onChange(parseFloat(e.target.value))}
        />
      </div>
    </div>
  );
};
