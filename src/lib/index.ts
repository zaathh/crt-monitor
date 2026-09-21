// Public API Exports for zath-crt-monitor
export { CRTScreen, type CRTScreenProps, type CRTScreenHandle } from './CRTScreen.js';
export { PRESETS, PRESET_ARCADE, PRESET_RETRO_TV, PRESET_BROADCAST_PVM, PRESET_VHS_TAPE, PRESET_COMMODORE, PRESET_TERMINAL, PRESET_AMBER_CRT, PRESET_CYBERPUNK, PRESET_MILD } from './presets.js';

export {
  type CRTSettings,
  type PresetName,
  type ScreenWarpSettings,
  type MonitorBezelSettings,
  type ScanlinesSettings,
  type ChromaticAberrationSettings,
  type PhosphorDotGridSettings,
  type VignetteSettings,
  type ScreenGlareSettings
} from './types.js';
export { unwarpMouseCoordinates } from './webgl/mouseUnwarp.js';
