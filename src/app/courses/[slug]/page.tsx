// src/app/courses/[slug]/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react'; // Import React and useMemo
import Link from 'next/link';
import CourseDetailSkeleton from '@/components/CourseDetailSkeleton';
import ErrorDisplay from '@/components/ErrorDisplay';
import EmptyState from '@/components/EmptyState';
import { useParams } from 'next/navigation';
// Ensure Arrow icons are imported for sorting controls
import { ArrowDownIcon, ArrowUpIcon, ArrowTopRightOnSquareIcon, BookOpenIcon, ChatBubbleLeftRightIcon, DocumentTextIcon as MoodleDocIcon } from '@heroicons/react/24/outline';

// Import the icon helper function (adjust path if necessary)
import { getFileIcon } from '@/lib/utils';

// --- Interfaces ---
interface CourseFile {
  name: string;
  url?: string | null; // download_url can sometimes be null
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
  departments?: string[]; // Array for multiple departments
  level?: number;
  credits?: number;
  semester?: "I" | "II"; // Added semester
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
  if (i >= sizes.length) return `${(bytes / Math.pow(k, sizes.length - 1)).toFixed(dm)} ${sizes[sizes.length - 1]}`;
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}


// --- Fetch Course Details Function ---
async function fetchCourseDetails(slug: string): Promise<CourseDetails | null> {
  const apiUrl = `/api/courses/${slug}`;
  console.log(`[CourseDetail Page] Fetching from: ${apiUrl}`);
  try {
    const res = await fetch(apiUrl, { cache: 'no-store' }); // Dev only setting
    console.log(`[CourseDetail Page] Fetch status for ${slug}: ${res.status}`);
    if (!res.ok) {
      if (res.status === 404) {
          console.warn(`Course details not found for slug: ${slug} (API returned 404)`);
          return null; // Treat 404 as course not found
      }
      const errorBody = await res.text().catch(() => `Status ${res.status}`);
      let details = `Status: ${res.status}. ${errorBody}`;
      try {
          const jsonError = JSON.parse(errorBody);
          details = jsonError.error || jsonError.message || details;
       } catch (_ignoredError) { /* ignore parsing error */ }
      console.error(`Failed fetch course details for ${slug}:`, details);
      throw new Error(`Failed to fetch course details. ${details}`);
    }
    const data = await res.json();
    console.log(`[CourseDetail Page] Successfully fetched details for ${slug}`);
    if (!data || !data.metadata || !Array.isArray(data.files)) {
        console.error("Received invalid data structure from API for", slug);
        throw new Error("Invalid data structure received from server.");
    }
    return data as CourseDetails;
  } catch (error: unknown) {
    console.error(`Error caught in fetchCourseDetails for ${slug}:`, error);
    const message = (error instanceof Error) ? error.message : "An unknown error occurred during data fetching.";
    throw new Error(message);
  }
}


