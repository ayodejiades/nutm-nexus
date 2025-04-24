// src/app/courses/[slug]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CourseDetailSkeleton from '@/components/CourseDetailSkeleton';
import ErrorDisplay from '@/components/ErrorDisplay';
import EmptyState from '@/components/EmptyState';
import { useParams } from 'next/navigation';
import { ArrowTopRightOnSquareIcon, BookOpenIcon, ChatBubbleLeftRightIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

// --- Interfaces ---
interface CourseFile {
  name: string;
  url: string;
  size: number;
}
interface CourseMetadata {
  title: string;
  code: string;
  description: string;
  instructor?: string;
  youtubePlaylistId?: string;
  moodleCourseUrl?: string;
  moodleForumUrl?: string;
  moodleAssignmentsUrl?: string;
}
interface CourseDetails {
  metadata: CourseMetadata;
  files: CourseFile[];
}

// --- formatBytes ---
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0 || !bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// --- fetchCourseDetails ---
async function fetchCourseDetails(slug: string): Promise<CourseDetails | null> {
  const apiUrl = `/api/courses/${slug}`;
  try {
    const res = await fetch(apiUrl);
    if (!res.ok) {
      if (res.status === 404) return null;
      const errorBody = await res.text().catch(() => `Status ${res.status}`);
      console.error(`Failed fetch course details for ${slug}:`, errorBody);
      throw new Error(`Failed to fetch details. Status: ${res.status}`);
    }
    return await res.json() as CourseDetails;
  } catch (error: any) {
    console.error(`Error fetching details for ${slug}:`, error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}

// --- Main Component ---
export default function CourseDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    if (!slug) {
      setIsLoading(false);
      setIsNotFound(true);
      return;
    }
    setIsLoading(true);
    setIsNotFound(false);
    setError(null);
    fetchCourseDetails(slug)
      .then(data => {
        if (data === null) setIsNotFound(true);
        else setCourseDetails(data);
      })
      .catch(err => setError(err.message || "Unknown error"))
      .finally(() => setIsLoading(false));
  }, [slug]);

  // --- Render Logic ---
  if (!slug) return <CourseDetailSkeleton />; // Or specific error
  if (isLoading) return <CourseDetailSkeleton />;
  if (error) return <ErrorDisplay message={`Could Not Load Course Details`} details={error} />;
  if (isNotFound || !courseDetails) return (
    <div>
      <Link href="/" className="text-primary hover:underline mb-4 inline-block"> ← Back</Link>
      <ErrorDisplay message="Course Not Found" details={`Course '${slug}' could not be found.`} />
    </div>
  );

  const { metadata, files } = courseDetails;
  const hasMoodleLinks = metadata.moodleCourseUrl || metadata.moodleForumUrl || metadata.moodleAssignmentsUrl;

  // Define styles for resource sections
  const sectionStyle = "mb-8 p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900/30 shadow-sm";
  const sectionTitleStyle = "text-2xl font-semibold mb-5 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-3";
  const listItemStyle = "flex items-center group py-2";
  const linkStyle = "text-primary hover:underline group-hover:text-primary-dark dark:text-primary-light dark:hover:text-primary flex items-center break-all transition-colors duration-150";
  const iconStyle = "w-5 h-5 mr-3 text-primary/70 dark:text-primary-light/70 flex-shrink-0";
  const externalIconStyle = "w-4 h-4 ml-1.5 text-gray-400 dark:text-gray-500 inline-block flex-shrink-0 group-hover:text-primary-dark dark:group-hover:text-primary";


  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/" className="text-primary hover:underline mb-6 inline-block transition duration-150 text-sm">
        ← Back to All Courses
      </Link>
      <h1 className="text-3xl md:text-4xl font-bold text-primary-dark dark:text-primary-light mb-2">{metadata.code} - {metadata.title}</h1>
      <p className="text-lg text-foreground/80 dark:text-foreground/70 mb-4">{metadata.description}</p>
      {metadata.instructor && <p className="text-gray-600 dark:text-gray-400 mb-8">Instructor: {metadata.instructor}</p>}

      {/* Tutorial Files Section */}
      <div className={sectionStyle}>
         <h2 className={sectionTitleStyle}>Tutorial Files</h2>
         {files && files.length > 0 ? (
           <ul className="space-y-1 divide-y divide-gray-100 dark:divide-gray-800">
             {files.map((file) => (
               <li key={file.name} className={`${listItemStyle} justify-between`}>
                 <a href={file.url} target="_blank" rel="noopener noreferrer" className={linkStyle}>
                   <DocumentTextIcon className={iconStyle} />
                   {file.name}
                 </a>
                 <span className="text-gray-500 dark:text-gray-400 text-xs ml-2 flex-shrink-0">{formatBytes(file.size)}</span>
               </li>
             ))}
           </ul>
         ) : ( <EmptyState title="No Files Yet" message="Tutorial files haven't been uploaded for this course." /> )}
      </div>

      {/* Moodle Resources Section */}
      {hasMoodleLinks && (
        <div className={sectionStyle}>
          <h2 className={sectionTitleStyle}>Moodle Resources</h2>
          <ul className="space-y-1 divide-y divide-gray-100 dark:divide-gray-800">
            {metadata.moodleCourseUrl && (
              <li className={listItemStyle}>
                 <BookOpenIcon className={iconStyle}/>
                 <a href={metadata.moodleCourseUrl} target="_blank" rel="noopener noreferrer" className={linkStyle}>
                   Moodle Course Page <ArrowTopRightOnSquareIcon className={externalIconStyle}/>
                 </a>
              </li>
            )}
             {metadata.moodleForumUrl && (
              <li className={listItemStyle}>
                 <ChatBubbleLeftRightIcon className={iconStyle}/>
                 <a href={metadata.moodleForumUrl} target="_blank" rel="noopener noreferrer" className={linkStyle}>
                   Course Forum <ArrowTopRightOnSquareIcon className={externalIconStyle}/>
                 </a>
              </li>
            )}
             {metadata.moodleAssignmentsUrl && (
              <li className={listItemStyle}>
                 <DocumentTextIcon className={iconStyle}/>
                 <a href={metadata.moodleAssignmentsUrl} target="_blank" rel="noopener noreferrer" className={linkStyle}>
                   Assignments <ArrowTopRightOnSquareIcon className={externalIconStyle}/>
                 </a>
              </li>
            )}
          </ul>
        </div>
      )}

      {/* YouTube Playlist Section */}
      {metadata.youtubePlaylistId && (
         <div className={sectionStyle}>
            <h2 className={sectionTitleStyle}>Video Lectures</h2>
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-800">
              <iframe
                key={metadata.youtubePlaylistId} // Add key to force re-render if ID changes
                src={`https://www.youtube.com/embed/videoseries?list=${metadata.youtubePlaylistId}`}
                title="YouTube video playlist player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-full bg-gray-100 dark:bg-gray-800" // Background while loading
                loading="lazy"
              ></iframe>
            </div>
         </div>
      )}
    </div>
  );
}