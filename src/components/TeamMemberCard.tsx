// src/components/TeamMemberCard.tsx
import Image from "next/image";

interface TeamMemberCardProps {
  name: string;
  role: string;
  imageUrl: string;
  linkedin?: string;
  github?: string;
  website?: string;
}

const LinkedInIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    {" "}
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />{" "}
  </svg>
);
const GitHubIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    {" "}
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.5.49.09.665-.213.665-.472 0-.23-.01-1.023-.015-1.86-2.782.602-3.369-1.21-3.369-1.21-.445-1.13-1.087-1.434-1.087-1.434-.89-.608.068-.596.068-.596 1.003.07 1.53 1.027 1.53 1.027.89 1.524 2.34 1.084 2.91.828.092-.643.35-1.083.636-1.332-2.22-.25-4.557-1.104-4.557-4.927 0-1.088.39-1.979 1.029-2.675-.103-.253-.446-1.268.098-2.64 0 0 .84-.268 2.75 1.022A9.607 9.607 0 0112 6.82c.85.004 1.705.115 2.504.336 1.909-1.29 2.747-1.022 2.747-1.022.546 1.372.202 2.387.1 2.64.64.696 1.028 1.587 1.028 2.675 0 3.833-2.34 4.673-4.566 4.92.358.307.678.918.678 1.85 0 1.337-.012 2.415-.012 2.74 0 .26.172.565.672.47C19.138 20.192 22 16.437 22 12.017 22 6.484 17.522 2 12 2z"
      clipRule="evenodd"
    />{" "}
  </svg>
);

export default function TeamMemberCard({
  name,
  role,
  imageUrl,
  linkedin,
  github,
  website,
}: TeamMemberCardProps) {
  return (
    <div className="flex flex-col items-center p-8 bg-white/[0.02] border border-white/5 rounded-2xl text-center group transition-all duration-300 hover:border-primary/30">
      <div className="relative w-28 h-28 mb-6 overflow-hidden rounded-full border-2 border-primary/20 p-1 group-hover:border-primary/50 transition-colors">
        <Image
          src={imageUrl || "/placeholder-avatar.png"}
          alt={name}
          width={112}
          height={112}
          className="w-full h-full rounded-full object-cover"
          unoptimized={imageUrl?.includes("http")}
        />
      </div>
      <h3 className="text-xl font-bold text-foreground mb-1 tracking-tight">
        {name}
      </h3>
      <p className="text-xs font-bold text-primary uppercase tracking-widest mb-6">
        {role}
      </p>

      <div className="flex justify-center space-x-4">
        {linkedin && (
          <a
            href={linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/30 hover:text-primary transition-colors"
          >
            <LinkedInIcon />
          </a>
        )}
        {github && (
          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/30 hover:text-white transition-colors"
          >
            <GitHubIcon />
          </a>
        )}
        {website && (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/30 hover:text-primary transition-colors"
          >
            <span className="text-[10px] font-bold">WWW</span>
          </a>
        )}
      </div>
    </div>
  );
}
