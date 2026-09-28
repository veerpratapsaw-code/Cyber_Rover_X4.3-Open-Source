import React, { useEffect, useRef } from 'react';

export default function CyberGridCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animationFrameId;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetMouseX = mouseX;
    let targetMouseY = mouseY;
    let scrollY = window.scrollY;

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e) => {
      targetMouseX = e.clientX;
      targetMouseY = e.clientY;
    };

    const handleScroll = () => {
      scrollY = window.scrollY || window.pageYOffset || 0;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });

    // Generate 3D stars / depth nodes with high dynamic depth range
    const particleCount = 130;
    const particles = Array.from({ length: particleCount }, () => ({
      x: (Math.random() - 0.5) * width * 2.2,
      y: (Math.random() - 0.5) * height * 2.2,
      z: Math.random() * 950 + 100,
      size: Math.random() * 1.8 + 0.6,
      alpha: Math.random() * 0.6 + 0.2
    }));

    const render = () => {
      // Smooth lerp mouse tracking
      mouseX += (targetMouseX - mouseX) * 0.06;
      mouseY += (targetMouseY - mouseY) * 0.06;

      ctx.clearRect(0, 0, width, height);

      const fov = 450;
      // Enhanced 3D focal offset for a tangible, premium depth effect
      const cx = width / 2 + (mouseX - width / 2) * 0.16;
      const cy = height / 2 + (mouseY - height / 2) * 0.16;

      const projectedPoints = [];

      // Render 3D depth particles
      particles.forEach((p) => {
        // Dynamic scroll offset
        const effectiveY = p.y - (scrollY * 0.22) % (height * 2.2);
        const scale = fov / (fov + p.z);
        const x2d = cx + p.x * scale;
        const y2d = cy + effectiveY * scale;

        if (x2d >= -20 && x2d <= width + 20 && y2d >= -20 && y2d <= height + 20) {
          projectedPoints.push({ x: x2d, y: y2d, scale, alpha: p.alpha });

          ctx.beginPath();
          ctx.arc(x2d, y2d, p.size * scale * 1.6, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 217, 255, ${p.alpha * scale * 1.1})`;
          ctx.fill();
        }
      });

      // Subtle dynamic 3D interconnect lines between nearby particles
      ctx.lineWidth = 0.6;
      const len = projectedPoints.length;
      for (let i = 0; i < len; i += 2) {
        for (let j = i + 1; j < Math.min(i + 8, len); j++) {
          const dx = projectedPoints[i].x - projectedPoints[j].x;
          const dy = projectedPoints[i].y - projectedPoints[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const lineAlpha = (1 - dist / 110) * 0.07 * projectedPoints[i].scale;
            ctx.beginPath();
            ctx.moveTo(projectedPoints[i].x, projectedPoints[i].y);
            ctx.lineTo(projectedPoints[j].x, projectedPoints[j].y);
            ctx.strokeStyle = `rgba(0, 217, 255, ${lineAlpha})`;
            ctx.stroke();
          }
        }
      }

      // Draw 3D horizon grid with responsive perspective
      const gridHorizon = height * 0.72 + (mouseY - height / 2) * 0.1;
      const gridVanishingX = cx;

      ctx.strokeStyle = 'rgba(0, 217, 255, 0.04)';
      ctx.lineWidth = 1;

      for (let i = -14; i <= 14; i++) {
        ctx.beginPath();
        ctx.moveTo(gridVanishingX, gridHorizon);
        ctx.lineTo(gridVanishingX + i * (width / 7.5), height);
        ctx.stroke();
      }

      for (let y = gridHorizon; y < height; y += (height - gridHorizon) / 7) {
        const progress = (y - gridHorizon) / (height - gridHorizon);
        ctx.strokeStyle = `rgba(0, 217, 255, ${progress * 0.05})`;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.9
      }}
    />
  );
}
