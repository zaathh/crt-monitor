import React, { useState } from 'react';
import { type CRTSettings, type PresetName } from '../../lib/types.js';
import { PRESETS } from '../../lib/presets.js';

interface CodeExportBoxProps {
  settings: CRTSettings;
  activePreset: PresetName | 'CUSTOM';
  basePreset?: PresetName;
}

export const CodeExportBox: React.FC<CodeExportBoxProps> = ({ settings, activePreset, basePreset = 'ARCADE' }) => {
  const [copied, setCopied] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const generateCode = () => {
    if (activePreset !== 'CUSTOM') {
      return `import { CRTScreen } from 'zath-crt-monitor';

export default function RetroApp() {
  return (
    <CRTScreen preset="${activePreset}" width="100%" height="100%">
      {/* Your game canvas, video, image, or terminal */}
      <canvas id="gameCanvas" />
    </CRTScreen>
  );
}`;
    }

    const base = PRESETS[basePreset] || PRESETS.ARCADE;
    const sections: (keyof Omit<CRTSettings, 'animations'>)[] = [
      'screenWarp',
      'monitorBezel',
      'scanlines',
      'chromaticAberration',
      'phosphorDotGrid',
      'vignette',
      'screenGlare'
    ];

    const jsxProps: string[] = [];

    for (const sec of sections) {
      const baseSec = base[sec] as Record<string, any>;
      const curSec = settings[sec] as Record<string, any>;
      const changedProps: string[] = [];

      for (const key of Object.keys(curSec)) {
        if (curSec[key] !== baseSec[key]) {
          const val = typeof curSec[key] === 'string' ? `'${curSec[key]}'` : curSec[key];
          changedProps.push(`${key}: ${val}`);
        }
      }

      if (changedProps.length > 0) {
        jsxProps.push(`      ${sec}={{ ${changedProps.join(', ')} }}`);
      }
    }

    // Check animations
    type AnimSubKey = 'glitch' | 'jitter' | 'flicker' | 'scanlineRoll' | 'staticNoise';
    const animKeys: AnimSubKey[] = [
      'glitch',
      'jitter',
      'flicker',
      'scanlineRoll',
      'staticNoise'
    ];

    const animSubProps: string[] = [];
    for (const subKey of animKeys) {
      const baseSub = base.animations[subKey] as Record<string, any>;
      const curSub = settings.animations[subKey] as Record<string, any>;
      const changedSubProps: string[] = [];

      for (const k of Object.keys(curSub)) {
        if (curSub[k] !== baseSub[k]) {
          const val = typeof curSub[k] === 'string' ? `'${curSub[k]}'` : curSub[k];
          changedSubProps.push(`${k}: ${val}`);
        }
      }

      if (changedSubProps.length > 0) {
        animSubProps.push(`${subKey}: { ${changedSubProps.join(', ')} }`);
      }
    }

    if (animSubProps.length > 0) {
      jsxProps.push(`      animations={{ ${animSubProps.join(', ')} }}`);
    }

    // If completely identical to basePreset
    if (jsxProps.length === 0) {
      return `import { CRTScreen } from 'zath-crt-monitor';

export default function RetroApp() {
  return (
    <CRTScreen preset="${basePreset}" width="100%" height="100%">
      {/* Your game canvas, video, image, or terminal */}
      <canvas id="gameCanvas" />
    </CRTScreen>
  );
}`;
    }

    return `import { CRTScreen } from 'zath-crt-monitor';

export default function RetroApp() {
  return (
    <CRTScreen
      preset="${basePreset}"
      width="100%"
      height="100%"
${jsxProps.join('\n')}
    >
      {/* Your game canvas, video, image, or terminal */}
      <canvas id="gameCanvas" />
    </CRTScreen>
  );
}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(generateCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      width: '100%',
      background: '#07090e',
      border: '1px solid #161c28',
      borderRadius: '3px',
      overflow: 'hidden'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 14px',
        background: '#0c1017',
        borderBottom: isOpen ? '1px solid #161c28' : 'none',
        cursor: 'pointer'
      }} onClick={() => setIsOpen(!isOpen)}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', fontFamily: 'var(--font-mono)', color: '#f8fafc', fontWeight: 600 }}>
          <span style={{ color: '#4ade80', fontSize: '10px' }}>{isOpen ? '▼' : '▶'}</span>
          <span style={{ letterSpacing: '0.04em' }}>CODE EXPORT // REACT JSX SPEC</span>
          <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 500, background: '#0d1119', border: '1px solid #1a2233', padding: '1px 6px', borderRadius: '2px' }}>[{activePreset}]</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleCopy();
          }}
          style={{
            background: copied ? '#163020' : '#112217',
            border: copied ? '1px solid #22c55e' : '1px solid #16a34a',
            color: copied ? '#86efac' : '#4ade80',
            fontFamily: 'var(--font-mono)',
            fontSize: '10.5px',
            fontWeight: 600,
            letterSpacing: '0.04em',
            padding: '4px 10px',
            borderRadius: '2px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.15s ease'
          }}
        >
          {copied ? (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>COPIED</span>
            </>
          ) : (
            <>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
              </svg>
              <span>COPY JSX</span>
            </>
          )}
        </button>
      </div>

      {isOpen && (
        <pre style={{
          padding: '14px 16px',
          margin: 0,
          background: '#04060a',
          fontSize: '11px',
          color: '#86efac',
          fontFamily: 'var(--font-mono)',
          overflowX: 'auto',
          lineHeight: '1.6',
          borderTop: '1px solid #141923'
        }}>
          <code>{generateCode()}</code>
        </pre>
      )}
    </div>
  );
};
