# Revora // EngineVerse
> **Premium Mechanical Scrollytelling & 3D Analytics Platform**

[![Hackathon Build v4.0](https://img.shields.io/badge/Build-v4.0-fbbf24?style=for-the-badge&logo=probot&logoColor=white)](file:///d:/CODES%20HERE/Revora/frontend/index.html)
[![Tech Stack](https://img.shields.io/badge/Tech-Three.js%20|%20Vanilla%20JS-38bdf8?style=for-the-badge)](file:///d:/CODES%20HERE/Revora/frontend/about.html)

Interactive 3D Mechanical Learning Platform
Revora is an interactive web platform that transforms complex mechanical engine
concepts into a visual and immersive learning experience using real-time 3D
rendering, scroll-based storytelling, and performance analytics.

## Problem
Mechanical engineering concepts, especially internal combustion engines are
difficult to understand using static diagrams and textbooks. Students often
struggle to visualize:
How engine components interact
How motion occurs inside engines
Differences between engine configurations
Performance trade-offs between engine types
Traditional learning methods lack interactivity and real-time visualization.

## Solution
Revora solves this problem by combining:
Real time 3D engine visualization
Scroll based interactive storytelling
Engine analytics dashboard
Engine comparison system
This creates a learning experience where users see, interact, and analyze instead
of just reading theory.


## 🚀 Core Features

### 1. Mission Control (Dashboard)
The central nerve center of the platform. Featuring a "Bento-style" grid that tracks:
*   **Real-time Metrics**: Mocked server RPM, system efficiency, and recorded power.
*   **Quick Launch**: Fast access points to the primary 3D rendering sequences.
*   **System Terminal**: An integrated hacker-style console for backend logging.

### 2. 3D Scrollytelling Tours
Inspired by premium product launches (Apple/Tesla), this feature uses the **Intersection Observer API** to synchronize text-based documentation with a live 3D viewer.
*   **Automatic Highlights**: As you scroll through specific engine parts (Intake Manifold, Crankshaft), the 3D model automatically rotates and frames the component in real-time.
*   **Available Models**: V8 Flagship, Inline 6 (Performance), and Inline 4 (Efficiency).

### 3. Schematic Dictionary (Parts Library)
A "Blueprint" style library containing detailed analysis of engine components.
*   **Interactive Flip Cards**: Built with CSS 3D Transforms, each card flips to reveal high-level technical specifications and "System Type" categorizations.
*   **Dynamic Loading**: Optimized for performance, loading full schematic modules only when requested.

### 4. Comparison Duel
A data-driven tool to pit different engine configurations against each other.
*   **Categorical Analytics**: Compare Power, Weight, Maintenance, and Complexity.
*   **Victory Algorithm**: Automatically calculates the winner based on selected performance metrics.

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Structure** | Semantic HTML5 |
| **Styling** | Vanilla CSS3 (Custom Properties, Glassmorphism, 3D Transforms) |
| **3D Rendering** | **Three.js** (WebGL 2.0) |
| **Logic** | ES6+ Modules, Intersection Observer API |
| **Models** | Compressed GLB (glTF 2.0) |

---

## 📦 Getting Started

### Prerequisites
*   A modern web browser with **WebGL 2.0** support (Chrome, Edge, Firefox).
*   A local development server (e.g., Live Server, Python `http.server`, or Node `http-server`).

### Installation
1.  Clone the repository:
    ```bash
    git clone https://github.com/vivekbabunaidu-lang/expert-engine
    ```
2.  Navigate to the directory:
    ```bash
    cd revora/frontend
    ```
3.  Launch with a local server:
    ```bash
    # using Python
    python -m http.server 8000
    ```
4.  Open `http://localhost:8000` in your browser.

---

## 🎨 Design Language
Revora follows a **Premium Industrial** aesthetic:
*   **Colors**: Deep Obsidian (#020617), Electric Blue (#38bdf8), and Mechanical Bronze (#fbbf24).
*   **Glassmorphism**: Backdrop filters (blur 16px) with translucent borders for a high-tech "Blueprint" feel.
*   **Animations**: Smooth cubic-bezier transitions for all navigation and card interactions.

---

## 👥 Meet the Team
**Team Code Jammers**
*   **Members**:Vivek Babu Naidu, M Pavan Kumar, T Jahnavi, S Vasavi Sruthi
*   **Hackathon Build**: v4.0 (Finalized Branding)
*   **Mission**: Making mechanical engineering accessible through visual excellence.

---

> [!IMPORTANT]
> **Performance Note**: For the best 3D Experience, ensure hardware acceleration is enabled in your browser settings.

> [!TIP]
> Use the **Compare** tool to understand why the **Boxer Engine** offers a lower center of gravity compared to traditional **V-Type** layouts.

---
*Created for the 2026 Engineering Hackathon.*
