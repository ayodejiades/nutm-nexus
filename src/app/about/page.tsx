import type { Metadata } from "next";
import Link from "next/link";
import { BookOpenIcon, BoltIcon, VideoCameraIcon, LockOpenIcon } from "@heroicons/react/24/outline";

export const metadata: Metadata = {
  title: "About | NUTM Nexus",
  description: "Learn more about NUTM Nexus — the official platform of the Peer-2-Peer Tutorial.",
};

const features = [
  {
    icon: BookOpenIcon,
    title: "Centralized Resources",
    description: "All your course materials — lecture notes, past questions, syllabi — organized in one place. No more hunting through multiple platforms.",
  },
  {
    icon: VideoCameraIcon,
    title: "Video Integration",
    description: "Curated YouTube playlists embedded directly into each course page, so you can learn at your own pace.",
  },
  {
    icon: LockOpenIcon,
    title: "Open Source",
    description: "Built by students, for students. The entire codebase is open source on GitHub — anyone can contribute.",
  },
];

const techStack = [
  { name: "Next.js 16", role: "Framework", color: "text-white" },
  { name: "React 19", role: "UI Library", color: "text-sky-400" },
  { name: "TypeScript", role: "Language", color: "text-blue-400" },
  { name: "Vercel", role: "Hosting", color: "text-green-400" },
  { name: "GitHub API", role: "Content", color: "text-pink-400" },
  { name: "Auth.js", role: "Auth", color: "text-purple-400" },
];

export default function AboutPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-20 animate-fade-in">

      {/* Hero */}
      <section className="text-center pt-8 sm:pt-12 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">About the Platform</p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-6">
            What is Nexus?
          </h1>
          <p className="text-base sm:text-lg text-foreground/40 max-w-2xl mx-auto font-medium leading-relaxed">
            NUTM Nexus is the official platform of the Peer-2-Peer Tutorial at the Nigerian University of Technology & Management.
          </p>
        </div>
      </section>

      {/* Mission */}
      <section className="relative">
        <div className="bg-surface-1/40 border border-white/5 rounded-2xl p-8 sm:p-10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] rounded-full pointer-events-none" />
          <div className="relative z-10">
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-3">Our Mission</p>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-6 max-w-lg">
              Empowering NUTM students through peer-driven learning.
            </h2>
            <p className="text-[15px] text-foreground/50 leading-relaxed max-w-2xl">
              The Peer-2-Peer Tutorial  believes that students learn best from each other. Nexus eliminates the friction of scattered resources by bringing everything: lecture notes, tutorials, past questions, and video content into a single, beautifully designed platform.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section>
        <div className="text-center mb-12">
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-3">Features</p>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Built for Learning
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group bg-surface-1/30 border border-white/5 rounded-2xl p-7 hover:border-primary/20 transition-all duration-300"
            >
              <feature.icon className="w-6 h-6 text-primary mb-4" />
              <h3 className="text-base font-black text-white mb-2 tracking-tight">{feature.title}</h3>
              <p className="text-[13px] text-foreground/40 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack */}
      <section>
        <div className="text-center mb-12">
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-3">Under the Hood</p>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Technology Stack
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {techStack.map((tech) => (
            <div
              key={tech.name}
              className="bg-surface-1/30 border border-white/5 rounded-xl px-5 py-4 text-center hover:border-white/10 transition-all"
            >
              <p className={`text-sm font-black tracking-tight ${tech.color}`}>{tech.name}</p>
              <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest mt-1">{tech.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-surface-1/30 border border-white/5 rounded-2xl p-6 sm:p-8">
        <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">How It Works</p>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-6">
          Simple by design.
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {[
            { step: "01", title: "Sign In", desc: "Authenticate with your Google account in one click." },
            { step: "02", title: "Browse Courses", desc: "Filter by department, level, or semester to find your course." },
            { step: "03", title: "Learn & Review", desc: "Download resources, watch tutorials, and engage with peer-curated study materials." },
          ].map((item) => (
            <div key={item.step} className="flex flex-col">
              <span className="text-4xl font-black text-primary/20 mb-2 leading-none">{item.step}</span>
              <h3 className="text-sm font-black text-white mb-1.5 uppercase tracking-wider">{item.title}</h3>
              <p className="text-[13px] text-foreground/40 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center pb-8 border-t border-white/5 pt-12">
        <h2 className="text-xl font-black text-white mb-3">Ready to explore?</h2>
        <p className="text-sm text-foreground/40 max-w-md mx-auto mb-8">
          Head back to the course catalog and start browsing your materials.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="px-8 py-4 bg-primary hover:bg-primary-light text-black rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
          >
            Browse Courses
          </Link>
          <Link
            href="/team"
            className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
          >
            Meet the Team
          </Link>
        </div>
      </section>
    </div>
  );
}
