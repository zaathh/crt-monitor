import React, { useEffect, useRef } from 'react';

const COMMANDS = [
  'npm i zath-crt-monitor',
  'import { CRTScreen } from "zath-crt-monitor";',
  'zath-crt --preset ARCADE --curvature',
  '<CRTScreen preset="ARCADE" />',
  'systemctl restart crt-shader-engine'
];

export const HeroTerminal: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    let cmdIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let pauseCounter = 0;
    let stepCounter = 0;

    const render = () => {
      stepCounter++;

      // Typewriter state machine
      const currentCmd = COMMANDS[cmdIdx];

      if (pauseCounter > 0) {
        pauseCounter--;
      } else {
        if (!isDeleting) {
          // Typing speed: 1 character every 4 frames (~65ms)
          if (stepCounter % 4 === 0) {
            charIdx++;
            if (charIdx >= currentCmd.length) {
              charIdx = currentCmd.length;
              // Pause at completed text for ~90 frames (1.5 seconds)
              pauseCounter = 90;
              isDeleting = true;
            }
          }
        } else {
          // Deleting / Backspacing speed: 1 character every 2 frames (~33ms)
          if (stepCounter % 2 === 0) {
            charIdx--;
            if (charIdx <= 0) {
              charIdx = 0;
              // Pause before next command for ~20 frames (0.33 seconds)
              pauseCounter = 20;
              isDeleting = false;
              cmdIdx = (cmdIdx + 1) % COMMANDS.length;
            }
          }
        }
      }

      // Background
      ctx.fillStyle = '#06090e';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Terminal Header Bar
      ctx.fillStyle = '#0e1420';
      ctx.fillRect(0, 0, canvas.width, 32);
      ctx.fillStyle = '#22c55e';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText('● TERMINAL // ROOT@CRT-CORE [ONLINE]', 16, 20);

      // Terminal System Output Lines
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.fillStyle = '#00ff88';

      const staticLines = [
        'SYS_BOOT: ZATH-CRT-MONITOR V1.0.0',
        'PIPELINE: WEBGL 2.0 MULTI-PASS GLSL',
        'SHADERS: SCANLINES / PHOSPHOR / WARP [OK]',
        'STATUS: REAL-TIME ANALOG DISPLAY ONLINE'
      ];

      let y = 62;
      for (let i = 0; i < staticLines.length; i++) {
        ctx.fillText(staticLines[i], 20, y);
        y += 24;
      }

      // Divider
      ctx.fillStyle = '#1a2433';
      ctx.fillRect(20, y - 6, canvas.width - 40, 1);
      y += 20;

      // Active Prompt Line with Typed Command
      const promptPrefix = 'root@crt-node:~$ ';
      ctx.font = '13px "JetBrains Mono", monospace';
      ctx.fillStyle = '#86efac';
      ctx.fillText(promptPrefix, 20, y);

      const prefixWidth = ctx.measureText(promptPrefix).width;
      const typedText = currentCmd.slice(0, charIdx);

      // Typed command in bright white
      ctx.fillStyle = '#f8fafc';
      ctx.fillText(typedText, 20 + prefixWidth, y);

      const typedWidth = ctx.measureText(typedText).width;

      // Blinking Terminal Cursor
      if (Math.floor(stepCounter / 25) % 2 === 0) {
        ctx.fillStyle = '#22c55e';
        ctx.fillRect(22 + prefixWidth + typedWidth, y - 11, 8, 14);
      }

      // Sub-hint
      ctx.font = '10.5px "JetBrains Mono", monospace';
      ctx.fillStyle = '#475569';
      ctx.fillText('// TYPEWRITER LOOP: TYPE > PAUSE > DELETE > NEXT', 20, y + 36);

      // Subtle phosphor scan/matrix grid lines
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.035)';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 32);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={720}
      height={450}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  );
};
