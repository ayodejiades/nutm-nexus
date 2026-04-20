import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "The Team | NUTM Nexus",
  description: "Meet the team behind the NUTM Peer-2-Peer Tutorial .",
};

const LinkedInIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const GitHubIcon = () => (
  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.5.49.09.665-.213.665-.472 0-.23-.01-1.023-.015-1.86-2.782.602-3.369-1.21-3.369-1.21-.445-1.13-1.087-1.434-1.087-1.434-.89-.608.068-.596.068-.596 1.003.07 1.53 1.027 1.53 1.027.89 1.524 2.34 1.084 2.91.828.092-.643.35-1.083.636-1.332-2.22-.25-4.557-1.104-4.557-4.927 0-1.088.39-1.979 1.029-2.675-.103-.253-.446-1.268.098-2.64 0 0 .84-.268 2.75 1.022A9.607 9.607 0 0112 6.82c.85.004 1.705.115 2.504.336 1.909-1.29 2.747-1.022 2.747-1.022.546 1.372.202 2.387.1 2.64.64.696 1.028 1.587 1.028 2.675 0 3.833-2.34 4.673-4.566 4.92.358.307.678.918.678 1.85 0 1.337-.012 2.415-.012 2.74 0 .26.172.565.672.47C19.138 20.192 22 16.437 22 12.017 22 6.484 17.522 2 12 2z"
      clipRule="evenodd"
    />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
  </svg>
);

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  imageUrl: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Ayodeji Adesegun",
    role: "Team Lead",
    bio: "Full-stack developer passionate about building tools that make academic resources more accessible to students.",
    imageUrl: "/ayodeji.png",
    linkedin: "https://www.linkedin.com/in/ayodejiades/",
    github: "https://github.com/ayodejiades",
    website: "https://ayodeji.tech",
  },
  {
    name: "Adebiyi Itunuayo",
    role: "Team Member",
    bio: "Focused on quality assurance and ensuring all resources meet the academic standards students deserve.",
    imageUrl: "/adebiyi.png",
    linkedin: "https://www.linkedin.com/in/adebiyi-itunuayo-397bab151",
    github: "https://github.com/FFFF-0000h",
    website: "https://adebiyiitunuaayo.com",
  },
];

function SocialLink({ href, children, label }: { href: string; children: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="p-2 bg-white/5 hover:bg-primary/10 border border-white/5 hover:border-primary/30 rounded-lg text-foreground/30 hover:text-primary transition-all"
    >
      {children}
    </a>
  );
}

export default function TeamPage() {
  return (
    <div className="max-w-5xl mx-auto space-y-16 animate-fade-in">
      {/* Hero */}
      <section className="text-center pt-8 sm:pt-12 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10">
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">The People Behind Nexus</p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-white tracking-tight mb-6">
            Meet the Team
          </h1>
          <p className="text-base sm:text-lg text-foreground/40 max-w-xl mx-auto font-medium leading-relaxed">
            We&apos;re NUTM&apos;s Peer-2-Peer Tutorial  — building tools to make academic resources more accessible for every student.
          </p>
        </div>
      </section>

      {/* Team Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {teamMembers.map((member, idx) => (
          <div
            key={member.name}
            className="group relative bg-surface-1/40 border border-white/5 rounded-2xl overflow-hidden hover:border-primary/20 transition-all duration-500 flex flex-col"
          >
            {/* Image Area */}
            <div className="relative h-64 sm:h-72 overflow-hidden shrink-0">
              <Image
                src={member.imageUrl}
                alt={member.name}
                width={400}
                height={400}
                unoptimized
                className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D10] via-[#0A0D10]/40 to-transparent" />

              {/* Role badge */}
              <div className="absolute top-4 left-4">
                <span className="px-2.5 py-1 bg-black/50 backdrop-blur-md border border-white/10 rounded-lg text-[9px] font-black text-white/60 uppercase tracking-widest">
                  {idx === 0 ? "Lead" : "Member"}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pt-5 pb-6 flex flex-col flex-grow">
              <h3 className="text-xl font-black text-white tracking-tight leading-tight">{member.name}</h3>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mt-1 mb-4">{member.role}</p>
              <p className="text-[13px] text-foreground/50 leading-relaxed flex-grow">{member.bio}</p>

              {/* Divider + Social Links */}
              <div className="pt-4 mt-4 border-t border-white/5 flex gap-2.5">
                {member.linkedin && (
                  <SocialLink href={member.linkedin} label={`${member.name} LinkedIn`}>
                    <LinkedInIcon />
                  </SocialLink>
                )}
                {member.github && (
                  <SocialLink href={member.github} label={`${member.name} GitHub`}>
                    <GitHubIcon />
                  </SocialLink>
                )}
                {member.website && (
                  <SocialLink href={member.website} label={`${member.name} Website`}>
                    <GlobeIcon />
                  </SocialLink>
                )}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* CTA Section */}
      <section className="text-center py-12 border-t border-white/5">
        <h2 className="text-xl font-black text-white mb-3">Want to Contribute?</h2>
        <p className="text-sm text-foreground/40 max-w-md mx-auto mb-8">
          NUTM Nexus is open source. If you&apos;re a student who wants to help improve the platform, we&apos;d love to hear from you.
        </p>
        <a
          href="https://github.com/ayodejiades/nutm-nexus"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all active:scale-95"
        >
          <GitHubIcon />
          View on GitHub
        </a>
      </section>
    </div>
  );
}
