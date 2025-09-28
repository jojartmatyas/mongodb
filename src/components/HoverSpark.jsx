import React, { useEffect, useRef } from 'react';

// Egérkövető szikra / felvillanó szemcse effektek canvason
export default function HoverSpark({ colorA = 'rgba(188,140,55,0.9)', colorB = 'rgba(200,110,45,0.85)' }) {
  const ref = useRef(null);
  const particles = useRef([]);
  const pointer = useRef({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const lastEmit = useRef(0);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas.getContext('2d');
    let raf;

    function resize() {
      canvas.width = window.innerWidth * devicePixelRatio;
      canvas.height = window.innerHeight * devicePixelRatio;
      ctx.scale(devicePixelRatio, devicePixelRatio);
    }
    resize();
    window.addEventListener('resize', resize);

    function emit(x, y) {
      for (let i = 0; i < 4; i++) {
        const ang = Math.random() * Math.PI * 2;
        const sp = 40 + Math.random() * 80;
        particles.current.push({
          x,
          y,
            vx: Math.cos(ang) * sp,
            vy: Math.sin(ang) * sp,
          life: 0,
          max: 600 + Math.random() * 400,
          size: 2 + Math.random() * 2.5,
          hueShift: Math.random()
        });
      }
    }

    function loop(ts) {
      raf = requestAnimationFrame(loop);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // parányi utánfény (trail)
      ctx.globalCompositeOperation = 'lighter';

      const now = ts || 0;
      if (now - lastEmit.current > 55) {
        emit(pointer.current.x, pointer.current.y);
        lastEmit.current = now;
      }

      particles.current = particles.current.filter(p => p.life < p.max);
      for (const p of particles.current) {
        p.life += 16; // közel 60fps-hez
        const t = p.life / p.max;
        const ease = 1 - Math.pow(1 - t, 3);
        p.x += p.vx * 0.016 * (1 - t * 0.6);
        p.y += p.vy * 0.016 * (1 - t * 0.6) + 10 * 0.016 * t; // enyhe gravitáció
        const alpha = Math.max(0, 1 - ease);
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * (1 + t * 4));
        grad.addColorStop(0, colorA);
        grad.addColorStop(0.6, colorB);
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 + t * 2.6), 0, Math.PI * 2);
        ctx.fill();
        // kis csillanó pont
        ctx.fillStyle = `rgba(255,230,180,${alpha * 0.8})`;
        ctx.fillRect(p.x - 0.5, p.y - 0.5, 1, 1);
      }
    }

    function move(e) {
      pointer.current.x = e.clientX;
      pointer.current.y = e.clientY;
    }
    window.addEventListener('pointermove', move, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('resize', resize);
    };
  }, [colorA, colorB]);

  return <canvas ref={ref} className="hover-spark-layer" aria-hidden />;
}
