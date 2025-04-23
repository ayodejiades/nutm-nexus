import type { Metadata } from 'next';
import Link from 'next/link'; // Import Link for potential internal links

export const metadata: Metadata = {
  title: 'About | NUTM Nexus',
  description: 'Learn more about the NUTM Nexus course resource hub.',
};

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8 sm:py-12">
      {/* Hero Section (Optional, simple title for now) */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold tracking-tight text-primary-dark sm:text-5xl mb-4">
          About NUTM Nexus
        </h1>
        <p className="text-lg text-foreground/80"> {/* Slightly muted text color */}
          Your central hub for NUTM course materials and resources.
        </p>
      </div>

      {/* Main Content Sections */}
      <div className="space-y-12">
        {/* Mission Section */}
        <section>
          <h2 className="text-2xl font-semibold text-foreground border-l-4 border-primary pl-3 mb-4">
            Our Mission
          </h2>
          <p className="text-base text-foreground/90 leading-relaxed">
            NUTM Nexus aims to provide students at NUTM with a simple, accessible, and centralized platform
            for accessing course tutorials, lecture notes, syllabi, and supplementary video resources. We believe in
            leveraging modern, open technologies to create a streamlined learning experience, free from the clutter
            of complex systems.
          </p>
        </section>

        {/* Technology Section */}
        <section>
          <h2 className="text-2xl font-semibold text-foreground border-l-4 border-primary pl-3 mb-4">
            How It Works
          </h2>
          <p className="text-base text-foreground/90 leading-relaxed mb-4">
            This platform is built entirely using free and readily available tools, demonstrating a lean approach to development:
          </p>
          <ul className="list-disc list-outside space-y-2 pl-5 text-base text-foreground/90">
            <li>
              <strong>Frontend:</strong> Built with <a href="https://nextjs.org/" target="_blank" rel="noopener noreferrer" className="font-medium underline hover:text-primary-dark">Next.js</a> (a React framework) and styled using <a href="https://tailwindcss.com/" target="_blank" rel="noopener noreferrer" className="font-medium underline hover:text-primary-dark">Tailwind CSS</a> for a modern, responsive interface. Written in <a href="https://www.typescriptlang.org/" target="_blank" rel="noopener noreferrer" className="font-medium underline hover:text-primary-dark">TypeScript</a> for enhanced code quality.
            </li>
            <li>
              <strong>Data Storage:</strong> All course metadata (like titles, descriptions, YouTube links) and tutorial files (PDFs, documents) are stored directly within a single <a href="https://github.com/ayodejiades/nutm-nexus" target="_blank" rel="noopener noreferrer" className="font-medium underline hover:text-primary-dark">GitHub</a> repository.
            </li>
            <li>
              <strong>Authentication:</strong> Secure login is handled via GitHub OAuth using <a href="https://next-auth.js.org/" target="_blank" rel="noopener noreferrer" className="font-medium underline hover:text-primary-dark">NextAuth.js</a>.
            </li>
            <li>
              <strong>Hosting:</strong> The website is deployed globally and hosted for free on <a href="https://vercel.com/" target="_blank" rel="noopener noreferrer" className="font-medium underline hover:text-primary-dark">Vercel</a>, which integrates seamlessly with Next.js and GitHub.
            </li>
          </ul>
        </section>

        {/* Simplicity & Openness Section */}
        <section>
          <h2 className="text-2xl font-semibold text-foreground border-l-4 border-primary pl-3 mb-4">
            Simplicity First
          </h2>
          <p className="text-base text-foreground/90 leading-relaxed">
            By utilizing GitHub as our "database" and Vercel for hosting, NUTM Nexus minimizes infrastructure overhead
            and costs. Updates to course materials are as simple as pushing changes to the GitHub repository. This approach
            prioritizes ease of maintenance and accessibility.
          </p>
           {/* Optional: Add contact or contribution info here */}
        </section>

      </div>
    </div>
  );
}