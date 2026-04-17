import React from 'react';

interface CourseImageProps {
  title: string;
  code: string;
  className?: string;
}

// Minimalist, professional SVG patterns
const PATTERNS = [
  // 0: Tech / Engineering (Grid/Circles)
  (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full opacity-30">
      <circle cx="50" cy="50" r="30" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" />
      <circle cx="50" cy="50" r="15" stroke="white" strokeWidth="0.5" />
      <path d="M0 50H100M50 0V100" stroke="white" strokeWidth="0.2" />
      <rect x="40" y="40" width="20" height="20" stroke="white" strokeWidth="0.5" transform="rotate(45 50 50)" />
    </svg>
  ),
  // 1: Business / Leadership (Abstract Paths)
  (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full opacity-30">
      <path d="M10 90 L40 50 L60 70 L90 20" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="90" r="2" fill="white" />
      <circle cx="40" cy="50" r="2" fill="white" />
      <circle cx="60" cy="70" r="2" fill="white" />
      <circle cx="90" cy="20" r="2" fill="white" />
      <path d="M0 80Q50 80 100 20" stroke="white" strokeWidth="0.5" opacity="0.3" />
    </svg>
  ),
  // 2: Science / Research (Hexagons)
  (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full opacity-30">
      <path d="M50 10L84.6 30V70L50 90L15.4 70V30L50 10Z" stroke="white" strokeWidth="0.5" />
      <path d="M50 30L67.3 40V60L50 70L32.7 60V40L50 30Z" stroke="white" strokeWidth="1" />
      <circle cx="50" cy="50" r="2" fill="white" />
    </svg>
  ),
  // 3: Arts / Innovation (Waves)
  (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full opacity-30">
      <path d="M0 50C20 30 40 70 60 50C80 30 100 70 120 50" stroke="white" strokeWidth="1" fill="none" />
      <path d="M0 60C20 40 40 80 60 60C80 40 100 80 120 60" stroke="white" strokeWidth="0.5" opacity="0.5" />
      <path d="M0 40C20 20 40 60 60 40C80 20 100 60 120 40" stroke="white" strokeWidth="0.5" opacity="0.5" />
    </svg>
  )
];

export default function CourseImage({ title, code, className = "" }: CourseImageProps) {
  // Use deterministic selection based on course code
  const deterministicSum = code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const colors = [
    'from-emerald-900 via-primary to-emerald-800',
    'from-slate-900 via-emerald-950 to-primary',
    'from-emerald-800 via-emerald-900 to-black',
    'from-primary-dark via-emerald-900 to-slate-900',
  ];

  const colorIndex = deterministicSum % colors.length;
  const patternIndex = deterministicSum % PATTERNS.length;
  const gradient = colors[colorIndex];
  const Pattern = PATTERNS[patternIndex];

  return (
    <div className={`relative aspect-video overflow-hidden bg-[#0A1016] group-hover:scale-105 transition-transform duration-700 ease-out flex items-center justify-center ${className}`}>
      {/* Deep Gradient Base */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-80`} />

      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* The SVG Pattern */}
      <div className="absolute inset-0 flex items-center justify-center transform scale-75 group-hover:scale-90 transition-transform duration-1000">
        {Pattern}
      </div>

      {/* Radial highlighting */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05)_0%,transparent_70%)]" />

      {/* Fine Border Overlay */}
      <div className="absolute inset-0 border border-white/5" />

      {/* Context Badge */}
      <div className="absolute top-4 left-4 z-20">
        <div className="px-2 py-0.5 bg-white/5 backdrop-blur-md rounded border border-white/10">
          <span className="text-[8px] font-black text-white/40 tracking-[0.2em] uppercase">
            MODULE
          </span>
        </div>
      </div>

      {/* Centered Large Code (Subtle) */}
      <span className="relative z-10 text-5xl font-black text-white/5 tracking-tightest select-none uppercase">
        {code}
      </span>
    </div>
  );
}