// --- Main Course Detail Page Component ---
export default function CourseDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  // State variables
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);
  // State for file sorting
  const [fileSortKey, setFileSortKey] = useState<'name' | 'size'>('name'); // Default sort by name
  const [fileSortOrder, setFileSortOrder] = useState<'asc' | 'desc'>('asc'); // Default ascending

  // Fetch data effect
  useEffect(() => {
    if (!slug) {
      setIsLoading(false);
      setIsNotFound(true);
      return;
    }
    setIsLoading(true);
    setIsNotFound(false);
    setError(null);
    setCourseDetails(null); // Clear previous data
    fetchCourseDetails(slug)
      .then(data => {
        if (data === null) setIsNotFound(true);
        else setCourseDetails(data);
      })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Unknown error"))
      .finally(() => setIsLoading(false));
  }, [slug]);

  // --- Memoize the sorted files list ---
  // This recalculates only when the source files or sort criteria change
  const sortedFiles = useMemo(() => {
      // Return empty array immediately if no files data
      if (!courseDetails?.files) return [];

      // Create a mutable copy to avoid sorting the original state directly
      const filesToSort = [...courseDetails.files];

      // Sort the copy based on current key and order
      filesToSort.sort((a, b) => {
          let comparison = 0;
          // Compare based on the selected sort key
          if (fileSortKey === 'name') {
              // Case-insensitive string comparison for names
              comparison = (a.name || '').localeCompare(b.name || '');
          } else if (fileSortKey === 'size') {
              // Numerical comparison for size (treat undefined size as 0)
              comparison = (a.size ?? 0) - (b.size ?? 0);
          }
          // Apply ascending or descending order
          return fileSortOrder === 'asc' ? comparison : -comparison;
      });

      console.log(`Sorted files by ${fileSortKey} ${fileSortOrder}. Count: ${filesToSort.length}`);
      return filesToSort; // Return the sorted copy
  }, [courseDetails?.files, fileSortKey, fileSortOrder]); // Dependencies


  // --- Render Logic ---
  if (isLoading) return <CourseDetailSkeleton />;
  if (error) return (
    <div className="max-w-4xl mx-auto">
         <Link href="/" className="text-primary hover:underline mb-6 inline-block text-sm"> ← Back </Link>
         <ErrorDisplay message={`Could Not Load Course Details`} details={error} />
    </div>
  );
   if (isNotFound || !courseDetails) return (
      <div className="max-w-4xl mx-auto">
           <Link href="/" className="text-primary hover:underline mb-6 inline-block text-sm"> ← Back </Link>
          <ErrorDisplay message="Course Not Found" details={`Course '${slug || 'requested'}' could not be found.`} />
      </div>
   );


  // Data is ready
  const { metadata /* files replaced by sortedFiles */ } = courseDetails;
  const hasMoodleLinks = metadata.moodleCourseUrl || metadata.moodleForumUrl || metadata.moodleAssignmentsUrl;

  // --- Styles ---
  const sectionStyle = "mb-8 p-6 border border-gray-200 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-800/30 shadow-sm";
  const sectionTitleBaseStyle = "text-xl sm:text-2xl font-semibold text-gray-900 dark:text-gray-100"; // Base style for title text
  const sectionTitleContainerStyle = "flex flex-wrap justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-5 gap-4"; // Container for title + controls
  const listItemStyle = "flex items-center group py-2.5";
  const linkStyle = "font-medium text-primary hover:underline group-hover:text-primary-dark dark:text-primary-light dark:hover:text-primary flex items-center break-words transition-colors duration-150 min-w-0";
  const moodleIconStyle = "w-5 h-5 mr-3 text-primary/70 dark:text-primary-light/70 flex-shrink-0";
  const fileIconStyle = "w-5 h-5 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0";
  const externalIconStyle = "w-4 h-4 ml-1.5 text-gray-400 dark:text-gray-500 inline-block flex-shrink-0 group-hover:text-primary-dark dark:group-hover:text-primary";
  const metadataBadgeStyle = "text-xs text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 px-1.5 py-0.5 rounded whitespace-nowrap";
  const sortButtonStyle = `flex items-center px-2 py-0.5 rounded text-xs transition-colors duration-150`;
  const activeSortButtonStyle = `bg-gray-200 dark:bg-gray-700 font-medium text-gray-800 dark:text-gray-100`;
  const inactiveSortButtonStyle = `text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50`;


  // --- Function to handle file sort toggle ---
  const handleFileSort = (key: 'name' | 'size') => {
      if (key === fileSortKey) {
          // Toggle order if same key is clicked
          setFileSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
      } else {
          // Switch to new key and default to ascending
          setFileSortKey(key);
          setFileSortOrder('asc');
      }
  };


  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Link */}
      <Link href="/" className="text-primary hover:underline mb-6 inline-block transition duration-150 text-sm"> ← Back to All Courses </Link>

      {/* Course Header Section */}
      <div className="mb-5 border-b border-gray-200 dark:border-gray-700 pb-5">
        {/* Code Badge */}
        <span className="inline-block bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light px-2.5 py-1 rounded-full text-sm font-semibold mb-3">
            {metadata.code}
        </span>
        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">{metadata.title}</h1>
        {/* Metadata Row */}
        <div className="flex items-center gap-x-3 gap-y-1 flex-wrap text-sm text-gray-600 dark:text-gray-400 mb-3">
            {metadata.instructor && <span>Instructor: {metadata.instructor}</span>}
            {/* Badges for level, credits, semester */}
            {metadata.level && <span className={metadataBadgeStyle}>Level: {metadata.level}</span>}
            {metadata.credits && <span className={metadataBadgeStyle}>Credits: {metadata.credits}</span>}
            {metadata.semester && <span className={metadataBadgeStyle}>Semester: {metadata.semester}</span>}
        </div>
         {/* Departments List */}
         {metadata.departments && metadata.departments.length > 0 && (
            <div className="text-sm text-gray-600 dark:text-gray-400">
                <span className="font-medium">Departments:</span> {metadata.departments.join(', ')}
            </div>
         )}
      </div>
      {/* Description */}
      <p className="text-lg text-foreground/80 dark:text-foreground/70 mb-8">{metadata.description}</p>


      {/* Resources & Files Section */}
      <div className={sectionStyle}>
         {/* Section Header with Sort Controls */}
         <div className={sectionTitleContainerStyle}>
            <h2 className={sectionTitleBaseStyle}> Resources & Files </h2>
            {/* File Sort Controls - only show if more than 1 file */}
            {sortedFiles && sortedFiles.length > 1 && (
                 <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="text-xs text-muted-foreground dark:text-gray-400">Sort by:</span>
                    {/* Name Sort Button */}
                    <button
                        onClick={() => handleFileSort('name')}
                        className={`${sortButtonStyle} ${fileSortKey === 'name' ? activeSortButtonStyle : inactiveSortButtonStyle}`}
                        aria-label={`Sort by Name ${fileSortKey === 'name' ? (fileSortOrder === 'asc' ? '(Ascending)' : '(Descending)') : ''}`}
                        >
                        Name
                        {fileSortKey === 'name' && (
                            fileSortOrder === 'asc'
                            ? <ArrowUpIcon className="w-3 h-3 ml-1 flex-shrink-0" aria-hidden="true"/>
                            : <ArrowDownIcon className="w-3 h-3 ml-1 flex-shrink-0" aria-hidden="true"/>
                        )}
                    </button>
                     {/* Size Sort Button */}
                     <button
                        onClick={() => handleFileSort('size')}
                         className={`${sortButtonStyle} ${fileSortKey === 'size' ? activeSortButtonStyle : inactiveSortButtonStyle}`}
                         aria-label={`Sort by Size ${fileSortKey === 'size' ? (fileSortOrder === 'asc' ? '(Ascending)' : '(Descending)') : ''}`}
                        >
                        Size
                        {fileSortKey === 'size' && (
                             fileSortOrder === 'asc'
                             ? <ArrowUpIcon className="w-3 h-3 ml-1 flex-shrink-0" aria-hidden="true"/>
                             : <ArrowDownIcon className="w-3 h-3 ml-1 flex-shrink-0" aria-hidden="true"/>
                        )}
                    </button>
                 </div>
            )}
         </div>

         {/* Render File List using the sorted array */}
         {sortedFiles && sortedFiles.length > 0 ? (
           <ul className="space-y-1 divide-y divide-gray-100 dark:divide-gray-800/50">
             {/* Map over the sortedFiles array */}
             {sortedFiles.map((file) => {
                const fileName = file?.name || 'Unnamed File';
                const IconComponent = getFileIcon(fileName); // Get the appropriate icon
                return (
                    <li key={`${fileName}-${file.url || ''}`} className={`${listItemStyle} justify-between gap-4`}>
                        {/* File Link */}
                        <a
                           href={file.url || '#'} // Use '#' as fallback href if URL is missing
                           target="_blank"
                           rel="noopener noreferrer"
                           className={`${linkStyle} ${!file.url ? 'opacity-50 cursor-not-allowed pointer-events-none' : ''}`} // Style disabled links
                           download={!file.url?.startsWith('http')} // Suggest download if not HTTP(S)
                           aria-disabled={!file.url}
                           title={file.url ? fileName : `${fileName} (Link unavailable)`} // Indicate if link is missing
                        >
                            <IconComponent className={fileIconStyle} aria-hidden="true"/>
                            <span className="truncate" title={fileName}>{fileName}</span> {/* Truncate long filenames */}
                        </a>
                         {/* File Size */}
                        <span className="text-gray-500 dark:text-gray-400 text-xs ml-2 flex-shrink-0 whitespace-nowrap">
                           {formatBytes(file.size)}
                        </span>
                    </li>
                );
             })}
           </ul>
         ) : (
            // Show empty state if no files are present
            <EmptyState title="No Resources Found" message="No files or resources have been uploaded for this course yet." />
         )}
      </div>


      {/* Moodle Resources Section (No changes needed) */}
      {hasMoodleLinks && (
        <div className={sectionStyle}>
          <h2 className={sectionTitleBaseStyle.replace('mb-5','mb-4')}>Moodle Links</h2> {/* Adjust title style slightly if needed */}
          <ul className="space-y-1 divide-y divide-gray-100 dark:divide-gray-800/50">
            {metadata.moodleCourseUrl && <li className={listItemStyle}><BookOpenIcon className={moodleIconStyle}/> <a href={metadata.moodleCourseUrl} target="_blank" rel="noopener noreferrer" className={linkStyle}> Moodle Course Page <ArrowTopRightOnSquareIcon className={externalIconStyle}/></a></li>}
            {metadata.moodleForumUrl && <li className={listItemStyle}><ChatBubbleLeftRightIcon className={moodleIconStyle}/> <a href={metadata.moodleForumUrl} target="_blank" rel="noopener noreferrer" className={linkStyle}> Course Forum <ArrowTopRightOnSquareIcon className={externalIconStyle}/></a></li>}
            {metadata.moodleAssignmentsUrl && <li className={listItemStyle}><MoodleDocIcon className={moodleIconStyle}/> <a href={metadata.moodleAssignmentsUrl} target="_blank" rel="noopener noreferrer" className={linkStyle}> Assignments <ArrowTopRightOnSquareIcon className={externalIconStyle}/></a></li>}
          </ul>
        </div>
      )}


      {/* YouTube Playlist Section (No changes needed) */}
      {metadata.youtubePlaylistId && (
         <div className={sectionStyle}>
            <h2 className={sectionTitleBaseStyle.replace('mb-5','mb-4')}>Video Lectures</h2>
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900">
              <iframe
                key={slug + '-' + metadata.youtubePlaylistId} // Key helps React update if ID changes
                src={`https://www.youtube.com/embed/videoseries?list=${metadata.youtubePlaylistId}`}
                title="YouTube video playlist player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin" // Recommended policy
                allowFullScreen
                className="w-full h-full"
                loading="lazy" // Defer loading
              ></iframe>
            </div>
         </div>
      )}
    </div>
  );
}