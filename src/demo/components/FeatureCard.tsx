import React from 'react';
import { Checkbox } from './Checkbox.js';

interface FeatureCardProps {
  title: string;
  categoryLabel?: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  onReset?: () => void;
  children: React.ReactNode;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  enabled,
  onToggle,
  onReset,
  children
}) => {
  return (
    <div className={`modern-feature-card ${enabled ? 'active' : ''}`}>
      <div className="modern-feature-toggle-row" onClick={() => onToggle(!enabled)}>
        <div className="modern-feature-title-wrap">
          <Checkbox checked={enabled} onChange={onToggle} />
          <span className="modern-feature-title">{title}</span>
        </div>
        {onReset && (
          <button
            type="button"
            className="modern-feature-reset-btn"
            onClick={(e) => {
              e.stopPropagation();
              onReset();
            }}
            title={`Reset ${title} to preset default`}
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
            </svg>
            <span>Reset</span>
          </button>
        )}
      </div>

      {enabled && <div className="modern-feature-body">{children}</div>}
    </div>
  );
};

