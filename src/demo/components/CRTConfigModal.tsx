import React from 'react';
import { type CRTSettings, type PresetName } from '../../lib/types.js';
import { PRESETS } from '../../lib/presets.js';
import { SliderRow } from './SliderRow.js';
import { FeatureCard } from './FeatureCard.js';
import { PRESET_OPTIONS } from './CRTPlaygroundSidebar.js';

interface CRTConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CRTSettings;
  onSettingsChange: (settings: CRTSettings) => void;
  activePreset: PresetName | 'CUSTOM';
  onSelectPreset: (preset: PresetName) => void;
  isEffectEnabled?: boolean;
  onToggleEffect?: () => void;
}

export const CRTConfigModal: React.FC<CRTConfigModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSettingsChange,
  activePreset,
  onSelectPreset,
  isEffectEnabled = true,
  onToggleEffect
}) => {
  if (!isOpen) return null;

  const referencePreset = PRESETS[activePreset === 'CUSTOM' ? 'ARCADE' : activePreset];

  const updateSection = <K extends keyof CRTSettings>(
    section: K,
    updates: Partial<CRTSettings[K]>
  ) => {
    onSettingsChange({
      ...settings,
      [section]: {
        ...settings[section],
        ...updates
      }
    });
  };

  const resetSection = <K extends keyof CRTSettings>(section: K) => {
    onSettingsChange({
      ...settings,
      [section]: {
        ...referencePreset[section]
      }
    });
  };

  const updateAnimation = <K extends keyof CRTSettings['animations']>(
    key: K,
    updates: Partial<CRTSettings['animations'][K]>
  ) => {
    onSettingsChange({
      ...settings,
      animations: {
        ...settings.animations,
        [key]: {
          ...(settings.animations[key] as any),
          ...updates
        }
      }
    });
  };

  const resetAnimation = <K extends keyof CRTSettings['animations']>(key: K) => {
    onSettingsChange({
      ...settings,
      animations: {
        ...settings.animations,
        [key]: {
          ...(referencePreset.animations[key] as any)
        }
      }
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="crt-modal" onClick={(e) => e.stopPropagation()}>
        {/* Top Window Title Bar */}
        <div className="modal-top-bar">
          <span className="top-title-group" style={{ fontFamily: 'var(--font-mono)', fontSize: '11.5px', letterSpacing: '0.05em' }}>CRT CONFIGURATION MATRIX</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {onToggleEffect && (
              <div className="monitor-power-section">
                <span className={`power-led ${!isEffectEnabled ? 'off' : ''}`} />
                <button
                  type="button"
                  className="monitor-power-btn"
                  onClick={onToggleEffect}
                  title={isEffectEnabled ? 'Bypass / Turn OFF CRT Effect' : 'Enable / Turn ON CRT Effect'}
                >
                  EFFECT
                </button>
              </div>
            )}
            <button className="btn-modal-close" onClick={onClose}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="modal-scroll-body">
          {/* Preset Switcher Tabs */}
          <div className="sidebar-presets-wrap" style={{ borderBottom: '1px solid #161c28' }}>
            <span className="sidebar-section-sub">PRESET MATRIX ({PRESET_OPTIONS.length})</span>
            <div className="preset-tabs-row">
              {PRESET_OPTIONS.map((preset) => (
                <button
                  key={preset.id}
                  className={`preset-tab-btn ${activePreset === preset.id ? 'active' : ''}`}
                  onClick={() => onSelectPreset(preset.id)}
                  title={`Load ${preset.id} preset`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* 1. SCREEN WARP */}
          <FeatureCard
            categoryLabel="SCREEN WARP"
            title="Screen Warp"
            enabled={settings.screenWarp.enabled}
            onToggle={(enabled) => updateSection('screenWarp', { enabled })}
            onReset={() => resetSection('screenWarp')}
          >
            <SliderRow
              label="Bulge"
              min={0.0}
              max={2.0}
              step={0.05}
              value={settings.screenWarp.bulge}
              hint="Curvature of the glass tube"
              onChange={(v) => updateSection('screenWarp', { bulge: v })}
            />
            <SliderRow
              label="Edge Darken"
              min={0.0}
              max={1.0}
              step={0.01}
              value={settings.screenWarp.edgeDarken}
              hint="Darkening along outer barrel bounds"
              onChange={(v) => updateSection('screenWarp', { edgeDarken: v })}
            />
          </FeatureCard>

          {/* 2. MONITOR BEZEL */}
          <FeatureCard
            categoryLabel="MONITOR BEZEL"
            title="Monitor Bezel"
            enabled={settings.monitorBezel.enabled}
            onToggle={(enabled) => updateSection('monitorBezel', { enabled })}
            onReset={() => resetSection('monitorBezel')}
          >
            <SliderRow
              label="Thickness"
              min={0}
              max={60}
              step={1}
              value={settings.monitorBezel.thickness}
              unit="px"
              hint="Width of outer chassis frame"
              onChange={(v) => updateSection('monitorBezel', { thickness: v })}
            />
            <div className="modern-color-row">
              <span className="modern-slider-label">Bezel Color</span>
              <input
                type="color"
                value={settings.monitorBezel.bezelColor}
                onChange={(e) => updateSection('monitorBezel', { bezelColor: e.target.value })}
                style={{
                  background: 'none',
                  border: '1px solid #374151',
                  borderRadius: '2px',
                  width: '36px',
                  height: '22px',
                  cursor: 'pointer'
                }}
              />
            </div>
          </FeatureCard>

          {/* 3. SCANLINES */}
          <FeatureCard
            categoryLabel="SCANLINES"
            title="Scanlines"
            enabled={settings.scanlines.enabled}
            onToggle={(enabled) => updateSection('scanlines', { enabled })}
            onReset={() => resetSection('scanlines')}
          >
            <SliderRow
              label="Opacity"
              min={0.0}
              max={1.0}
              step={0.01}
              value={settings.scanlines.opacity}
              isPercent={true}
              hint="Visibility of horizontal raster lines"
              onChange={(v) => updateSection('scanlines', { opacity: v })}
            />
            <SliderRow
              label="Line Spacing"
              min={1}
              max={8}
              step={1}
              value={settings.scanlines.lineSpacing}
              unit="px"
              hint="Distance between individual beam passes"
              onChange={(v) => updateSection('scanlines', { lineSpacing: v })}
            />
          </FeatureCard>

          {/* 4. CHROMATIC ABERRATION */}
          <FeatureCard
            categoryLabel="CHROMATIC ABERRATION"
            title="Chromatic Aberration"
            enabled={settings.chromaticAberration.enabled}
            onToggle={(enabled) => updateSection('chromaticAberration', { enabled })}
            onReset={() => resetSection('chromaticAberration')}
          >
            <SliderRow
              label="Shift Amount"
              min={0}
              max={10}
              step={1}
              value={settings.chromaticAberration.shiftAmount}
              unit="px"
              hint="RGB color channel displacement distance"
              onChange={(v) => updateSection('chromaticAberration', { shiftAmount: v })}
            />
          </FeatureCard>

          {/* 5. PHOSPHOR DOT GRID */}
          <FeatureCard
            categoryLabel="PHOSPHOR DOT GRID"
            title="Phosphor Dot Grid"
            enabled={settings.phosphorDotGrid.enabled}
            onToggle={(enabled) => updateSection('phosphorDotGrid', { enabled })}
            onReset={() => resetSection('phosphorDotGrid')}
          >
            <SliderRow
              label="Opacity"
              min={0.0}
              max={1.0}
              step={0.01}
              value={settings.phosphorDotGrid.opacity}
              isPercent={true}
              hint="Aperture grille / shadow mask pixel pattern"
              onChange={(v) => updateSection('phosphorDotGrid', { opacity: v })}
            />
          </FeatureCard>

          {/* 6. VIGNETTE */}
          <FeatureCard
            categoryLabel="VIGNETTE"
            title="Vignette"
            enabled={settings.vignette.enabled}
            onToggle={(enabled) => updateSection('vignette', { enabled })}
            onReset={() => resetSection('vignette')}
          >
            <SliderRow
              label="Strength"
              min={0.0}
              max={1.0}
              step={0.01}
              value={settings.vignette.strength}
              hint="Outer corner darkening intensity"
              onChange={(v) => updateSection('vignette', { strength: v })}
            />
            <SliderRow
              label="Roundness"
              min={0.0}
              max={1.0}
              step={0.05}
              value={settings.vignette.roundness}
              hint="Radial circular vs barrel shape"
              onChange={(v) => updateSection('vignette', { roundness: v })}
            />
            <SliderRow
              label="Falloff"
              min={0.1}
              max={1.0}
              step={0.05}
              value={settings.vignette.falloff}
              hint="Smoothness of dark gradient transition"
              onChange={(v) => updateSection('vignette', { falloff: v })}
            />
            <div className="modern-color-row">
              <span className="modern-slider-label">Vignette Color</span>
              <input
                type="color"
                value={settings.vignette.color}
                onChange={(e) => updateSection('vignette', { color: e.target.value })}
                style={{
                  background: 'none',
                  border: '1px solid #374151',
                  borderRadius: '2px',
                  width: '36px',
                  height: '22px',
                  cursor: 'pointer'
                }}
              />
            </div>
          </FeatureCard>

          {/* 7. SCREEN GLARE */}
          <FeatureCard
            categoryLabel="SCREEN GLARE"
            title="Screen Glare"
            enabled={settings.screenGlare.enabled}
            onToggle={(enabled) => updateSection('screenGlare', { enabled })}
            onReset={() => resetSection('screenGlare')}
          >
            <SliderRow
              label="Opacity"
              min={0.0}
              max={1.0}
              step={0.01}
              value={settings.screenGlare.opacity}
              hint="Light reflection brightness on glass surface"
              onChange={(v) => updateSection('screenGlare', { opacity: v })}
            />
            <SliderRow
              label="Size"
              min={0.1}
              max={1.0}
              step={0.05}
              value={settings.screenGlare.size}
              hint="Spread diameter of ambient spotlight"
              onChange={(v) => updateSection('screenGlare', { size: v })}
            />
            <SliderRow
              label="Position X"
              min={0.0}
              max={1.0}
              step={0.02}
              value={settings.screenGlare.positionX}
              hint="Horizontal reflection source offset"
              onChange={(v) => updateSection('screenGlare', { positionX: v })}
            />
            <SliderRow
              label="Position Y"
              min={0.0}
              max={1.0}
              step={0.02}
              value={settings.screenGlare.positionY}
              hint="Vertical reflection source offset"
              onChange={(v) => updateSection('screenGlare', { positionY: v })}
            />
          </FeatureCard>

          {/* 8. LINE GLITCH & TEAR */}
          <FeatureCard
            categoryLabel="LINE GLITCH & TEAR"
            title="Line Glitch & Tear"
            enabled={settings.animations.glitch.enabled}
            onToggle={(enabled) => updateAnimation('glitch', { enabled })}
            onReset={() => resetAnimation('glitch')}
          >
            <SliderRow
              label="Intensity"
              min={0.0}
              max={1.0}
              step={0.05}
              value={settings.animations.glitch.intensity}
              hint="Horizontal slice displacement distance"
              onChange={(v) => updateAnimation('glitch', { intensity: v })}
            />
            <SliderRow
              label="Frequency"
              min={0.0}
              max={1.0}
              step={0.05}
              value={settings.animations.glitch.frequency}
              hint="Occurrence rate of signal burst glitches"
              onChange={(v) => updateAnimation('glitch', { frequency: v })}
            />
          </FeatureCard>

          {/* 9. V-SYNC JITTER */}
          <FeatureCard
            categoryLabel="V-SYNC JITTER"
            title="V-Sync Jitter"
            enabled={settings.animations.jitter.enabled}
            onToggle={(enabled) => updateAnimation('jitter', { enabled })}
            onReset={() => resetAnimation('jitter')}
          >
            <SliderRow
              label="Amount"
              min={0.0}
              max={5.0}
              step={0.2}
              value={settings.animations.jitter.amount}
              unit="px"
              hint="Vertical micro-shake from sync instability"
              onChange={(v) => updateAnimation('jitter', { amount: v })}
            />
          </FeatureCard>

          {/* 10. SCREEN FLICKER */}
          <FeatureCard
            categoryLabel="SCREEN FLICKER"
            title="Screen Flicker"
            enabled={settings.animations.flicker.enabled}
            onToggle={(enabled) => updateAnimation('flicker', { enabled })}
            onReset={() => resetAnimation('flicker')}
          >
            <SliderRow
              label="Intensity"
              min={0.0}
              max={1.0}
              step={0.05}
              value={settings.animations.flicker.intensity}
              isPercent={true}
              hint="Phosphor luminance modulation"
              onChange={(v) => updateAnimation('flicker', { intensity: v })}
            />
          </FeatureCard>

          {/* 11. SCANLINE ROLL */}
          <FeatureCard
            categoryLabel="SCANLINE ROLL"
            title="Scanline Roll (VHS)"
            enabled={settings.animations.scanlineRoll.enabled}
            onToggle={(enabled) => updateAnimation('scanlineRoll', { enabled })}
            onReset={() => resetAnimation('scanlineRoll')}
          >
            <SliderRow
              label="Speed"
              min={0.1}
              max={5.0}
              step={0.1}
              value={settings.animations.scanlineRoll.speed}
              unit="x"
              hint="Vertical hum bar scroll velocity"
              onChange={(v) => updateAnimation('scanlineRoll', { speed: v })}
            />
            <SliderRow
              label="Intensity"
              min={0.0}
              max={1.0}
              step={0.05}
              value={settings.animations.scanlineRoll.intensity}
              isPercent={true}
              hint="Strength of traveling hum bar shadow"
              onChange={(v) => updateAnimation('scanlineRoll', { intensity: v })}
            />
          </FeatureCard>

          {/* 12. STATIC NOISE */}
          <FeatureCard
            categoryLabel="STATIC NOISE"
            title="Static Noise"
            enabled={settings.animations.staticNoise.enabled}
            onToggle={(enabled) => updateAnimation('staticNoise', { enabled })}
            onReset={() => resetAnimation('staticNoise')}
          >
            <SliderRow
              label="Intensity"
              min={0.0}
              max={1.0}
              step={0.05}
              value={settings.animations.staticNoise.intensity}
              isPercent={true}
              hint="Analog TV antenna grain & snow density"
              onChange={(v) => updateAnimation('staticNoise', { intensity: v })}
            />
          </FeatureCard>

        </div>
      </div>
    </div>
  );
};
