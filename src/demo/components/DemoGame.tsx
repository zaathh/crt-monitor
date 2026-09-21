import React, { useEffect, useRef } from 'react';

export const DemoGame: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let ballX = 400;
    let ballY = 250;
    let vx = 5;
    let vy = 3.5;
    let p1Y = 220;
    let p2Y = 220;
    let animId = 0;

    const render = () => {
      ballX += vx;
      ballY += vy;

      if (ballY <= 20 || ballY >= canvas.height - 20) {
        vy = -vy;
      }
      if (ballX <= 30 || ballX >= canvas.width - 30) {
        vx = -vx;
      }

      // Smooth AI paddles
      p1Y += (ballY - (p1Y + 30)) * 0.08;
      p2Y += (ballY - (p2Y + 30)) * 0.07;

      // Draw Arcade Arena
      ctx.fillStyle = '#0f121d';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Arena Outer Border
      ctx.strokeStyle = '#3a445e';
      ctx.lineWidth = 4;
      ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

      // Center Line
      ctx.setLineDash([10, 10]);
      ctx.strokeStyle = '#2d3748';
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, 10);
      ctx.lineTo(canvas.width / 2, canvas.height - 10);
      ctx.stroke();
      ctx.setLineDash([]);

      // Top Scores
      ctx.font = '24px "Press Start 2P", monospace';
      ctx.fillStyle = '#4f78aa';
      ctx.fillText('07', canvas.width / 2 - 80, 50);
      ctx.fillStyle = '#c6535f';
      ctx.fillText('05', canvas.width / 2 + 40, 50);

      // Title
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillStyle = '#d8a548';
      ctx.textAlign = 'center';
      ctx.fillText(':: 1991 ARCADE CYBER PONG ::', canvas.width / 2, 85);
      ctx.textAlign = 'left';

      // Left Paddle (Blue)
      ctx.fillStyle = '#4f78aa';
      ctx.fillRect(20, p1Y, 14, 60);

      // Right Paddle (Red)
      ctx.fillStyle = '#c6535f';
      ctx.fillRect(canvas.width - 34, p2Y, 14, 60);

      // Ball (Glowing Amber)
      ctx.fillStyle = '#d8a548';
      ctx.beginPath();
      ctx.arc(ballX, ballY, 8, 0, Math.PI * 2);
      ctx.fill();

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
