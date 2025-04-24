import type { Metadata } from 'next';
import TeamMemberCard from '@/components/TeamMemberCard';

export const metadata: Metadata = {
  title: 'The Team | NUTM Nexus',
  description: 'Meet the team behind the NUTM Nexus project.',
};

// Team Member Data 
const teamMembers = [
  {
    name: 'Ayodeji A.',
    role: 'Chief Mathematical Officer',
    imageUrl: '/ayodeji.png', 
    linkedin: 'https://www.linkedin.com/in/ayodejiades/',
    github: 'https://github.com/ayodejiades',  
    website: 'https://ayodejiades.vercel.app/', 
  },
  // Add more members here:
  // {
  //   name: 'Another Member',
  //   role: 'Role',
  //   imageUrl: '/path/to/image.jpg',
  //   linkedin: '#', github: '#', website: '#'
  // },
];

export default function TeamPage() {
  return (
    <div className="container mx-auto max-w-5xl px-4 py-8 sm:py-12">
      {/* Page Header */}
      <div className="text-center mb-10 md:mb-16">
        <h1 className="text-4xl font-bold tracking-tight text-primary-dark dark:text-primary-light sm:text-5xl mb-4">
          Meet the Team
        </h1>
        <p className="text-lg text-foreground/80 dark:text-foreground/70 max-w-2xl mx-auto">
          We are passionate about making learning resources more accessible at NUTM.
        </p>
      </div>

      {/* Team Member Grid */}
      {teamMembers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center"> {/* Added justify-center */}
          {teamMembers.map((member) => (
            <TeamMemberCard
              key={member.name} // Ensure names are unique or add an id
              {...member} // Spread props for cleaner code
            />
          ))}
        </div>
      ) : (
         <p className="text-center text-gray-600 dark:text-gray-400">Team information coming soon.</p>
      )}
    </div>
  );
}