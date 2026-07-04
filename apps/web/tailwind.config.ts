import type { Config } from "tailwindcss";

// Design tokens — see DESIGN.md for rationale.
// Palette: industrial ops-console, not SaaS-cream.
const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14181C",      // primary dark surface (sidebar, nav)
        graphite: "#1D2229", // card / raised surface on dark
        steel: "#4C7A94",    // secondary accent — status, links, info
        amber: "#E8A23D",    // primary accent — CTAs, active states, hazard marker
        rust: "#B5482F",     // destructive / overdue / scrap
        paper: "#F5F3EE",    // light content background (manifest paper)
        line: "#DAD6CC",     // hairline borders on paper surfaces
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      letterSpacing: {
        tag: "0.08em",
      },
    },
  },
  plugins: [],
};

export default config;
