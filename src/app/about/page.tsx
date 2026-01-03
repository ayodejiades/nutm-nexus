import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About | NUTM Nexus",
  description: "Learn more about the NUTM Nexus course resource hub.",
};

export default function AboutPage() {
  const headingStyle =
    "text-2xl font-bold text-foreground mb-6 flex items-center gap-3";
  const cardStyle = "bg-white/[0.02] border border-white/5 rounded-2xl p-8";

  return (
    <div className="max-w-4xl mx-auto space-y-16 animate-fade-in">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
          About <span className="text-primary">Nexus</span>
        </h1>
        <p className="text-lg text-foreground/60 max-w-2xl mx-auto leading-relaxed">
          The central hub for NUTM course materials and academic resources.
        </p>
      </div>

      <div className="space-y-10">
        <section className={cardStyle}>
          <h2 className={headingStyle}>
            <span className="w-8 h-1 bg-primary rounded-full" />
            Our Mission
          </h2>
          <p className="text-foreground/70 leading-relaxed text-lg">
            NUTM Nexus aims to provide students at NUTM with a simple,
            accessible, and centralized platform for accessing course tutorials,
            lecture notes, syllabi, and supplementary video resources. We
            believe in leveraging lean technologies to create a streamlined
            learning experience.
          </p>
        </section>

        <div className="grid md:grid-cols-2 gap-8">
          <section className={cardStyle}>
            <h2 className="text-xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <ul className="space-y-4 text-sm text-foreground/60">
              <li>
                <strong className="text-primary">Frontend:</strong> Built with
                Next.js, React, and Tailwind CSS.
              </li>
              <li>
                <strong className="text-primary">Data:</strong> Powered by the
                GitHub Open API for easy updates.
              </li>
              <li>
                <strong className="text-primary">Hosting:</strong> Managed on
                the Vercel global edge network.
              </li>
            </ul>
          </section>

          <section className={cardStyle}>
            <h2 className="text-xl font-bold text-foreground mb-4">
              Simplicity First
            </h2>
            <p className="text-sm text-foreground/60 leading-relaxed mb-6">
              By utilizing GitHub for storage and Vercel for hosting, Nexus
              minimizes overhead and complexity. Updates are as simple as a git
              push.
            </p>
            <Link
              href="/team"
              className="text-sm font-bold text-primary hover:text-primary-light transition-colors"
            >
              MEET THE TEAM →
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
