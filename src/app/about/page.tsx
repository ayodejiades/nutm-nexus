// src/app/about/page.tsx
import type { Metadata } from 'next';
import Link from 'next/link'; 

export const metadata: Metadata = {
  title: 'About | NUTM Nexus',
  description: 'Learn more about the NUTM Nexus course resource hub.',
};

export default function AboutPage() {
    const sectionStyle = "mb-10";
    const headingStyle = "text-2xl font-semibold text-foreground dark:text-white border-l-4 border-primary pl-4 mb-4";
    const paragraphStyle = "text-base text-foreground/80 dark:text-foreground/70 leading-relaxed";
    const linkStyle = "font-medium text-primary dark:text-primary-light underline hover:text-primary-dark dark:hover:text-primary transition-colors";

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8 sm:py-12">
      {/* Hero Section */}
      <div className="text-center mb-12 md:mb-16">
        <h1 className="text-4xl font-bold tracking-tight text-primary-dark dark:text-primary-light sm:text-5xl mb-4">
          About
        </h1>
        <p className="text-lg text-foreground/80 dark:text-foreground/70">
          Your central hub for NUTM course materials and resources.
        </p>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-10">
        {/* Mission Section */}
        <section className={sectionStyle}>
          <h2 className={headingStyle}> Our Mission </h2>
          <p className={paragraphStyle}>
            NUTM Nexus aims to provide students at NUTM with a simple, accessible, and centralized platform
            for accessing course tutorials, lecture notes, syllabi, and supplementary video resources. We believe in
            leveraging modern, open technologies to create a streamlined learning experience, free from the clutter
            of complex systems.
          </p>
        </section>

        <section className={sectionStyle}>
          <h2 className={headingStyle}> How It Works </h2>
          <p className={`${paragraphStyle} mb-4`}>
            This platform is built entirely using free and readily available tools, demonstrating a lean approach to development:
          </p>
          <ul className="list-disc list-outside space-y-3 pl-5 text-base text-foreground/80 dark:text-foreground/70">
             <li> <strong>Frontend:</strong> Built with <a href="https://nextjs.org/" target="_blank" rel="noopener noreferrer" className={linkStyle}>Next.js</a> & <a href="https://react.dev/" target="_blank" rel="noopener noreferrer" className={linkStyle}>React</a>, styled using <a href="https://tailwindcss.com/" target="_blank" rel="noopener noreferrer" className={linkStyle}>Tailwind CSS</a> for a modern, responsive interface. Written in <a href="https://www.typescriptlang.org/" target="_blank" rel="noopener noreferrer" className={linkStyle}>TypeScript</a>. </li>
             <li> <strong>Data Storage:</strong> All course metadata and tutorial files are stored directly within a single <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className={linkStyle}>GitHub</a> repository. </li>
             <li> <strong>Hosting:</strong> Deployed globally and hosted for free on <a href="https://vercel.com/" target="_blank" rel="noopener noreferrer" className={linkStyle}>Vercel</a>. </li>
          </ul>
        </section>

        <section className={sectionStyle}>
          <h2 className={headingStyle}> Simplicity First </h2>
          <p className={paragraphStyle}>
             By utilizing GitHub for data storage and Vercel for hosting, NUTM Nexus minimizes infrastructure overhead
             and costs. Updates to course materials are as simple as pushing changes to the GitHub repository. This approach
             prioritizes ease of maintenance and accessibility.
          </p>
        </section>

         <section className="text-center mt-12 pt-8 border-t border-gray-200 dark:border-gray-700">
             <p className={paragraphStyle}>
                Have questions or want to contribute? {' '}
                <Link href="/team" className={linkStyle}>
                    Reach out to the team!
                </Link>
             </p>
         </section>

      </div>
    </div>
  );
}
