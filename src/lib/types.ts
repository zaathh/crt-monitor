// TypeScript Definitions for zath-crt-monitor

export interface ScreenWarpSettings {
  enabled: boolean;
  bulge: number;      // e.g. 0.0 - 2.0 (default: 0.6 - 1.2)
  edgeDarken: number; // e.g. 0.0 - 1.0 (default: 0.12 - 0.25)
}

export interface MonitorBezelSettings {
  enabled: boolean;
  thickness: number;   // In pixels, e.g. 0 - 60px
  bezelColor: string;  // Hex or CSS color, e.g. '#0e1117'
}

export interface ScanlinesSettings {
  enabled: boolean;
  opacity: number;     // 0.0 - 1.0 (e.g. 0.18 - 0.55)
  lineSpacing: number; // In pixels, e.g. 2 - 4px
}

export interface ChromaticAberrationSettings {
  enabled: boolean;
  shiftAmount: number; // In pixels, e.g. 2 - 4px
}

export interface PhosphorDotGridSettings {
  enabled: boolean;
  opacity: number;     // 0.0 - 1.0 (e.g. 0.20 - 0.40)
}

export interface VignetteSettings {
  enabled: boolean;
  strength: number;    // 0.0 - 1.0 (0.0 = no vignette, 1.0 = heavy)
  roundness: number;   // 0.0 = rectangular/box, 1.0 = circular
  falloff: number;     // 0.1 - 1.0 (softness of gradient)
  color: string;       // Custom vignette color, e.g. '#000000'
}

export interface ScreenGlareSettings {
  enabled: boolean;
  opacity: number;     // 0.0 - 1.0
  size: number;        // 0.1 - 1.0 (spread / size of spotlight)
  positionX: number;   // 0.0 - 1.0 (horizontal position)
  positionY: number;   // 0.0 - 1.0 (vertical position)
}

// Retro Animation Suite
export interface GlitchSettings {
  enabled: boolean;
  intensity: number;   // 0.0 - 1.0 (line displacement distance)
  frequency: number;   // 0.0 - 1.0 (burst rate / frequency)
}

export interface JitterSettings {
  enabled: boolean;
  amount: number;      // 0 - 6px (v-sync micro-shake)
}

export interface FlickerSettings {
  enabled: boolean;
  intensity: number;   // 0.0 - 1.0 (phosphor refresh flicker)
}

export interface ScanlineRollSettings {
  enabled: boolean;
  speed: number;       // 0.1 - 5.0 (speed of rolling wave)
  intensity: number;   // 0.0 - 1.0 (wave intensity)
}

export interface StaticNoiseSettings {
  enabled: boolean;
  intensity: number;   // 0.0 - 1.0 (analog TV grain)
}

export interface AnimationSettings {
  glitch: GlitchSettings;
  jitter: JitterSettings;
  flicker: FlickerSettings;
  scanlineRoll: ScanlineRollSettings;
  staticNoise: StaticNoiseSettings;
  powerProgress: number; // 1.0 = fully on, 0.0 = collapsed/off
}

export interface CRTSettings {
  screenWarp: ScreenWarpSettings;
  monitorBezel: MonitorBezelSettings;
  scanlines: ScanlinesSettings;
  chromaticAberration: ChromaticAberrationSettings;
  phosphorDotGrid: PhosphorDotGridSettings;
  vignette: VignetteSettings;
  screenGlare: ScreenGlareSettings;
  animations: AnimationSettings;
}

export type PresetName =
  | 'ARCADE'
  | 'RETRO TV'
  | 'BROADCAST PVM'
  | 'VHS TAPE'
  | 'COMMODORE'
  | 'TERMINAL'
  | 'AMBER CRT'
  | 'CYBERPUNK'
  | 'MILD';
