// src/components/TeamMemberCard.tsx
import Image from 'next/image';

interface TeamMemberCardProps {
  name: string;
  role: string;
  imageUrl: string; // URL for the member's picture
  linkedin?: string; // Optional LinkedIn URL
  github?: string;   // Optional GitHub URL
  website?: string;  // Optional Website URL
}

// --- SVG Icons (Keep these simple or use a library) ---
const LinkedInIcon = () => ( <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"> <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/> </svg> );
const GitHubIcon = () => ( <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"> <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.5.49.09.665-.213.665-.472 0-.23-.01-1.023-.015-1.86-2.782.602-3.369-1.21-3.369-1.21-.445-1.13-1.087-1.434-1.087-1.434-.89-.608.068-.596.068-.596 1.003.07 1.53 1.027 1.53 1.027.89 1.524 2.34 1.084 2.91.828.092-.643.35-1.083.636-1.332-2.22-.25-4.557-1.104-4.557-4.927 0-1.088.39-1.979 1.029-2.675-.103-.253-.446-1.268.098-2.64 0 0 .84-.268 2.75 1.022A9.607 9.607 0 0112 6.82c.85.004 1.705.115 2.504.336 1.909-1.29 2.747-1.022 2.747-1.022.546 1.372.202 2.387.1 2.64.64.696 1.028 1.587 1.028 2.675 0 3.833-2.34 4.673-4.566 4.92.358.307.678.918.678 1.85 0 1.337-.012 2.415-.012 2.74 0 .26.172.565.672.47C19.138 20.192 22 16.437 22 12.017 22 6.484 17.522 2 12 2z" clipRule="evenodd" /> </svg> );
const WebsiteIcon = () => ( <svg className="w-5 h-5" fill="none" strokeWidth={1.5} stroke="currentColor" viewBox="0 0 24 24"> <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" /> </svg> );
// --- End Icons ---

export default function TeamMemberCard({ name, role, imageUrl, linkedin, github, website }: TeamMemberCardProps) {
  const linkBaseStyle = "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors";

  return (
    <div className="flex flex-col items-center p-6 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700/50 rounded-lg shadow-md text-center transition duration-200 hover:shadow-lg">
      <Image
        src={imageUrl || '/placeholder-avatar.png'} // Ensure fallback image exists in /public
        alt={`Profile picture of ${name}`}
        width={112} // Slightly smaller
        height={112}
        className="w-28 h-28 rounded-full mb-4 object-cover border-2 border-gray-300 dark:border-gray-600"
        priority={false} // Set priority to false unless it's above the fold
        unoptimized={imageUrl?.includes('http')}
      />
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">{name}</h3>
      <p className="text-sm text-primary dark:text-primary-light mb-4">{role}</p>
      <div className="flex justify-center space-x-4 mt-auto pt-4"> {/* Push icons down */}
        {linkedin && (
          <a href={linkedin} target="_blank" rel="noopener noreferrer" title="LinkedIn Profile" className={`${linkBaseStyle} hover:!text-blue-600 dark:hover:!text-blue-400`}>
            <LinkedInIcon /> <span className="sr-only">LinkedIn</span>
          </a>
        )}
        {github && (
          <a href={github} target="_blank" rel="noopener noreferrer" title="GitHub Profile" className={`${linkBaseStyle} hover:!text-gray-900 dark:hover:!text-white`}>
            <GitHubIcon /> <span className="sr-only">GitHub</span>
          </a>
        )}
        {website && (
          <a href={website} target="_blank" rel="noopener noreferrer" title="Personal Website" className={linkBaseStyle}>
             <WebsiteIcon /> <span className="sr-only">Website</span>
          </a>
        )}
      </div>
    </div>
  );
}