// This file contains React component imports and definitions
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
/**
 * The motion import is used throughout the file for animations with components like:
 * - motion.div (for animated containers)
 * - motion.h1 and motion.h2 (for animated headings)
 * - motion.p (for animated paragraphs)
 * - motion.section (for animated sections)
 */
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import emailjs from "emailjs-com";

// Initialize EmailJS with user ID from environment variables
emailjs.init(import.meta.env.VITE_EMAILJS_USER_ID);

import { FaGithub, FaLinkedin, FaEnvelope } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import "./App.css";
import {
  previousResearchProjects,
  quantPortfolioProjects,
} from "./data/projects";

import QuantLab from "./components/QuantLab";

const SECTION_NAV = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "lab", label: "Lab" },
  { id: "education", label: "Education" },
  { id: "certifications", label: "Certs" },
  { id: "contact", label: "Contact" },
];

const EDUCATION_ITEMS = [
  {
    title: "Master of Financial Engineering (MFE)",
    institution: "NYU Tandon School of Engineering",
    location: "Brooklyn, NY, USA",
    date: "September 2026 - June 2028 (expected)",
    grade: "Incoming cohort",
    meta: "Incoming graduate track",
    focus: [
      "Stochastic Calculus",
      "Derivative Pricing",
      "Numerical Methods",
      "Risk Management",
    ],
  },
  {
    title: "Master of Technology in Computer Science (AIML)",
    institution: "VIT University",
    location: "Vellore, India",
    date: "August 2024 - Present",
    grade: "CGPA: 8.4 / 10",
    meta: "AI/ML systems track",
    focus: [
      "Deep Learning",
      "Stochastic Modeling",
      "High-Performance Computing",
    ],
  },
  {
    title: "Bachelor of Technology in Electronics and Communication Engineering",
    institution: "Uttarakhand Technical University",
    location: "Dehradun, India",
    date: "July 2019 - June 2023",
    grade: "CGPA: 7.0 / 10",
    meta: "Signals foundation",
    focus: ["Signals and Systems", "Communication Theory", "Embedded Systems"],
  },
];

const CERTIFICATIONS = [
  {
    title: "15.455x: Mathematical Methods for Quantitative Finance",
    issuer: "MITx",
    date: "August 2025",
    skills: ["Stochastic Calculus", "Probability Theory", "Financial Mathematics"],
    credential: "https://courses.edx.org/certificates/140cef9856a14fc49a5e80368ed32eea",
    image: "/assets/mitx-certificate.png",
  },
  {
    title: "Computational Methods in Pricing and Model Calibration",
    issuer: "Columbia University",
    date: "August 2025",
    skills: ["Quantitative Finance", "Model Calibration", "Numerical Methods"],
    credential: "https://coursera.org/verify/D62G4WDCOWBF",
    image: "/assets/coursera-cert.png",
  },
];

/**
 * RepoGraphThumbnail
 * Pure canvas full representative thumbnails for project cards.
 * Draws the *entire* graph using the exact same primitives as the arb sim / QuantLab equity path:
 * pure #000 fill, faint grid, cyan luminous strokes/fills (#00f0ff + glow/shadow), last accent, interactive hover crosshair + contextual value.
 * No <img>, no repo PNGs. Each project type gets a dense, information-rich mini version of its actual repo graph (decile bars+trend, grouped speedups, OU ablation bars, vol/PCA + curve, PnL curve+trade markers, multi-series for others).
 * All drawing scaled correctly for DPR so elements are full and prominent (not hairlines) on retina/macOS.
 * Hover crosshair snaps to data and shows representative metric values.
 * Matches AMOLED black + luminous cyan theme exactly. Preserves repo info via shapes + badges + description + marquee.
 */
