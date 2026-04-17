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
      // Add animation delay utility if needed for staggered animations
      animationDelay: {
        '400': '400ms',
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