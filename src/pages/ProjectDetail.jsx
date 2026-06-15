import { useLocation, useNavigate, useParams } from "react-router-dom";
// eslint-disable-next-line no-unused-vars
import { motion, useMotionValue, useTransform } from "framer-motion";
import { marked } from "marked";
import React from "react";
import { projects } from "../data/projects";

export default function ProjectDetail() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { id } = useParams();

  const projectFromId = projects.find((candidate) => candidate.id === id) || null;
  const project = state?.id === id ? state : projectFromId;

  // initialise readmeHtml if embedded
  const [readmeHtml, setReadmeHtml] = React.useState(
    project?.readme ? marked.parse(project.readme) : null
  );
  const [readmeError, setReadmeError] = React.useState(null);

  // Interactive README enhancements
  const readmeRef = React.useRef(null);
  const [toc, setToc] = React.useState([]); // [{id, text, level}] for interactive TOC
  // Fetch README.md if not embedded and github link present
  React.useEffect(() => {
    const fetchReadme = async () => {
      if (!project?.github) return;
      setReadmeError(null);
      setReadmeHtml(project.readme ? marked.parse(project.readme) : null);
      const repoPath = project.github.replace("https://github.com/", "");
      const tryBranches = ["main", "master"];
      for (const branch of tryBranches) {
        try {
          const rawUrl = `https://raw.githubusercontent.com/${repoPath}/${branch}/README.md`;
          const res = await fetch(rawUrl);
          if (res.ok) {
            const md = await res.text();
            // Convert markdown to HTML using marked
            // convert relative image paths to absolute URLs
            const baseUrl = `https://raw.githubusercontent.com/${repoPath}/${branch}/`;
            const fixedMd = md.replace(/\]\((?!http)(.*?)\)/g, (_match, p1) => `](${baseUrl}${p1})`);
            const html = marked.parse(fixedMd);
            setReadmeHtml(html);
            return;
          }
        } catch {
          // continue to next branch
        }
      }
      setReadmeError("README not found");
    };

    fetchReadme();
  }, [project]);

  React.useEffect(() => {
    if (!project) {
      navigate("/", { replace: true });
    }
  }, [navigate, project]);

  // Fix: ensure we always land at the very top of the page when opening a project detail
  // (prevents the auto "scroll a bit" behavior on card click / route change from the main grid).
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [id]);

  // Interactive + presentable README: build TOC from headings + attach copy-to-clipboard to code blocks.
  // Runs after the raw HTML is injected. Provides navigation (clickable TOC with smooth animated scroll)
  // and one-click copy on every code snippet – makes long repo READMEs feel like a real interactive doc
  // instead of plain static text. All animations use existing Framer Motion.
  React.useEffect(() => {
    const container = readmeRef.current;
    if (!container || !readmeHtml) {
      setToc([]);
      return;
    }

    // Extract headings for TOC (h1-h3 only for cleanliness)
    const headings = Array.from(container.querySelectorAll('h1, h2, h3'));
    const items = [];
    headings.forEach((h, idx) => {
      if (!h.id) h.id = `readme-h-${idx}`;
      items.push({
        id: h.id,
        text: h.textContent.trim().replace(/\s+/g, ' '),
        level: Number(h.tagName[1]),
      });
    });
    setToc(items);

    // Enhance code blocks with interactive COPY buttons (positioned absolutely, theme-matched)
    const pres = container.querySelectorAll('pre');
    pres.forEach((pre) => {
      if (pre.querySelector('.readme-copy-btn')) return;
      pre.style.position = 'relative';
      const btn = document.createElement('button');
      btn.className = 'readme-copy-btn pill pill-small absolute top-2 right-2 text-[10px] opacity-60 hover:opacity-100 transition-all active:scale-95';
      btn.textContent = 'COPY';
      btn.onclick = async (e) => {
        e.stopPropagation();
        const codeText = pre.innerText || pre.textContent || '';
        try {
          await navigator.clipboard.writeText(codeText);
          const orig = btn.textContent;
          btn.textContent = 'COPIED';
          btn.style.background = 'rgba(0,240,255,0.2)';
          setTimeout(() => {
            btn.textContent = orig;
            btn.style.background = '';
          }, 1400);
        } catch {
          /* clipboard may be unavailable in some contexts; ignore silently */
        }
      };
      pre.appendChild(btn);
    });
  }, [readmeHtml]);

  // Live mouse-reactive 3D tilt for the repo graph figure (Aceternity 3D Card + direction-aware research + tilt libs).
  // Gives true directional perspective on AMOLED cosmic theme inside the project page, beyond static whileHover.
  // Hooks must be unconditional (before any early return).
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const graphRef = React.useRef(null);

  const handleGraphMouseMove = (e) => {
    const el = graphRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const maxTilt = 7; // subtle, premium, perf-friendly
    rotateX.set((0.5 - py) * maxTilt);
    rotateY.set((px - 0.5) * maxTilt);
  };
  const resetGraphTilt = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  if (!project) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-gray-100 px-4 md:px-6 py-8 md:py-10 relative overflow-hidden grain">
      <div className="absolute inset-0 pointer-events-none aurora-bg opacity-80" />
      <motion.div
        className="max-w-6xl mx-auto liquid-glass liquid-refraction luminous-border rounded-2xl p-6 md:p-10 lg:p-12 space-y-10 relative z-10 overflow-hidden"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
      >
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => navigate(-1)}
          className="pill ripple mb-2"
        >
          BACK
        </motion.button>

        {/* Stacks vertically on phones + tablets (grid-cols-1 default) for comfortable reading + thumb scrolling. Side-by-side graph + dossier only on large desktop. Preserves 3D tilt (mouse-only, no accidental activation on touch). */}
        <div className="grid grid-cols-1 lg:grid-cols-[1.02fr_0.98fr] gap-8 lg:gap-10 items-start">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08, duration: 0.55 }}
          >
            <div className="uppercase tracking-[3px] text-[10px] text-[#00f0ff] mb-3">
              PROJECT DOSSIER
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-5 bg-clip-text text-transparent bg-gradient-to-r from-[#00f0ff] via-white to-[#a78bfa] luminous-text leading-tight">
              {/* Aceternity Text Generate Effect (from research for micro stagger on headlines in glassmorphism sections; less blur preserved + hover glow). Applied to project page title for more animation on detail pages. */}
              {project.title.split("").map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.025, delay: i * 0.018 }}
                  style={{ display: "inline-block" }}
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
            </h1>
            <motion.p
              className="text-[#d4d4d8] text-base md:text-lg leading-relaxed mb-6"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12, duration: 0.5 }}
            >
              {project.description}
            </motion.p>
            <div className="text-[10px] uppercase tracking-[2px] text-[#00f0ff]/70 mb-4">All information, metrics, results, and graphs in this dossier and the embedded report are taken directly from the linked GitHub repository of this listed project (only projects already in the portfolio data are shown).</div>

            <motion.div
              className="flex flex-wrap gap-2 mb-8"
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
            >
              {project.technologies?.map((tech, idx) => (
                <motion.span
                  key={idx}
                  className="pill pill-small text-[#a1a1aa] premium-hover glow-cyan glowing-effect min-h-[36px] min-w-[36px] sm:min-h-[32px]"
                  variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
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
            </motion.div>

            <div className="flex flex-wrap gap-3 detail-ctas min-h-[44px] items-center" onMouseMove={handleGraphMouseMove} onMouseLeave={resetGraphTilt}>
              {project.github && (
                <motion.a
                  href={project.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pill pill-primary ripple premium-hover moving-border glowing-effect"
                  whileHover={{ y: -2, scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 18 } }}
                  whileTap={{ scale: 0.985 }}
                >
                  VIEW ON GITHUB
                </motion.a>
              )}
              <motion.button
                type="button"
                onClick={() => navigate("/")}
                className="pill ripple premium-hover moving-border"
                whileHover={{ y: -2, scale: 1.015, transition: { type: 'spring', stiffness: 380, damping: 20 } }}
                whileTap={{ scale: 0.985 }}
              >
                ALL MISSIONS
              </motion.button>
            </div>
          </motion.div>

          {project.image && (
            <motion.div
              ref={graphRef}
              className="modern-repo-graph premium-hover luminous-border aurora-mesh glowing-effect"
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.6, type: "spring", stiffness: 220 }}
              onMouseMove={handleGraphMouseMove}
              onMouseLeave={resetGraphTilt}
              style={{
                rotateX,
                rotateY,
                transformPerspective: '900px',
              }}
              whileHover={{
                scale: 1.015,
                transition: { type: "spring", stiffness: 260, damping: 20 }
              }}
            >
              <img
                src={project.image}
                alt={`${project.title} — Graph / result from the actual GitHub repository (modern glassmorphic AMOLED dark treatment with cosmic aurora overlays + neon filters matching theme; exact info, shapes, numbers preserved from repo)`}
                className="w-full max-h-[320px] sm:max-h-[420px] lg:max-h-[520px] mx-auto object-contain p-1 md:p-2"
              />
              {/* Subtle AMOLED-scaled figure caption for clarity + repo fidelity - added micro whileHover lift from Aceternity micro research for more animation on project page graph. */}
              <motion.div
                className="absolute bottom-1.5 left-2 right-2 text-[9px] uppercase tracking-[1.5px] text-[#00f0ff]/60 bg-black/60 px-1.5 py-px rounded pointer-events-none"
                whileHover={{ y: -1, opacity: 0.9 }}
              >
                Repo figure • AMOLED styled • info intact
              </motion.div>
            </motion.div>
          )}
        </div>

        <motion.section
          className="glass-2-0 liquid-refraction aurora-mesh rounded-2xl p-5 md:p-7 border border-white/10 glowing-effect"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24, duration: 0.55 }}
          whileHover={{ scale: 1.006, transition: { type: "spring", stiffness: 300 } }}
        >
          <div className="flex items-center justify-between gap-4 mb-5">
            <h2 className="text-xl md:text-2xl font-semibold text-white luminous-text lamp-effect">
              README
            </h2>
            <span className="pill pill-small text-[#a1a1aa] premium-hover">LIVE FETCH FROM REPO</span>
          </div>

          {/* Interactive Table of Contents – generated from README headings.
              Click any pill for smooth animated scroll to that section.
              Makes long repo READMEs navigable and less "simple static text". */}
          {toc.length > 1 && (
            <div className="mb-4 pb-4 border-b border-white/10">
              <div className="text-[10px] uppercase tracking-[2px] text-[#00f0ff]/70 mb-2 flex items-center gap-2">
                CONTENTS <span className="text-[9px] opacity-50">({toc.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5 max-h-20 overflow-auto pr-1">
                {toc.map((item) => (
                  <motion.button
                    key={item.id}
                    onClick={() => {
                      const el = document.getElementById(item.id);
                      if (el) {
                        const y = el.getBoundingClientRect().top + window.scrollY - 80;
                        window.scrollTo({ top: y, behavior: 'smooth' });
                      }
                    }}
                    className="pill pill-small text-[#a1a1aa] hover:text-[#00f0ff] text-[11px] tracking-tight"
                    whileHover={{ scale: 1.02, y: -1 }}
                    whileTap={{ scale: 0.985 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  >
                    {item.text.length > 42 ? item.text.slice(0, 39) + '…' : item.text}
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {readmeHtml ? (
            <motion.div
              ref={readmeRef}
              className="detail-readme max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.45 }}
              dangerouslySetInnerHTML={{ __html: readmeHtml }}
            />
          ) : readmeError ? (
            <p className="text-red-400">{readmeError}</p>
          ) : (
            <p className="text-gray-400">Loading detailed README...</p>
          )}
          <div className="mt-6 pt-4 border-t border-white/10 text-[10px] text-[#00f0ff]/60 tracking-[1px] uppercase">Text, figures &amp; results above rendered from the project's GitHub README (raw) with AMOLED glassmorphic styling + micro animations for immersive dossier view.</div>
        </motion.section>
      </motion.div>
    </div>
  );
}
