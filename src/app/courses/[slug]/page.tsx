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
import { getFileIcon } from '@/lib/utils'; // Assuming utils.ts exists in src/lib

// --- Interfaces ---
interface CourseFile {
  name: string;
  url?: string | null; // download_url can sometimes be null from GitHub API
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
function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  // Handle edge case for extremely large files if needed
  if (i >= sizes.length) return `${(bytes / Math.pow(k, sizes.length - 1)).toFixed(dm)} ${sizes[sizes.length - 1]}`;
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}


// --- Fetch Course Details Function ---
async function fetchCourseDetails(slug: string): Promise<CourseDetails | null> {
  const apiUrl = `/api/courses/${slug}`;
  console.log(`[CourseDetail Page] Fetching from: ${apiUrl}`);
  try {
    // Always refetch in development, use caching in production via revalidate tag or time-based
    const res = await fetch(apiUrl, { cache: 'no-store' }); // Change cache setting for production
    console.log(`[CourseDetail Page] Fetch status for ${slug}: ${res.status}`);
    if (!res.ok) {
      if (res.status === 404) {
          console.warn(`Course details not found for slug: ${slug} (API returned 404)`);
          return null; // Treat 404 as course not found
      }
      // Try to get more specific error from API response body
      const errorBody = await res.text().catch(() => `Status ${res.status}`);
      let details = `Status: ${res.status}. ${errorBody}`;
      // FIX: Omit variable name in catch if unused
      try {
          const jsonError = JSON.parse(errorBody);
          details = jsonError.error || jsonError.message || details;
       } catch { /* Ignore parsing error */ }
      console.error(`Failed fetch course details for ${slug}:`, details);
      throw new Error(`Failed to fetch course details. ${details}`);
    }
    const data = await res.json();
    console.log(`[CourseDetail Page] Successfully fetched details for ${slug}`);
    // Basic validation of returned structure (optional but good)
    if (!data || !data.metadata || !Array.isArray(data.files)) {
        console.error("Received invalid data structure from API for", slug);
        throw new Error("Invalid data structure received from server.");
    }
    return data as CourseDetails;
  } catch (error: unknown) { // Use unknown type
    console.error(`Error caught in fetchCourseDetails for ${slug}:`, error);
    // Use type guard for error message
    const message = (error instanceof Error) ? error.message : "An unknown error occurred during data fetching.";
    throw new Error(message); // Re-throw as Error object
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
    // If slug is not available yet (e.g., during initial render or invalid URL), set state appropriately
    if (!slug) {
      console.warn("CourseDetail: Slug is missing from params on mount/update.");
      setIsLoading(false);
      setIsNotFound(true); // Treat missing/invalid slug as "Not Found"
      return;
    }

    // Reset state before fetching
    setIsLoading(true);
    setIsNotFound(false);
    setError(null);
    setCourseDetails(null); // Clear previous details
    console.log(`CourseDetail useEffect: Fetching details for valid slug: ${slug}`);

    fetchCourseDetails(slug)
      .then(data => {
        if (data === null) {
          // API explicitly returned null (e.g., 404 from API route)
          console.log(`CourseDetail useEffect: Course not found for slug: ${slug} (API returned null).`);
          setIsNotFound(true);
        } else {
          // Data successfully fetched
          console.log(`CourseDetail useEffect: Received details for slug ${slug}.`);
          setCourseDetails(data);
          setError(null); // Clear any previous error
        }
      })
      .catch((err: unknown) => { // Use unknown for catch
        // Handle errors during the fetch process
        console.error(`CourseDetail useEffect: Caught error while fetching for slug ${slug}:`, err);
        // Use type guard for message
        // FIX: Prefix unused parameter `_e` if not using the caught error directly inside block
        setError(err instanceof Error ? err.message : "Unknown fetch error");
        setCourseDetails(null); // Clear details on error
        setIsNotFound(false); // This is an error state, not "not found"
      })
      .finally(() => {
        // Ensure loading is always set to false after fetch attempt
        setIsLoading(false);
        console.log(`CourseDetail useEffect: Fetch attempt finished for slug ${slug}.`);
      });
  }, [slug]); // Dependency array ensures effect runs when slug changes


  // --- Render Logic ---
  // 1. Show skeleton while loading is true
  if (isLoading) {
      console.log(`CourseDetail: Rendering skeleton for ${slug || 'unknown slug'} (isLoading).`);
      return <CourseDetailSkeleton />;
  }

  // 2. Show error display if an error occurred during fetch
  if (error) {
     console.error(`CourseDetail: Rendering ErrorDisplay for ${slug || 'unknown slug'}:`, error);
    return (
        <div className="max-w-4xl mx-auto">
             <Link href="/" className="text-primary hover:underline mb-6 inline-block transition duration-150 text-sm">
                ← Back to All Courses
            </Link>
            <ErrorDisplay message={`Could Not Load Course Details`} details={error} />
        </div>
    );
  }

  // 3. Show "Not Found" state if API indicated not found OR slug was invalid OR courseDetails is null after loading
   if (isNotFound || !courseDetails) {
       console.log(`CourseDetail: Rendering Not Found for ${slug || 'unknown slug'}. isNotFound=${isNotFound}, !courseDetails=${!courseDetails}`);
      return (
          <div className="max-w-4xl mx-auto">
              <Link href="/" className="text-primary hover:underline mb-6 inline-block transition duration-150 text-sm">
                 ← Back to All Courses
             </Link>
             <ErrorDisplay message="Course Not Found" details={`The course '${slug || 'requested'}' could not be found.`} />
          </div>
      );
   }


  // 4. --- Main Content Rendering (Data is available) ---
  const { metadata, files } = courseDetails;
  const hasMoodleLinks = metadata.moodleCourseUrl || metadata.moodleForumUrl || metadata.moodleAssignmentsUrl;
  console.log(`CourseDetail: Rendering main content for ${slug}.`);


  // Common Styles defined for readability
  const sectionStyle = "mb-8 p-6 border border-gray-200 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-800/30 shadow-sm";
  const sectionTitleStyle = "text-xl sm:text-2xl font-semibold mb-5 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-3";
  const listItemStyle = "flex items-center group py-2.5"; // Consistent vertical padding
  const linkStyle = "font-medium text-primary hover:underline group-hover:text-primary-dark dark:text-primary-light dark:hover:text-primary flex items-center break-words transition-colors duration-150 min-w-0"; // Handle long links
  const moodleIconStyle = "w-5 h-5 mr-3 text-primary/70 dark:text-primary-light/70 flex-shrink-0";
  const fileIconStyle = "w-5 h-5 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0";
  const externalIconStyle = "w-4 h-4 ml-1.5 text-gray-400 dark:text-gray-500 inline-block flex-shrink-0 group-hover:text-primary-dark dark:group-hover:text-primary";


  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Link */}
      <Link href="/" className="text-primary hover:underline mb-6 inline-block transition duration-150 text-sm">
        ← Back to All Courses
      </Link>

      {/* Course Header Section */}
      <div className="mb-5 border-b border-gray-200 dark:border-gray-700 pb-5">
        <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="inline-block bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light px-2.5 py-0.5 rounded-full text-xs font-semibold">
                {metadata.code}
            </span>
            {/* Metadata Badges */}
            {metadata.department && <span className="text-xs text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 px-1.5 py-0.5 rounded">Dept: {metadata.department}</span>}
            {metadata.level && <span className="text-xs text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 px-1.5 py-0.5 rounded">Level: {metadata.level}</span>}
            {metadata.credits && <span className="text-xs text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 px-1.5 py-0.5 rounded">Credits: {metadata.credits}</span>}
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">{metadata.title}</h1>
        {metadata.instructor && <p className="text-sm text-gray-600 dark:text-gray-400">Instructor: {metadata.instructor}</p>}
      </div>
      <p className="text-lg text-foreground/80 dark:text-foreground/70 mb-8">{metadata.description}</p>


      {/* Resources & Files Section */}
      <div className={sectionStyle}>
         <h2 className={sectionTitleStyle}>Resources & Files</h2>
         {/* Ensure files array exists before mapping */}
         {files && files.length > 0 ? (
           <ul className="space-y-1 divide-y divide-gray-100 dark:divide-gray-800/50">
             {files.map((file) => {
                // Handle potential missing name gracefully (though unlikely from GitHub API)
                const fileName = file?.name || 'Unnamed File';
                const IconComponent = getFileIcon(fileName); // Get icon based on name
                return (
                    // Use name and potentially URL as key for better stability
                    <li key={`${fileName}-${file.url || ''}`} className={`${listItemStyle} justify-between gap-4`}>
                        {/* Link file only if URL exists */}
                        <a
                            href={file.url || '#'} // Provide fallback href
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${linkStyle} ${!file.url ? 'opacity-50 pointer-events-none' : ''}`} // Style disabled links
                            download={!file.url?.startsWith('http')} // Suggest download for non-HTTP links
                            aria-disabled={!file.url} // Accessibility for disabled links
                            title={file.url ? fileName : `${fileName} (Link unavailable)`} // Tooltip
                        >
                            <IconComponent className={fileIconStyle} aria-hidden="true"/>
                             {/* Use min-w-0 and truncate on span for better control */}
                            <span className="truncate">{fileName}</span>
                        </a>
                         {/* Ensure size doesn't wrap */}
                        <span className="text-gray-500 dark:text-gray-400 text-xs ml-2 flex-shrink-0 whitespace-nowrap">{formatBytes(file.size)}</span>
                    </li>
                );
             })}
           </ul>
         ) : (
            // Provide an empty state if no files are found
            <EmptyState title="No Resources Found" message="No files or resources have been uploaded for this course yet." />
         )}
      </div>


      {/* Moodle Resources Section */}
      {hasMoodleLinks && (
        <div className={sectionStyle}>
          <h2 className={sectionTitleStyle}>Moodle Links</h2>
          <ul className="space-y-1 divide-y divide-gray-100 dark:divide-gray-800/50">
             {/* Conditionally render each link */}
            {metadata.moodleCourseUrl && <li className={listItemStyle}><BookOpenIcon className={moodleIconStyle}/> <a href={metadata.moodleCourseUrl} target="_blank" rel="noopener noreferrer" className={linkStyle}> Moodle Course Page <ArrowTopRightOnSquareIcon className={externalIconStyle}/></a></li>}
            {metadata.moodleForumUrl && <li className={listItemStyle}><ChatBubbleLeftRightIcon className={moodleIconStyle}/> <a href={metadata.moodleForumUrl} target="_blank" rel="noopener noreferrer" className={linkStyle}> Course Forum <ArrowTopRightOnSquareIcon className={externalIconStyle}/></a></li>}
            {metadata.moodleAssignmentsUrl && <li className={listItemStyle}><MoodleDocIcon className={moodleIconStyle}/> <a href={metadata.moodleAssignmentsUrl} target="_blank" rel="noopener noreferrer" className={linkStyle}> Assignments <ArrowTopRightOnSquareIcon className={externalIconStyle}/></a></li>}
          </ul>
        </div>
      )}


      {/* YouTube Playlist Section */}
      {metadata.youtubePlaylistId && (
         <div className={sectionStyle}>
            <h2 className={sectionTitleStyle}>Video Lectures</h2>
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900">
              {/* Add a key to iframe to help React re-render if the src changes */}
              <iframe
                key={slug + '-' + metadata.youtubePlaylistId} // More robust key
                src={`https://www.youtube.com/embed/videoseries?list=${metadata.youtubePlaylistId}`}
                title="YouTube video playlist player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin" // Recommended policy
                allowFullScreen
                className="w-full h-full"
                loading="lazy" // Defer loading until needed
              ></iframe>
            </div>
         </div>
      )}
    </div>
  );
    }
