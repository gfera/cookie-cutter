# Cookie Cutter

A web app that generates 3D printable cookie cutters from SVG files. Upload an SVG shape, adjust parameters like scale, wall thickness, and height, preview the result in an interactive 3D viewer, and export the cutter as an STL file ready for 3D printing.

## How It Works

1. **Upload an SVG** — The shape is parsed and normalized into Three.js `Shape` objects.
2. **Adjust parameters** — Control scale, wall thickness (mm), and height (mm) via the sidebar. An approximate size in centimeters is shown in real time.
3. **3D Preview** — The cutter is rendered with a metallic material using `@react-three/fiber` and `@react-three/drei`. Orbit the camera to inspect from any angle.
4. **Export STL** — Generates a proper STL mesh (base + walls) and downloads it as `cookie_cutter.stl`.

### Shape Processing Pipeline

- **SVG Parsing** (`svgParser.ts`) — Uses Three.js `SVGLoader` to convert SVG paths into `Shape` objects, centering and normalizing them.
- **Shape Offsetting** (`shapeOffset.ts`) — Uses [ClipperLib](https://sourceforge.net/p/jsclipper/) to offset shapes outward and compute boolean differences (outer − inner = wall).
- **Cutter Generation** (`cutterGenerator.ts`) — Combines offset and difference operations to produce the cutter wall and base shapes.
- **STL Export** — Uses Three.js `STLExporter` to serialize the extruded geometry.

## Tech Stack

- **React 19** + **TypeScript** + **Vite**
- **Three.js** / **@react-three/fiber** / **@react-three/drei** — 3D rendering
- **ClipperLib** — Polygon offsetting and boolean operations
- **Zustand** — State management
- **Tailwind CSS** — Styling
- **Lucide React** — Icons

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- npm (comes with Node.js)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd cookie-cutter

# Install dependencies
npm install
```

### Development

```bash
# Start the dev server with HMR
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

Output goes to the `dist/` directory.

### Preview Production Build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## Deploy to GitHub Pages

This project includes a GitHub Actions workflow at `.github/workflows/deploy.yml` that builds and deploys the app to GitHub Pages on every push to `main`.

### One-time repository setup

1. Push this repository to GitHub.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.

### Automatic deployment

- Push changes to `main`.
- GitHub Actions will run the `Deploy to GitHub Pages` workflow.
- After it completes, your site will be available at:
  - `https://<your-username>.github.io/cookie-cutter/`

### Notes

- The Vite `base` path is automatically set to `/cookie-cutter/` in GitHub Actions builds.
- If you rename the repository, update the `base` value in `vite.config.ts` accordingly.
