import React, { useEffect, useRef, useImperativeHandle, forwardRef, useMemo } from 'react';
import {
  type CRTSettings,
  type PresetName,
  type ScreenWarpSettings,
  type MonitorBezelSettings,
  type ScanlinesSettings,
  type ChromaticAberrationSettings,
  type PhosphorDotGridSettings,
  type VignetteSettings,
  type ScreenGlareSettings,
  type GlitchSettings,
  type JitterSettings,
  type FlickerSettings,
  type ScanlineRollSettings,
  type StaticNoiseSettings
} from './types.js';
import { PRESETS } from './presets.js';
import { CRTShaderEngine } from './webgl/CRTShaderEngine.js';
import { unwarpMouseCoordinates } from './webgl/mouseUnwarp.js';

export interface CRTScreenProps {
  settings?: CRTSettings;
  preset?: PresetName;
  screenWarp?: Partial<ScreenWarpSettings>;
  monitorBezel?: Partial<MonitorBezelSettings>;
  scanlines?: Partial<ScanlinesSettings>;
  chromaticAberration?: Partial<ChromaticAberrationSettings>;
  phosphorDotGrid?: Partial<PhosphorDotGridSettings>;
  vignette?: Partial<VignetteSettings>;
  screenGlare?: Partial<ScreenGlareSettings>;
  animations?: Partial<{
    glitch?: Partial<GlitchSettings>;
    jitter?: Partial<JitterSettings>;
    flicker?: Partial<FlickerSettings>;
    scanlineRoll?: Partial<ScanlineRollSettings>;
    staticNoise?: Partial<StaticNoiseSettings>;
    powerProgress?: number;
  }>;
  enabled?: boolean; // Whether CRT shader effects are active. If false, renders pure clean pass-through.
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  width?: number | string;
  height?: number | string;
  onScreenClick?: (coords: { x: number; y: number }, originalEvent: React.MouseEvent) => void;
}

export interface CRTScreenHandle {
  getCanvas: () => HTMLCanvasElement | null;
  unwarpCoords: (clientX: number, clientY: number) => { x: number; y: number };
}

