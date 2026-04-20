// This file contains React component imports and definitions
import { useState, useEffect } from "react";
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

import { FaGithub, FaLinkedin, FaEnvelope, FaArrowDown } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import "./App.css";

function App() {
  const navigate = useNavigate();
  // Define state for scroll position (used for potential scroll animations)
  const [scrollY, setScrollY] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState("idle");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    
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

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1],
        when: "beforeChildren",
      },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  // New animation variants
  const fadeIn = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.8 },
    },
  };

  // Define slideIn for potential future use
  const _slideIn = (direction = "left") => ({
    hidden: {
      opacity: 0,
      x: direction === "left" ? -50 : 50,
    },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.6, ease: "easeOut" },
    },
  });

  // Define scaleUp for potential future use
  const _scaleUp = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: { duration: 0.5, ease: "easeOut" },
    },
    hover: {
      scale: 1.03,
      transition: { duration: 0.3 },
    },
    tap: { scale: 0.98 },
  };

  const float = {
    initial: { y: 0 },
    animate: {
      y: [-10, 0, -10],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const textReveal = {
    hidden: { opacity: 0, y: 20 },
    visible: (i = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 * i,
        duration: 0.5,
      },
    }),
  };

  // Use scrollY for potential scroll-based animations (placeholder for future enhancement)
  // Calculate scroll progress percentage (0 to 1)
  const _scrollProgress =
    scrollY / (document.body.scrollHeight - window.innerHeight) || 0;

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "var(--color-amoled)", color: "white" }}
    >
      {/* Hero Section */}
      <header className="relative h-screen overflow-hidden flex flex-col justify-center items-center px-4">
        {/* Animated background elements */}
        <motion.div
          className="absolute inset-0 z-0"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          <motion.div
            className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-blue-500 opacity-10 blur-3xl"
            variants={float}
          />
          <motion.div
            className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-purple-500 opacity-10 blur-3xl"
            variants={{
              ...float,
              animate: {
                ...float.animate,
                y: [0, -15, 0],
                transition: { ...float.animate.transition, delay: 0.5 },
              },
            }}
          />
        </motion.div>

        <motion.div
          className="z-10 text-center max-w-4xl mx-auto"
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
        >
          {/* Animated title with character reveal */}
          <motion.h1
            className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"
            variants={staggerContainer}
          >
            {"Paritosh Dwivedi".split("").map((char, i) => (
              <motion.span
                key={i}
                variants={textReveal}
                custom={i * 0.05}
                className="inline-block"
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.h1>

          <motion.h2
            className="text-xl md:text-2xl text-gray-300 mb-12 font-light tracking-wider"
            variants={fadeInUp}
          >
            <motion.span
              variants={textReveal}
              custom={1}
              className="inline-block"
            >
              Aspiring Quant Researcher
            </motion.span>
          </motion.h2>

          {/* Animated social links */}
          <motion.div
            className="flex justify-center gap-6 mb-16"
            variants={staggerContainer}
          >
            {[
              { icon: <FaGithub />, url: "https://github.com/pdwi2020" },
              {
                icon: <FaLinkedin />,
                url: "https://www.linkedin.com/in/paritosh-dwivedi-792120308?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
              },
              { icon: <FaXTwitter />, url: "https://x.com/paritoshDwi223" },
              { icon: <FaEnvelope />, url: "#contact" },
            ].map((item, index) => (
              <motion.a
                key={index}
                href={item.url}
                target={item.url.startsWith("http") ? "_blank" : ""}
                rel={item.url.startsWith("http") ? "noopener noreferrer" : ""}
                className="text-2xl text-gray-400 hover:text-blue-400 transition-colors duration-300"
                variants={fadeInUp}
                custom={index * 0.1 + 1}
                whileHover={{ y: -5, scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                {item.icon}
              </motion.a>
            ))}
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            className="absolute bottom-8 left-1/2 -translate-x-1/2"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            transition={{ delay: 1.5 }}
          >
            <motion.div
              className="w-8 h-12 border-2 border-gray-500 rounded-2xl flex justify-center p-1"
              animate={{
                y: [0, 10, 0],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <motion.div
                className="w-1 h-2 bg-gray-400 rounded-full"
                initial={{ y: 0 }}
                animate={{
                  y: [0, 15, 0],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      </header>

      {/* About Section */}
      <section id="about" style={{ padding: "5rem 1rem" }}>
        <div style={{ maxWidth: "56rem", margin: "0 auto" }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="glass-panel"
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
              About Me
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
                <div className="aspect-square rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 overflow-hidden">
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
                      className="px-3 py-1 bg-glass-bg border border-glass-border rounded-full text-sm"
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

      {/* Projects Section */}
      <section id="projects" className="py-20 px-4 md:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <motion.h2
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
            Research Projects
          </motion.h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
              gap: "2rem",
            }}
          >
            {[
              {
                title: "P2 — Avellaneda-Stoikov HFT Market Maker (Flagship)",
                description:
                  "End-to-end HFT market-making policy: derived the HJB dynamic-programming equation from Ho-Stoll utility through a queue-reactive correction and a Glosten-Milgrom Bayesian adverse-selection layer (3045-word appendix), validated on LOBSTER AAPL 2012-06-21 replay with inventory hard limits enforced by quote suppression (≈$662 PnL on 972 fills, ~7.9% spread capture). Shared accounting across simulator and replay. 46 passing tests.",
                technologies: [
                  "Python 3.14",
                  "HJB Control",
                  "LOBSTER",
                  "Poisson LOB",
                  "Glosten-Milgrom",
                  "Queue-Reactive",
                ],
                image: "/assets/prob%20forecasts.png",
                github: "https://github.com/pdwi2020/p2_market_maker",
              },
              {
                title:
                  "P5 — GPU-Accelerated Monte Carlo for Exotic Options (Flagship)",
                description:
                  "Full-matrix Monte Carlo benchmark across GBM / Heston / Bates / Heston-Hull-White with standard MC, Sobol QMC, and MLMC. Tesla T4 vs CPU: 12x Heston, 8x HHW, 6x Bates, 3x GBM. Malliavin integration-by-parts Greeks (Fournié 1999) for Asian/lookback/barrier. Honest negative: Sobol QMC on Bates jump payoffs ~1.2x because indicator discontinuities blunt variance reduction. 75 passing tests.",
                technologies: [
                  "CUDA",
                  "PyTorch",
                  "MLMC",
                  "Sobol QMC",
                  "Malliavin Greeks",
                  "Carr-Madan FFT",
                ],
                image: "/assets/vega%20surface.png",
                github: "https://github.com/pdwi2020/p5_gpu_mc_exotics",
              },
              {
                title:
                  "P1 — Cross-Sectional Equity Factor Research on Russell 3000",
                description:
                  "12-1 momentum decile spread on real 2,539-name Russell-3000 panel (1.25M rows, 2024-04-19 to 2026-04-17). Gross daily Sharpe 0.30, net 0.26 after 5+2 bps, Newey-West t-stat 0.43, deflated Sharpe (Bailey) 1.00. BARRA variance decomposition: style 80.3% / sector 4.4% / specific 15.3%. Almgren-Chriss capacity sweep does not bracket break-even within $1M-$1B, a sweep-range limitation rather than an overclaim. 83 passing tests.",
                technologies: [
                  "Python",
                  "Pandas",
                  "BARRA Risk",
                  "Almgren-Chriss",
                  "Deflated Sharpe",
                  "Walk-Forward CV",
                ],
                image: "/assets/output4.png",
                github: "https://github.com/pdwi2020/p1_factor_research",
              },
              {
                title:
                  "P4 — S&P 500 Statistical Arbitrage with Multiple-Testing Rigor",
                description:
                  "Market-neutral pair + 3-asset basket stat-arb with Engle-Granger + Johansen cointegration, static OU, Kalman-OU, neural OU, and regime-switching OU baselines. Deflated with Bonferroni + BH + BY + Storey + Hansen SPA + White Reality Check. 4-way OU ablation across 16 validated pairs: regime 1.07 > static 0.95 > Kalman 0.75 > neural 0.36 (median net Sharpe). Honest caveat: n=16 is too small for a Hansen SPA method-choice claim. 60 passing tests.",
                technologies: [
                  "Python",
                  "Johansen",
                  "Kalman-OU",
                  "Hansen SPA",
                  "White Reality Check",
                  "Regime-Switching",
                ],
                image: "/assets/project-stochastic.png",
                github: "https://github.com/pdwi2020/p4_stat_arb",
              },
              {
                title: "P3 — Volatility Surface Dynamics & Forecasting",
                description:
                  "SVI + SSVI + rBergomi calibration on a bundled SPY option panel (PCA PC1 explains 99% of surface variance) plus a HAR-RV vs GARCH(1,1) horserace on a 125-day SPY realized-vol window using MSE + QLIKE losses. At h=1 and h=22 GARCH wins; h=5 is very close. Daily SPY snapshot accrual via macOS LaunchAgent. 55 passing + 2 skipped (MPS float64).",
                technologies: [
                  "Python",
                  "SVI / SSVI",
                  "rBergomi",
                  "HAR-RV",
                  "GARCH(1,1)",
                  "PCA",
                ],
                image: "/assets/ablation%20study.png",
                github: "https://github.com/pdwi2020/p3_vol_surface",
              },
            ].map((project, index) => (
              <motion.div
                key={index}
                className="glass-panel group relative overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 hover:-translate-y-1 hover:scale-[1.02] hover:ring-1 hover:ring-blue-500/30"
                style={{
                  cursor: "pointer",
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ 
                  scale: 1.02,
                  transition: { 
                    duration: 0.2,
                    ease: "easeOut"
                  }
                }}
                onClick={() => {
                  navigate(`/project/${index}`, { state: project });
                }}
              >
                <div className="relative w-full bg-white rounded-t-xl overflow-hidden" style={{ aspectRatio: "16/9" }}>
                  {project.image ? (
                    <div className="w-full h-full flex items-center justify-center p-4">
                      <img
                        src={project.image}
                        alt={`${project.title} Visualization`}
                        className="max-w-full max-h-full object-contain"
                      />
                    </div>
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "rgba(156, 163, 175, 1)",
                      }}
                    >
                      {project.title} Visualization
                    </div>
                  )}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.7) 50%, transparent 100%)",
                      opacity: 0,
                      display: "flex",
                      alignItems: "flex-end",
                      justifyContent: "center",
                      transition: "all 0.3s ease-in-out",
                      padding: "1.5rem",
                    }}
                    className="group-hover:opacity-100"
                  >
                    <a
                      href={
                        project.github ||
                        (index === 0
                          ? "https://github.com/pdwi2020/QGNN-CoPE"
                          : index === 1
                          ? "https://github.com/pdwi2020/Cross-asset-neural-model-"
                          : index === 2
                          ? "https://github.com/pdwi2020/monte-carlo-sim-CUDA"
                          : index === 3
                          ? "https://github.com/pdwi2020/eth-anomaly-detec"
                          : "")
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-primary"
                      style={{ fontSize: "0.875rem" }}
                    >
                      View on GitHub
                    </a>
                  </div>
                </div>
                <div style={{ padding: "1.5rem" }} className="transition-all duration-300 group-hover:bg-gradient-to-b from-blue-900/10 to-transparent">
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: "700",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {project.title}
                  </h3>
                  <p
                    style={{
                      color: "rgba(209, 213, 219, 1)",
                      fontSize: "0.875rem",
                      marginBottom: "1rem",
                    }}
                  >
                    {project.description}
                  </p>
                  <div
                    style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}
                  >
                    {project.technologies.map((tech, techIndex) => (
                      <span
                        key={techIndex}
                        style={{
                          padding: "0.25rem 0.5rem",
                          background: "var(--glass-bg)",
                          border: "1px solid var(--glass-border)",
                          borderRadius: "9999px",
                          fontSize: "0.75rem",
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Education Section */}
      <section
        id="education"
        style={{
          padding: "5rem 1rem",
          background:
            "linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(9,9,11,0.6) 10%)",
        }}
      >
        <div style={{ maxWidth: "80rem", margin: "0 auto" }}>
          <motion.h2
            className="text-3xl md:text-4xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Education
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 px-4 max-w-6xl mx-auto">
            {[
              {
                title: "Master of Financial Engineering (MFE)",
                institution: "NYU Tandon School of Engineering",
                location: "Brooklyn, NY, USA",
                date: "September 2026 – June 2028 (expected)",
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
                date: "August 2024 – Present",
                grade: "CGPA: 8.4 / 10",
                focus: [
                  "Deep Learning",
                  "Stochastic Modeling",
                  "High-Performance Computing",
                ],
              },
              {
                title:
                  "Bachelor of Technology in Electronics and Communication Engineering",
                institution: "Uttarakhand Technical University",
                location: "Dehradun, India",
                date: "July 2019 – June 2023",
                grade: "CGPA: 7.0 / 10",
                focus: [
                  "Signals and Systems",
                  "Communication Theory",
                  "Embedded Systems",
                ],
              },
            ].map((education, index) => (
              <motion.div
                key={index}
                className="glass-panel p-6 rounded-xl shadow-lg transition-all duration-300 border border-transparent flex flex-col h-full relative group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
                whileHover={{
                  y: -5,
                  boxShadow:
                    "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
                  transition: {
                    duration: 0.3,
                    ease: "easeOut",
                  },
                }}
              >
                <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-500/30 transition-all duration-300 pointer-events-none"></div>
                <div className="mb-4">
                  <h3 className="text-xl font-bold mb-2 text-white group-hover:text-blue-400 transition-colors duration-300">
                    {education.title}
                  </h3>
                  <p className="text-gray-300 mb-2">
                    {education.institution} • {education.location}
                  </p>
                  <p className="text-blue-400 mb-3 group-hover:text-blue-300 transition-colors duration-300">
                    {education.date}
                  </p>
                  {education.grade && (
                    <p className="text-sm text-gray-400 mb-4">
                      {education.grade}
                    </p>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-auto">
                  {education.focus.map((focusArea, i) => (
                    <span
                      key={i}
                      className="px-2 py-1 text-xs rounded-full bg-blue-900/30 text-blue-300 border border-blue-800/50 group-hover:bg-blue-800/40 group-hover:border-blue-700/60 transition-colors duration-300"
                    >
                      {focusArea}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications Section */}
      <section id="certifications" style={{ padding: "5rem 1rem", background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(9,9,11,0.8) 10%)' }}>
        <div style={{ maxWidth: "80rem", margin: "0 auto" }}>
          <motion.h2 
            className="text-3xl md:text-4xl font-bold mb-12 text-center bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            Certifications
          </motion.h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-4 max-w-4xl mx-auto">
            {[
              {
                title: "15.455x: Mathematical Methods for Quantitative Finance",
                issuer: "MITx",
                date: "August 2025",
                skills: ["Stochastic Calculus", "Probability Theory", "Financial Mathematics"],
                credential: "https://courses.edx.org/certificates/140cef9856a14fc49a5e80368ed32eea",
                image: "/assets/mitx-certificate.png"
              },
              {
                title: "Computational Methods in Pricing and Model Calibration",
                issuer: "Columbia University",
                date: "August 2025",
                skills: ["Quantitative Finance", "Model Calibration", "Numerical Methods"],
                credential: "https://coursera.org/verify/D62G4WDCOWBF",
                image: "/assets/coursera-cert.png"
              }
            ].map((cert, index) => (
              <motion.div
                key={index}
                className="glass-panel p-6 rounded-xl shadow-lg transition-all duration-300 border border-transparent flex flex-col h-full relative group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ 
                  y: -5,
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                  transition: { 
                    duration: 0.3,
                    ease: "easeOut"
                  }
                }}
              >
                <div className="absolute inset-0 rounded-xl border-2 border-transparent group-hover:border-blue-500/30 transition-all duration-300 pointer-events-none"></div>
                <div className="mb-4 overflow-hidden rounded-lg">
                  <img 
                    src={cert.image} 
                    alt={`${cert.title} Certificate`}
                    className="w-full h-auto object-cover transition-all duration-500 group-hover:scale-105"
                  />
                </div>
                <h3 className="text-xl font-bold mb-2 text-white group-hover:text-blue-400 transition-colors duration-300">{cert.title}</h3>
                <p className="text-blue-400 mb-3 group-hover:text-blue-300 transition-colors duration-300">
                  {cert.issuer} • {cert.date}
                </p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {cert.skills.map((skill, i) => (
                    <span 
                      key={i}
                      className="px-2 py-1 text-xs rounded-full bg-blue-900/30 text-blue-300 border border-blue-800/50 group-hover:bg-blue-800/40 group-hover:border-blue-700/60 transition-colors duration-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
                <a
                  href={cert.credential}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm text-blue-400 group-hover:text-blue-300 transition-colors duration-300 group/credential"
                >
                  View Credential
                  <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover/credential:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" style={{ padding: "5rem 1rem" }}>
        <div style={{ maxWidth: "48rem", margin: "0 auto" }}>
          <motion.div
            className="glass-panel"
            style={{ padding: "clamp(2rem, 4vw, 3rem)" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center">
              Let's Connect
            </h2>
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
                    style={{
                      width: "100%",
                      background: "var(--glass-bg)",
                      border: "1px solid var(--glass-border)",
                      borderRadius: "0.5rem",
                      padding: "0.75rem",
                      outline: "none",
                    }}
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    onFocus={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 0 0 2px rgb(59, 130, 246)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                    }}
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
                    style={{
                      width: "100%",
                      background: "var(--glass-bg)",
                      border: "1px solid var(--glass-border)",
                      borderRadius: "0.5rem",
                      padding: "0.75rem",
                      outline: "none",
                    }}
                    placeholder="your.email@example.com"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    required
                    onFocus={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 0 0 2px rgb(59, 130, 246)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                    }}
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
                  style={{
                    width: "100%",
                    background: "var(--glass-bg)",
                    border: "1px solid var(--glass-border)",
                    borderRadius: "0.5rem",
                    padding: "0.75rem",
                    outline: "none",
                  }}
                  placeholder="Your message here..."
                  value={formData.message}
                  onChange={(e) =>
                    setFormData({ ...formData, message: e.target.value })
                  }
                  required
                  onFocus={(e) => {
                    e.currentTarget.style.boxShadow =
                      "0 0 0 2px rgb(59, 130, 246)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.boxShadow = "none";
                  }}
                ></textarea>
              </div>

              <div style={{ textAlign: "center" }}>
                <button
                  type="submit"
                  className="btn btn-primary"
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
          <div style={{ display: "flex", gap: "1rem" }}>
            <a
              href="https://github.com/pdwi2020"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "rgba(156, 163, 175, 1)",
                transition: "color 0.3s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "white")}
              onMouseOut={(e) =>
                (e.currentTarget.style.color = "rgba(156, 163, 175, 1)")
              }
            >
              <FaGithub />
            </a>
            <a
              href="https://www.linkedin.com/in/paritosh-dwivedi-792120308?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "rgba(156, 163, 175, 1)",
                transition: "color 0.3s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "white")}
              onMouseOut={(e) =>
                (e.currentTarget.style.color = "rgba(156, 163, 175, 1)")
              }
            >
              <FaLinkedin />
            </a>
            <a
              href="https://x.com/paritoshDwi223"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "rgba(156, 163, 175, 1)",
                transition: "color 0.3s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "white")}
              onMouseOut={(e) =>
                (e.currentTarget.style.color = "rgba(156, 163, 175, 1)")
              }
            >
              <FaXTwitter />
            </a>
            <a
              href="#contact"
              style={{
                color: "rgba(156, 163, 175, 1)",
                transition: "color 0.3s",
              }}
              onMouseOver={(e) => (e.currentTarget.style.color = "white")}
              onMouseOut={(e) =>
                (e.currentTarget.style.color = "rgba(156, 163, 175, 1)")
              }
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
