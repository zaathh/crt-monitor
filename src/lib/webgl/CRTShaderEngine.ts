// Hardware-Accelerated WebGL CRT Post-Processing Engine with Full Retro Animation Suite
import { type CRTSettings } from '../types.js';

// Shallow comparison for a flat object (one level deep, primitives only)
function shallowEq(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  const keysA = Object.keys(a);
  if (keysA.length !== Object.keys(b).length) return false;
  for (const k of keysA) {
    if (a[k] !== b[k]) return false;
  }
  return true;
}

export class CRTShaderEngine {
  private readonly gl: WebGLRenderingContext;
  private readonly program: WebGLProgram;
  private readonly texture: WebGLTexture;

  // Uniform locations
  private readonly uResolution: WebGLUniformLocation;
  private readonly uTime: WebGLUniformLocation;

  private readonly uWarpEnabled: WebGLUniformLocation;
  private readonly uWarpBulge: WebGLUniformLocation;
  private readonly uWarpEdgeDarken: WebGLUniformLocation;

  private readonly uBezelEnabled: WebGLUniformLocation;
  private readonly uBezelThickness: WebGLUniformLocation;
  private readonly uBezelColor: WebGLUniformLocation;

  private readonly uScanlinesEnabled: WebGLUniformLocation;
  private readonly uScanlinesOpacity: WebGLUniformLocation;
  private readonly uScanlinesSpacing: WebGLUniformLocation;

  private readonly uChromAberrEnabled: WebGLUniformLocation;
  private readonly uChromAberrShift: WebGLUniformLocation;

  private readonly uDotGridEnabled: WebGLUniformLocation;
  private readonly uDotGridOpacity: WebGLUniformLocation;

  // Expanded Vignette
  private readonly uVignetteEnabled: WebGLUniformLocation;
  private readonly uVignetteStrength: WebGLUniformLocation;
  private readonly uVignetteRoundness: WebGLUniformLocation;
  private readonly uVignetteFalloff: WebGLUniformLocation;
  private readonly uVignetteColor: WebGLUniformLocation;

  // Expanded Glare
  private readonly uGlareEnabled: WebGLUniformLocation;
  private readonly uGlareOpacity: WebGLUniformLocation;
  private readonly uGlareSize: WebGLUniformLocation;
  private readonly uGlarePos: WebGLUniformLocation;

  // Animation Suite
  private readonly uGlitchEnabled: WebGLUniformLocation;
  private readonly uGlitchIntensity: WebGLUniformLocation;
  private readonly uGlitchFrequency: WebGLUniformLocation;

  private readonly uJitterEnabled: WebGLUniformLocation;
  private readonly uJitterAmount: WebGLUniformLocation;

  private readonly uFlickerEnabled: WebGLUniformLocation;
  private readonly uFlickerIntensity: WebGLUniformLocation;

  private readonly uRollEnabled: WebGLUniformLocation;
  private readonly uRollSpeed: WebGLUniformLocation;
  private readonly uRollIntensity: WebGLUniformLocation;

  private readonly uNoiseEnabled: WebGLUniformLocation;
  private readonly uNoiseIntensity: WebGLUniformLocation;

  private readonly uPowerProgress: WebGLUniformLocation;

  // Opt 3: parseColor cache
  private lastBezelHex = '';
  private lastVignetteHex = '';
  private cachedBezelColor: [number, number, number] = [0, 0, 0];
  private cachedVignetteColor: [number, number, number] = [0, 0, 0];

  // Opt 6: Dirty-check cache
  private lastSettings: CRTSettings | null = null;
  private lastWidth = 0;
  private lastHeight = 0;

  // Opt B: Track texture dimensions to switch texImage2D → texSubImage2D after first upload
  private texW = 0;
  private texH = 0;

