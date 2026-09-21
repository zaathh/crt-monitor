// Authentic CRT Presets Matching User Screenshots & New Animation Suite
import { type CRTSettings, type PresetName } from './types.js';

export const PRESETS: Record<PresetName, CRTSettings> = {
  ARCADE: {
    screenWarp: {
      enabled: true,
      bulge: 1.15,
      edgeDarken: 0.18
    },
    monitorBezel: {
      enabled: true,
      thickness: 28,
      bezelColor: '#0e1117'
    },
    scanlines: {
      enabled: true,
      opacity: 0.45,
      lineSpacing: 3
    },
    chromaticAberration: {
      enabled: true,
      shiftAmount: 4
    },
    phosphorDotGrid: {
      enabled: true,
      opacity: 0.30
    },
    vignette: {
      enabled: true,
      strength: 0.85,
      roundness: 0.80,
      falloff: 0.45,
      color: '#000000'
    },
    screenGlare: {
      enabled: true,
      opacity: 0.10,
      size: 0.35,
      positionX: 0.30,
      positionY: 0.25
    },
    animations: {
      glitch: {
        enabled: true,
        intensity: 0.30,
        frequency: 0.25
      },
      jitter: {
        enabled: true,
        amount: 1.2
      },
      flicker: {
        enabled: true,
        intensity: 0.15
      },
      scanlineRoll: {
        enabled: true,
        speed: 1.0,
        intensity: 0.25
      },
      staticNoise: {
        enabled: true,
        intensity: 0.12
      },
      powerProgress: 1.0
    }
  },

  'RETRO TV': {
    screenWarp: {
      enabled: true,
      bulge: 0.65,
      edgeDarken: 0.14
    },
    monitorBezel: {
      enabled: true,
      thickness: 24,
      bezelColor: '#121620'
    },
    scanlines: {
      enabled: true,
      opacity: 0.35,
      lineSpacing: 3
    },
    chromaticAberration: {
      enabled: true,
      shiftAmount: 3
    },
    phosphorDotGrid: {
      enabled: false,
      opacity: 0.30
    },
    vignette: {
      enabled: true,
      strength: 0.75,
      roundness: 0.90,
      falloff: 0.50,
      color: '#000000'
    },
    screenGlare: {
      enabled: true,
      opacity: 0.14,
      size: 0.42,
      positionX: 0.28,
      positionY: 0.26
    },
    animations: {
      glitch: {
        enabled: false,
        intensity: 0.25,
        frequency: 0.15
      },
      jitter: {
        enabled: true,
        amount: 1.6
      },
      flicker: {
        enabled: true,
        intensity: 0.20
      },
      scanlineRoll: {
        enabled: true,
        speed: 0.8,
        intensity: 0.35
      },
      staticNoise: {
        enabled: true,
        intensity: 0.20
      },
      powerProgress: 1.0
    }
  },

  'BROADCAST PVM': {
    screenWarp: {
      enabled: true,
      bulge: 0.12,
      edgeDarken: 0.05
    },
    monitorBezel: {
      enabled: true,
      thickness: 18,
      bezelColor: '#0a0d12'
    },
    scanlines: {
      enabled: true,
      opacity: 0.52,
      lineSpacing: 2
    },
    chromaticAberration: {
      enabled: true,
      shiftAmount: 1
    },
    phosphorDotGrid: {
      enabled: true,
      opacity: 0.35
    },
    vignette: {
      enabled: true,
      strength: 0.35,
      roundness: 0.30,
      falloff: 0.70,
      color: '#000000'
    },
    screenGlare: {
      enabled: true,
      opacity: 0.05,
      size: 0.25,
      positionX: 0.35,
      positionY: 0.20
    },
    animations: {
      glitch: {
        enabled: false,
        intensity: 0.10,
        frequency: 0.05
      },
      jitter: {
        enabled: false,
        amount: 0.0
      },
      flicker: {
        enabled: false,
        intensity: 0.05
      },
      scanlineRoll: {
        enabled: false,
        speed: 0.5,
        intensity: 0.10
      },
      staticNoise: {
        enabled: false,
        intensity: 0.05
      },
      powerProgress: 1.0
    }
  },

  'VHS TAPE': {
    screenWarp: {
      enabled: true,
      bulge: 0.55,
      edgeDarken: 0.16
    },
    monitorBezel: {
      enabled: true,
      thickness: 22,
      bezelColor: '#0c0f16'
    },
    scanlines: {
      enabled: true,
      opacity: 0.40,
      lineSpacing: 3
    },
    chromaticAberration: {
      enabled: true,
      shiftAmount: 5
    },
    phosphorDotGrid: {
      enabled: false,
      opacity: 0.25
    },
    vignette: {
      enabled: true,
      strength: 0.80,
      roundness: 0.85,
      falloff: 0.45,
      color: '#020508'
    },
    screenGlare: {
      enabled: true,
      opacity: 0.12,
      size: 0.38,
      positionX: 0.25,
      positionY: 0.30
    },
    animations: {
      glitch: {
        enabled: true,
        intensity: 0.55,
        frequency: 0.40
      },
      jitter: {
        enabled: true,
        amount: 2.4
      },
      flicker: {
        enabled: true,
        intensity: 0.25
      },
      scanlineRoll: {
        enabled: true,
        speed: 1.4,
        intensity: 0.45
      },
      staticNoise: {
        enabled: true,
        intensity: 0.28
      },
      powerProgress: 1.0
    }
  },

  COMMODORE: {
    screenWarp: {
      enabled: true,
      bulge: 0.50,
      edgeDarken: 0.12
    },
    monitorBezel: {
      enabled: true,
      thickness: 20,
      bezelColor: '#10141d'
    },
    scanlines: {
      enabled: true,
      opacity: 0.38,
      lineSpacing: 3
    },
    chromaticAberration: {
      enabled: true,
      shiftAmount: 2
    },
    phosphorDotGrid: {
      enabled: true,
      opacity: 0.28
    },
    vignette: {
      enabled: true,
      strength: 0.65,
      roundness: 0.70,
      falloff: 0.50,
      color: '#000000'
    },
    screenGlare: {
      enabled: true,
      opacity: 0.10,
      size: 0.32,
      positionX: 0.30,
      positionY: 0.25
    },
    animations: {
      glitch: {
        enabled: false,
        intensity: 0.15,
        frequency: 0.10
      },
      jitter: {
        enabled: true,
        amount: 0.8
      },
      flicker: {
        enabled: true,
        intensity: 0.12
      },
      scanlineRoll: {
        enabled: false,
        speed: 0.6,
        intensity: 0.15
      },
      staticNoise: {
        enabled: true,
        intensity: 0.08
      },
      powerProgress: 1.0
    }
  },

  TERMINAL: {
    screenWarp: {
      enabled: true,
      bulge: 0.90,
      edgeDarken: 0.25
    },
    monitorBezel: {
      enabled: true,
      thickness: 26,
      bezelColor: '#0a0d10'
    },
    scanlines: {
      enabled: true,
      opacity: 0.55,
      lineSpacing: 2
    },
    chromaticAberration: {
      enabled: false,
      shiftAmount: 0
    },
    phosphorDotGrid: {
      enabled: true,
      opacity: 0.42
    },
    vignette: {
      enabled: true,
      strength: 0.92,
      roundness: 0.60,
      falloff: 0.35,
      color: '#000000'
    },
    screenGlare: {
      enabled: false,
      opacity: 0.10,
      size: 0.30,
      positionX: 0.30,
      positionY: 0.25
    },
    animations: {
      glitch: {
        enabled: true,
        intensity: 0.20,
        frequency: 0.12
      },
      jitter: {
        enabled: false,
        amount: 0.5
      },
      flicker: {
        enabled: true,
        intensity: 0.22
      },
      scanlineRoll: {
        enabled: false,
        speed: 1.0,
        intensity: 0.15
      },
      staticNoise: {
        enabled: false,
        intensity: 0.08
      },
      powerProgress: 1.0
    }
  },

  'AMBER CRT': {
    screenWarp: {
      enabled: true,
      bulge: 0.80,
      edgeDarken: 0.20
    },
    monitorBezel: {
      enabled: true,
      thickness: 22,
      bezelColor: '#120f0a'
    },
    scanlines: {
      enabled: true,
      opacity: 0.50,
      lineSpacing: 2
    },
    chromaticAberration: {
      enabled: false,
      shiftAmount: 0
    },
    phosphorDotGrid: {
      enabled: true,
      opacity: 0.35
    },
    vignette: {
      enabled: true,
      strength: 0.88,
      roundness: 0.65,
      falloff: 0.40,
      color: '#1a0d00'
    },
    screenGlare: {
      enabled: true,
      opacity: 0.08,
      size: 0.28,
      positionX: 0.32,
      positionY: 0.24
    },
    animations: {
      glitch: {
        enabled: false,
        intensity: 0.15,
        frequency: 0.08
      },
      jitter: {
        enabled: false,
        amount: 0.4
      },
      flicker: {
        enabled: true,
        intensity: 0.18
      },
      scanlineRoll: {
        enabled: false,
        speed: 0.8,
        intensity: 0.12
      },
      staticNoise: {
        enabled: true,
        intensity: 0.06
      },
      powerProgress: 1.0
    }
  },

  CYBERPUNK: {
    screenWarp: {
      enabled: true,
      bulge: 0.85,
      edgeDarken: 0.22
    },
    monitorBezel: {
      enabled: true,
      thickness: 16,
      bezelColor: '#090d16'
    },
    scanlines: {
      enabled: true,
      opacity: 0.50,
      lineSpacing: 2
    },
    chromaticAberration: {
      enabled: true,
      shiftAmount: 6
    },
    phosphorDotGrid: {
      enabled: true,
      opacity: 0.35
    },
    vignette: {
      enabled: true,
      strength: 0.85,
      roundness: 0.75,
      falloff: 0.38,
      color: '#020008'
    },
    screenGlare: {
      enabled: true,
      opacity: 0.15,
      size: 0.45,
      positionX: 0.25,
      positionY: 0.25
    },
    animations: {
      glitch: {
        enabled: true,
        intensity: 0.65,
        frequency: 0.55
      },
      jitter: {
        enabled: true,
        amount: 3.2
      },
      flicker: {
        enabled: true,
        intensity: 0.30
      },
      scanlineRoll: {
        enabled: true,
        speed: 2.2,
        intensity: 0.55
      },
      staticNoise: {
        enabled: true,
        intensity: 0.32
      },
      powerProgress: 1.0
    }
  },

  MILD: {
    screenWarp: {
      enabled: true,
      bulge: 0.25,
      edgeDarken: 0.06
    },
    monitorBezel: {
      enabled: true,
      thickness: 12,
      bezelColor: '#0e1117'
    },
    scanlines: {
      enabled: true,
      opacity: 0.18,
      lineSpacing: 3
    },
    chromaticAberration: {
      enabled: true,
      shiftAmount: 2
    },
    phosphorDotGrid: {
      enabled: false,
      opacity: 0.20
    },
    vignette: {
      enabled: true,
      strength: 0.45,
      roundness: 0.70,
      falloff: 0.60,
      color: '#000000'
    },
    screenGlare: {
      enabled: true,
      opacity: 0.08,
      size: 0.30,
      positionX: 0.30,
      positionY: 0.25
    },
    animations: {
      glitch: {
        enabled: false,
        intensity: 0.15,
        frequency: 0.05
      },
      jitter: {
        enabled: false,
        amount: 0.0
      },
      flicker: {
        enabled: false,
        intensity: 0.05
      },
      scanlineRoll: {
        enabled: false,
        speed: 0.5,
        intensity: 0.10
      },
      staticNoise: {
        enabled: false,
        intensity: 0.05
      },
      powerProgress: 1.0
    }
  }
};

// Individual named exports for tree-shaking (opt 7)
// Bundlers can eliminate unused presets when only these are imported.
export const PRESET_ARCADE = PRESETS.ARCADE;
export const PRESET_RETRO_TV = PRESETS['RETRO TV'];
export const PRESET_BROADCAST_PVM = PRESETS['BROADCAST PVM'];
export const PRESET_VHS_TAPE = PRESETS['VHS TAPE'];
export const PRESET_COMMODORE = PRESETS.COMMODORE;
export const PRESET_TERMINAL = PRESETS.TERMINAL;
export const PRESET_AMBER_CRT = PRESETS['AMBER CRT'];
export const PRESET_CYBERPUNK = PRESETS.CYBERPUNK;
export const PRESET_MILD = PRESETS.MILD;

