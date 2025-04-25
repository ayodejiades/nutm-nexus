// src/app/courses/[slug]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CourseDetailSkeleton from '@/components/CourseDetailSkeleton';
import ErrorDisplay from '@/components/ErrorDisplay';
import EmptyState from '@/components/EmptyState';
import { useParams } from 'next/navigation';
import { ArrowTopRightOnSquareIcon, BookOpenIcon, ChatBubbleLeftRightIcon, DocumentTextIcon as MoodleDocIcon } from '@heroicons/react/24/outline';
import { getFileIcon } from '@/lib/utils'; // Import the helper

// --- Interfaces (Updated) ---
interface CourseFile { name: string; url?: string | null; size: number; }
interface CourseMetadata {
  title: string; code: string; description: string; instructor?: string; youtubePlaylistId?: string;
  moodleCourseUrl?: string; moodleForumUrl?: string; moodleAssignmentsUrl?: string;
  departments?: string[]; // Changed to array
  level?: number;
  credits?: number;
  semester?: "I" | "II"; // Added semester
}
interface CourseDetails { metadata: CourseMetadata; files: CourseFile[]; }

// --- formatBytes ---
function formatBytes(bytes: number, decimals = 1): string {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024; const dm = decimals < 0 ? 0 : decimals; const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    if (i >= sizes.length) return `${(bytes / Math.pow(k, sizes.length - 1)).toFixed(dm)} ${sizes[sizes.length - 1]}`;
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

// --- fetchCourseDetails ---
async function fetchCourseDetails(slug: string): Promise<CourseDetails | null> {
  const apiUrl = `/api/courses/${slug}`;
  try {
    const res = await fetch(apiUrl, { cache: 'no-store' }); // Dev only setting
    if (!res.ok) {
      if (res.status === 404) return null;
      const errorBody = await res.text().catch(() => `Status ${res.status}`);
      let details = `Status: ${res.status}. ${errorBody}`;
      try { details = JSON.parse(errorBody).error || details; } catch {}
      console.error(`Failed fetch course details for ${slug}:`, details);
      throw new Error(`Failed to fetch details. ${details}`);
    }
    const data = await res.json();
    if (!data || !data.metadata || !Array.isArray(data.files)) { throw new Error("Invalid data structure from server."); }
    return data as CourseDetails;
  } catch (error: unknown) {
    console.error(`Error fetching details for ${slug}:`, error);
    const message = (error instanceof Error) ? error.message : "Unknown fetch error.";
    throw new Error(message);
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
    if (!slug) { setIsLoading(false); setIsNotFound(true); return; }
    setIsLoading(true); setIsNotFound(false); setError(null); setCourseDetails(null);
    fetchCourseDetails(slug)
      .then(data => { if (data === null) setIsNotFound(true); else setCourseDetails(data); })
      .catch((err: unknown) => setError(err instanceof Error ? err.message : "Unknown error"))
      .finally(() => setIsLoading(false));
  }, [slug]);

  // --- Render Logic ---
  if (isLoading) return <CourseDetailSkeleton />;
  if (error) return ( <ErrorDisplay message={`Could Not Load Course Details`} details={error} /> );
  if (isNotFound || !courseDetails) return ( <ErrorDisplay message="Course Not Found" details={`Course '${slug || 'requested'}' could not be found.`} /> );


  const { metadata, files } = courseDetails;
  const hasMoodleLinks = metadata.moodleCourseUrl || metadata.moodleForumUrl || metadata.moodleAssignmentsUrl;

  // --- Styles ---
  const sectionStyle = "mb-8 p-6 border border-gray-200 dark:border-gray-700/50 rounded-lg bg-white dark:bg-gray-800/30 shadow-sm";
  const sectionTitleStyle = "text-xl sm:text-2xl font-semibold mb-5 text-gray-900 dark:text-gray-100 border-b border-gray-200 dark:border-gray-700 pb-3";
  const listItemStyle = "flex items-center group py-2.5";
  const linkStyle = "font-medium text-primary hover:underline group-hover:text-primary-dark dark:text-primary-light dark:hover:text-primary flex items-center break-words transition-colors duration-150 min-w-0";
  const moodleIconStyle = "w-5 h-5 mr-3 text-primary/70 dark:text-primary-light/70 flex-shrink-0";
  const fileIconStyle = "w-5 h-5 mr-3 text-gray-500 dark:text-gray-400 flex-shrink-0";
  const externalIconStyle = "w-4 h-4 ml-1.5 text-gray-400 dark:text-gray-500 inline-block flex-shrink-0 group-hover:text-primary-dark dark:group-hover:text-primary";
  const metadataBadgeStyle = "text-xs text-gray-500 dark:text-gray-400 border border-gray-300 dark:border-gray-600 px-1.5 py-0.5 rounded whitespace-nowrap"; // Added whitespace nowrap

  return (
    <div className="max-w-4xl mx-auto">
      {/* Back Link */}
      <Link href="/" className="text-primary hover:underline mb-6 inline-block transition duration-150 text-sm"> ← Back to All Courses </Link>

      {/* Course Header */}
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
      <p className="text-lg text-foreground/80 dark:text-foreground/70 mb-8">{metadata.description}</p>

      {/* Resources & Files Section */}
      <div className={sectionStyle}>
         <h2 className={sectionTitleStyle}>Resources & Files</h2>
         {files && files.length > 0 ? (
           <ul className="space-y-1 divide-y divide-gray-100 dark:divide-gray-800/50">
             {files.map((file) => {
                const fileName = file?.name || 'Unnamed File';
                const IconComponent = getFileIcon(fileName);
                return (
                    <li key={`${fileName}-${file.url || ''}`} className={`${listItemStyle} justify-between gap-4`}>
                        <a href={file.url || '#'} target="_blank" rel="noopener noreferrer" className={linkStyle} download={!file.url?.startsWith('http')} aria-disabled={!file.url} title={file.url ? fileName : `${fileName} (Link unavailable)`}>
                            <IconComponent className={fileIconStyle} aria-hidden="true"/>
                            <span className="truncate" title={fileName}>{fileName}</span>
                        </a>
                        <span className="text-gray-500 dark:text-gray-400 text-xs ml-2 flex-shrink-0 whitespace-nowrap">{formatBytes(file.size)}</span>
                    </li>
                );
             })}
           </ul>
         ) : ( <EmptyState title="No Resources Found" message="No files have been uploaded yet." /> )}
      </div>

      {/* Moodle Section */}
      {hasMoodleLinks && (
        <div className={sectionStyle}>
          <h2 className={sectionTitleStyle}>Moodle Links</h2>
          <ul className="space-y-1 divide-y divide-gray-100 dark:divide-gray-800/50">
            {metadata.moodleCourseUrl && <li className={listItemStyle}><BookOpenIcon className={moodleIconStyle}/> <a href={metadata.moodleCourseUrl} /*...*/ > Moodle Course Page <ArrowTopRightOnSquareIcon className={externalIconStyle}/></a></li>}
            {metadata.moodleForumUrl && <li className={listItemStyle}><ChatBubbleLeftRightIcon className={moodleIconStyle}/> <a href={metadata.moodleForumUrl} /*...*/ > Course Forum <ArrowTopRightOnSquareIcon className={externalIconStyle}/></a></li>}
            {metadata.moodleAssignmentsUrl && <li className={listItemStyle}><MoodleDocIcon className={moodleIconStyle}/> <a href={metadata.moodleAssignmentsUrl} /*...*/ > Assignments <ArrowTopRightOnSquareIcon className={externalIconStyle}/></a></li>}
          </ul>
        </div>
      )}

      {/* YouTube Section */}
      {metadata.youtubePlaylistId && (
         <div className={sectionStyle}>
            <h2 className={sectionTitleStyle}>Video Lectures</h2>
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-md border border-gray-200 dark:border-gray-800 bg-gray-100 dark:bg-gray-900">
              <iframe key={slug + '-' + metadata.youtubePlaylistId} src={`https://www.youtube.com/embed/videoseries?list=${metadata.youtubePlaylistId}`} /*...*/ ></iframe>
            </div>
         </div>
      )}
    </div>
  );
}
