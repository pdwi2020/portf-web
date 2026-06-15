import { useState, useRef, useEffect, useCallback } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, useSpring, useTransform } from 'framer-motion'; // motion used for <motion.span> animated numbers (x.ai-style live stats feel)

/**
 * QuantLab — Live Stat-Arb / Pair Execution Simulator
 * Real-time interactive demo (inspired by P4 stat-arb + cross-asset + polymarket arb work).
 * - Sliders drive a tiny OU-style spread simulator
 * - Live updating equity curve (canvas)
 * - "Execute" triggers a fill sequence with springy PnL pop
 * - Auto mode for true realtime feel
 */
export default function QuantLab() {
  const [threshold, setThreshold] = useState(1.35);
  const [halfLife, setHalfLife] = useState(18);
  const [edgeBias, setEdgeBias] = useState(0.6); // basis points edge
  const [isAuto, setIsAuto] = useState(false);
  const [realizedPnl, setRealizedPnl] = useState(1240);
  const [currentEdge, setCurrentEdge] = useState(0.82);
  const [fills, setFills] = useState(27);

  const curveCanvasRef = useRef(null);
  const historyRef = useRef([0, 12, 9, 31, 27, 44, 38, 61, 55, 79]); // initial synthetic equity path (PnL)
  const autoTimerRef = useRef(null);
  const hoverRef = useRef(null); // {x, y, value} for EQUITY PATH hover interactivity

  // Springy live metrics (physical feel)
  const pnlSpring = useSpring(realizedPnl, { stiffness: 120, damping: 18 });
  const edgeSpring = useSpring(currentEdge, { stiffness: 180, damping: 22 });

  const displayPnl = useTransform(pnlSpring, (v) => Math.round(v));
  const displayEdge = useTransform(edgeSpring, (v) => v.toFixed(2));

  const drawCurve = useCallback(() => {
    const canvas = curveCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const hist = historyRef.current;

    ctx.clearRect(0, 0, w, h);

    // grid
    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = 12 + (i * (h - 24)) / 4;
      ctx.beginPath();
      ctx.moveTo(12, y);
      ctx.lineTo(w - 12, y);
      ctx.stroke();
    }

    if (hist.length < 2) return;

    const min = Math.min(...hist);
    const max = Math.max(...hist);
    const range = Math.max(8, max - min);

    // equity path
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2.25;
    ctx.lineJoin = 'round';
    ctx.shadowColor = 'rgba(0,240,255,0.35)';
    ctx.shadowBlur = 6;

    ctx.beginPath();
    for (let i = 0; i < hist.length; i++) {
      const x = 14 + (i / (hist.length - 1)) * (w - 28);
      const y = h - 14 - ((hist[i] - min) / range) * (h - 28);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // last point glow
    const lastX = 14 + ((hist.length - 1) / (hist.length - 1)) * (w - 28);
    const lastY = h - 14 - ((hist[hist.length - 1] - min) / range) * (h - 28);
    ctx.fillStyle = '#67f6ff';
    ctx.beginPath();
    ctx.arc(lastX, lastY, 2.8, 0, Math.PI * 2);
    ctx.fill();

    // EQUITY PATH (SIMULATED) hover interactivity
    const hover = hoverRef.current;
    if (hover && hover.x != null) {
      ctx.save();
      // vertical crosshair line
      ctx.strokeStyle = 'rgba(0,240,255,0.55)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);
      ctx.beginPath();
      ctx.moveTo(hover.x, 8);
      ctx.lineTo(hover.x, h - 8);
      ctx.stroke();
      ctx.setLineDash([]);

      // highlight dot on the path
      ctx.fillStyle = '#00f0ff';
      ctx.shadowColor = 'rgba(0,240,255,0.6)';
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.arc(hover.x, hover.y, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // value label (like a tooltip)
      ctx.fillStyle = '#e0f7fa';
      ctx.font = '11px ui-monospace, monospace';
      ctx.textAlign = 'left';
      const label = `${hover.value >= 0 ? '+' : ''}${hover.value.toFixed(0)}`;
      ctx.fillText(label, hover.x + 5, 16);
      ctx.restore();
    }
  }, []);

  // Simple OU-inspired simulator step
  const simulateStep = useCallback(() => {
    const hist = historyRef.current;
    const last = hist[hist.length - 1] || 0;

    // mean reversion pull + noise + controllable edge
    const pull = (0 - last) * (0.5 / Math.max(4, halfLife));
    const noise = (Math.random() - 0.5) * (1.8 + (2.2 - threshold) * 0.6);
    const edge = (edgeBias - 0.1) * (threshold > 1.1 ? 1.15 : 0.9);

    let next = last + pull + noise + edge * 0.8;

    // occasional "fill" event when spread exceeds threshold
    const triggered = Math.abs(next - last) > (threshold * 0.65);
    if (triggered) {
      next += (edgeBias * 1.6) * (Math.random() > 0.5 ? 1 : -0.6);
    }

    hist.push(Math.max(-140, Math.min(260, next)));
    if (hist.length > 42) hist.shift();

    // update live edge (synthetic)
    const newEdge = Math.max(0.15, Math.min(2.4, 0.6 + (Math.abs(next - last) * 0.38) + edgeBias * 0.3));
    setCurrentEdge(parseFloat(newEdge.toFixed(2)));

    // occasional auto-realized fill
    if (triggered && Math.random() > 0.55) {
      const fillProfit = 38 + Math.floor(edgeBias * 18) + (Math.random() * 18 - 9);
      setRealizedPnl((p) => Math.round(p + fillProfit));
      setFills((f) => f + 1);
    }

    drawCurve();
  }, [drawCurve, edgeBias, halfLife, threshold]);

  // EQUITY PATH hover handlers - interactive crosshair + value when mouse moves across the graph
  function handleCurveMouseMove(e) {
    const canvas = curveCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const hist = historyRef.current;
    if (!hist || hist.length < 2) return;

    const progress = Math.max(0, Math.min(1, (mx - 14) / (canvas.width - 28)));
    const idx = Math.floor(progress * (hist.length - 1));
    const value = hist[idx];

    // compute screen y (same math as drawCurve)
    const min = Math.min(...hist);
    const max = Math.max(...hist);
    const range = Math.max(8, max - min);
    const y = canvas.height - 14 - ((value - min) / range) * (canvas.height - 28);

    hoverRef.current = { x: mx, y, value };
    drawCurve();
  }

  function handleCurveMouseLeave() {
    hoverRef.current = null;
    drawCurve();
  }

  // Touch equivalents for phones/tablets — drag finger across equity curve for live crosshair + value (same math as mouse)
  function handleCurveTouchMove(e) {
    const canvas = curveCanvasRef.current;
    if (!canvas || !e.touches || !e.touches[0]) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.touches[0].clientX - rect.left;
    const hist = historyRef.current;
    if (!hist || hist.length < 2) return;

    const progress = Math.max(0, Math.min(1, (mx - 14) / (canvas.width - 28)));
    const idx = Math.floor(progress * (hist.length - 1));
    const value = hist[idx];

    const min = Math.min(...hist);
    const max = Math.max(...hist);
    const range = Math.max(8, max - min);
    const y = canvas.height - 14 - ((value - min) / range) * (canvas.height - 28);

    hoverRef.current = { x: mx, y, value };
    drawCurve();
    // prevent page scroll while scrubbing the curve
    e.preventDefault();
  }

  function handleCurveTouchEnd() {
    hoverRef.current = null;
    drawCurve();
  }

  // Auto realtime loop
  useEffect(() => {
    if (isAuto) {
      autoTimerRef.current = setInterval(() => {
        simulateStep();
      }, 195);
    } else if (autoTimerRef.current) {
      clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    }
    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    };
  }, [isAuto, simulateStep]);

  // initial draw + resize handling (responsive height for phones/tablets — taller proportion on narrow screens so the equity curve is readable and touch-draggable)
  useEffect(() => {
    const canvas = curveCanvasRef.current;
    if (!canvas) return;

    function fit() {
      const parent = canvas.parentElement;
      const cssW = Math.max(260, (parent?.clientWidth || 520) - 0);
      // Dynamic height: ~38% of width (good aspect for curves) clamped for mobile vs desktop readability
      const cssH = Math.max(138, Math.min(205, Math.round(cssW * 0.385)));
      canvas.width = cssW;
      canvas.height = cssH;
      canvas.style.height = cssH + 'px';
      drawCurve();
    }
    fit();
    const ro = new ResizeObserver(fit);
    if (canvas.parentElement) ro.observe(canvas.parentElement);

    // seed a couple steps
    for (let k = 0; k < 3; k++) simulateStep();

    return () => ro.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // when sliders change, nudge the sim
  useEffect(() => {
    const id = setTimeout(() => {
      if (!isAuto) simulateStep();
    }, 70);
    return () => clearTimeout(id);
  }, [isAuto, simulateStep]);

  function executeFill() {
    const hist = historyRef.current;
    const profit = 52 + Math.floor(edgeBias * 22) + (Math.random() * 14 - 6);
    const newPnl = Math.round(realizedPnl + profit);

    setRealizedPnl(newPnl);
    setFills((f) => f + 1);
    setCurrentEdge((e) => Math.max(0.2, parseFloat((e * 0.6 + 0.3).toFixed(2))));

    // visual pop on path
    hist.push(hist[hist.length - 1] + profit * 0.65);
    if (hist.length > 42) hist.shift();
    drawCurve();

    // spring already bound to state
  }

  return (
    <div className="lab-container glass-2-0 grain liquid-refraction rounded-2xl p-6 md:p-8 text-sm">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-5">
        <div>
          <div className="uppercase tracking-[3px] text-[10px] text-[#00f0ff] mb-1">QUANT LAB</div>
          <h3 className="text-2xl font-semibold tracking-tight text-white micro-glow">Live Stat-Arb Execution Simulator</h3>
          <p className="text-[#a1a1aa] mt-1 max-w-prose">
            Real-time OU-style spread model. Adjust parameters — watch the equity curve and fills evolve.
            Inspired by rigorous multi-testing stat-arb and live execution systems.
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <button
            onClick={() => setIsAuto(!isAuto)}
            className={`pill ripple ${isAuto ? 'bg-[#00f0ff] text-black border-[#00f0ff]' : ''}`}
          >
            {isAuto ? 'PAUSE REALTIME' : 'START REALTIME'}
          </button>
          <button
            onClick={executeFill}
            className="pill pill-primary ripple"
          >
            EXECUTE FILL
          </button>
        </div>
      </div>

      {/* Live metrics */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="bento-card glass-2-0 p-4 rounded-xl">
          <div className="text-[#a1a1aa] text-[10px] tracking-widest">REALIZED PnL</div>
          <div className="font-mono text-4xl font-semibold tabular-nums mt-1 text-[#00f0ff]">
            <motion.span>{displayPnl}</motion.span>
            <span className="text-base align-super ml-0.5 text-[#00f0ff]/70">USD</span>
          </div>
          <div className="text-[10px] text-emerald-400/80 mt-0.5">+{fills} FILLS • SIM</div>
        </div>
        <div className="bento-card glass-2-0 p-4 rounded-xl">
          <div className="text-[#a1a1aa] text-[10px] tracking-widest">CURRENT EDGE</div>
          <div className="font-mono text-4xl font-semibold tabular-nums mt-1 text-white">
            <motion.span>{displayEdge}</motion.span>
            <span className="text-base align-super ml-0.5 text-white/50">bp</span>
          </div>
          <div className="text-[10px] text-[#a1a1aa] mt-0.5">THRESHOLD {threshold.toFixed(2)}σ</div>
        </div>
        <div className="bento-card glass-2-0 p-4 rounded-xl flex flex-col justify-between">
          <div>
            <div className="text-[#a1a1aa] text-[10px] tracking-widest mb-1">MEAN-REVERSION</div>
            <div className="font-mono text-3xl font-semibold tabular-nums">{halfLife}<span className="text-sm text-white/50">d</span></div>
          </div>
          <div className="text-[10px] text-[#a1a1aa]">HIGHER = SLOWER PULL • MORE PATIENT</div>
        </div>
      </div>

      {/* Viz + controls */}
      <div className="grid lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <div className="text-[10px] uppercase tracking-[2px] text-[#a1a1aa] mb-2 pl-1">EQUITY PATH (SIMULATED)</div>
          <div className="rounded-xl overflow-hidden border border-white/10 bg-black p-2 micro-glow cosmic-particle liquid-refraction">
            <canvas
              ref={curveCanvasRef}
              onMouseMove={handleCurveMouseMove}
              onMouseLeave={handleCurveMouseLeave}
              onTouchMove={handleCurveTouchMove}
              onTouchEnd={handleCurveTouchEnd}
              onTouchCancel={handleCurveTouchEnd}
              className="w-full block cursor-crosshair touch-pan-y"
            />
          </div>
          <div className="text-[10px] text-[#666] mt-1.5 pl-1">Curve updates live from the model. Auto mode streams new points.</div>

          {/* x.ai-style code demo (research element) — simple equivalent of the toy simulator */}
          <details className="mt-3 text-[10px] text-[#a1a1aa]">
            <summary className="cursor-pointer hover:text-white">Show equivalent Python snippet (toy OU step)</summary>
            <pre className="mt-2 p-3 bg-black/70 border border-white/10 rounded text-[9px] overflow-auto font-mono text-[#00f0ff]/90">
{`def ou_step(last, half_life, threshold, edge):
    pull = (0 - last) * (0.5 / max(4, half_life))
    noise = (random.random() - 0.5) * (1.8 + (2.2 - threshold) * 0.6)
    return last + pull + noise + edge * 0.8`}
            </pre>
          </details>
        </div>

        {/* Controls */}
        <div className="lg:col-span-2 space-y-5">
          <div>
            <div className="flex justify-between text-xs mb-1.5 text-[#a1a1aa]">
              <div>ENTRY THRESHOLD (σ)</div>
              <div className="font-mono text-[#00f0ff]">{threshold.toFixed(2)}</div>
            </div>
            <input
              type="range" min="0.6" max="2.4" step="0.01"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="lab-slider w-full accent-[#00f0ff]"
            />
            <div className="text-[10px] text-[#666] mt-0.5">Wider = fewer but higher-quality fills</div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5 text-[#a1a1aa]">
              <div>HALF-LIFE (DAYS)</div>
              <div className="font-mono text-[#00f0ff]">{halfLife}</div>
            </div>
            <input
              type="range" min="3" max="42" step="1"
              value={halfLife}
              onChange={(e) => setHalfLife(parseInt(e.target.value))}
              className="lab-slider w-full accent-[#00f0ff]"
            />
            <div className="text-[10px] text-[#666] mt-0.5">Speed of mean reversion in the spread process</div>
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5 text-[#a1a1aa]">
              <div>EDGE BIAS (bp)</div>
              <div className="font-mono text-[#00f0ff]">{edgeBias.toFixed(1)}</div>
            </div>
            <input
              type="range" min="0.1" max="1.8" step="0.1"
              value={edgeBias}
              onChange={(e) => setEdgeBias(parseFloat(e.target.value))}
              className="lab-slider w-full accent-[#00f0ff]"
            />
            <div className="text-[10px] text-[#666] mt-0.5">Structural edge after costs — drives the drift</div>
          </div>

          <div className="pt-2 text-[10px] text-[#a1a1aa] leading-snug">
            This is a lightweight browser-native simulator inspired by real stat-arb work in the listed repos (e.g. P4 S&P 500 pair/basket with cointegration + OU + multiple-testing rigor from the actual GitHub). Real systems add queue-reactive LOB, adverse-selection, full Hansen SPA / reality checks. Tune params to match repo backtests for more accuracy.
          </div>
        </div>
      </div>
    </div>
  );
}
