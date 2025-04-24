// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class", // IMPORTANT: Enable class-based dark mode
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // References CSS variables set in globals.css
      colors: {
        primary: {
          DEFAULT: "hsl(var(--color-primary))",
          light: "hsl(var(--color-primary-light))",
          dark: "hsl(var(--color-primary-dark))",
        },
        background: 'hsl(var(--color-background))',
        foreground: 'hsl(var(--color-foreground))',
        accent: {
           DEFAULT: "hsl(var(--color-accent))",
           light: "hsl(var(--color-accent-light))",
           dark: "hsl(var(--color-accent-dark))",
        },
        'accent-secondary': {
            DEFAULT: "hsl(var(--color-accent-secondary))",
        },
        // Use direct CSS vars for hero text colors
        'hero-foreground': 'hsl(var(--color-hero-foreground))',
        'hero-accent': 'hsl(var(--color-hero-accent))',
      },
      // Add animation delay utility if needed for staggered animations
      animationDelay: {
        '400': '400ms',
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/forms'), // For styling the search input
     // Custom utility for animation delay (if needed and not using a plugin)
     function ({ addUtilities }: { addUtilities: Function }) {
        addUtilities({
          '.animation-delay-400': {
            'animation-delay': '400ms',
          },
        })
     }
  ],
};
export default config;