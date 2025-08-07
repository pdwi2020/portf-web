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

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus("submitting");

    emailjs
      .send(
        import.meta.env.VITE_EMAILJS_SERVICE_ID,
        import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
        {
          from_name: formData.name,
          reply_to: formData.email,
          message: formData.message,
        }
      )
      .then((response) => {
        console.log("SUCCESS!", response.status, response.text);
        setFormStatus("success");
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => setFormStatus("idle"), 5000);
      })
      .catch((err) => {
        console.log("FAILED...", err);
        setFormStatus("error");
        setTimeout(() => setFormStatus("idle"), 5000);
      });
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
                title: "QGNN-CoPE: Quantum Graph Neural Networks",
                description:
                  "Developed a scalable quantum-enhanced graph neural network framework for complex pattern recognition in financial data, combining quantum computing principles with graph theory for improved predictive modeling.",
                technologies: [
                  "PyTorch",
                  "Quantum Computing",
                  "Graph Neural Networks",
                  "Python",
                  "Pennylane",
                ],
                image: "//assets/ablation%20study.png",
                github: "https://github.com/pdwi2020/QGNN-CoPE",
              },
              {
                title: "Cross-Asset Neural Model",
                description:
                  "Implemented a neural network model for multi-asset financial analysis, enabling cross-asset correlation detection and 3D-aware scene synthesis for visualizing market relationships and potential arbitrage opportunities.",
                technologies: [
                  "TensorFlow",
                  "Deep Learning",
                  "Financial Modeling",
                  "Python",
                  "Data Visualization",
                ],
                image: "//assets/prob%20forecasts.png",
                github: "https://github.com/pdwi2020/Cross-asset-neural-model-",
              },
              {
                title: "Monte Carlo Simulation with CUDA",
                description:
                  "Engineered a GPU-accelerated Monte Carlo simulation framework for pricing financial derivatives and risk assessment, achieving 40x performance improvement over CPU-based implementations.",
                technologies: [
                  "CUDA",
                  "C++",
                  "Parallel Computing",
                  "Risk Analysis",
                  "Financial Derivatives",
                ],
                image: "//assets/vega%20surface.png",
                github: "https://github.com/pdwi2020/monte-carlo-sim-CUDA",
              },
              {
                title: "Ethereum Anomaly Detection",
                description:
                  "Created an advanced anomaly detection system for Ethereum blockchain transactions using unsupervised machine learning techniques, identifying suspicious patterns and potential fraudulent activities with 85% accuracy.",
                technologies: [
                  "Python",
                  "Blockchain",
                  "Machine Learning",
                  "Anomaly Detection",
                  "DeltaCon Algorithm",
                ],
                image: "//assets/output4.png",
                github: "https://github.com/pdwi2020/eth-anomaly-detec",
              },
              // LIBOR Mathematical Modeling
              {
                title: "LIBOR Mathematical Modeling",
                description:
                  "Implemented interest-rate curve construction and LIBOR market model simulation framework, enabling accurate pricing of interest rate derivatives and scenario analysis.",
                technologies: [
                  "Python",
                  "Quantitative Finance",
                  "Stochastic Modeling",
                  "Monte Carlo",
                  "Pandas",
                ],
                github:
                  "https://github.com/pdwi2020/libor_mathematical_modeling",
                image: "//assets/output18.png",
              },
              // Stochastic Deep Learning for Geospatial Data
              {
                title: "Stochastic Deep Learning for Geospatial Data",
                description:
                  "Developed a novel approach for analyzing geospatial data using stochastic deep learning techniques. The project focuses on handling uncertainty in satellite imagery and geospatial datasets, providing probabilistic predictions and uncertainty quantification for better decision-making in environmental monitoring and analysis.",
                technologies: [
                  "Python",
                  "PyTorch",
                  "Monte Carlo Dropout",
                  "Deep Ensemble",
                  "Geospatial Analysis",
                  "Uncertainty Quantification",
                  "Satellite Imagery",
                ],
                github: "https://github.com/pdwi2020/stochastic-dl-geospatial",
                image: "//assets/9.png",
                readme: `# A Systematic Evaluation of Deep Learning Architectures for Geospatial Image Classification

This repository contains the code and analysis for a comprehensive study on classifying land-use from satellite imagery using a hierarchy of modern deep learning models. The project evaluates four distinct architectures on the EuroSAT dataset, focusing on performance, predictive uncertainty, computational efficiency, and the geometry of the optimization landscape.

This work serves as a practical guide for model selection in real-world applications and frames the classification task as a foundational step for generating **alternative data** for quantitative financial modeling.

## Table of Contents
1. Project Overview
2. Methodology
3. Performance Results
4. Uncertainty Quantification
5. Advanced Analysis
6. Proposed Financial Application
7. Setup and Usage

---

## Project Overview
The core objective of this research is to move beyond a simple classification task and conduct a rigorous, multi-faceted analysis of deep learning models for a practical application. We use the **EuroSAT dataset**, which contains 27,000 labeled satellite images across 10 distinct land-use classes, as a proxy for real-world economic and environmental activity.

Our analysis compares four models of increasing complexity:
- **LeNet-5:** A foundational CNN to establish a performance baseline.
- **ResNet-18:** A deep residual network representing modern CNN architectures.
- **Vision Transformer (ViT):** A state-of-the-art, attention-based architecture.
- **Deep Ensemble:** An ensemble of ResNet models to maximize robustness and accuracy.

## Methodology
The project was implemented in Python using TensorFlow 2.x on a Paperspace cloud instance equipped with an **NVIDIA RTX A6000 GPU**. The workflow included:
- An optimized tf.data input pipeline with asynchronous prefetching.
- On-the-fly data augmentation (random flips, rotations, zooms) to improve model generalization.
- Smart training callbacks (EarlyStopping, ModelCheckpoint) to prevent overfitting and save the best-performing models.

## Performance Results (Summary)
A systematic evaluation demonstrates a clear performance hierarchy, validating the effectiveness of advanced architectures and ensembling techniques. The Deep Ensemble model achieved a state-of-the-art accuracy of **95.39%**.

| Model | Test Accuracy |
|-------|--------------|
| LeNet-5 | 72.75% |
| ResNet-18 | 92.26% |
| Vision Transformer | 91.48% |
| ResNet-18 Ensemble | **95.39%** |

For full confusion matrices, F1-score comparisons, uncertainty plots, and loss landscape visualizations, see the GitHub repository.
`,
              },
              // LENET5 Image Classifier
              {
                title: "LENET5 Image Classifier (CUDA)",
                description:
                  "Implemented a modified LeNet-5 convolutional neural network for satellite image classification on the EuroSAT dataset, leveraging GPU parallelism (CUDA) for efficient training and inference. Achieved strong accuracy and robust generalization through data augmentation and optimized data pipelines.",
                technologies: [
                  "TensorFlow",
                  "Keras",
                  "CUDA",
                  "EuroSAT",
                  "Python",
                  "Deep Learning",
                  "CNN",
                ],
                github: "https://github.com/pdwi2020/LENET5_Image_classifier",
                image: "//assets/download.png",
              },
            ].map((project, index) => (
              <motion.div
                key={index}
                className="glass-panel group"
                style={{
                  overflow: "hidden",
                  borderRadius: "0.75rem",
                  cursor: "pointer",
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                onClick={() => {
                  navigate(`/project/${index}`, { state: project });
                }}
              >
                <div
                  style={{
                    aspectRatio: "16/9",
                    background:
                      "linear-gradient(to bottom right, rgba(59, 130, 246, 0.1), rgba(168, 85, 247, 0.1))",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {project.image ? (
                    <img
                      src={project.image}
                      alt={`${project.title} Visualization`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "contain",
                        background: "#fff",
                        display: "block",
                      }}
                    />
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
                      backgroundColor: "var(--color-amoled)",
                      opacity: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "opacity 0.3s",
                    }}
                    className="group-hover:opacity-80"
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
                <div style={{ padding: "1.5rem" }}>
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

            <form className="space-y-6" onSubmit={handleSubmit}>
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
