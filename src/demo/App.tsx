import React, { useState, useRef } from 'react';
import { CRTScreen } from '../lib/CRTScreen.js';
import { PRESETS } from '../lib/presets.js';
import { type CRTSettings, type PresetName } from '../lib/types.js';
import { CRTPlaygroundSidebar } from './components/CRTPlaygroundSidebar.js';
import { CRTConfigModal } from './components/CRTConfigModal.js';
import { CodeExportBox } from './components/CodeExportBox.js';
import { DemoTerminal } from './components/DemoTerminal.js';
import { DemoGame } from './components/DemoGame.js';
import { DemoMedia } from './components/DemoMedia.js';
import { HeroTerminal } from './components/HeroTerminal.js';
import './styles/modal.css';

type ContentTab = 'terminal' | 'game' | 'media';

export const App: React.FC = () => {
  const [contentTab, setContentTab] = useState<ContentTab>('terminal');
  const [activePreset, setActivePreset] = useState<PresetName | 'CUSTOM'>('ARCADE');
  const [basePreset, setBasePreset] = useState<PresetName>('ARCADE');
  const [settings, setSettings] = useState<CRTSettings>(PRESETS.ARCADE);
  const [isPowerOn, setIsPowerOn] = useState(true);
  const [isEffectEnabled, setIsEffectEnabled] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [copiedInstall, setCopiedInstall] = useState(false);
  const [isHeroPowerOn, setIsHeroPowerOn] = useState(true);
  const heroPowerAnimRef = useRef<number>(0);
  const powerAnimRef = useRef<number>(0);

  const [heroSettings, setHeroSettings] = useState<CRTSettings>(() => ({
    ...PRESETS.TERMINAL,
    screenWarp: {
      enabled: true,
      bulge: 0.70,
      edgeDarken: 0.12
    },
    monitorBezel: {
      enabled: false,
      thickness: 0,
      bezelColor: '#000000'
    },
    scanlines: {
      enabled: true,
      opacity: 0.45,
      lineSpacing: 2
    },
    phosphorDotGrid: {
      enabled: true,
      opacity: 0.35
    },
    vignette: {
      enabled: true,
      strength: 0.65,
      roundness: 0.65,
      falloff: 0.40,
      color: '#000000'
    },
    animations: {
      ...PRESETS.TERMINAL.animations,
      powerProgress: 1.0
    }
  }));

  // Hero CRT Power Cycle Toggle Animation
  const handleToggleHeroPower = () => {
    cancelAnimationFrame(heroPowerAnimRef.current);
    const targetState = !isHeroPowerOn;
    setIsHeroPowerOn(targetState);

    const startTime = performance.now();
    const duration = 240; // ms - faster, snappier CRT power pop
    const startVal = heroSettings.animations.powerProgress;
    const endVal = targetState ? 1.0 : 0.0;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1.0, elapsed / duration);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentVal = startVal + (endVal - startVal) * ease;

      setHeroSettings((prev) => ({
        ...prev,
        animations: {
          ...prev.animations,
          powerProgress: currentVal
        }
      }));

      if (progress < 1.0) {
        heroPowerAnimRef.current = requestAnimationFrame(animate);
      }
    };

    heroPowerAnimRef.current = requestAnimationFrame(animate);
  };

  const handleSelectPreset = (name: PresetName) => {
    setActivePreset(name);
    setBasePreset(name);
    setSettings({
      ...PRESETS[name],
      animations: {
        ...PRESETS[name].animations,
        powerProgress: isPowerOn ? 1.0 : 0.0
      }
    });
  };

  const handleCustomSettingsChange = (newSettings: CRTSettings) => {
    setSettings(newSettings);
    setActivePreset('CUSTOM');
  };

  const handleReset = () => {
    if (activePreset !== 'CUSTOM') {
      setSettings(PRESETS[activePreset]);
    } else {
      setActivePreset(basePreset);
      setSettings(PRESETS[basePreset]);
    }
  };

  // CRT Power Cycle Toggle Animation
  const handleTogglePower = () => {
    cancelAnimationFrame(powerAnimRef.current);
    const targetState = !isPowerOn;
    setIsPowerOn(targetState);

    const startTime = performance.now();
    const duration = 240; // ms - faster, snappier CRT power pop
    const startVal = settings.animations.powerProgress;
    const endVal = targetState ? 1.0 : 0.0;

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1.0, elapsed / duration);
      // Ease out cubic
      const ease = 1 - Math.pow(1 - progress, 3);
      const currentVal = startVal + (endVal - startVal) * ease;

      setSettings((prev) => ({
        ...prev,
        animations: {
          ...prev.animations,
          powerProgress: currentVal
        }
      }));

      if (progress < 1.0) {
        powerAnimRef.current = requestAnimationFrame(animate);
      }
    };

    powerAnimRef.current = requestAnimationFrame(animate);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#05070a', color: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Top Header Navbar - Tailored to zath-crt-monitor */}
      <header style={{
        height: '52px',
        padding: '0 24px',
        background: '#07090e',
        borderBottom: '1px solid #141923',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        {/* LEFT: Library Name + Version */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{
            fontSize: '14px',
            fontWeight: 600,
            color: '#f8fafc',
            letterSpacing: '-0.2px',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
          }}>
            zath-crt-monitor
          </span>
          <span style={{
            padding: '2px 6px',
            background: '#0d1119',
            border: '1px solid #1a2233',
            color: '#8b9bb4',
            borderRadius: '2px',
            fontSize: '10.5px',
            fontFamily: 'var(--font-mono)'
          }}>
            v1.0.0
          </span>
        </div>

        {/* RIGHT: Copyable Library Install Command + GitHub Link */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* One-click npm install copy */}
          <button
            onClick={() => {
              navigator.clipboard.writeText('npm i zath-crt-monitor');
              setCopiedInstall(true);
              setTimeout(() => setCopiedInstall(false), 2000);
            }}
            style={{
              background: '#0d1119',
              border: '1px solid #1a2233',
              color: copiedInstall ? '#4ade80' : '#8b9bb4',
              fontSize: '11px',
              fontFamily: 'var(--font-mono)',
              padding: '4px 10px',
              borderRadius: '2px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.15s ease'
            }}
            title="Click to copy npm command"
          >
            <span>npm i zath-crt-monitor</span>
            {copiedInstall ? (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
            ) : (
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            )}
          </button>

          {/* GitHub Repository Link */}
          <a
            href="https://github.com/zaathh/crt-monitor"
            target="_blank"
            rel="noreferrer"
            title="View GitHub Repository"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '28px',
              height: '28px',
              borderRadius: '2px',
              background: '#0d1119',
              border: '1px solid #1a2233',
              color: '#cbd5e1',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
              textDecoration: 'none'
            }}
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
            </svg>
          </a>
        </div>
      </header>

      {/* Hero Section - Split Layout: Left ObsidianUI Typography + Right Retro Convex PC Monitor */}
      <section className="hero-section">
        <div className="hero-main-layout">
          {/* Left Column: Styled like ObsidianUI screenshot, but about zath-crt-monitor */}
          <div className="hero-left">
            {/* Brand Title with subtle green phosphor accent */}
            <h1 className="hero-title-text">
              zath-<span style={{ color: '#4ade80' }}>crt</span>-monitor
            </h1>

            {/* Description Paragraph */}
            <p className="hero-desc-text">
              Animated, interactive CRT monitor components for React. Built with WebGL multi-pass GLSL shaders, ready to copy, customize, and wrap your next interface.
            </p>

            {/* Action Buttons */}
            <div className="hero-actions-row">
              <button
                className="btn-hero-primary"
                onClick={() => {
                  const el = document.querySelector('.playground-container');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                <span>Playground</span>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <polyline points="19 12 12 19 5 12"></polyline>
                </svg>
              </button>

              <button
                className="btn-hero-secondary"
                onClick={() => setIsModalOpen(true)}
                title="Open Documentation & Configuration"
              >
                Docs
              </button>
            </div>
          </div>

          {/* Right Column: Realistic Retro Convex PC Monitor / CRT TV */}
          <div className="retro-pc-monitor-wrap">
            {/* SVG Filter / Clip Path for Seamless Convex CRT Tube Silhouette */}
            <svg width="0" height="0" style={{ position: 'absolute', pointerEvents: 'none' }}>
              <defs>
                <clipPath id="crt-tube-clip" clipPathUnits="objectBoundingBox">
                  <path d="M 0.06 0.02 Q 0.5 0.005 0.94 0.02 Q 0.98 0.04 0.98 0.12 Q 0.995 0.5 0.98 0.88 Q 0.98 0.96 0.94 0.98 Q 0.5 0.995 0.06 0.98 Q 0.02 0.96 0.02 0.88 Q 0.005 0.5 0.02 0.12 Q 0.02 0.04 0.06 0.02 Z" />
                </clipPath>
              </defs>
            </svg>

            <div className="retro-pc-monitor">
              {/* Monitor Top Ventilation Slots */}
              <div className="monitor-top-vents">
                <span className="vent-slot" />
                <span className="vent-slot" />
                <span className="vent-slot" />
                <span className="vent-slot" />
                <span className="vent-slot" />
              </div>

              {/* Recessed Molded Bezel around Curved Tube */}
              <div className="monitor-bezel">
                <div className="monitor-tube-glass">
                  <CRTScreen settings={heroSettings} width="100%" height="100%">
                    <HeroTerminal />
                  </CRTScreen>
                  {/* Convex Glass Reflection / Bulbous Glare Overlay */}
                  <div className="tube-glass-reflection" />
                  {/* Outer Glass Rim Highlight */}
                  <div className="tube-glass-rim" />
                </div>
              </div>

              {/* Monitor Bottom Chin / Control Panel */}
              <div className="monitor-chin">
                <div className="monitor-brand">
                  <span>CRT-1400 // COLOR RGB</span>
                </div>

                <div className="monitor-power-section">
                  <span className={`power-led ${!isHeroPowerOn ? 'off' : ''}`} />
                  <button
                    type="button"
                    className="monitor-power-btn"
                    onClick={handleToggleHeroPower}
                    title={isHeroPowerOn ? "Turn Monitor Power OFF" : "Turn Monitor Power ON"}
                  >
                    POWER
                  </button>
                </div>
              </div>
            </div>

            {/* Pedestal Stand Neck & Base */}
            <div className="monitor-stand-neck" />
            <div className="monitor-stand-base" />
          </div>
        </div>
      </section>

      {/* Main Split-Screen Playground Area */}
      <main style={{ flexGrow: 1, padding: '24px 16px', display: 'flex', justifyContent: 'center' }}>
        <div className="playground-container">
          {/* LEFT: Stage Preview + Content Tabs + Code Generator */}
          <div className="playground-stage">
            {/* Stage Top Bar: Content Selector */}
            <div className="stage-top-bar">
              <div className="content-tabs-row">
                <button
                  className={`content-tab-btn ${contentTab === 'terminal' ? 'active' : ''}`}
                  onClick={() => setContentTab('terminal')}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="4 17 10 11 4 5"></polyline>
                    <line x1="12" y1="19" x2="20" y2="19"></line>
                  </svg>
                  <span>TERMINAL</span>
                </button>
                <button
                  className={`content-tab-btn ${contentTab === 'game' ? 'active' : ''}`}
                  onClick={() => setContentTab('game')}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="6" width="20" height="12" rx="2"></rect>
                    <line x1="6" y1="12" x2="10" y2="12"></line>
                    <line x1="8" y1="10" x2="8" y2="14"></line>
                    <circle cx="15" cy="13" r="1"></circle>
                    <circle cx="18" cy="11" r="1"></circle>
                  </svg>
                  <span>ARCADE PONG</span>
                </button>
                <button
                  className={`content-tab-btn ${contentTab === 'media' ? 'active' : ''}`}
                  onClick={() => setContentTab('media')}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                    <polyline points="2 17 12 22 22 17"></polyline>
                    <polyline points="2 12 12 17 22 12"></polyline>
                  </svg>
                  <span>SYNTHWAVE</span>
                </button>
              </div>

              {/* CRT Power On/Off - Matching Hero Style */}
              <div className="monitor-power-section">
                <span className={`power-led ${!isPowerOn ? 'off' : ''}`} />
                <button
                  type="button"
                  className="monitor-power-btn"
                  onClick={handleTogglePower}
                  title={isPowerOn ? "Turn Monitor Power OFF" : "Turn Monitor Power ON"}
                >
                  POWER
                </button>
              </div>
            </div>

            {/* Live CRT Monitor Frame */}
            <div className="crt-monitor-frame">
              <CRTScreen settings={settings} enabled={isEffectEnabled} width="100%" height="100%">
                {contentTab === 'terminal' && <DemoTerminal />}
                {contentTab === 'game' && <DemoGame />}
                {contentTab === 'media' && <DemoMedia />}
              </CRTScreen>
            </div>

            {/* Live React JSX Code Generator Box */}
            <CodeExportBox settings={settings} activePreset={activePreset} basePreset={basePreset} />
          </div>

          {/* RIGHT: Docked Real-Time Control Panel */}
          <CRTPlaygroundSidebar
            settings={settings}
            onSettingsChange={handleCustomSettingsChange}
            activePreset={activePreset}
            onSelectPreset={handleSelectPreset}
            onReset={handleReset}
            isEffectEnabled={isEffectEnabled}
            onToggleEffect={() => setIsEffectEnabled(!isEffectEnabled)}
          />
        </div>
      </main>

      {/* Full Configuration Modal */}
      <CRTConfigModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        settings={settings}
        onSettingsChange={handleCustomSettingsChange}
        activePreset={activePreset}
        onSelectPreset={handleSelectPreset}
        isEffectEnabled={isEffectEnabled}
        onToggleEffect={() => setIsEffectEnabled(!isEffectEnabled)}
      />
    </div>
  );
};
