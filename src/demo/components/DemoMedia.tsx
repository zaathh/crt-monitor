import React, { useEffect, useRef } from 'react';

export const DemoMedia: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw a rich retro anime / synthwave illustration
    ctx.fillStyle = '#101424';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Sun
    const grad = ctx.createLinearGradient(400, 100, 400, 320);
    grad.addColorStop(0, '#f59e0b');
    grad.addColorStop(0.5, '#ec4899');
    grad.addColorStop(1, '#8b5cf6');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(400, 240, 120, 0, Math.PI * 2);
    ctx.fill();

    // Sun stripes
    ctx.fillStyle = '#101424';
    for (let y = 200; y < 360; y += 14) {
      const h = ((y - 200) / 160) * 8 + 2;
      ctx.fillRect(250, y, 300, h);
    }

    // Mountains
    ctx.fillStyle = '#1a1836';
    ctx.beginPath();
    ctx.moveTo(100, 360);
    ctx.lineTo(260, 220);
    ctx.lineTo(420, 360);
    ctx.fill();

    ctx.fillStyle = '#14122d';
    ctx.beginPath();
    ctx.moveTo(350, 360);
    ctx.lineTo(520, 250);
    ctx.lineTo(700, 360);
    ctx.fill();

    // 3D Perspective Grid
    ctx.strokeStyle = '#00e5ff';
    ctx.lineWidth = 1.5;
    for (let y = 360; y < 500; y += 18) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(800, y);
      ctx.stroke();
    }
    for (let x = -200; x <= 1000; x += 60) {
      ctx.beginPath();
      ctx.moveTo(400, 360);
      ctx.lineTo(x, 500);
      ctx.stroke();
    }

    // Title
    ctx.font = '22px "Press Start 2P", monospace';
    ctx.fillStyle = '#00ff88';
    ctx.textAlign = 'center';
    ctx.fillText('NEO TOKYO // 1999', 400, 60);

    ctx.font = '11px "JetBrains Mono", monospace';
    ctx.fillStyle = '#00e5ff';
    ctx.fillText('// 24-BIT HIGH RESOLUTION CRT DISPLAY EMULATION //', 400, 95);
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
