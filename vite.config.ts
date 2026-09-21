import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// Custom Vite plugin: strips whitespace/comments from inline GLSL strings AND
// renames long GLSL local variable names to short 2-char names at build time.
// esbuild cannot minify inside template literals, so this does it manually.
function glslMinifyPlugin() {
  // Map of GLSL local variable names to their short replacements.
  // Only renames user-defined locals — uniforms (u_*), varyings (v_*),
  // attributes (a_*), built-ins (gl_*), GLSL keywords and functions are untouched.
  const RENAME_MAP: Record<string, string> = {
    halfSize: 'hs', thickness: 'tk', screenSDF: 'xs', innerCoord: 'ic',
    jitterTime: 'jt', pProgY: 'pY', pProgX: 'pX', currentWarp: 'cw',
    glitchTime: 'gT', isGlitchTime: 'iG', lineBlock: 'lB', lineRand: 'lR',
    scanFactor: 'sF', rollWave: 'rW', rollFactor: 'rF', dotPattern: 'dP',
    maskFactor: 'mF', boxVig: 'bV', distCenter: 'dC', radVig: 'rV',
    rawVig: 'rwV', vigCurve: 'vC', vigFactor: 'vF', edgeDist: 'eD',
    collapseIntensity: 'cI', whiteCol: 'wC', jitterAmount: 'jA',
    scanY: 'sY', rollY: 'rY', dotX: 'dX', dotY: 'dY',
    glareUV: 'gU', spread: 'sp',
  };

  return {
    name: 'glsl-minify',
    transform(code: string, id: string) {
      if (!id.includes('CRTShaderEngine')) return null;

      const result = code.replace(/(`[\s\S]*?`)/g, (match) => {
        if (!match.includes('void main') && !match.includes('precision')) return match;

        let m = match
          // Remove // single-line comments
          .replace(/[ \t]*\/\/[^\n]*/g, '')
          // Collapse 3+ blank lines into 1
          .replace(/\n{3,}/g, '\n')
          // Strip leading whitespace per line
          .replace(/\n[ \t]+/g, '\n')
          // Remove trailing whitespace
          .replace(/[ \t]+\n/g, '\n');

        // Opt A: Rename long GLSL local variable names to short equivalents
        for (const [from, to] of Object.entries(RENAME_MAP)) {
          // \b word boundary ensures we don't mangle substrings of longer names
          m = m.replace(new RegExp(`\\b${from}\\b`, 'g'), to);
        }

        return m;
      });

      return result === code ? null : { code: result, map: null };
    }
  };
}


export default defineConfig(({ mode }) => {
  const isLib = mode === 'lib';

  return {
    plugins: [glslMinifyPlugin(), react()],
    server: {
      port: 5173,
      open: false
    },
    build: isLib
      ? {
          lib: {
            entry: resolve(__dirname, 'src/lib/index.ts'),
            name: 'ZathCRTMonitor',
            formats: ['es', 'cjs'],
            fileName: (format) => `index.${format === 'es' ? 'js' : 'cjs'}`
          },
          rollupOptions: {
            external: ['react', 'react-dom'],
            output: {
              globals: {
                react: 'React',
                'react-dom': 'ReactDOM'
              }
            }
          }
        }
      : {
          outDir: 'dist'
        }
  };
});