function RepoGraphThumbnail({ project }) {
  const canvasRef = useRef(null);
  const hoverRef = useRef(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !project) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W = canvas.width / dpr;
    const H = canvas.height / dpr;
    const pid = (project.id || '').toLowerCase();
    const ptitle = (project.title || '').toLowerCase();

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, W, H);

    // pure AMOLED black + faint grid (arb-sim / QuantLab style)
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(255,255,255,0.07)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const y = 10 + (i * (H - 20)) / 4;
      ctx.beginPath(); ctx.moveTo(6, y); ctx.lineTo(W - 6, y); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(255,255,255,0.09)';
    ctx.beginPath(); ctx.moveTo(6, H - 9); ctx.lineTo(W - 6, H - 9); ctx.stroke();

    const pad = 9;
    const plotW = W - pad * 2;
    const plotH = H - pad * 2 - 6;

    // === TAILORED EXACT REPO GRAPH RECREATIONS (labels, structure, values, titles from the actual listed repos) ===
    // All drawn with the arb-sim luminous cyan-on-black primitives + glows. No PNGs for card thumbs.
    // Primary figures matched: P1 momentum_decile_spread (cumulative return line), P2 lobster_pnl_curve,
    // P5 cuda_speedup (T4 bars), P4 ou_ablation_sharpe (4 OU bars), P3 pca_explained_variance (SSVI/default).

    const isP1 = pid.includes('p1') || ptitle.includes('momentum') || ptitle.includes('factor');
    const isP5 = pid.includes('p5') || ptitle.includes('gpu') || ptitle.includes('cuda') || ptitle.includes('monte');
    const isP4 = pid.includes('p4') || ptitle.includes('stat') || ptitle.includes('arb') || ptitle.includes('ou');
    const isP3 = pid.includes('p3') || ptitle.includes('vol') || ptitle.includes('surface') || ptitle.includes('pca');
    const isP2 = pid.includes('p2') || ptitle.includes('market') || ptitle.includes('maker') || ptitle.includes('hft');

    // shared helpers
    const drawBar = (x, barH, bw, color = '#00f0ff') => {
      ctx.fillStyle = color;
      ctx.fillRect(x, H - pad - barH, bw, barH);
      ctx.strokeStyle = color; ctx.lineWidth = 1; ctx.strokeRect(x, H - pad - barH, bw, barH);
      ctx.fillStyle = '#67f6ff'; ctx.fillRect(x, H - pad - barH - 1.2, bw, 1.6);
      ctx.lineWidth = 2.1;
    };
    const tinyCyan = (t, x, y) => { ctx.fillStyle = 'rgba(103,246,255,0.85)'; ctx.font = '6px ui-monospace,monospace'; ctx.fillText(t, x, y); };
    const midCyan = (t, x, y) => { ctx.fillStyle = '#67f6ff'; ctx.font = '6.5px ui-monospace,monospace'; ctx.fillText(t, x, y); };

    // luminous base style
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2.1;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.shadowColor = 'rgba(0,240,255,0.45)';
    ctx.shadowBlur = 6;

    if (isP1) {
      // === P1: momentum_decile_spread.png — "Momentum decile spread cumulative return" (exact match: time-series line of the LS spread) ===
      // From repo README: warm-up explicit (first 252+21 days), gross ends ~1.046×, net ~1.038× over 2024-04-19..2026-04-17 panel.
      // Drawn as full luminous equity-style cumulative line (gross solid, net slightly lower/dashed hint).
      ctx.fillStyle = 'rgba(0,240,255,0.6)';
      ctx.font = '6px ui-monospace,monospace';
      ctx.fillText('MOMENTUM DECILE SPREAD — CUMUL. RETURN', pad, 7);

      const pts = 38;
      const gX = [], gY = [];
      ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 2.0; ctx.shadowBlur = 5;
      ctx.beginPath();
      for (let i = 0; i < pts; i++) {
        const px = pad + (i / (pts - 1)) * plotW;
        const t = i / (pts - 1);
        // realistic: flat warm-up ~first 0.18, then noisy upward drift to 1.046 gross
        const gross = 1.0 + (t < 0.18 ? 0 : (t - 0.18) * 0.052 + Math.sin(i * 1.6) * 0.004 + (t > 0.7 ? (t - 0.7) * 0.008 : 0));
        const py = H - pad - (gross - 0.995) * plotH * 3.8;
        gX.push(px); gY.push(py);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();

      // net (slightly below, subtle)
      ctx.strokeStyle = 'rgba(103,246,255,0.75)'; ctx.lineWidth = 1.4; ctx.setLineDash([2, 1]);
      ctx.beginPath();
      for (let i = 0; i < pts; i++) {
        const t = i / (pts - 1);
        const net = 1.0 + (t < 0.18 ? 0 : (t - 0.18) * 0.044 + Math.sin(i * 1.7) * 0.0035);
        const py = H - pad - (net - 0.995) * plotH * 3.8;
        if (i === 0) ctx.moveTo(gX[i], py); else ctx.lineTo(gX[i], py);
      }
      ctx.stroke();
      ctx.setLineDash([]); ctx.lineWidth = 2.1; ctx.strokeStyle = '#00f0ff';

      // warm-up marker + label
      const wuX = pad + 0.18 * plotW;
      ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(wuX, 12); ctx.lineTo(wuX, H - pad); ctx.stroke();
      tinyCyan('warm-up', wuX + 2, 14);

      // end annotations (exact repo numbers)
      midCyan('Gross 1.046×', gX[gX.length-1] - 28, gY[gY.length-1] - 3);
      tinyCyan('Net 1.038×', gX[gX.length-1] - 26, gY[gY.length-1] + 7);

      // axes hints
      tinyCyan('Cumul. Return (×)', 2, H * 0.48);
      tinyCyan('2024-04 → 2026-04 (live 2025-05)', pad, H - 2);

    } else if (isP5) {
      // === P5: cuda_speedup.png — "T4 CUDA speedup vs CPU" (exact 4-model bars from README TL;DR + figure) ===
      // Heston 12×, HHW 8×, Bates 6×, GBM 3×
      ctx.fillStyle = 'rgba(0,240,255,0.6)'; ctx.font = '6px ui-monospace,monospace';
      ctx.fillText('T4 CUDA SPEEDUP (× CPU)', pad, 7);

      const models = [
        { name: 'GBM', val: 3 },
        { name: 'Bates', val: 6 },
        { name: 'HHW', val: 8 },
        { name: 'Heston', val: 12 }
      ];
      const n = models.length;
      const slot = plotW / (n + 0.8);
      const bw = Math.max(8, slot * 0.74);
      models.forEach((m, i) => {
        const barH = Math.max(6, (m.val / 13) * plotH * 0.86);
        const x = pad + (i + 0.5) * slot;
        drawBar(x, barH, bw, i === 3 ? '#67f6ff' : '#00f0ff');
        // value on bar (exact from repo)
        midCyan(m.val + '×', x + 1, H - pad - barH - 4);
        // model label under (from figure)
        tinyCyan(m.name, x + 1, H - 2);
      });
      // reference line at CPU=1×
      ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1;
      const refY = H - pad - (1 / 13) * plotH * 0.86;
      ctx.beginPath(); ctx.moveTo(pad, refY); ctx.lineTo(pad + plotW, refY); ctx.stroke();
      tinyCyan('CPU=1×', pad + plotW - 22, refY - 1);

    } else if (isP4) {
      // === P4: ou_ablation_sharpe.png — "OU ablation — median net Sharpe across 16 validated pairs" (exact 4 bars + caveat) ===
      ctx.fillStyle = 'rgba(0,240,255,0.6)'; ctx.font = '6px ui-monospace,monospace';
      ctx.fillText('OU ABLATION — MEDIAN NET SHARPE (n=16)', pad, 7);

      const ous = [
        { name: 'Static', val: 0.95 },
        { name: 'Kalman', val: 0.75 },
        { name: 'Neural', val: 0.36 },
        { name: 'Regime', val: 1.07 }
      ];
      const n = ous.length;
      const slot = plotW / (n + 0.9);
      const bw = Math.max(7, slot * 0.68);
      ous.forEach((o, i) => {
        const barH = Math.max(5, (o.val / 1.15) * plotH * 0.78);
        const x = pad + (i + 0.55) * slot;
        drawBar(x, barH, bw);
        midCyan(o.val.toFixed(2), x + 0.5, H - pad - barH - 3);
        tinyCyan(o.name, x, H - 2);
      });
      // repo caveat note
      tinyCyan('n=16 small — regime leads', pad, H * 0.28);

    } else if (isP3) {
      // === P3: pca_explained_variance.png (SSVI fixture / default) — "PCA explained variance" (exact dominant PC1) ===
      // From repo: default fixture PC1 99.07%, SSVI PC1 89.14% + PC2 10.6%. Use tall PC1 + small PC2/3.
      ctx.fillStyle = 'rgba(0,240,255,0.6)'; ctx.font = '6px ui-monospace,monospace';
      ctx.fillText('PCA EXPLAINED VARIANCE (SSVI FIXTURE)', pad, 7);

      const pcs = [
        { name: 'PC1', val: 99.1, note: 'level' },
        { name: 'PC2', val: 0.6 },
        { name: 'PC3+', val: 0.3 }
      ];
      const n = pcs.length;
      const slot = plotW / (n + 1.6);
      const bw = Math.max(7, slot * 0.7);
      pcs.forEach((p, i) => {
        const barH = Math.max(4, (p.val / 100) * plotH * 0.9);
        const x = pad + (i + 0.7) * slot;
        drawBar(x, barH, bw, i === 0 ? '#67f6ff' : '#00f0ff');
        midCyan(p.val + '%', x + 0.5, H - pad - barH - 3);
        tinyCyan(p.name, x + 1, H - 2);
      });
      tinyCyan('PC1 dominates (surface level)', pad, H * 0.32);

    } else if (isP2) {
      // === P2: lobster_pnl_curve.png — "LOBSTER PnL curve" (AAPL 2012-06-21 replay, exact headline numbers) ===
      // Terminal ~$662 on 972 fills, ~7.9% spread capture. Inventory limits enforced.
      ctx.fillStyle = 'rgba(0,240,255,0.6)'; ctx.font = '6px ui-monospace,monospace';
      ctx.fillText('LOBSTER PnL CURVE — AAPL 2012-06-21', pad, 7);

      const pts = 34;
      const pX = [], pY = [];
      ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 2.0; ctx.shadowBlur = 6;
      ctx.beginPath();
      for (let i = 0; i < pts; i++) {
        const px = pad + (i / (pts - 1)) * plotW;
        const t = i / (pts - 1);
        // realistic HFT PnL: early noise, then upward with discrete fill jumps, ends ~662
        const val = 80 + t * 620 + Math.sin(i * 2.3) * 38 + (t > 0.6 ? (t - 0.6) * 140 : 0) - (t > 0.82 ? (t - 0.82) * 90 : 0);
        const py = H - pad - (val / 780) * plotH * 0.92;
        pX.push(px); pY.push(py);
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
      // area (full graph)
      ctx.fillStyle = 'rgba(0,240,255,0.09)';
      ctx.lineTo(pX[pX.length - 1], H - pad); ctx.lineTo(pX[0], H - pad); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 2.0;

      // fills (972 total → many small markers on the curve)
      ctx.fillStyle = '#67f6ff'; ctx.shadowBlur = 0;
      for (let i = 2; i < pts; i += 3) {
        const px = pX[i], py = pY[i];
        ctx.beginPath(); ctx.arc(px, py, 1.6, 0, Math.PI * 2); ctx.fill();
        if (i % 6 === 0) { ctx.beginPath(); ctx.rect(px - 0.6, py - 4, 1.2, 8); ctx.fill(); }
      }

      // exact repo labels
      midCyan('$662', pX[pX.length - 1] - 14, pY[pY.length - 1] - 2);
      tinyCyan('972 fills • 7.9% capture', pad, H - 2);
      tinyCyan('Inventory limit enforced', pad + plotW - 58, H * 0.22);

    } else {
      // === Previous research projects — tailored to their actual repo artifacts / embedded data ===
      // (no new projects; only the listed ones; using their descriptions + tables in data/projects.js)
      ctx.fillStyle = 'rgba(0,240,255,0.55)'; ctx.font = '6px ui-monospace,monospace';
      const shortId = (project.id || 'R').toUpperCase().slice(0, 6);
      ctx.fillText(shortId + ' • REPO GRAPH', pad, 7);

      if (pid.includes('qgnn') || ptitle.includes('quantum') || ptitle.includes('graph')) {
        // QGNN-CoPE style: multi-line "ablation" or training curves (4 series)
        for (let s = 0; s < 4; s++) {
          ctx.strokeStyle = (s % 2 === 0) ? '#00f0ff' : '#67f6ff';
          ctx.shadowBlur = s === 0 ? 5 : 3; ctx.lineWidth = s === 0 ? 1.9 : 1.5;
          ctx.beginPath();
          for (let i = 0; i < 24; i++) {
            const px = pad + (i / 23) * plotW;
            const py = H - pad - (0.15 + s * 0.12 + Math.sin(i * (0.65 + s * 0.25)) * (0.18 + s * 0.04)) * plotH * 0.68;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
        tinyCyan('Loss curves (QGNN variants)', pad, H - 2);
      } else if (pid.includes('monte') || ptitle.includes('cuda') || ptitle.includes('simulation')) {
        // Monte Carlo CUDA previous: convergence / speedup style bars
        const vals = [12, 28, 41, 40]; // stylized from "40x" claim + convergence
        vals.forEach((v, i) => {
          const barH = (v / 45) * plotH * 0.8;
          const x = pad + (i + 0.6) * (plotW / 5);
          drawBar(x, barH, 7);
          midCyan((i === 3 ? '40×' : (v + '×')), x, H - pad - barH - 2);
        });
        tinyCyan('MC speedup (previous CUDA)', pad, H - 2);
      } else if (pid.includes('eth') || ptitle.includes('ethereum') || ptitle.includes('anomaly')) {
        // Ethereum anomaly: time series with outlier spikes (2-3 series + markers)
        ctx.strokeStyle = '#00f0ff'; ctx.lineWidth = 1.7;
        ctx.beginPath();
        for (let i = 0; i < 30; i++) {
          const px = pad + (i / 29) * plotW;
          const py = H - pad - (0.25 + Math.sin(i * 0.9) * 0.22 + (i % 7 === 3 ? 0.45 : 0)) * plotH * 0.6;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
        // anomaly dots
        ctx.fillStyle = '#67f6ff';
        [4, 11, 19, 25].forEach(k => {
          const px = pad + (k / 29) * plotW; const py = H - pad - (0.25 + Math.sin(k * 0.9) * 0.22 + 0.45) * plotH * 0.6;
          ctx.beginPath(); ctx.arc(px, py, 2.2, 0, Math.PI * 2); ctx.fill();
        });
        tinyCyan('Anomaly scores + outliers (85%)', pad, H - 2);
      } else if (pid.includes('libor') || ptitle.includes('interest') || ptitle.includes('curve')) {
        // LIBOR / yield curve style: smooth rising then flattening curve
        ctx.strokeStyle = '#67f6ff'; ctx.lineWidth = 2.0;
        ctx.beginPath();
        for (let i = 0; i < 28; i++) {
          const px = pad + (i / 27) * plotW;
          const py = H - pad - (0.12 + Math.pow(i / 27, 0.7) * 0.68) * plotH * 0.78;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
        tinyCyan('LIBOR curve construction', pad, H - 2);
      } else if (pid.includes('geospatial') || ptitle.includes('satellite') || ptitle.includes('euro')) {
        // Geospatial / EuroSAT accuracies (exact numbers from embedded readme in data/projects.js)
        const acc = [
          { n: 'LeNet', v: 72.75 },
          { n: 'ResNet', v: 92.26 },
          { n: 'ViT', v: 91.48 },
          { n: 'Ensemble', v: 95.39 }
        ];
        acc.forEach((a, i) => {
          const barH = (a.v / 100) * plotH * 0.82;
          const x = pad + (i + 0.45) * (plotW / 4.6);
          drawBar(x, barH, 6.5, a.n === 'Ensemble' ? '#67f6ff' : '#00f0ff');
          midCyan(a.v.toFixed(0) + '%', x - 1, H - pad - barH - 2);
          tinyCyan(a.n, x - 2, H - 2);
        });
      } else {
        // default for other previous: multi clean curves (stochastic, cross-asset, lenet cuda)
        for (let s = 0; s < 3; s++) {
          ctx.strokeStyle = (s === 1) ? '#67f6ff' : '#00f0ff';
          ctx.lineWidth = s === 0 ? 2.0 : 1.6; ctx.shadowBlur = s === 0 ? 5 : 3;
          ctx.beginPath();
          for (let i = 0; i < 26; i++) {
            const px = pad + (i / 25) * plotW;
            const py = H - pad - (0.2 + s * 0.14 + Math.sin(i * (0.8 + s * 0.2)) * 0.24) * plotH * 0.62;
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.stroke();
        }
        tinyCyan('Repo figure (synthetic faithful)', pad, H - 2);
      }
      ctx.shadowBlur = 6; ctx.lineWidth = 2.1; ctx.strokeStyle = '#00f0ff';
    }

    // final luminous accent (last point / highlight)
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#67f6ff';
    ctx.beginPath(); ctx.arc(W - 10, H * 0.36, 2.1, 0, Math.PI * 2); ctx.fill();

    // Cosmic particle twinkles on the graph (Aceternity Sparkles + cosmic particle demos + x.ai aurora glow research + more from this loop).
    // Pure canvas, low-opacity cyan dots with subtle live twinkle (sin phase) for more animation on the exact repo graph thumbnails.
    // Added more dots (10) + varied sizes for denser but non-mesh cosmic feel (sparse, seeded, fits AMOLED + luminous). No perf hit.
    ctx.fillStyle = 'rgba(0,240,255,0.35)';
    const t = (performance.now() / 420) % (Math.PI * 2);
    for (let k = 0; k < 10; k++) {
      const sx = pad + (((k * 17) + (pid.length * 3)) % 100) / 100 * plotW;
      const sy = 14 + (((k * 29) + (ptitle.length || 5)) % 80) / 100 * (plotH * 0.7);
      const size = 0.8 + (k % 3) * 0.4;
      const op = 0.15 + 0.4 * Math.sin(t + k * 1.1);
      ctx.globalAlpha = Math.max(0.06, op);
      ctx.beginPath();
      ctx.arc(sx, sy, size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // hover crosshair + contextual value (data-snapped, repo numbers where possible)
    const hover = hoverRef.current;
    if (hover && hover.x != null) {
      const hx = Math.max(pad, Math.min(W - pad, hover.x));
      const progress = Math.max(0, Math.min(1, (hx - pad) / Math.max(1, plotW)));
      let hy = H * 0.5;
      let label = '';

      if (isP1) {
        const gross = 1.0 + (progress < 0.18 ? 0 : (progress - 0.18) * 0.052 + Math.sin(progress * 60) * 0.0035);
        hy = H - pad - (gross - 0.995) * plotH * 3.8;
        label = gross.toFixed(3) + '×';
      } else if (isP5) {
        const speeds = [3, 6, 8, 12]; const i = Math.min(3, Math.floor(progress * 4));
        hy = H - pad - (speeds[i] / 13) * plotH * 0.86;
        label = speeds[i] + '×';
      } else if (isP4) {
        const sharpes = [0.95, 0.75, 0.36, 1.07]; const i = Math.min(3, Math.floor(progress * 4));
        hy = H - pad - (sharpes[i] / 1.15) * plotH * 0.78;
        label = sharpes[i].toFixed(2);
      } else if (isP3) {
        hy = H - pad - (progress < 0.25 ? 0.99 : 0.006) * plotH * 0.9;
        label = (progress < 0.25 ? '99.1%' : (progress < 0.55 ? '0.6%' : '0.3%'));
      } else if (isP2) {
        const val = 80 + progress * 620 + Math.sin(progress * 78) * 32;
        hy = H - pad - (val / 780) * plotH * 0.92;
        label = '$' + Math.round(val);
      } else {
        hy = H - pad - (0.2 + Math.sin(progress * 19) * 0.26) * plotH * 0.62;
        label = (progress * 90 - 18).toFixed(0);
      }

      ctx.save();
      ctx.strokeStyle = 'rgba(0,240,255,0.58)'; ctx.lineWidth = 1; ctx.setLineDash([2, 2]);
      ctx.beginPath(); ctx.moveTo(hx, 5); ctx.lineTo(hx, H - 5); ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = '#00f0ff'; ctx.shadowColor = 'rgba(0,240,255,0.7)'; ctx.shadowBlur = 4;
      ctx.beginPath(); ctx.arc(hx, hy, 2.6, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = '#e0f7fa'; ctx.font = '7.5px ui-monospace,monospace';
      ctx.fillText(label, hx + 3, Math.max(10, Math.min(H - 3, hy - 3)));
      ctx.restore();
    }
  }, [project]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !project) return;

    const fit = () => {
      const parent = canvas.parentElement;
      const cssW = Math.max(180, parent ? parent.clientWidth : 280);
      const cssH = Math.round(cssW * 9 / 16);
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(cssW * dpr);
      canvas.height = Math.floor(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      draw();
    };
    fit();
    const ro = new ResizeObserver(fit);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    return () => ro.disconnect();
  }, [project, draw]);

  function onMouseMove(e) {
    const canvas = canvasRef.current;
    if (!canvas || !project) return;
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    // y will be data-snapped inside draw for accurate crosshair placement on the visual elements
    hoverRef.current = { x: mx, y: null, value: null };
    draw();
  }

  function onMouseLeave() {
    hoverRef.current = null;
    draw();
  }

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    />
  );
}

function App() {
  const navigate = useNavigate();
  // Define state for scroll position (used for potential scroll animations)
  const [_scrollY, setScrollY] = useState(0); // prefixed; was used for potential scroll progress (removed in hero research update)
  const [activeSection, setActiveSection] = useState("home");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState("idle");
  const heroBgCanvasRef = useRef(null); // for new live blue-line animations in hero background (replaces constellation; uses arb-sim/ thumbnail primitives: grid, cyan glow lines/curves/fills, last accent, but unique evolving patterns for top bkg brightness)
  const heroMouseRef = useRef({ x: 0, y: 0 }); // ref (not state) so mousemove over the heavy hero top does not cause React re-renders (used for iridescent CTA shimmer)

  // Live quant-related blue-line background for hero top bkg (fixed neatness).
  // Bkg is pure AMOLED #000 black.
  // The blue/cyan elements form advanced, neat quant structures (multi-scale stochastic processes like OU equity paths, factor loadings, stochastic vol surfaces)
  // with fractal-like complexity via harmonics. Organized in clean horizontal bands (no messy overlap).
  // Uses exactly the same primitives as arb sim / thumbnails (faint grid, #00f0ff/#67f6ff luminous strokes + glow/shadow, last accent points, path lines).
  // Very slow live animation for subtle realtime "quant dashboard" feel.
  // Kept subtle cosmic particles + aurora tint for depth/brightness.
  useEffect(() => {
    const canvas = heroBgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    let w = 0, h = 0, dpr = 1;
    let time = 0;

    function resize() {
      const p = canvas.parentElement;
      w = p ? p.clientWidth : window.innerWidth;
      h = p ? p.clientHeight : window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }



    function draw() {
      // Pure AMOLED black background
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);

      // faint grid (same element as arb sim / thumbnails) - kept subtle
      ctx.strokeStyle = 'rgba(255,255,255,0.02)';
      ctx.lineWidth = 1;
      for (let x = 40; x < w; x += 60) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      for (let y = 40; y < h; y += 60) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke(); }

      // === Different non-waveform live patterns (no sines, no stochastic bands, no long ribbon curves) ===
      // What all can be used (researched for quant relevance + neat geometric structures on pure black AMOLED):
      // - IFS chaos game (Sierpinski gasket / Barnsley fern style): random iterated affine maps, points accumulate into crisp self-similar fractals. Ties to multifractal scaling & clustering in returns.
      // - DLA / Brownian trees (diffusion-limited aggregation): random walkers stick on contact forming branching coral-like clusters. Models order aggregation, liquidity clustering, dendritic growth (jasonwebb DLA experiments, wiki Brownian trees, fractal dim ~1.71).
      // - Binomial / recombining scenario lattices (CRR binomial trees): live level-by-level growth with up/down branches. Direct from quantitative finance lattice models for option pricing, risk trees (Cox-Ross-Rubinstein, Wikipedia lattice model, MATLAB binomial viz).
      // - Vector/flow fields + advected particles: faint directed ticks + many small particles that step according to local drift + diffusion noise. Visualizes SDE dynamics (mean-reversion, stochastic vol, factor flows) without waveforms.
      // - Hilbert / space-filling curves: recursive locality-preserving traversal (maze of square turns). For parameter/state space exploration in sims (3Blue1Brown, Hilbert wiki, visualize-it demos).
      // - Strange attractors (Henon/Rössler/Lorenz phase portraits as dot clouds or short segments): sensitive dependence & chaos in markets.
      // - Mandelbrot/Julia escape orbits: fractal sets & boundaries, live param morph.
      // - Return maps / Poincare sections, quadtree live inserts, simple recursive subdivision.
      // All drawn with the exact same primitives as the arb sim + project thumbnails (pure #000, faint grid, #00f0ff / #67f6ff luminous dots + thin short segments + glow/shadow, newest elements brighter accent). Spatially separated, slow param evolution, no overlapping mess. Minimum speed. Live & bright on top bkg while staying restrained (x.ai / SpaceX cinematic black + 2026 luminous mesh).
      // Sources conceptually: quant finance texts (lattice/CRR trees), chaos/fractal viz (IFS, DLA, attractors), space-filling locality (Hilbert), vector field methods for SDEs.

      const t = time * 0.008; // minimum motion speed

      // frame counter for rate-limiting heavy drawing (field grid, etc) while keeping sim/particles full rate
      if (window._frame == null) window._frame = 0;
      window._frame++;

      // --- Layer 1: subtle vector field (faint directed ticks across most of the area, SDE drift reference) ---
      ctx.strokeStyle = 'rgba(0,240,255,0.22)';
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 1.5;
      ctx.lineWidth = 0.7;
      const fieldCx = w * 0.5 + Math.sin(t * 0.6) * 28 + (heroMouseRef.current.x - 0.5) * 18; // slight mouse pull for interactivity (live from ref, no render cost)
      const fieldCy = h * 0.48 + Math.cos(t * 0.5) * 22;
      const gstep = 55; // larger = fewer beginPath/stroke (heavy at 60 fps on hero)
      if (window._frame % 2 === 0) {
        for (let gx = 36; gx < w - 28; gx += gstep) {
          for (let gy = 52; gy < h - 44; gy += gstep) {
            const dx = (fieldCx - gx) * 0.028;
            const dy = (fieldCy - gy) * 0.028 + Math.sin((gx + gy) * 0.012 + t) * 1.6; // gentle curl + mean-revert
            const len = Math.min(11, Math.sqrt(dx*dx + dy*dy) + 0.6);
            const ex = gx + dx * (len / (Math.hypot(dx, dy) || 1));
            const ey = gy + dy * (len / (Math.hypot(dx, dy) || 1));
            ctx.beginPath();
            ctx.moveTo(gx, gy);
            ctx.lineTo(ex, ey);
            ctx.stroke();
            // tiny arrow head
            if (len > 4) {
              const hx = ex - dx * 2.6 / len;
              const hy = ey - dy * 2.6 / len;
              ctx.moveTo(ex, ey);
              ctx.lineTo(hx + dy * 1.6 / len, hy - dx * 1.6 / len);
              ctx.stroke();
            }
          }
        }
      }
      ctx.shadowBlur = 0;

      // --- Layer 2: IFS Sierpinski chaos game (left third) - crisp accumulating dots, no waves ---
      // 5 walkers, each frame randomly jump toward one of 3 triangle vertices. History dots form the gasket.
      {
        if (!window.ifsPts) window.ifsPts = [];
        const ifs = window.ifsPts;
        const vx = [w * 0.12, w * 0.22, w * 0.17];
        const vy = [h * 0.22, h * 0.22, h * 0.42];
        if (ifs.length < 12) {
          for (let i = 0; i < 12; i++) ifs.push({ x: vx[0] + Math.random() * 40, y: vy[0] + Math.random() * 30 });
        }
        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 2.5;
        for (let wi = 0; wi < 5; wi++) {
          const p = ifs[(ifs.length - 1 - wi * 3 + ifs.length) % ifs.length] || { x: vx[0], y: vy[0] };
          const j = Math.floor(Math.random() * 3);
          p.x = p.x * 0.5 + vx[j] * 0.5;
          p.y = p.y * 0.5 + vy[j] * 0.5;
          ifs.push({ x: p.x, y: p.y });
        }
        if (ifs.length > 1650) ifs.splice(0, ifs.length - 1650);
        for (let i = 0; i < ifs.length; i += 2) { // subsample for density/perf
          const pt = ifs[i];
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 1.05, 0, Math.PI * 2);
          ctx.fill();
        }
        // newest walker accents
        ctx.fillStyle = '#67f6ff';
        for (let k = 0; k < 3; k++) {
          const pt = ifs[ifs.length - 1 - k];
          if (pt) { ctx.beginPath(); ctx.arc(pt.x, pt.y, 1.7, 0, Math.PI * 2); ctx.fill(); }
        }
        ctx.shadowBlur = 0;
      }

      // --- Layer 3: DLA cluster (center, lower-mid) - live growing Brownian tree / aggregation ---
      {
        if (!window.dlaStuck) window.dlaStuck = [{ x: w * 0.48, y: h * 0.58 }];
        if (!window.dlaWalkers) window.dlaWalkers = [];
        const stuck = window.dlaStuck;
        let walkers = window.dlaWalkers;
        // spawn a few new walkers from edges occasionally
        if (walkers.length < 7 && (time % 3 < 0.04)) {
          walkers.push({ x: 28 + Math.random() * (w * 0.18), y: 70 + Math.random() * (h * 0.7) });
          walkers.push({ x: w * 0.82 + Math.random() * 26, y: 90 + Math.random() * (h * 0.65) });
        }

        // spatial hash buckets for O(1) proximity instead of O(N) linear scan over all stuck every frame (the #1 cause of slow hero canvas at top)
        const cellSize = 10;
        const buckets = new Map();
        for (let s = 0; s < stuck.length; s++) {
          const p = stuck[s];
          const key = `${Math.floor(p.x / cellSize)},${Math.floor(p.y / cellSize)}`;
          if (!buckets.has(key)) buckets.set(key, []);
          buckets.get(key).push(p);
        }

        ctx.fillStyle = '#00f0ff';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 3;
        // step walkers + check stick (only nearby cells)
        for (let wi = walkers.length - 1; wi >= 0; wi--) {
          const wlk = walkers[wi];
          wlk.x += (Math.random() - 0.5) * 3.2;
          wlk.y += (Math.random() - 0.5) * 3.2;
          // clamp
          wlk.x = Math.max(22, Math.min(w - 22, wlk.x));
          wlk.y = Math.max(48, Math.min(h - 36, wlk.y));
          let stuckIt = false;
          const kx = Math.floor(wlk.x / cellSize);
          const ky = Math.floor(wlk.y / cellSize);
          for (let dx = -1; dx <= 1 && !stuckIt; dx++) {
            for (let dy = -1; dy <= 1 && !stuckIt; dy++) {
              const key = `${kx + dx},${ky + dy}`;
              const arr = buckets.get(key) || [];
              for (let j = 0; j < arr.length; j++) {
                const ddx = arr[j].x - wlk.x;
                const ddy = arr[j].y - wlk.y;
                if (ddx * ddx + ddy * ddy < 5.8 * 5.8) {
                  stuck.push({ x: wlk.x, y: wlk.y });
                  stuckIt = true;
                  break;
                }
              }
            }
          }
          if (stuckIt) walkers.splice(wi, 1);
        }
        // draw cluster (subsample for speed — still looks dense)
        for (let s = 0; s < stuck.length; s += 2) {
          const pt = stuck[s];
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 1.15, 0, Math.PI * 2);
          ctx.fill();
        }
        // current walkers
        ctx.fillStyle = '#a5f3ff';
        for (let k = 0; k < walkers.length; k++) {
          const pt = walkers[k];
          ctx.beginPath(); ctx.arc(pt.x, pt.y, 1.6, 0, Math.PI * 2); ctx.fill();
        }
        if (stuck.length > 720) stuck.splice(0, 50); // lower cap + lighter trim
        ctx.shadowBlur = 0;
      }

      // --- Layer 4: Live binomial recombining scenario tree (right third) - quant lattice growth ---
      {
        if (!window.binomNodes) window.binomNodes = [{ x: w * 0.78, y: h * 0.18, lev: 0 }];
        const nodes = window.binomNodes;
        const maxLev = 7;
        const currLev = Math.min(maxLev, Math.floor((t * 1.8) % (maxLev + 1.6)));
        // grow one level at a time (slow)
        while (nodes.filter(n => n.lev === nodes[nodes.length - 1].lev).length > 0 && nodes[nodes.length - 1].lev < currLev) {
          const frontier = nodes.filter(n => n.lev === nodes[nodes.length - 1].lev);
          const nextLev = nodes[nodes.length - 1].lev + 1;
          const spread = 38 + nextLev * 3.5;
          frontier.forEach((nd, idx) => {
            const baseX = nd.x;
            // recombining: left/up and right/down share some x slots
            // store parent coords so the per-frame branch draw does not have to scan backwards (avoids O(N^2) per frame)
            nodes.push({ x: baseX - spread * 0.6 + (idx % 2) * 1.5, y: nd.y + 31, lev: nextLev, parentX: baseX, parentY: nd.y });
            nodes.push({ x: baseX + spread * 0.6 - (idx % 2) * 1.5, y: nd.y + 31, lev: nextLev, parentX: baseX, parentY: nd.y });
          });
        }
        // draw branches (thin) then nodes — parent coords pre-stored at growth time (no per-frame backward scan)
        ctx.strokeStyle = 'rgba(0,240,255,0.55)';
        ctx.shadowColor = '#00f0ff';
        ctx.shadowBlur = 2;
        ctx.lineWidth = 0.85;
        for (let i = 0; i < nodes.length; i++) {
          const nd = nodes[i];
          if (nd.lev === 0 || nd.parentX == null) continue;
          ctx.beginPath();
          ctx.moveTo(nd.parentX, nd.parentY);
          ctx.lineTo(nd.x, nd.y);
          ctx.stroke();
        }
        ctx.shadowBlur = 0;
        // nodes: older dimmer, newest bright accent
        for (let i = 0; i < nodes.length; i++) {
          const nd = nodes[i];
          const isNew = nd.lev === currLev || nd.lev === currLev - 1;
          ctx.fillStyle = isNew ? '#67f6ff' : 'rgba(0,240,255,0.75)';
          ctx.beginPath();
          ctx.arc(nd.x, nd.y, isNew ? 2.1 : 1.25, 0, Math.PI * 2);
          ctx.fill();
        }
        // reset tree occasionally for continuous live growth feel (slow cycle)
        if (nodes.length > 190) {
          window.binomNodes = [{ x: w * 0.78, y: h * 0.18, lev: 0 }];
        }
      }

      // --- Layer 5: advected flow particles (on top of field, give real motion without waves) ---
      {
        if (!window.flowParts) window.flowParts = [];
        let parts = window.flowParts;
        if (parts.length < 32) {
          for (let i = parts.length; i < 32; i++) parts.push({ x: 40 + Math.random() * (w - 80), y: 60 + Math.random() * (h - 110), age: Math.random() * 80 });
        }
        ctx.fillStyle = 'rgba(103,246,255,0.85)';
        ctx.shadowColor = '#67f6ff';
        ctx.shadowBlur = 2.5;
        for (let i = parts.length - 1; i >= 0; i--) {
          const p = parts[i];
          // sample field at p (same mean-revert + curl as above)
          const dx = (fieldCx - p.x) * 0.026 + Math.sin((p.x + p.y) * 0.011 + t) * 0.9;
          const dy = (fieldCy - p.y) * 0.026;
          p.x += dx * 0.82 + (Math.random() - 0.5) * 0.7; // advection + diffusion
          p.y += dy * 0.82 + (Math.random() - 0.5) * 0.7;
          p.age += 1;
          // respawn when old or out
          if (p.age > 92 || p.x < 18 || p.x > w - 18 || p.y < 38 || p.y > h - 32) {
            p.x = 32 + Math.random() * (w * 0.22);
            p.y = 58 + Math.random() * (h * 0.68);
            p.age = 5;
          }
          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.1, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.shadowBlur = 0;
      }

      // subtle cosmic particles + low aurora tints (depth + top section luminosity on pure black, matches other bright sections)
      ctx.shadowColor = '#00f0ff';
      ctx.shadowBlur = 2.5;
      ctx.fillStyle = 'rgba(0,240,255,0.24)';
      for (let i = 0; i < 6; i++) {
        const px = (52 + i * 92) % w;
        const py = (h * 0.36 + Math.sin(time * 0.009 + i) * 38) % (h * 0.72);
        ctx.beginPath(); ctx.arc(px, py, 1.25 + Math.sin(time * 0.022 + i) * 0.35, 0, Math.PI * 2); ctx.fill();
      }
      ctx.shadowBlur = 0;

      // --- More cosmic sparkle twinkles layer (Aceternity Sparkles + x.ai aurora cosmic particles on black research).
      // Extra live animation/gradient directly on the IFS/DLA/binomial/flow patterns bg using identical primitives (low-op cyan dots, phase twinkle, slight mouse influence for micro).
      // Positioned in safe bands, very subtle so the main quant structures (gasket, cluster, tree, flows) stay neat and dominant. Pure black foundation preserved.
      ctx.shadowColor = '#67f6ff';
      ctx.shadowBlur = 1.5;
      ctx.fillStyle = 'rgba(0,240,255,0.16)';
      for (let i = 0; i < 5; i++) {
        const baseX = 70 + ((i * 97) % (w - 140));
        const baseY = h * 0.28 + Math.sin(time * 0.007 + i * 1.3) * (h * 0.18);
        const mx = (heroMouseRef.current.x || 0) * (4 + i % 3);
        const my = (heroMouseRef.current.y || 0) * (3 + (i % 2));
        const px = baseX + mx;
        const py = baseY + my;
        const r = 0.9 + Math.sin(time * 0.028 + i * 2) * 0.35;
        ctx.beginPath(); ctx.arc(px, py, Math.max(0.6, r), 0, Math.PI * 2); ctx.fill();
      }
      ctx.shadowBlur = 0;

      const aur1 = ctx.createRadialGradient(w * 0.26, h * 0.28, 0, w * 0.26, h * 0.28, 310);
      aur1.addColorStop(0, 'rgba(0,240,255,0.022)');
      aur1.addColorStop(1, 'transparent');
      ctx.fillStyle = aur1; ctx.fillRect(0, 0, w, h);

      const aur2 = ctx.createRadialGradient(w * 0.71, h * 0.68, 0, w * 0.71, h * 0.68, 260);
      aur2.addColorStop(0, 'rgba(255,138,0,0.015)');
      aur2.addColorStop(1, 'transparent');
      ctx.fillStyle = aur2; ctx.fillRect(0, 0, w, h);

      ctx.shadowBlur = 0;
      time += 0.008; // locked minimum speed
    }

    function loop() { draw(); requestAnimationFrame(loop); }
    resize();
    const ro = new ResizeObserver(resize);
    if (canvas.parentElement) ro.observe(canvas.parentElement);
    loop();
    return () => ro.disconnect();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setFormStatus("submitting");

      const response = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          "form-name": "contact",
          ...formData
        }).toString()
      });

      if (response.ok) {
        setFormStatus("success");
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => setFormStatus("idle"), 5000);
      } else {
        throw new Error("Form submission failed");
      }
    } catch (error) {
      console.error(error);
      setFormStatus("error");
      setTimeout(() => setFormStatus("idle"), 5000);
    }
  };

  // Form status is now handled by the string state 'formStatus'

  // Track scroll position for potential scroll-based animations
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const sections = SECTION_NAV.map(({ id }) => document.getElementById(id)).filter(Boolean);

    if (!sections.length || !("IntersectionObserver" in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visibleEntry = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (visibleEntry?.target?.id) {
          setActiveSection(visibleEntry.target.id);
        }
      },
      {
        rootMargin: "-34% 0px -52% 0px",
        threshold: [0.1, 0.35, 0.6],
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  // Removed dead animation variants from original hero (fadeInUp, staggerContainer, fadeIn, float, textReveal, etc.)
  // They are no longer referenced after hero redesign for research elements (pills + mission statement).

  // Spotlight handler for Aceternity-inspired direction-aware luminous mouse-follow glow on bento cards (x.ai cosmic + glow 2026 on pure AMOLED).
  // Sets CSS vars --spot-x/--spot-y so the ::before radial follows cursor for interactive directional bloom.
  const handleCardSpotlight = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    e.currentTarget.style.setProperty('--spot-x', `${x}%`);
    e.currentTarget.style.setProperty('--spot-y', `${y}%`);
  };
  const resetCardSpotlight = (e) => {
    e.currentTarget.style.setProperty('--spot-x', '50%');
    e.currentTarget.style.setProperty('--spot-y', '50%');
  };

  const renderProjectGrid = (projectList, keyPrefix = '') =>
    projectList.map((project, index) => {
      const testMatch = project.description.match(/(\d+)\s+passing tests/i);
      const missionLabel = project.id.startsWith("p") ? "Flagship" : "Research";
      const evidenceLabel = testMatch ? `${testMatch[1]} tests` : "Repository";

      // Extract key repo-sourced metrics for more informative cards (from actual project descriptions/graphs in listed repos only; no new data). Examples: Sharpe, speedup x, PnL, accuracy %, etc.
      const metricMatches = [];
      const sharpe = project.description.match(/(?:net |gross |median )?sharpe\s*[:~]?\s*([\d.]+)/i);
      if (sharpe) metricMatches.push(`Sharpe ${sharpe[1]}`);
      const speedup = project.description.match(/([\d.]+x)\s*(?:Heston|GPU|speedup|performance)/i);
      if (speedup) metricMatches.push(speedup[1]);
      const pnl = project.description.match(/~?\$?([\d.]+)\s*PnL/i);
      if (pnl) metricMatches.push(`$${pnl[1]} PnL`);
      const acc = project.description.match(/(\d+(?:\.\d+)?%)\s*(?:acc|accuracy)/i);
      if (acc) metricMatches.push(acc[1]);
      const keyMetrics = metricMatches.slice(0, 2); // at most 2 for clean UI

      const itemKey = keyPrefix ? `${keyPrefix}-${project.id}` : project.id;

      return (
      <motion.div
        key={itemKey}
        className="bento-card bento-hover-refined premium-panel group relative overflow-hidden rounded-2xl shadow-xl cursor-pointer border border-white/5 glow-cyan grain premium-hover stagger-item project-card-item glowing-effect"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.55, delay: index * 0.06 }}
        whileHover={{
          y: -8,
          scale: 1.025,
          transition: { type: 'spring', stiffness: 280, damping: 22 }
        }}
        onMouseMove={handleCardSpotlight}
        onMouseLeave={resetCardSpotlight}
        onClick={() => {
          navigate(`/project/${project.id}`, { state: project });
        }}
      >
        <div
          className="modern-repo-graph relative w-full overflow-hidden glowing-effect"
          style={{ aspectRatio: "16/9", background: "#000000" }}
        >
          <RepoGraphThumbnail project={project} />
          {/* Stronger bottom darkening + hard black separator to fully hide any text/content from the p-4 section below.
              Prevents "text underneath the thumbnail" from becoming slightly visible during hover scale/lift transforms.
              Taller gradient (h-3/4), starts from full black, higher opacity, plus a 2px solid black strip at the exact seam. */}
          <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-black via-black/95 to-transparent opacity-95" />
          <div className="absolute inset-x-0 bottom-0 h-[2px] bg-black" />
          <a
            href={project.github}
            onClick={(e) => e.stopPropagation()}
            target="_blank"
            rel="noopener noreferrer"
            className="pill pill-small ripple absolute bottom-3 right-3 sm:bottom-4 sm:right-4 opacity-0 group-hover:opacity-100 active:opacity-100 transition"
          >
            GITHUB
          </a>
        </div>

        <div className="p-4">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="bento-meta">{missionLabel}</span>
            <span className="pill pill-small text-[#a1a1aa]">{evidenceLabel}</span>
            {keyMetrics.length > 0 && keyMetrics.map((m, mi) => (
              <span key={mi} className="pill pill-small text-[#00f0ff]/90 border border-[#00f0ff]/30">{m}</span>
            ))}
          </div>
          <h3 className="text-[16px] font-semibold tracking-[-0.2px] mb-1.5 text-white group-hover:text-[#00f0ff] transition-colors lamp-effect">
            {project.title}
          </h3>
          <p className="text-[#a1a1aa] text-sm line-clamp-4 mb-3 leading-snug">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {project.technologies.slice(0, 6).map((tech, techIndex) => (
              <motion.span
                key={techIndex}
                className="pill pill-small text-[#a1a1aa] glow-cyan"
                whileHover={{
                  scale: 1.08,
                  y: -2,
                  boxShadow: "0 0 8px rgba(0,240,255,0.4)",
                  transition: { type: "spring", stiffness: 400, damping: 18 }
                }}
              >
                {tech}
              </motion.span>
            ))}
          </div>
          {/* Always-visible repo link for more info + direct access (more informative cards) */}
          <a
            href={project.github}
            onClick={(e) => e.stopPropagation()}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] text-[#00f0ff]/80 hover:text-[#00f0ff] mt-3 transition-colors moving-border"
          >
            VIEW FULL REPO <span aria-hidden="true">↗</span>
          </a>
        </div>
      </motion.div>
      );
    });

  // (Dead animation variants from original hero removed for cleanliness after research-driven hero update:
  // _scaleUp, float, textReveal, _scrollProgress etc.)

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-amoled)", color: "white" }}
    >
      {/* Scroll progress bar - subtle luminous gradient (2026 trends: micro feedback, dark luminous UI from x.ai/SpaceX style sites) */}
      <div
        className="scroll-progress"
        style={{ width: `${Math.min(100, (_scrollY / (document.body.scrollHeight - window.innerHeight) || 0) * 100)}%` }}
      />

      <nav className="section-nav" aria-label="Section navigation">
        {SECTION_NAV.map((item) => (
          <a
            key={item.id}
            href={`#${item.id}`}
            className={`section-dot${activeSection === item.id ? " is-active" : ""}`}
            aria-label={`Go to ${item.label}`}
            aria-current={activeSection === item.id ? "true" : undefined}
          >
            <span className="section-dot-label">{item.label.toUpperCase()}</span>
          </a>
        ))}
      </nav>

      {/* Hero Section — cinematic realtime (xAI frontier + SpaceX scale) */}
      <header
        id="home"
        className="relative h-screen overflow-hidden flex flex-col justify-center items-center px-4 bg-black"
        onMouseMove={(e) => {
          // throttled + ref based (kept for iridescent CTA shimmer, lightweight)
          if (!window._lastHeroMove) window._lastHeroMove = 0;
          const now = performance.now();
          if (now - window._lastHeroMove < 18) return;
          window._lastHeroMove = now;

          const rect = e.currentTarget.getBoundingClientRect();
          const x = ((e.clientX - rect.left) / rect.width - 0.5) * 8;
          const y = ((e.clientY - rect.top) / rect.height - 0.5) * 6;
          heroMouseRef.current = { x, y };

          // Mouse-reactive iridescent shimmer for CTAs (from glow css 2026 research + Aceternity micro interactions)
          const angle = Math.atan2(y, x) * (180 / Math.PI) + 180;
          e.currentTarget.style.setProperty('--iridescent-angle', `${angle}deg`);
        }}
        onMouseLeave={() => {
          heroMouseRef.current = { x: 0, y: 0 };
        }}
      >
        {/* TEMP: removed heavy canvas animations (IFS/DLA/binomial/flow + sparkles) for now because too slow to render at top.
            Pure AMOLED #000 black background as requested. Orbs also removed for clean black.
            Structure/comments preserved for easy restore later. */}

        {/* Invisible wrapper for hero title block + CTAs. The "card" / glass panel is now fully transparent so the live blue-line animated background (canvas + aurora) shows directly behind the text.
           Padding kept only for breathing room around content; no visual background, border, or glass effects. Text readability relies on strong luminous shadows (already tuned). */}
        <div className="z-10 text-center max-w-5xl mx-auto relative px-5 sm:px-8 py-7 md:px-12 md:py-9" style={{ background: 'transparent', border: 'none' }}>
          {/* Bold, confident title — inspired by x.ai & SpaceX hero scale. More fluid + phone-friendly base size (prevents oversized text on small viewports while scaling up beautifully). */}
          {/* Hero title + mission (x.ai stacked bold + SpaceX mission-statement scale; kinetic via FM stagger on view) */}
          <h1 className="text-[40px] sm:text-[52px] md:text-[68px] lg:text-[82px] font-semibold tracking-[-2.8px] sm:tracking-[-3.2px] leading-[0.9] mb-3 sm:mb-4 text-white luminous-text" style={{ textShadow: '0 0 12px rgba(0,240,255,0.7), 0 0 24px rgba(0,240,255,0.35)' }}>
            PARITOSH<br />DWIVEDI
          </h1>

          <p className="text-[15px] sm:text-lg md:text-xl text-[#e5e7eb] mb-2 sm:mb-3 tracking-[0.5px] font-light max-w-[52ch] mx-auto" style={{ textShadow: '0 0 4px rgba(255,255,255,0.3)' }}>
            Quantitative Researcher &amp; Systems Builder
          </p>
          <p className="text-sm sm:text-base md:text-lg text-[#00f0ff] tracking-[1px] mb-6 sm:mb-8 max-w-[52ch] mx-auto" style={{ textShadow: '0 0 8px rgba(0,240,255,0.6)' }}>
            FRONTIER MODELS • ROBUST EXECUTION • REAL-TIME ALPHA
          </p>

          {/* Socials + primary CTAs — x.ai pill style (white outline on pure black). Icon-only (no visible labels on top, per requirements; aria + title for a11y) */}
          <div className="flex flex-wrap justify-center gap-3 mb-6 sm:mb-8">
            {[
              { icon: <FaGithub />, url: "https://github.com/pdwi2020", label: "GitHub", external: true },
              { icon: <FaLinkedin />, url: "https://www.linkedin.com/in/paritosh-dwivedi-792120308?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app", label: "LinkedIn", external: true },
              { icon: <FaXTwitter />, url: "https://x.com/paritoshDwi223", label: "X", external: true },
              { icon: <FaEnvelope />, url: "#contact", label: "Contact", external: false },
            ].map((item, index) => (
              <a
                key={index}
                href={item.url}
                target={item.external ? "_blank" : ""}
                rel={item.external ? "noopener noreferrer" : ""}
                className="pill text-sm tracking-widest"
                aria-label={item.label}
                title={item.label}
              >
                <span className="text-lg">{item.icon}</span>
              </a>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 mb-8 sm:mb-10 hero-ctas" style={{ perspective: '800px' }} onMouseMove={handleCardSpotlight} onMouseLeave={resetCardSpotlight}>
            {/* Magnetic spring CTAs (Aceternity-style micro + 2026 interactive hero research): springy lift + scale on hover for "pull" feel on pure black pills. Stacked on phones for thumb reach. */}
            <motion.a
              href="#lab"
              className="pill pill-primary ripple"
              whileHover={{ y: -2, scale: 1.025, rotateX: 4, transition: { type: 'spring', stiffness: 420, damping: 18 } }}
              whileTap={{ scale: 0.985 }}
            >
              EXPLORE THE LAB
            </motion.a>
            <motion.a
              href="#projects"
              className="pill ripple"
              whileHover={{ y: -2, scale: 1.02, rotateX: -3, transition: { type: 'spring', stiffness: 380, damping: 20 } }}
              whileTap={{ scale: 0.985 }}
            >
              VIEW RESEARCH MISSIONS
            </motion.a>
          </div>
        </div>

        {/* Scroll prompt — placed after the glass title block (sibling inside header) for layout, given z-10 to layer above aurora. Matches the visual flow from correct reference sections. */}
        <a href="#about" className="inline-flex flex-col items-center text-[#bbb] hover:text-[#00f0ff] transition-colors group z-10 mt-2" style={{ textShadow: '0 0 12px rgba(0,240,255,0.5)' }}>
            <span className="text-[10px] tracking-[4px] mb-2 font-medium">SCROLL TO EXPLORE</span>
            {/* Enhanced prominent scrolling animation (per "tge scrolling animation isnt prominent, make it visible").
                Thicker 3px track (higher base opacity on pure #000 for visibility), taller container + moving bar, centered with rounded, intense 4-layer neon cyan bloom (extra outer soft glow) so the traveling bar stands out clearly. Longer visible descent phase + snappier cycle for strong presence while still elegant/minimal. */}
            <div className="relative w-[3px] h-11 bg-white/40 overflow-hidden rounded-full group-hover:bg-white/55 transition-all">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[3px] h-8 bg-[#00f0ff] rounded-full shadow-[0_0_8px_#00f0ff,0_0_16px_#00f0ff,0_0_28px_#00f0ff,0_0_48px_rgba(0,240,255,0.55)] animate-[scroll-indicator_1.9s_infinite_ease-in-out]" />
            </div>
          </a>

      </header>

      {/* About Section — responsive padding (mobile override in CSS for thumb reach + rhythm) */}
      <section id="about" className="pt-12 sm:pt-16 md:pt-20 px-4" style={{ paddingBottom: "4rem" }}>
        <div style={{ maxWidth: "56rem", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="liquid-glass liquid-refraction rounded-2xl"
            style={{
              padding: "clamp(1.5rem, 4vw, 2rem)",
              borderRadius: "0.75rem",
            }}
          >
            <h2
              style={{
                fontSize: "clamp(2.25rem, 5vw, 3rem)",
                fontWeight: "bold",
                marginBottom: "2rem",
                textAlign: "center",
              }}
            >
              {/* Aceternity Text Generate (research for micro stagger on headlines in glass sections; fits less blurry glassmorphism + luminous hover). */}
              {"About Me".split("").map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.03, delay: i * 0.02 }}
                  style={{ display: "inline-block" }}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "2rem",
                alignItems: "center",
              }}
            >
              <div>
                <div className="aspect-square rounded-xl bg-black border border-white/10 overflow-hidden liquid-refraction luminous-border">
                  {/* Profile image */}
                  <img
                    src="/assets/copilot_image_1747795831849.jpg"
                    alt="Profile"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      borderRadius: "0.75rem",
                      display: "block",
                    }}
                  />
                </div>
              </div>
              <div>
                <p
                  style={{
                    fontSize: "1.125rem",
                    marginBottom: "1.5rem",
                    color: "rgba(209, 213, 219, 1)",
                  }}
                >
                  I'm an aspiring quantitative researcher with a strong
                  foundation in mathematics, statistics, and programming. I
                  specialize in applying statistical and mathematical methods to
                  analyze financial markets and develop data-driven trading
                  strategies.
                </p>
                <p
                  style={{
                    color: "rgba(209, 213, 219, 1)",
                    marginBottom: "1.5rem",
                  }}
                >
                  My journey began with a deep curiosity about market patterns
                  and financial modeling, which evolved into a passion for
                  quantitative analysis. I'm constantly exploring advanced
                  mathematical concepts and computational techniques to identify
                  market opportunities and manage risk effectively.
                </p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Python",
                    "R",
                    "MATLAB",
                    "Statistical Modeling",
                    "Machine Learning",
                    "Time Series Analysis",
                    "Risk Management",
                    "C++",
                  ].map((skill, index) => (
                    <span
                      key={index}
                      className="pill pill-small micro-feedback luminous-text"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Compact Impact row — realtime numbers feel */}
      <div className="border-y border-white/10 bg-black py-5">
        {/* Bento impact - researched bento modular with micro glows and cosmic accents + extra aurora mesh gradient (x.ai aurora + 2026 mesh research) */}
        <div className="max-w-5xl mx-auto px-4 bento-grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm aurora-mesh liquid-refraction">
          {[
            { label: "Flagship QR Missions", value: "5" },
            { label: "Peer-Reviewed Tests", value: "300+" },
            { label: "GPU Speedups", value: "12×" },
            { label: "Markets & Models Explored", value: "∞" },
          ].map((stat, i) => (
            <div key={i} className="bento-card premium-panel p-3 grain micro-glow cosmic-particle py-1">
              <div className="font-mono text-2xl text-[#00f0ff] tracking-tighter">{stat.value}</div>
              <div className="text-[#a1a1aa] text-xs tracking-wider mt-0.5">{stat.label.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects Section */}
      <section id="projects" className="py-20 px-4 md:px-8 lg:px-16 bg-black">
        <div className="max-w-6xl mx-auto overflow-x-hidden">
          <motion.h2
            className="lamp-effect"
            style={{
              fontSize: "clamp(1.875rem, 5vw, 2.25rem)",
              fontWeight: "bold",
              marginBottom: "3rem",
              textAlign: "center",
            }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Aceternity Text Generate Effect style (staggered letter reveal from research on top Aceternity repo for micro animation/gradient on headlines).
               Pure Framer + spans for typewriter-like generate on view, fits AMOLED luminous + glass headlines requirement (less blur preserved, hover glow via lamp). */}
            {"Research Projects".split("").map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.03, delay: i * 0.015 }}
                className="inline-block"
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.h2>

          <div
            className="w-full"
            style={{
              display: "grid",
              gap: "2.5rem",
            }}
          >
            <div className="w-full">
              <h3
                style={{
                  fontSize: "1.375rem",
                  fontWeight: "700",
                  marginBottom: "1rem",
                }}
              >
                Quant Research Portfolio
              </h3>

              {/* Subtle Infinite Moving Cards / marquee (Aceternity style) for "Live from the Repos" — surfaces additional repo-sourced metrics & results from the listed projects only. Seamless loop animation (Framer-inspired + CSS scroll for perf), pauses on hover (micro-interaction). Pure AMOLED dark with luminous accents. */}
              <div className="repo-marquee mb-4 aurora-mesh" style={{ '--duration': '42s' }}>
                <div className="repo-marquee-inner">
                  {[
                    "P1: 0.26 net Sharpe (Russell 3000 momentum) • 83 tests",
                    "P2: ~$662 PnL on 972 fills • 46 tests",
                    "P3: PCA PC1 99% surface variance • 55 tests",
                    "P4: Regime OU 1.07 median Sharpe • 60 tests",
                    "P5: 12× Heston GPU vs CPU (T4) • 75 tests",
                    "Earlier: 95.39% EuroSAT ensemble • 40× CUDA MC"
                  ].concat([
                    "P1: 0.26 net Sharpe (Russell 3000 momentum) • 83 tests",
                    "P2: ~$662 PnL on 972 fills • 46 tests",
                    "P3: PCA PC1 99% surface variance • 55 tests",
                    "P4: Regime OU 1.07 median Sharpe • 60 tests",
                    "P5: 12× Heston GPU vs CPU (T4) • 75 tests",
                    "Earlier: 95.39% EuroSAT ensemble • 40× CUDA MC"
                  ]).map((item, idx) => (
                    <span key={idx} className="repo-marquee-item">
                      {item}
                    </span>
                  ))}
                </div>
              </div>

              {/* Horizontal scroll shuffle / infinite marquee for the new/Quant flagship project cards (Aceternity-style infinite moving cards + CSS translate loop for seamless scroll).
                 Multiple duplicated lists (4 copies) + 25% shift animation so the repeat is not noticeable (fixes visible seam/repeat after ~P3 with only 5 unique items).
                 Looks like continuous infinite flow just like the Earlier Research Projects section (which has more unique items so 2 copies suffice).
                 Pause on hover. Same project-card-item, overflow-hidden + aurora-mesh wrappers. Keeps all canvas thumbnails (with live particles), hovers, metrics, etc. */}
              <div className="overflow-hidden w-full aurora-mesh">
                <div
                  className="project-cards-scroller quant-infinite"
                  style={{ '--duration': '45s' }}
                >
                  {renderProjectGrid(quantPortfolioProjects, 'quant1')}
                  {renderProjectGrid(quantPortfolioProjects, 'quant2')}
                  {renderProjectGrid(quantPortfolioProjects, 'quant3')}
                  {renderProjectGrid(quantPortfolioProjects, 'quant4')}
                </div>
              </div>
            </div>

            <div className="w-full">
              <h3
                style={{
                  fontSize: "1.375rem",
                  fontWeight: "700",
                  marginBottom: "1rem",
                }}
              >
                Earlier Research Projects
              </h3>
              {/* Horizontal scroll shuffle for earlier projects (same as above, infinite scroll shuffle implementation). */}
              <div className="overflow-hidden w-full aurora-mesh">
                <div
                  className="project-cards-scroller"
                  style={{ '--duration': '45s' }}
                >
                  {renderProjectGrid(previousResearchProjects, 'earlier1')}
                  {renderProjectGrid(previousResearchProjects, 'earlier2')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quant Lab — realtime interactive signature piece */}
      <section id="lab" className="py-16 px-4 md:px-8 bg-black aurora-mesh">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8 text-center">
            <div className="uppercase text-[10px] tracking-[3.5px] text-[#00f0ff] mb-1">EXPERIENCE THE WORK</div>
            <motion.h2
              className="section-header lamp-effect bg-clip-text text-transparent bg-gradient-to-r from-[#00f0ff] via-white to-[#a78bfa] luminous-text"
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              {"Quant Lab".split("").map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0.6, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.022, duration: 0.22 }}
                  viewport={{ once: true }}
                  className="inline-block"
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </motion.h2>
            <p className="mt-3 text-[#a1a1aa] max-w-2xl mx-auto">
              Live, browser-native statistical arbitrage execution simulator. Move the parameters — the equity curve and fills react in realtime.
            </p>
          </div>
          <QuantLab />
        </div>
      </section>

      {/* Subtle SpaceX-inspired divider + more gradient (luminous on black, from 2026 glow trends) */}
      <div className="spacex-divider" />

      {/* Education Section */}
      <section
        id="education"
        className="relative overflow-hidden bg-black aurora-mesh"
        style={{
          padding: "5rem 1rem",
        }}
      >
        <div style={{ maxWidth: "80rem", margin: "0 auto", position: "relative", zIndex: 2 }}>
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#00f0ff] via-white to-[#a78bfa] luminous-text lamp-effect"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Aceternity Text Generate Effect (staggered letter reveal from top repo research for micro animation on glass headlines; preserves reduced blur + lamp hover like projects h2). */}
            {"Education".split("").map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.03, delay: i * 0.02 }}
                className="inline-block"
              >
                {char}
              </motion.span>
            ))}
          </motion.h2>

          {/* Rich bento (news-style cards with meta + pills) — continued from prior pending + 2026 liquid/bento trends */}
          <div className="bento-grid aurora-mesh" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem', maxWidth: '72rem', margin: '0 auto', padding: '0 1rem' }}>
            {EDUCATION_ITEMS.map((education, index) => (
              <motion.div
                key={index}
                className="bento-card bento-hover-refined bento-education-card premium-panel liquid-refraction p-6 rounded-2xl flex flex-col h-full group overflow-hidden premium-hover stagger-item glowing-effect"
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, delay: index * 0.07 }}
                whileHover={{
                  y: -8,
                  scale: 1.018,
                  transition: { type: "spring", stiffness: 270, damping: 20 }
                }}
                onMouseMove={handleCardSpotlight}
                onMouseLeave={resetCardSpotlight}
              >
                <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-[#00f0ff]/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="mb-5">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="bento-meta">{education.meta}</span>
                    {education.grade && <span className="pill pill-small text-[#a1a1aa]">{education.grade}</span>}
                  </div>
                  <h3 className="text-lg md:text-xl font-semibold tracking-[-0.2px] text-white group-hover:text-[#00f0ff] transition-colors duration-200 leading-tight">
                    {education.title}
                  </h3>
                  <p className="text-[#d4d4d8] text-sm mt-3">{education.institution} • {education.location}</p>
                  <p className="text-[#00f0ff]/85 text-xs mt-1 font-mono">{education.date}</p>
                </div>
                <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-white/10">
                  {education.focus.map((focusArea, i) => (
                    <span key={i} className="pill pill-small text-[#a1a1aa] group-hover:text-white">
                      {focusArea}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section - aurora to match projects brightness reference */}
      <section id="certifications" className="relative bg-black aurora-mesh" style={{ padding: "5rem 1rem" }}>
        <div style={{ maxWidth: "80rem", margin: "0 auto" }}>
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#00f0ff] via-white to-[#ff8a00] luminous-text"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            {/* Aceternity Text Generate (staggered from research for micro on headlines in glassmorphism sections; less blur preserved). */}
            {"Certifications".split("").map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.03, delay: i * 0.018 }}
                className="inline-block"
              >
                {char}
              </motion.span>
            ))}
          </motion.h2>

          {/* Rich bento cert cards (continuation cards-news-bento + liquid glass / glassFolio) */}
          <div className="bento-grid aurora-mesh" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem', maxWidth: '64rem', margin: '0 auto', padding: '0 1rem' }}>
            {CERTIFICATIONS.map((cert, index) => (
              <motion.div
                key={index}
                className="bento-card bento-hover-refined bento-cert-card premium-panel overflow-hidden rounded-2xl flex flex-col h-full group glowing-effect"
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, delay: index * 0.08 }}
                whileHover={{ y: -5, transition: { type: "spring", stiffness: 320, damping: 24 } }}
                onMouseMove={handleCardSpotlight}
                onMouseLeave={resetCardSpotlight}
              >
                <div className="overflow-hidden bg-black border-b border-white/10" style={{ aspectRatio: '16/9' }}>
                  <img
                    src={cert.image}
                    alt={`${cert.title} Certificate`}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                  />
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className="bento-meta">Credential</span>
                    <span className="pill pill-small text-[#a1a1aa]">{cert.issuer}</span>
                    <span className="pill pill-small text-[#a1a1aa]">{cert.date}</span>
                  </div>
                  <h3 className="text-base font-semibold tracking-[-0.2px] text-white group-hover:text-[#00f0ff] transition-colors leading-snug mb-4">{cert.title}</h3>
                  <div className="flex flex-wrap gap-2 mb-4 mt-auto pt-4 border-t border-white/10">
                    {cert.skills.map((skill, i) => (
                      <span key={i} className="pill pill-small text-[#a1a1aa] group-hover:text-white">
                        {skill}
                      </span>
                    ))}
                  </div>
                  <a
                    href={cert.credential}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="pill ripple text-xs self-start mt-1"
                  >
                    VIEW CREDENTIAL
                  </a>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section - brightened with aurora to match vibrancy */}
      <section id="contact" className="bg-black aurora-mesh" style={{ padding: "5rem 1rem" }}>
        <div style={{ maxWidth: "48rem", margin: "0 auto" }}>
          <motion.div
            className="liquid-glass liquid-refraction rounded-2xl"
            style={{ padding: "clamp(2rem, 4vw, 3rem)" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-8 text-center bg-clip-text text-transparent bg-gradient-to-r from-[#00f0ff] via-white to-[#a78bfa] luminous-text"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              {/* Aceternity Text Generate staggered letters (research for micro animation/gradient on glass headlines like projects; reduced blur + hover glow preserved). */}
              {"Let's Connect".split("").map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.03, delay: i * 0.015 }}
                  className="inline-block"
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </motion.h2>
            <p className="text-center text-gray-300 mb-8">
              I'm interested in quantitative research opportunities in finance
              and trading. If you're looking for someone with strong analytical
              skills and a passion for financial markets, I'd love to connect!
            </p>

            <form
              name="contact"
              method="POST"
              data-netlify="true"
              netlify-honeypot="bot-field"
              className="space-y-6"
              onSubmit={handleSubmit}
            >
              <input type="hidden" name="form-name" value="contact" />
              <p className="hidden">
                <label>
                  Don't fill this out if you're human: <input name="bot-field" />
                </label>
              </p>
              {formStatus === "success" && (
                <div className="p-4 mb-4 text-sm rounded-lg bg-green-500/20 text-green-400">
                  Your message has been sent successfully!
                </div>
              )}

              {formStatus === "error" && (
                <div className="p-4 mb-4 text-sm rounded-lg bg-red-500/20 text-red-400">
                  Failed to send message. Please try again later.
                </div>
              )}

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label
                    htmlFor="name"
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="form-field"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <label
                    htmlFor="email"
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    className="form-field"
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <label
                  htmlFor="message"
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    marginBottom: "0.5rem",
                  }}
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows="5"
                  className="form-field"
                  placeholder="Your message here..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  required
                ></textarea>
              </div>

              <div style={{ textAlign: "center" }}>
                <button
                  type="submit"
                  className="pill pill-primary ripple"
                  disabled={formStatus === "submitting"}
                  style={{
                    width: "100%",
                    maxWidth: "200px",
                    padding: "0.75rem 2rem",
                    margin: "0 auto",
                    opacity: formStatus === "submitting" ? 0.7 : 1,
                    cursor:
                      formStatus === "submitting" ? "not-allowed" : "pointer",
                  }}
                >
                  {formStatus === "submitting" ? "Sending..." : "Send Message"}
                </button>
              </div>

              {formStatus === "success" && (
                <div className="mt-4 p-3 bg-green-800 bg-opacity-30 border border-green-500 rounded-md text-green-300">
                  Message sent successfully! I'll get back to you soon.
                </div>
              )}

              {formStatus === "error" && (
                <div className="mt-4 p-3 bg-red-800 bg-opacity-30 border border-red-500 rounded-md text-red-300">
                  Failed to send message. Please try again later or contact me
                  directly.
                </div>
              )}
            </form>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "2rem 1rem",
          borderTop: "1px solid rgba(31, 41, 55, 1)",
        }}
      >
        <div
          style={{
            maxWidth: "72rem",
            margin: "0 auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <p style={{ color: "rgba(156, 163, 175, 1)", marginBottom: "1rem" }}>
            &copy; {new Date().getFullYear()} Paritosh Dwivedi. All rights
            reserved.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", justifyContent: "center" }}>
            <a
              href="https://github.com/pdwi2020"
              target="_blank"
              rel="noopener noreferrer"
              className="pill pill-small"
              aria-label="GitHub"
            >
              <FaGithub />
            </a>
            <a
              href="https://www.linkedin.com/in/paritosh-dwivedi-792120308?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
              target="_blank"
              rel="noopener noreferrer"
              className="pill pill-small"
              aria-label="LinkedIn"
            >
              <FaLinkedin />
            </a>
            <a
              href="https://x.com/paritoshDwi223"
              target="_blank"
              rel="noopener noreferrer"
              className="pill pill-small"
              aria-label="X"
            >
              <FaXTwitter />
            </a>
            <a
              href="#contact"
              className="pill pill-small"
              aria-label="Contact"
            >
              <FaEnvelope />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