const CRTScreenInner = forwardRef<CRTScreenHandle, CRTScreenProps>(({
  settings: propSettings,
  preset = 'ARCADE',
  screenWarp,
  monitorBezel,
  scanlines,
  chromaticAberration,
  phosphorDotGrid,
  vignette,
  screenGlare,
  animations,
  enabled = true,
  className = '',
  style = {},
  children,
  width = '100%',
  height = '100%',
  onScreenClick
}, ref) => {
  const displayCanvasRef = useRef<HTMLCanvasElement>(null);
  const contentContainerRef = useRef<HTMLDivElement>(null);
  const shaderEngineRef = useRef<CRTShaderEngine | null>(null);
  const animFrameRef = useRef<number>(0);
  // Opt 4: cache the resolved child media element, re-query only on DOM mutation
  const targetRef = useRef<HTMLCanvasElement | HTMLVideoElement | HTMLImageElement | null>(null);
  // Opt C+D: track whether rendering should be active (tab visible AND in viewport)
  const isRenderActiveRef = useRef(true);
  // Stores the render fn so visibility/intersection handlers can restart the loop
  const renderFnRef = useRef<((ts: number) => void) | null>(null);

  // Active settings merged over base preset
  const basePresetSettings = PRESETS[preset] || PRESETS.ARCADE;
  const activeSettings = useMemo<CRTSettings>(() => {
    if (propSettings) {
      return propSettings;
    }
    return {
      screenWarp: { ...basePresetSettings.screenWarp, ...screenWarp },
      monitorBezel: { ...basePresetSettings.monitorBezel, ...monitorBezel },
      scanlines: { ...basePresetSettings.scanlines, ...scanlines },
      chromaticAberration: { ...basePresetSettings.chromaticAberration, ...chromaticAberration },
      phosphorDotGrid: { ...basePresetSettings.phosphorDotGrid, ...phosphorDotGrid },
      vignette: { ...basePresetSettings.vignette, ...vignette },
      screenGlare: { ...basePresetSettings.screenGlare, ...screenGlare },
      animations: {
        ...basePresetSettings.animations,
        ...animations,
        glitch: { ...basePresetSettings.animations.glitch, ...animations?.glitch },
        jitter: { ...basePresetSettings.animations.jitter, ...animations?.jitter },
        flicker: { ...basePresetSettings.animations.flicker, ...animations?.flicker },
        scanlineRoll: { ...basePresetSettings.animations.scanlineRoll, ...animations?.scanlineRoll },
        staticNoise: { ...basePresetSettings.animations.staticNoise, ...animations?.staticNoise },
        powerProgress: animations?.powerProgress ?? basePresetSettings.animations.powerProgress
      }
    };
  }, [
    propSettings,
    basePresetSettings,
    screenWarp,
    monitorBezel,
    scanlines,
    chromaticAberration,
    phosphorDotGrid,
    vignette,
    screenGlare,
    animations
  ]);

  const bypassedSettings = React.useMemo<CRTSettings>(() => ({
    ...activeSettings,
    screenWarp: { ...activeSettings.screenWarp, enabled: false },
    monitorBezel: { ...activeSettings.monitorBezel, enabled: false },
    scanlines: { ...activeSettings.scanlines, enabled: false },
    chromaticAberration: { ...activeSettings.chromaticAberration, enabled: false },
    phosphorDotGrid: { ...activeSettings.phosphorDotGrid, enabled: false },
    vignette: { ...activeSettings.vignette, enabled: false },
    screenGlare: { ...activeSettings.screenGlare, enabled: false },
    animations: {
      ...activeSettings.animations,
      glitch: { ...activeSettings.animations.glitch, enabled: false },
      jitter: { ...activeSettings.animations.jitter, enabled: false },
      flicker: { ...activeSettings.animations.flicker, enabled: false },
      scanlineRoll: { ...activeSettings.animations.scanlineRoll, enabled: false },
      staticNoise: { ...activeSettings.animations.staticNoise, enabled: false }
    }
  }), [activeSettings]);

  const effectiveSettings = enabled ? activeSettings : bypassedSettings;

  useImperativeHandle(ref, () => ({
    getCanvas: () => displayCanvasRef.current,
    unwarpCoords: (clientX: number, clientY: number) => {
      if (!displayCanvasRef.current) return { x: clientX, y: clientY };
      const w = displayCanvasRef.current.width;
      const h = displayCanvasRef.current.height;
      return unwarpMouseCoordinates(
        clientX,
        clientY,
        displayCanvasRef.current,
        effectiveSettings.screenWarp.enabled ? effectiveSettings.screenWarp.bulge : 0,
        effectiveSettings.monitorBezel.enabled,
        effectiveSettings.monitorBezel.thickness,
        w,
        h
      );
    }
  }));

  // Initialize WebGL
  useEffect(() => {
    const canvas = displayCanvasRef.current;
    const container = contentContainerRef.current;
    if (!canvas) return;

    try {
      shaderEngineRef.current = new CRTShaderEngine(canvas);
    } catch (err) {
      console.error('Failed to initialize WebGL CRT Shader:', err);
    }

    // Opt 5: DPR-aware canvas sizing — multiply by devicePixelRatio for crisp HiDPI rendering
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === canvas) {
          const dpr = window.devicePixelRatio || 1;
          canvas.width = canvas.clientWidth * dpr;
          canvas.height = canvas.clientHeight * dpr;
        }
      }
    });
    resizeObserver.observe(canvas);

    // Opt 4: MutationObserver — cache child media element, only re-query on DOM change
    const updateTarget = () => {
      targetRef.current = container
        ? (container.querySelector('canvas, video, img') as HTMLCanvasElement | HTMLVideoElement | HTMLImageElement | null)
        : null;
    };
    updateTarget();
    const mutationObserver = container ? new MutationObserver(updateTarget) : null;
    mutationObserver?.observe(container!, { childList: true, subtree: true });

    return () => {
      resizeObserver.disconnect();
      mutationObserver?.disconnect();
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const effectiveSettingsRef = useRef(effectiveSettings);
  effectiveSettingsRef.current = effectiveSettings;

  // Continuous render loop for canvas/video children
  // Opts C+D: loop only runs while tab is visible AND component is in viewport
  useEffect(() => {
    const canvas = displayCanvasRef.current;
    const container = contentContainerRef.current;
    if (!canvas || !container) return;

    const scheduleFrame = () => {
      if (isRenderActiveRef.current && !document.hidden) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    const render = (timestamp: number) => {
      const engine = shaderEngineRef.current;
      if (engine) {
        const target = targetRef.current;
        if (target) {
          try {
            engine.render(target, effectiveSettingsRef.current, timestamp * 0.001);
          } catch (e) {
            // Frame skip if media not ready
          }
        }
      }
      scheduleFrame();
    };

    // Store render fn so external handlers can resume the loop
    renderFnRef.current = render;

    // Opt C: Visibility API — pause when browser tab is hidden
    const onVisibilityChange = () => {
      if (document.hidden) {
        cancelAnimationFrame(animFrameRef.current);
      } else if (isRenderActiveRef.current) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Opt D: IntersectionObserver — pause when component is scrolled off-screen
    const intersectionObserver = new IntersectionObserver(([entry]) => {
      isRenderActiveRef.current = entry.isIntersecting;
      if (entry.isIntersecting && !document.hidden) {
        animFrameRef.current = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(animFrameRef.current);
      }
    }, { threshold: 0 });
    intersectionObserver.observe(canvas);

    // Start the loop
    scheduleFrame();

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      intersectionObserver.disconnect();
    };
  }, []);

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onScreenClick || !displayCanvasRef.current) return;
    const w = displayCanvasRef.current.width;
    const h = displayCanvasRef.current.height;
    const unwarped = unwarpMouseCoordinates(
      e.clientX,
      e.clientY,
      displayCanvasRef.current,
      activeSettings.screenWarp.enabled ? activeSettings.screenWarp.bulge : 0,
      activeSettings.monitorBezel.enabled,
      activeSettings.monitorBezel.thickness,
      w,
      h
    );
    onScreenClick(unwarped, e);
  };

  return (
    <div
      className={`crt-screen-wrapper ${className}`}
      style={{
        position: 'relative',
        width,
        height,
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#000000',
        ...style
      }}
    >
      {/* Hidden container holding the source children (canvas, video, img) */}
      <div
        ref={contentContainerRef}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          opacity: 0,
          pointerEvents: 'none',
          zIndex: -1
        }}
      >
        {children}
      </div>

      {/* WebGL Display Canvas */}
      <canvas
        ref={displayCanvasRef}
        onClick={handleClick}
        style={{
          width: '100%',
          height: '100%',
          display: 'block',
          objectFit: 'contain',
          cursor: onScreenClick ? 'pointer' : 'default'
        }}
      />
    </div>
  );
});

// Opt E: React.memo — prevents re-renders triggered by parent component updates
// that have no relation to CRT settings, avoiding useMemo recalculation overhead.
export const CRTScreen = React.memo(CRTScreenInner);
(CRTScreen as React.MemoExoticComponent<typeof CRTScreenInner>).displayName = 'CRTScreen';


