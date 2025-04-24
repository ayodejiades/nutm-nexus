// src/app/courses/[slug]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CourseDetailSkeleton from '@/components/CourseDetailSkeleton';
import ErrorDisplay from '@/components/ErrorDisplay';
import EmptyState from '@/components/EmptyState';
import { useParams } from 'next/navigation';
import { ArrowTopRightOnSquareIcon, BookOpenIcon, ChatBubbleLeftRightIcon, DocumentTextIcon as MoodleDocIcon } from '@heroicons/react/24/outline';

// Import the icon helper function (ensure path is correct)
import { getFileIcon } from '@/lib/utils';

// --- Interfaces ---
interface CourseFile {
  name: string;
  url?: string; // download_url can sometimes be null from GitHub API
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
  // Added fields
  department?: string;
  level?: number;
  credits?: number;
}
interface CourseDetails {
  metadata: CourseMetadata;
  files: CourseFile[];
}

// --- Format Bytes Helper ---
function formatBytes(bytes: number, decimals = 1): string { // Adjusted decimals
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  if (i >= sizes.length) return `${(bytes / Math.pow(k, sizes.length - 1)).toFixed(dm)} ${sizes[sizes.length - 1]}`; // Handle very large files if needed
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}


// --- Fetch Course Details Function ---
async function fetchCourseDetails(slug: string): Promise<CourseDetails | null> {
  const apiUrl = `/api/courses/${slug}`;
  try {
    // Use no-store during dev, configure revalidation for prod
    const res = await fetch(apiUrl, { cache: 'no-store' });
    if (!res.ok) {
      if (res.status === 404) {
          console.warn(`Course details not found for slug: ${slug}`);
          return null; // Treat 404 as course not found
      }
      const errorBody = await res.text().catch(() => `Status ${res.status}`);
      let details = `Status: ${res.status}. ${errorBody}`;
       try { details = JSON.parse(errorBody).error || details; } catch (e) { /* ignore */ }
      console.error(`Failed fetch course details for ${slug}:`, details);
      throw new Error(`Failed to fetch course details. ${details}`);
    }
    const data = await res.json();
    console.log(`Successfully fetched details for ${slug}`);
    return data as CourseDetails;
  } catch (error: any) {
    console.error(`Error caught in fetchCourseDetails for ${slug}:`, error);
    throw error instanceof Error ? error : new Error(String(error));
  }
}


