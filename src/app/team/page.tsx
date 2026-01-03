import type { Metadata } from "next";
import TeamMemberCard from "@/components/TeamMemberCard";

export const metadata: Metadata = {
  title: "The Team | NUTM Nexus",
  description: "Meet the team behind the NUTM Nexus project.",
};

const teamMembers = [
  {
    name: "Ayodeji A.",
    role: "Tech Team Lead",
    imageUrl: "/ayodeji.png",
    linkedin: "https://www.linkedin.com/in/ayodejiades/",
    github: "https://github.com/ayodejiades",
    website: "https://ayodejiades.vercel.app/",
  },
  {
    name: "Opemipo A.",
    role: "Tech Team Member",
    imageUrl: "/opemipo.png",
    linkedin: "https://www.linkedin.com/in/opemipo-akinwumi/",
    github: "https://github.com/opemipoakinwumi",
    website: "https://www.linkedin.com/in/opemipo-akinwumi/",
  },
];

export default function TeamPage() {
  return (
    <div className="container mx-auto max-w-5xl space-y-16 animate-fade-in">
      <div className="text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mb-4">
          Meet the <span className="text-primary">Team</span>
        </h1>
        <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
          We are passionate about making learning resources more accessible at
          NUTM.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-10 max-w-4xl mx-auto">
        {teamMembers.map((member) => (
          <TeamMemberCard key={member.name} {...member} />
        ))}
      </div>
    </div>
  );
}
