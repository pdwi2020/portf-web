import { useRef, useEffect } from 'react';

/**
 * RealtimeConstellation
 * Vanilla Canvas particle + connection field for premium "frontier data" feel.
 * Inspired by neural nets + starfields (xAI / SpaceX cinematic).
 * - Mouse gently influences particles (attraction + highlight)
 * - Smooth organic drift
 * - Responsive + DPR aware + perf guards (pause when hidden / reduced motion)
 */
export default function RealtimeConstellation({ className = '', density = 1.0 }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(null);
  const particlesRef = useRef([]);
  const meteorsRef = useRef([]);
  const burstsRef = useRef([]);
  const trailRef = useRef([]);
  const lastMeteorRef = useRef(0);
  const mouseRef = useRef({ x: null, y: null, active: false });
  const runningRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let width = 0;
    let height = 0;
    let dpr = 1;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const config = {
      count: Math.floor(240 * density),
      maxDist: 135,
      speed: 0.22,
      attraction: 0.012,
      friction: 0.985,
      pulseSpeed: 0.0018,
      meteorEveryMs: 1450,
    };

    if (prefersReduced) {
      config.count = Math.floor(config.count * 0.45);
      config.speed = 0.09;
    }

    function resize() {
      const parent = canvas.parentElement;
      width = parent ? parent.clientWidth : window.innerWidth;
      height = parent ? parent.clientHeight : window.innerHeight;

      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createParticles() {
      const arr = [];
      for (let i = 0; i < config.count; i++) {
        arr.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * config.speed,
          vy: (Math.random() - 0.5) * config.speed,
          r: Math.random() * 2.8 + 1.2,
          phase: Math.random() * Math.PI * 2,
        });
      }
      particlesRef.current = arr;
    }

    function createMeteor(now) {
      if (prefersReduced || now - lastMeteorRef.current < config.meteorEveryMs) return;
      if (Math.random() > 0.035) return;

      lastMeteorRef.current = now;
      const speed = 3.2 + Math.random() * 1.8;
      const angle = 0.58 + Math.random() * 0.18;
      meteorsRef.current.push({
        x: Math.random() * width * 0.75,
        y: Math.random() * height * 0.28,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        length: 80 + Math.random() * 70,
        life: 1,
        color: Math.random() > 0.5 ? '0, 240, 255' : '255, 138, 0',
      });
    }

    function updateAndDraw() {
      if (!runningRef.current) {
        rafRef.current = requestAnimationFrame(updateAndDraw);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      const particles = particlesRef.current;
      const mouse = mouseRef.current;
      const now = performance.now();

      // NO dark wash. Draw faint aurora base *in the canvas* so the constellation background area itself is brightly luminous (cyan/orange/purple glow across the whole hero), matching the intensity of aurora in correct bright sections. Particles, connections, meteors are bright accents on this lit bg. This fixes the "constellation background is dim" by making the field glow even in gaps.
      const grad1 = ctx.createRadialGradient(width*0.2, height*0.3, 0, width*0.2, height*0.3, Math.max(width, height)*0.7);
      grad1.addColorStop(0, 'rgba(0,240,255,0.52)');
      grad1.addColorStop(1, 'rgba(0,240,255,0)');
      ctx.fillStyle = grad1;
      ctx.fillRect(0,0,width,height);

      const grad2 = ctx.createRadialGradient(width*0.8, height*0.7, 0, width*0.8, height*0.7, Math.max(width, height)*0.65);
      grad2.addColorStop(0, 'rgba(255,138,0,0.42)');
      grad2.addColorStop(1, 'rgba(255,138,0,0)');
      ctx.fillStyle = grad2;
      ctx.fillRect(0,0,width,height);

      const grad3 = ctx.createRadialGradient(width*0.5, height*0.5, 0, width*0.5, height*0.5, Math.max(width, height)*0.9);
      grad3.addColorStop(0, 'rgba(167,139,250,0.35)');
      grad3.addColorStop(1, 'rgba(167,139,250,0)');
      ctx.fillStyle = grad3;
      ctx.fillRect(0,0,width,height);

      createMeteor(now);

      // update
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // gentle autonomous motion + phase for organic feel
        p.phase += config.pulseSpeed;
        const wobble = Math.sin(p.phase) * 0.035;

        p.x += p.vx + wobble * 0.3;
        p.y += p.vy + wobble * 0.25;

        // soft friction + bounds (bounce with damping)
        p.vx *= config.friction;
        p.vy *= config.friction;

        if (p.x < 0 || p.x > width) {
          p.vx *= -0.92;
          p.x = Math.max(0, Math.min(width, p.x));
        }
        if (p.y < 0 || p.y > height) {
          p.vy *= -0.92;
          p.y = Math.max(0, Math.min(height, p.y));
        }

        // mouse influence
        if (mouse.active && mouse.x != null && mouse.y != null) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist2 = dx * dx + dy * dy;
          if (dist2 > 1 && dist2 < 38000) {
            const dist = Math.sqrt(dist2);
            const force = (config.attraction * (1 - dist / 195)) / (1 + dist * 0.002);
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
        }
      }

      // draw connections first (behind dots) - enhanced with subtle gradients + glow (research: x.ai cosmic + 2026 dark gradients/glows)
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < config.maxDist * config.maxDist) {
            const d = Math.sqrt(d2);
            const alpha = 0.55 * (1 - d / config.maxDist);
            ctx.globalAlpha = Math.max(0.48, alpha);

            // boost near mouse
            if (mouse.active && mouse.x != null) {
              const mdx = (p1.x + p2.x) / 2 - mouse.x;
              const mdy = (p1.y + p2.y) / 2 - mouse.y;
              if (mdx * mdx + mdy * mdy < 26000) ctx.globalAlpha = Math.min(0.92, ctx.globalAlpha * 1.6);
            }

            // gradient line for depth (beautiful gradients from research)
            const grad = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
            grad.addColorStop(0, `rgba(0, 240, 255, ${alpha * 0.7})`);
            grad.addColorStop(1, `rgba(167, 139, 250, ${alpha * 0.5})`);
            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.8;

            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      // draw particles - enhanced with cosmic glow blooms, gradient fills, twinkle (research: x.ai cosmic, luminous glows, aurora, micro animations on dark)
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const pulse = 0.65 + Math.sin(p.phase * 1.7) * 0.35;
        const twinkle = 0.7 + Math.sin(p.phase * 3) * 0.3;

        // multi layer glow for bloom (OLED luminous, cosmic)
        ctx.shadowColor = 'rgba(0, 240, 255, 1)';
        ctx.shadowBlur = 20 * pulse;
        ctx.fillStyle = `rgba(0, 240, 255, ${0.95 * twinkle})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * pulse * 1.8, 0, Math.PI * 2);
        ctx.fill();

        ctx.shadowColor = 'rgba(167, 139, 250, 0.9)';
        ctx.shadowBlur = 14 * pulse;
        ctx.fillStyle = `rgba(167, 139, 250, ${0.82 * twinkle})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * pulse * 1.4, 0, Math.PI * 2);
        ctx.fill();

        // main particle with subtle gradient fill
        ctx.shadowBlur = 0;
        const pGrad = ctx.createRadialGradient(p.x - p.r*0.3, p.y - p.r*0.3, p.r*0.2, p.x, p.y, p.r * pulse);
        pGrad.addColorStop(0, 'rgba(224, 242, 255, 1)');
        pGrad.addColorStop(1, `rgba(0, 240, 255, ${0.7 * twinkle})`);
        ctx.fillStyle = pGrad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * pulse, 0, Math.PI * 2);
        ctx.fill();

        // bright core
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(p.x, p.y, Math.max(0.3, p.r * 0.3 * twinkle), 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.shadowBlur = 0;

      const meteors = meteorsRef.current;
      for (let i = 0; i < meteors.length; i++) {
        const m = meteors[i];
        m.x += m.vx;
        m.y += m.vy;
        m.life -= 0.012;

        const tailX = m.x - m.vx * m.length * 0.18;
        const tailY = m.y - m.vy * m.length * 0.18;
        const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        grad.addColorStop(0, `rgba(${m.color}, 1 * m.life)`);
        grad.addColorStop(1, `rgba(${m.color}, 0)`);
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.8;
        ctx.shadowColor = `rgba(${m.color}, 0.95 * m.life)`;
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
      }
      meteorsRef.current = meteors.filter((m) => m.life > 0 && m.x < width + 120 && m.y < height + 120);
      ctx.shadowBlur = 0;

      const trail = trailRef.current;
      for (let i = 0; i < trail.length; i++) {
        const t = trail[i];
        t.life -= 0.035;
        ctx.strokeStyle = `rgba(0, 240, 255, ${0.8 * t.life})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(t.x, t.y, 16 + (1 - t.life) * 28, 0, Math.PI * 2);
        ctx.stroke();
      }
      trailRef.current = trail.filter((t) => t.life > 0);

      const bursts = burstsRef.current;
      for (let i = 0; i < bursts.length; i++) {
        const b = bursts[i];
        b.x += b.vx;
        b.y += b.vy;
        b.vx *= 0.97;
        b.vy *= 0.97;
        b.life -= 0.035;
        ctx.fillStyle = `rgba(${b.color}, ${Math.max(0, b.life)})`;
        ctx.shadowColor = `rgba(${b.color}, ${Math.max(0, b.life)})`;
        ctx.shadowBlur = 7;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }
      burstsRef.current = bursts.filter((b) => b.life > 0);
      ctx.shadowBlur = 0;

      rafRef.current = requestAnimationFrame(updateAndDraw);
    }

    function onMouseMove(e) {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
      if (!prefersReduced) {
        trailRef.current.push({ x: mouseRef.current.x, y: mouseRef.current.y, life: 1 });
        if (trailRef.current.length > 14) trailRef.current.shift();
      }
    }

    function onMouseLeave() {
      mouseRef.current.active = false;
    }

    function onClick(e) {
      if (prefersReduced) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      for (let i = 0; i < 18; i++) {
        const angle = (Math.PI * 2 * i) / 18 + Math.random() * 0.25;
        const speed = 0.8 + Math.random() * 1.8;
        burstsRef.current.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          r: 1 + Math.random() * 1.4,
          life: 0.85,
          color: i % 3 === 0 ? '255, 138, 0' : '0, 240, 255',
        });
      }

      for (let i = 0; i < particlesRef.current.length; i++) {
        const p = particlesRef.current[i];
        const dx = p.x - x;
        const dy = p.y - y;
        const dist2 = dx * dx + dy * dy;
        if (dist2 > 0.1 && dist2 < 20000) {
          const dist = Math.sqrt(dist2);
          const force = 1.8 * (1 - dist / 142);
          p.vx += (dx / dist) * force;
          p.vy += (dy / dist) * force;
        }
      }
    }

    function onVisibility() {
      runningRef.current = document.visibilityState === 'visible';
    }

    function onIntersection(entries) {
      const entry = entries[0];
      runningRef.current = entry.isIntersecting;
    }

    // init
    resize();
    createParticles();

    // listeners
    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);
    canvas.addEventListener('click', onClick);
    document.addEventListener('visibilitychange', onVisibility);

    let io;
    if ('IntersectionObserver' in window) {
      io = new IntersectionObserver(onIntersection, { threshold: 0.05 });
      io.observe(canvas);
    }

    // kick off
    runningRef.current = true;
    rafRef.current = requestAnimationFrame(updateAndDraw);

    // cleanup
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      canvas.removeEventListener('click', onClick);
      document.removeEventListener('visibilitychange', onVisibility);
      if (io) io.disconnect();
    };
  }, [density]);

  return (
    <canvas
      ref={canvasRef}
      className={`block ${className}`}
      style={{ background: 'transparent' }}
    />
  );
}