  constructor(displayCanvas: HTMLCanvasElement) {
    // Opt 2: antialias:false — no benefit in shader post-processing, frees GPU MSAA
    const gl = displayCanvas.getContext('webgl', { alpha: true, antialias: false });
    if (!gl) throw new Error('WebGL not supported for CRT Shader');
    this.gl = gl;

    const vsSource = `
      attribute vec2 a_pos;
      varying vec2 v_uv;
      void main() {
        v_uv = (a_pos + 1.0) * 0.5;
        v_uv.y = 1.0 - v_uv.y;
        gl_Position = vec4(a_pos, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision mediump float;
      uniform sampler2D u_tex;
      uniform vec2 u_resolution;
      uniform float u_time;
      uniform bool u_warpEnabled;
      uniform float u_warpBulge;
      uniform float u_warpEdgeDarken;
      uniform bool u_bezelEnabled;
      uniform float u_bezelThickness;
      uniform vec3 u_bezelColor;
      uniform bool u_scanlinesEnabled;
      uniform float u_scanlinesOpacity;
      uniform float u_scanlinesSpacing;
      uniform bool u_chromAberrEnabled;
      uniform float u_chromAberrShift;
      uniform bool u_dotGridEnabled;
      uniform float u_dotGridOpacity;
      uniform bool u_vignetteEnabled;
      uniform float u_vignetteStrength;
      uniform float u_vignetteRoundness;
      uniform float u_vignetteFalloff;
      uniform vec3 u_vignetteColor;
      uniform bool u_glareEnabled;
      uniform float u_glareOpacity;
      uniform float u_glareSize;
      uniform vec2 u_glarePos;
      uniform bool u_glitchEnabled;
      uniform float u_glitchIntensity;
      uniform float u_glitchFrequency;
      uniform bool u_jitterEnabled;
      uniform float u_jitterAmount;
      uniform bool u_flickerEnabled;
      uniform float u_flickerIntensity;
      uniform bool u_rollEnabled;
      uniform float u_rollSpeed;
      uniform float u_rollIntensity;
      uniform bool u_noiseEnabled;
      uniform float u_noiseIntensity;
      uniform float u_powerProgress;
      varying vec2 v_uv;

      float hash12(vec2 p) {
        vec3 p3 = fract(vec3(p.xyx) * 0.1031);
        p3 += dot(p3, p3.yzx + 33.33);
        return fract((p3.x + p3.y) * p3.z);
      }

      void main() {
        vec2 p = (v_uv - 0.5) * u_resolution;
        vec2 halfSize = u_resolution * 0.5;
        if (u_bezelEnabled) {
          float thickness = max(0.0, u_bezelThickness);
          halfSize = max(vec2(10.0), (u_resolution * 0.5) - vec2(thickness));
        }
        vec2 dBox = abs(p) - halfSize;
        float screenSDF = max(dBox.x, dBox.y);
        if (u_bezelEnabled && screenSDF > 0.0) {
          gl_FragColor = vec4(u_bezelColor, 1.0);
          return;
        }
        vec2 innerCoord = p / halfSize;
        if (u_jitterEnabled && u_jitterAmount > 0.01) {
          float jitterTime = floor(u_time * 30.0);
          float jx = (hash12(vec2(jitterTime, 1.0)) - 0.5) * (u_jitterAmount / u_resolution.x) * 2.0;
          float jy = (hash12(vec2(jitterTime, 2.0)) - 0.5) * (u_jitterAmount / u_resolution.y) * 2.0;
          innerCoord += vec2(jx, jy);
        }
        if (u_powerProgress < 0.999) {
          if (u_powerProgress <= 0.001) {
            gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
            return;
          }
          float pProgY = clamp(u_powerProgress * 2.2, 0.002, 1.0);
          float pProgX = clamp((u_powerProgress - 0.4) * 2.0, 0.002, 1.0);
          if (abs(innerCoord.x) > pProgX || abs(innerCoord.y) > pProgY) {
            gl_FragColor = vec4(u_bezelEnabled ? u_bezelColor : vec3(0.0), 1.0);
            return;
          }
          innerCoord.y /= pProgY;
          innerCoord.x /= pProgX;
        }
        float currentWarp = u_warpBulge * (u_powerProgress < 0.999 ? smoothstep(0.7, 1.0, u_powerProgress) : 1.0);
        if (u_warpEnabled && currentWarp > 0.001) {
          float d = dot(innerCoord, innerCoord);
          float k1 = currentWarp * 0.09;
          float k2 = currentWarp * 0.03;
          innerCoord = innerCoord * (1.0 + k1 * d + k2 * d * d);
          float scale = 1.0 + (currentWarp * 0.14);
          innerCoord = innerCoord / scale;
        }
        vec2 uv = innerCoord * 0.5 + 0.5;
        if (u_glitchEnabled && u_glitchIntensity > 0.01) {
          float glitchTime = floor(u_time * 12.0);
          float isGlitchTime = step(1.0 - u_glitchFrequency * 0.5, hash12(vec2(glitchTime, 12.34)));
          if (isGlitchTime > 0.5) {
            float lineBlock = floor(uv.y * 32.0);
            float lineRand = hash12(vec2(lineBlock, glitchTime));
            if (lineRand > 0.65) {
              float shift = (lineRand - 0.5) * u_glitchIntensity * 0.08;
              uv.x += shift;
            }
          }
        }
        if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
          gl_FragColor = vec4(u_bezelEnabled ? u_bezelColor : vec3(0.0), 1.0);
          return;
        }
        vec3 col;
        if (u_chromAberrEnabled && u_chromAberrShift > 0.1) {
          float shift = (u_chromAberrShift / u_resolution.x) * 1.5;
          float distCenter = distance(uv, vec2(0.5));
          float r = texture2D(u_tex, uv + vec2(distCenter * shift, 0.0)).r;
          float g = texture2D(u_tex, uv).g;
          float b = texture2D(u_tex, uv - vec2(distCenter * shift, 0.0)).b;
          col = vec3(r, g, b);
        } else {
          col = texture2D(u_tex, uv).rgb;
        }
        if (u_scanlinesEnabled && u_scanlinesOpacity > 0.01) {
          float spacing = max(1.0, u_scanlinesSpacing);
          float scanY = uv.y * u_resolution.y;
          float scan = sin((scanY / spacing) * 3.14159);
          float scanFactor = 1.0 - (u_scanlinesOpacity * (0.5 - 0.5 * scan));
          col *= scanFactor;
        }
        if (u_rollEnabled && u_rollIntensity > 0.01) {
          float rollY = uv.y - u_time * u_rollSpeed * 0.4;
          float rollWave = sin(rollY * 6.28318);
          float rollFactor = 1.0 - (u_rollIntensity * 0.35 * (0.5 - 0.5 * rollWave));
          col *= rollFactor;
        }
        if (u_dotGridEnabled && u_dotGridOpacity > 0.01) {
          float dotX = sin((uv.x * u_resolution.x) * 1.5708);
          float dotY = sin((uv.y * u_resolution.y) * 1.5708);
          float dotPattern = 0.5 * (dotX + dotY);
          float maskFactor = 1.0 - (u_dotGridOpacity * (0.5 - 0.5 * dotPattern));
          col *= maskFactor;
        }
        if (u_flickerEnabled && u_flickerIntensity > 0.01) {
          float flicker = 1.0 - (u_flickerIntensity * 0.06 * sin(u_time * 58.0) * sin(u_time * 23.0));
          col *= flicker;
        }
        if (u_noiseEnabled && u_noiseIntensity > 0.01) {
          float n = hash12(gl_FragCoord.xy + vec2(u_time * 133.7, u_time * 47.1));
          col += vec3((n - 0.5) * u_noiseIntensity * 0.3);
        }
        if (u_vignetteEnabled) {
          float boxVig = uv.x * (1.0 - uv.x) * uv.y * (1.0 - uv.y) * 16.0;
          boxVig = clamp(boxVig, 0.0, 1.0);
          float distCenter = distance(uv, vec2(0.5)) * 1.414;
          float radVig = clamp(1.0 - distCenter, 0.0, 1.0);
          float rawVig = mix(boxVig, radVig, clamp(u_vignetteRoundness, 0.0, 1.0));
          float vigCurve = pow(rawVig, mix(0.15, 0.85, clamp(u_vignetteFalloff, 0.0, 1.0)));
          float vigFactor = mix(1.0, vigCurve, clamp(u_vignetteStrength, 0.0, 1.0));
          col = mix(u_vignetteColor, col, vigFactor);
        }
        if (u_warpEnabled && u_warpEdgeDarken > 0.01) {
          float edgeDist = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
          float darken = smoothstep(0.0, 0.15, edgeDist);
          col *= mix(1.0 - u_warpEdgeDarken, 1.0, darken);
        }
        if (u_glareEnabled && u_glareOpacity > 0.01) {
          vec2 glareUV = uv - u_glarePos;
          float spread = mix(35.0, 4.0, clamp(u_glareSize, 0.05, 1.0));
          float glare = exp(-dot(glareUV, glareUV) * spread) * u_glareOpacity;
          col += vec3(glare * 0.85, glare * 0.95, glare);
        }
        if (u_powerProgress < 0.95 && u_powerProgress > 0.01) {
          float collapseIntensity = (1.0 - u_powerProgress);
          float luma = dot(col, vec3(0.299, 0.587, 0.114));
          vec3 whiteCol = vec3(luma * 1.4 + 0.2);
          col = mix(col, whiteCol, clamp(collapseIntensity * 1.5, 0.0, 1.0));
          col += vec3(collapseIntensity * 0.9);
        }
        gl_FragColor = vec4(col, 1.0);
      }
    `;

    this.program = this.createProgram(vsSource, fsSource);
    gl.useProgram(this.program);

    this.uResolution = gl.getUniformLocation(this.program, 'u_resolution')!;
    this.uTime = gl.getUniformLocation(this.program, 'u_time')!;
    this.uWarpEnabled = gl.getUniformLocation(this.program, 'u_warpEnabled')!;
    this.uWarpBulge = gl.getUniformLocation(this.program, 'u_warpBulge')!;
    this.uWarpEdgeDarken = gl.getUniformLocation(this.program, 'u_warpEdgeDarken')!;
    this.uBezelEnabled = gl.getUniformLocation(this.program, 'u_bezelEnabled')!;
    this.uBezelThickness = gl.getUniformLocation(this.program, 'u_bezelThickness')!;
    this.uBezelColor = gl.getUniformLocation(this.program, 'u_bezelColor')!;
    this.uScanlinesEnabled = gl.getUniformLocation(this.program, 'u_scanlinesEnabled')!;
    this.uScanlinesOpacity = gl.getUniformLocation(this.program, 'u_scanlinesOpacity')!;
    this.uScanlinesSpacing = gl.getUniformLocation(this.program, 'u_scanlinesSpacing')!;
    this.uChromAberrEnabled = gl.getUniformLocation(this.program, 'u_chromAberrEnabled')!;
    this.uChromAberrShift = gl.getUniformLocation(this.program, 'u_chromAberrShift')!;
    this.uDotGridEnabled = gl.getUniformLocation(this.program, 'u_dotGridEnabled')!;
    this.uDotGridOpacity = gl.getUniformLocation(this.program, 'u_dotGridOpacity')!;
    this.uVignetteEnabled = gl.getUniformLocation(this.program, 'u_vignetteEnabled')!;
    this.uVignetteStrength = gl.getUniformLocation(this.program, 'u_vignetteStrength')!;
    this.uVignetteRoundness = gl.getUniformLocation(this.program, 'u_vignetteRoundness')!;
    this.uVignetteFalloff = gl.getUniformLocation(this.program, 'u_vignetteFalloff')!;
    this.uVignetteColor = gl.getUniformLocation(this.program, 'u_vignetteColor')!;
    this.uGlareEnabled = gl.getUniformLocation(this.program, 'u_glareEnabled')!;
    this.uGlareOpacity = gl.getUniformLocation(this.program, 'u_glareOpacity')!;
    this.uGlareSize = gl.getUniformLocation(this.program, 'u_glareSize')!;
    this.uGlarePos = gl.getUniformLocation(this.program, 'u_glarePos')!;
    this.uGlitchEnabled = gl.getUniformLocation(this.program, 'u_glitchEnabled')!;
    this.uGlitchIntensity = gl.getUniformLocation(this.program, 'u_glitchIntensity')!;
    this.uGlitchFrequency = gl.getUniformLocation(this.program, 'u_glitchFrequency')!;
    this.uJitterEnabled = gl.getUniformLocation(this.program, 'u_jitterEnabled')!;
    this.uJitterAmount = gl.getUniformLocation(this.program, 'u_jitterAmount')!;
    this.uFlickerEnabled = gl.getUniformLocation(this.program, 'u_flickerEnabled')!;
    this.uFlickerIntensity = gl.getUniformLocation(this.program, 'u_flickerIntensity')!;
    this.uRollEnabled = gl.getUniformLocation(this.program, 'u_rollEnabled')!;
    this.uRollSpeed = gl.getUniformLocation(this.program, 'u_rollSpeed')!;
    this.uRollIntensity = gl.getUniformLocation(this.program, 'u_rollIntensity')!;
    this.uNoiseEnabled = gl.getUniformLocation(this.program, 'u_noiseEnabled')!;
    this.uNoiseIntensity = gl.getUniformLocation(this.program, 'u_noiseIntensity')!;
    this.uPowerProgress = gl.getUniformLocation(this.program, 'u_powerProgress')!;

    const posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]), gl.STATIC_DRAW);

    const aPos = gl.getAttribLocation(this.program, 'a_pos');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const tex = gl.createTexture();
    if (!tex) throw new Error('Failed to create WebGL texture');
    this.texture = tex;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  }

  public render(
    source: HTMLCanvasElement | HTMLImageElement | HTMLVideoElement,
    settings: CRTSettings,
    time: number = 0
  ): void {
    const gl = this.gl;
    const prev = this.lastSettings;
    const w = gl.canvas.width;
    const h = gl.canvas.height;

    gl.viewport(0, 0, w, h);
    gl.useProgram(this.program);

    // Opt B: Use texImage2D only when texture dimensions change, texSubImage2D otherwise (no realloc)
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    const srcW = (source as HTMLCanvasElement).width || (source as HTMLVideoElement).videoWidth || (source as HTMLImageElement).naturalWidth || 1;
    const srcH = (source as HTMLCanvasElement).height || (source as HTMLVideoElement).videoHeight || (source as HTMLImageElement).naturalHeight || 1;
    if (srcW !== this.texW || srcH !== this.texH) {
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      this.texW = srcW;
      this.texH = srcH;
    } else {
      gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, gl.RGBA, gl.UNSIGNED_BYTE, source);
    }

    // Always upload time (changes every frame)
    gl.uniform1f(this.uTime, time);

    // Upload resolution only when canvas size changes (Opt 6)
    if (w !== this.lastWidth || h !== this.lastHeight) {
      gl.uniform2f(this.uResolution, w, h);
      this.lastWidth = w;
      this.lastHeight = h;
    }

    // Opt 3: Only re-parse hex color when string changes
    if (settings.monitorBezel.bezelColor !== this.lastBezelHex) {
      this.cachedBezelColor = this.parseColor(settings.monitorBezel.bezelColor);
      this.lastBezelHex = settings.monitorBezel.bezelColor;
    }
    if (settings.vignette.color !== this.lastVignetteHex) {
      this.cachedVignetteColor = this.parseColor(settings.vignette.color);
      this.lastVignetteHex = settings.vignette.color;
    }

    // Opt 6: Per-group dirty-checking — only upload changed uniform groups
    const sw = settings.screenWarp;
    if (!prev || !shallowEq(sw as unknown as Record<string, unknown>, prev.screenWarp as unknown as Record<string, unknown>)) {
      gl.uniform1i(this.uWarpEnabled, sw.enabled ? 1 : 0);
      gl.uniform1f(this.uWarpBulge, sw.bulge);
      gl.uniform1f(this.uWarpEdgeDarken, sw.edgeDarken);
    }

    const mb = settings.monitorBezel;
    if (!prev || !shallowEq(mb as unknown as Record<string, unknown>, prev.monitorBezel as unknown as Record<string, unknown>)) {
      gl.uniform1i(this.uBezelEnabled, mb.enabled ? 1 : 0);
      gl.uniform1f(this.uBezelThickness, mb.thickness);
      gl.uniform3f(this.uBezelColor, this.cachedBezelColor[0], this.cachedBezelColor[1], this.cachedBezelColor[2]);
    }

    const sl = settings.scanlines;
    if (!prev || !shallowEq(sl as unknown as Record<string, unknown>, prev.scanlines as unknown as Record<string, unknown>)) {
      gl.uniform1i(this.uScanlinesEnabled, sl.enabled ? 1 : 0);
      gl.uniform1f(this.uScanlinesOpacity, sl.opacity);
      gl.uniform1f(this.uScanlinesSpacing, sl.lineSpacing);
    }

    const ca = settings.chromaticAberration;
    if (!prev || !shallowEq(ca as unknown as Record<string, unknown>, prev.chromaticAberration as unknown as Record<string, unknown>)) {
      gl.uniform1i(this.uChromAberrEnabled, ca.enabled ? 1 : 0);
      gl.uniform1f(this.uChromAberrShift, ca.shiftAmount);
    }

    const dg = settings.phosphorDotGrid;
    if (!prev || !shallowEq(dg as unknown as Record<string, unknown>, prev.phosphorDotGrid as unknown as Record<string, unknown>)) {
      gl.uniform1i(this.uDotGridEnabled, dg.enabled ? 1 : 0);
      gl.uniform1f(this.uDotGridOpacity, dg.opacity);
    }

    const vig = settings.vignette;
    if (!prev || !shallowEq(vig as unknown as Record<string, unknown>, prev.vignette as unknown as Record<string, unknown>)) {
      gl.uniform1i(this.uVignetteEnabled, vig.enabled ? 1 : 0);
      gl.uniform1f(this.uVignetteStrength, vig.strength);
      gl.uniform1f(this.uVignetteRoundness, vig.roundness);
      gl.uniform1f(this.uVignetteFalloff, vig.falloff);
      gl.uniform3f(this.uVignetteColor, this.cachedVignetteColor[0], this.cachedVignetteColor[1], this.cachedVignetteColor[2]);
    }

    const sg = settings.screenGlare;
    if (!prev || !shallowEq(sg as unknown as Record<string, unknown>, prev.screenGlare as unknown as Record<string, unknown>)) {
      gl.uniform1i(this.uGlareEnabled, sg.enabled ? 1 : 0);
      gl.uniform1f(this.uGlareOpacity, sg.opacity);
      gl.uniform1f(this.uGlareSize, sg.size);
      gl.uniform2f(this.uGlarePos, sg.positionX, sg.positionY);
    }

    const anim = settings.animations;
    const panim = prev?.animations;

    const gl2 = anim.glitch;
    if (!prev || !panim || !shallowEq(gl2 as unknown as Record<string, unknown>, panim.glitch as unknown as Record<string, unknown>)) {
      gl.uniform1i(this.uGlitchEnabled, gl2.enabled ? 1 : 0);
      gl.uniform1f(this.uGlitchIntensity, gl2.intensity);
      gl.uniform1f(this.uGlitchFrequency, gl2.frequency);
    }

    const jit = anim.jitter;
    if (!prev || !panim || !shallowEq(jit as unknown as Record<string, unknown>, panim.jitter as unknown as Record<string, unknown>)) {
      gl.uniform1i(this.uJitterEnabled, jit.enabled ? 1 : 0);
      gl.uniform1f(this.uJitterAmount, jit.amount);
    }

    const flk = anim.flicker;
    if (!prev || !panim || !shallowEq(flk as unknown as Record<string, unknown>, panim.flicker as unknown as Record<string, unknown>)) {
      gl.uniform1i(this.uFlickerEnabled, flk.enabled ? 1 : 0);
      gl.uniform1f(this.uFlickerIntensity, flk.intensity);
    }

    const rol = anim.scanlineRoll;
    if (!prev || !panim || !shallowEq(rol as unknown as Record<string, unknown>, panim.scanlineRoll as unknown as Record<string, unknown>)) {
      gl.uniform1i(this.uRollEnabled, rol.enabled ? 1 : 0);
      gl.uniform1f(this.uRollSpeed, rol.speed);
      gl.uniform1f(this.uRollIntensity, rol.intensity);
    }

    const nos = anim.staticNoise;
    if (!prev || !panim || !shallowEq(nos as unknown as Record<string, unknown>, panim.staticNoise as unknown as Record<string, unknown>)) {
      gl.uniform1i(this.uNoiseEnabled, nos.enabled ? 1 : 0);
      gl.uniform1f(this.uNoiseIntensity, nos.intensity);
    }

    // powerProgress animates — always upload
    gl.uniform1f(this.uPowerProgress, anim.powerProgress ?? 1.0);

    this.lastSettings = settings;
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  private parseColor(hex: string): [number, number, number] {
    if (hex && hex.startsWith('#')) {
      const clean = hex.slice(1);
      if (clean.length === 6) {
        return [
          parseInt(clean.slice(0, 2), 16) / 255,
          parseInt(clean.slice(2, 4), 16) / 255,
          parseInt(clean.slice(4, 6), 16) / 255
        ];
      }
    }
    return [0.0, 0.0, 0.0];
  }

  private createProgram(vsSource: string, fsSource: string): WebGLProgram {
    const gl = this.gl;
    const vs = this.compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = this.compileShader(gl.FRAGMENT_SHADER, fsSource);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      throw new Error(`Shader Link Error: ${gl.getProgramInfoLog(prog)}`);
    }
    return prog;
  }

  private compileShader(type: number, source: string): WebGLShader {
    const gl = this.gl;
    const s = gl.createShader(type)!;
    gl.shaderSource(s, source);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      throw new Error(`Shader Compile Error: ${gl.getShaderInfoLog(s)}`);
    }
    return s;
  }
}
