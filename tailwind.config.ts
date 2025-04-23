// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Define Nigerian Green and variants for Tailwind utility classes
        primary: {
          DEFAULT: "hsl(var(--color-primary))", // Use HSL variable from CSS
          light: "hsl(var(--color-primary-light))",
          dark: "hsl(var(--color-primary-dark))",
        },
        // Map background/foreground CSS variables for Tailwind use (optional but good practice)
        background: 'hsl(var(--color-background))',
        foreground: 'hsl(var(--color-foreground))',
      },
      // Keep the backgroundImage extensions if you use them
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      // If using Geist fonts via next/font, they might already be configured.
      // If not, you can define them here as well, referencing the CSS vars.
      // fontFamily: {
      //   sans: ['var(--font-sans)', 'Arial', 'Helvetica', 'sans-serif'], // Add fallback
      //   mono: ['var(--font-mono)', 'monospace'],
      // },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'), // Ensure aspect-ratio plugin is added
  ],
};
export default config;