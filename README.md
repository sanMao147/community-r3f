# Community R3F

This project is a rewrite of the original 3D community visualization project using React, React Three Fiber, and TypeScript.

## Tech Stack

- **Framework**: React + Vite
- **3D Engine**: Three.js + React Three Fiber (@react-three/fiber)
- **Helpers**: @react-three/drei
- **Post Processing**: @react-three/postprocessing
- **State Management**: Zustand
- **Styling**: Tailwind CSS v4
- **Animations**: GSAP
- **Language**: TypeScript

## Getting Started

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Run development server:

   ```bash
   pnpm dev
   ```

3. Build for production:
   ```bash
   pnpm build
   ```

## Features

- **3D Scene**: Loads `model.glb` with Draco compression.
- **Interaction**: Click on water pipes to view details.
- **Modes**:
  - **Default**: Standard view.
  - **Water Monitoring**: Highlights water pipes, changes other buildings to wireframe, and animates camera to a specific view.
- **Post Processing**: Bloom (glow) and Outline effects.
- **Responsive UI**: Tooltips and controls using Tailwind CSS.
