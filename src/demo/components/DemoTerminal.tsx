import React, { useEffect, useRef } from 'react';

export const DemoTerminal: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let frame = 0;
    let animId = 0;

    const lines = [
      'SYS_INIT: TOKYO_ARCADE_NET V4.2.0 [ONLINE]',
      'SEC_KERNEL: PRIVACY_VERIFIED (0_EXT_CONN)',
      'WASM_CODEC: READY (AVIF, WEBP, MOZJPEG, OXIPNG)',
      'MEMORY_POOL: 4 WORKERS ACTIVE // HEAP LEAN',
      'ROLLBACK_ENGINE: PREDICTION BUFFER SYNCHRONIZED',
      '>> SCANNING SECTORS: 0x7FFE92A... [OK]',
      '>> RETRO_OS LOADED IN 12ms',
      'READY FOR INPUT. TYPE [HELP] FOR COMMANDS.'
    ];

    const render = () => {
      frame++;
      ctx.fillStyle = '#0a0d14';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Terminal Header
      ctx.fillStyle = '#161c28';
      ctx.fillRect(0, 0, canvas.width, 32);
      ctx.fillStyle = '#00ff88';
      ctx.font = '11px "JetBrains Mono", monospace';
      ctx.fillText('● TERMINAL // ROOT@NET-NODE-01', 16, 20);

      // Terminal Lines
      ctx.font = '12px "JetBrains Mono", monospace';
      ctx.fillStyle = '#00ff88';

      let y = 60;
      for (let i = 0; i < lines.length; i++) {
        ctx.fillText(lines[i], 20, y);
        y += 24;
      }

      // Blinking Cursor
      if (Math.floor(frame / 30) % 2 === 0) {
        ctx.fillStyle = '#00e5ff';
        ctx.fillRect(20, y - 10, 8, 14);
      }

      // Retro Matrix / Grid lines
      ctx.strokeStyle = 'rgba(0, 255, 136, 0.05)';
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
      width={800}
      height={500}
      style={{ width: '100%', height: '100%' }}
    />
  );
};