// --- Main Course Detail Page Component ---
export default function CourseDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug; // Get slug using the hook

  // State variables
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  // Fetch data on mount or when slug changes
  useEffect(() => {
    if (!slug) {
      console.warn("CourseDetail: Slug is missing, cannot fetch.");
      setIsLoading(false);
      setIsNotFound(true); // Consider this not found if slug is invalid
      return;
    }

    setIsLoading(true);
    setIsNotFound(false);
    setError(null);
    console.log(`CourseDetail useEffect: Fetching details for slug: ${slug}`);

    fetchCourseDetails(slug)
      .then(data => {
        if (data === null) {
          console.log(`CourseDetail useEffect: Course not found for slug: ${slug}`);
          setIsNotFound(true);
          setCourseDetails(null);
        } else {
          console.log(`CourseDetail useEffect: Received details for slug ${slug}.`);
          setCourseDetails(data);
          setError(null); // Clear error on success
        }
      })
      .catch(err => {
        console.error(`CourseDetail useEffect: Caught error for slug ${slug}:`, err);
        setError(err.message || "An unknown error occurred while fetching course details.");
        setCourseDetails(null); // Clear details on error
        setIsNotFound(false); // It's an error, not necessarily "not found"
      })
      .finally(() => {
        setIsLoading(false);
        console.log(`CourseDetail useEffect: Fetch finished for slug ${slug}.`);
      });
  }, [slug]); // Dependency array includes slug


  // --- Render Logic ---
  // Handle cases before accessing courseDetails
  if (isLoading) return <CourseDetailSkeleton />; // Show skeleton while loading

  if (error) {
    // Show error display if fetch failed
    return (
        <div className="max-w-4xl mx-auto">
             <Link href="/" className="text-primary hover:underline mb-6 inline-block transition duration-150 text-sm">
                ← Back to All Courses
            </Link>
            <ErrorDisplay message={`Could Not Load Course Details`} details={error} />
        </div>
    );
  }

  if (isNotFound || !courseDetails) {
     // Show "Not Found" state if API returned 404 or slug was missing
    return (
        <div className="max-w-4xl mx-auto">
             <Link href="/" className="text-primary hover:underline mb-6 inline-block transition duration-150 text-sm">
                ← Back to All Courses
            </Link>
            <ErrorDisplay message="Course Not Found" details={`The course '${slug || 'requested'}' could not be found.`} />
        </div>
    );
  }


  // --- Main Content Rendering (if data is loaded successfully) ---
  const { metadata, files } = courseDetails;
  const hasMoodleLinks = metadata.moodleCourseUrl || metadata.moodleForumUrl || metadata.moodleAssignmentsUrl;

  // Common Styles for sections
  const sectionStyle = "mb-8 p-6 border border-gray-200 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-800/30 shadow-sm";
  const sectionTitleStyle = "text-xl sm:text-2xl font-semibold mb-5 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-3";
  const listItemStyle = "flex items-center group py-2.5"; // Increased padding
  const linkStyle = "font-medium text-primary hover:underline group-hover:text-primary-dark dark:text-primary-light dark:hover:text-primary flex items-center break-words transition-colors duration-150 min-w-0"; // break-words needed
  const moodleIconStyle = "w-5 h-5 mr-3 text-primary/70 dark:text-primary-light/70 flex-shrink-0";
  const fileIconStyle = "w-5 h-5 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0";
  const externalIconStyle = "w-4 h-4 ml-1.5 text-gray-400 dark:text-gray-500 inline-block flex-shrink-0 group-hover:text-primary-dark dark:group-hover:text-primary";

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Link */}
      <Link href="/" className="text-primary hover:underline mb-6 inline-block transition duration-150 text-sm">
        ← Back to All Courses
      </Link>

      {/* Course Header */}
      <div className="mb-5">
        <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="inline-block bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light px-2.5 py-0.5 rounded-full text-xs font-semibold">
                {metadata.code}
            </span>
            {/* Display metadata badges */}
            {metadata.department && <span className="text-xs text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 px-1.5 py-0.5 rounded">Dept: {metadata.department}</span>}
            {metadata.level && <span className="text-xs text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 px-1.5 py-0.5 rounded">Level: {metadata.level}</span>}
            {metadata.credits && <span className="text-xs text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 px-1.5 py-0.5 rounded">Credits: {metadata.credits}</span>}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">{metadata.title}</h1>
        {metadata.instructor && <p className="text-sm text-gray-600 dark:text-gray-400">Instructor: {metadata.instructor}</p>}
      </div>
      <p className="text-lg text-foreground/80 dark:text-foreground/70 mb-8">{metadata.description}</p>


      {/* Tutorial Files Section */}
      <div className={sectionStyle}>
         <h2 className={sectionTitleStyle}>Resources & Files</h2>
         {files && files.length > 0 ? (
           <ul className="space-y-1 divide-y divide-gray-100 dark:divide-gray-800/50">
             {files.map((file) => {
                const IconComponent = getFileIcon(file?.name); // Get the icon component
                return (
                    <li key={file.name} className={`${listItemStyle} justify-between gap-4`}>
                        <a href={file.url || '#'} target="_blank" rel="noopener noreferrer" className={linkStyle} download={!file.url?.startsWith('http')}>
                            <IconComponent className={fileIconStyle} aria-hidden="true"/>
                             {/* Use min-w-0 and truncate on span for better control */}
                            <span className="truncate" title={file.name}>{file.name}</span>
                        </a>
                         {/* Ensure size doesn't wrap */}
                        <span className="text-gray-500 dark:text-gray-400 text-xs ml-2 flex-shrink-0 whitespace-nowrap">{formatBytes(file.size)}</span>
                    </li>
                );
             })}
           </ul>
         ) : ( <EmptyState title="No Files Found" message="No resources have been uploaded for this course yet." /> )}
      </div>


      {/* Moodle Resources Section */}
      {hasMoodleLinks && (
        <div className={sectionStyle}>
          <h2 className={sectionTitleStyle}>Moodle Links</h2>
          <ul className="space-y-1 divide-y divide-gray-100 dark:divide-gray-800/50">
            {metadata.moodleCourseUrl && (
              <li className={listItemStyle}>
                 <BookOpenIcon className={moodleIconStyle}/>
                 <a href={metadata.moodleCourseUrl} target="_blank" rel="noopener noreferrer" className={linkStyle}>
                   Moodle Course Page <ArrowTopRightOnSquareIcon className={externalIconStyle}/>
                 </a>
              </li>
            )}
             {metadata.moodleForumUrl && (
              <li className={listItemStyle}>
                 <ChatBubbleLeftRightIcon className={moodleIconStyle}/>
                 <a href={metadata.moodleForumUrl} target="_blank" rel="noopener noreferrer" className={linkStyle}>
                   Course Forum <ArrowTopRightOnSquareIcon className={externalIconStyle}/>
                 </a>
              </li>
            )}
             {metadata.moodleAssignmentsUrl && (
              <li className={listItemStyle}>
                 <MoodleDocIcon className={moodleIconStyle}/>
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
                key={slug + '-' + metadata.youtubePlaylistId} // More robust key
                src={`https://www.youtube.com/embed/videoseries?list=${metadata.youtubePlaylistId}`}
                title="YouTube video playlist player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full h-full bg-gray-100 dark:bg-gray-900"
                loading="lazy"
              ></iframe>
            </div>
         </div>
      )}
    </div>
  );
}