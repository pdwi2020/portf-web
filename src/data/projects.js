export const quantPortfolioProjects = [
  {
    id: "p2-market-maker",
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
    id: "p5-gpu-mc-exotics",
    title: "P5 — GPU-Accelerated Monte Carlo for Exotic Options (Flagship)",
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
    id: "p1-factor-research",
    title: "P1 — Cross-Sectional Equity Factor Research on Russell 3000",
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
    id: "p4-stat-arb",
    title: "P4 — S&P 500 Statistical Arbitrage with Multiple-Testing Rigor",
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
    id: "p3-vol-surface",
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
];

export const previousResearchProjects = [
  {
    id: "qgnn-cope",
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
    image: "/assets/ablation%20study.png",
    github: "https://github.com/pdwi2020/QGNN-CoPE",
  },
  {
    id: "cross-asset-neural-model",
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
    image: "/assets/prob%20forecasts.png",
    github: "https://github.com/pdwi2020/Cross-asset-neural-model-",
  },
  {
    id: "monte-carlo-simulation-cuda",
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
    image: "/assets/vega%20surface.png",
    github: "https://github.com/pdwi2020/monte-carlo-sim-CUDA",
  },
  {
    id: "ethereum-anomaly-detection",
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
    image: "/assets/output4.png",
    github: "https://github.com/pdwi2020/eth-anomaly-detec",
  },
  {
    id: "libor-mathematical-modeling",
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
    image: "/assets/output18.png",
    github: "https://github.com/pdwi2020/libor_mathematical_modeling",
  },
  {
    id: "stochastic-anomaly-detection-dynamic-networks",
    title:
      "Stochastic Anomaly Detection in High-Dimensional Dynamic Networks",
    description:
      "Developed a novel anomaly detection framework for dynamic networks using stochastic modeling and high-dimensional statistical methods, enabling real-time detection of structural anomalies in evolving graph data.",
    technologies: [
      "Python",
      "NetworkX",
      "PyTorch",
      "Stochastic Processes",
      "Graph Theory",
      "Anomaly Detection",
    ],
    image: "/assets/project-stochastic.png",
    github: "https://github.com/pdwi2020/Stoch-Anomaly-Detec-in-Dyn-Net",
  },
  {
    id: "stochastic-deep-learning-geospatial",
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
    image: "/assets/9.png",
    github: "https://github.com/pdwi2020/stochastic-dl-geospatial",
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
  {
    id: "lenet5-image-classifier-cuda",
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
    image: "/assets/download.png",
    github: "https://github.com/pdwi2020/LENET5_Image_classifier",
  },
];

export const projects = [
  ...quantPortfolioProjects,
  ...previousResearchProjects,
];
