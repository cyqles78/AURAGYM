
import React, { useEffect, useRef } from 'react';

export const Confetti: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#FFD700', '#30D158', '#0A84FF', '#FF375F', '#FFFFFF'];
    const particles: any[] = [];
    const particleCount = 150;

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 3,
        vx: (Math.random() - 0.5) * 15, // Horizontal spread
        vy: (Math.random() - 0.5) * 15 - 5, // Upward burst
        size: Math.random() * 6 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        life: 1, // Opacity/Life
        decay: Math.random() * 0.01 + 0.005
      });
    }

    let animationId: number;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let activeParticles = 0;

      particles.forEach((p) => {
        if (p.life > 0) {
          activeParticles++;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.3; // Gravity
          p.vx *= 0.96; // Drag
          p.life -= p.decay;

          ctx.globalAlpha = Math.max(0, p.life);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      if (activeParticles > 0) {
        animationId = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };

    animate();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-[100]"
    />
  );
};
