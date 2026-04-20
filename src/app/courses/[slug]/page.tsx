// src/app/courses/[slug]/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react'; // Import React and useMemo
import Link from 'next/link';
import CourseDetailSkeleton from '@/components/CourseDetailSkeleton';
import ErrorDisplay from '@/components/ErrorDisplay';
import EmptyState from '@/components/EmptyState';
import { useParams } from 'next/navigation';
// Ensure Arrow icons are imported for sorting controls
import { ArrowDownIcon, ArrowUpIcon, ArrowTopRightOnSquareIcon, BookOpenIcon, ChatBubbleLeftRightIcon, DocumentTextIcon as MoodleDocIcon, UserIcon } from '@heroicons/react/24/outline';

// Import the icon helper function (adjust path if necessary)
import { getFileIcon } from '@/lib/utils';

// Minimalist, professional SVG patterns (matching CourseImage)
const PATTERNS = [
  // 0: Tech / Engineering
  (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full opacity-10">
      <circle cx="50" cy="50" r="30" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" />
      <circle cx="50" cy="50" r="15" stroke="white" strokeWidth="0.5" />
      <path d="M0 50H100M50 0V100" stroke="white" strokeWidth="0.2" />
    </svg>
  ),
  // 1: Business / Leadership
  (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full opacity-10">
      <path d="M10 90 L40 50 L60 70 L90 20" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M0 80Q50 80 100 20" stroke="white" strokeWidth="0.5" opacity="0.3" />
    </svg>
  ),
  // 2: Science / Research
  (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full opacity-10">
      <path d="M50 10L84.6 30V70L50 90L15.4 70V30L50 10Z" stroke="white" strokeWidth="0.5" />
      <circle cx="50" cy="50" r="2" fill="white" />
    </svg>
  ),
  // 3: Arts / Innovation
  (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full opacity-10">
      <path d="M0 50C20 30 40 70 60 50C80 30 100 70 120 50" stroke="white" strokeWidth="1" fill="none" />
      <path d="M0 60C20 40 40 80 60 60C80 40 100 80 120 60" stroke="white" strokeWidth="0.5" opacity="0.5" />
    </svg>
  )
];

// --- Interfaces ---
interface CourseFile {
  name: string;
  url?: string | null;
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
      } catch { /* ignore parsing error */ }
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

  // Track recently visited courses
  useEffect(() => {
    if (!slug) return;
    try {
      const key = "nexus_recent";
      const recent: string[] = JSON.parse(localStorage.getItem(key) || "[]");
      const updated = [slug, ...recent.filter((s) => s !== slug)].slice(0, 10);
      localStorage.setItem(key, JSON.stringify(updated));
    } catch {}
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

  // Use deterministic selection for background pattern
  const deterministicSum = metadata.code.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const Pattern = PATTERNS[deterministicSum % PATTERNS.length];

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      {/* --- Coursera-style Hero Header --- */}
      <section className="relative -mt-8 pt-24 pb-20 overflow-hidden">
        {/* Abstract Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F1721] to-background border-b border-white/5" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[130px] rounded-full" />

        {/* Pattern Overlay */}
        <div className="absolute right-0 top-0 w-1/2 h-full flex items-center justify-center transform scale-150 rotate-12 pointer-events-none">
          {Pattern}
        </div>

        <div className="section-container relative z-10">
          <Link
            href="/"
            className="inline-flex items-center text-xs font-black text-primary hover:text-primary-light uppercase tracking-widest mb-8 transition-colors"
          >
            ← Back to All Courses
          </Link>

          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-black rounded-lg border border-primary/20 tracking-widest uppercase">
                {metadata.code}
              </span>
              {metadata.level && (
                <span className="px-3 py-1 bg-white/5 text-foreground/40 text-xs font-bold rounded-lg border border-white/5 tracking-widest uppercase">
                  Level {metadata.level}
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-6xl font-black text-white leading-tightest mb-6 tracking-tight">
              {metadata.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20">
                  <UserIcon className="w-5 h-5 text-primary" />
                </div>
                <span className="font-black tracking-tight">By {metadata.instructor || "NUTM Faculty"}</span>
              </div>
              <div className="h-4 w-px bg-white/10 hidden sm:block" />
              <div className="flex items-center gap-3 text-foreground/50 font-black uppercase tracking-widest text-[10px]">
                <span className="px-2 py-0.5 bg-white/5 rounded-md border border-white/5">{metadata.credits || 3} Credits</span>
                <span className="px-2 py-0.5 bg-white/5 rounded-md border border-white/5">Semester {metadata.semester || "I"}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Main Content Grid --- */}
      <section className="section-container">
        <div className="flex flex-col lg:flex-row gap-12">
          {/* Main Content (Resources) */}
          <div className="lg:flex-grow space-y-12">
            {/* Description Section */}
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <BookOpenIcon className="w-4 h-4 text-primary" />
                Course Overview
              </h2>
              <p className="text-xl text-foreground/50 max-w-2xl font-medium leading-relaxed mb-8 italic">
                {courseDetails.metadata.description}
              </p>

              {/* Action Bar */}
              <div className="flex flex-wrap gap-4">
                {courseDetails.metadata.moodleCourseUrl && (
                  <a
                    href={courseDetails.metadata.moodleCourseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-black text-xs uppercase tracking-widest transition-all border border-white/5 flex items-center gap-2"
                  >
                    Enter Moodle Core
                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>


            {/* Resources Section */}
            <div className="coursera-card bg-surface-1/40 p-1">
              <div className="p-6 border-b border-white/5 flex flex-wrap justify-between items-center gap-4">
                <h2 className="text-lg font-black text-white tracking-tight">
                  Learning <span className="text-primary italic">Resources</span>
                </h2>

                {sortedFiles && sortedFiles.length > 1 && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleFileSort('name')}
                      className={`text-[10px] font-black px-3 py-1.5 rounded-lg border transition-all uppercase tracking-widest ${fileSortKey === 'name' ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-surface-2 border-white/5 text-foreground/40 hover:bg-surface-3'}`}
                    >
                      Name {fileSortKey === 'name' && (fileSortOrder === 'asc' ? '↑' : '↓')}
                    </button>
                    <button
                      onClick={() => handleFileSort('size')}
                      className={`text-[10px] font-black px-3 py-1.5 rounded-lg border transition-all uppercase tracking-widest ${fileSortKey === 'size' ? 'bg-primary/20 border-primary/40 text-primary' : 'bg-surface-2 border-white/5 text-foreground/40 hover:bg-surface-3'}`}
                    >
                      Size {fileSortKey === 'size' && (fileSortOrder === 'asc' ? '↑' : '↓')}
                    </button>
                  </div>
                )}
              </div>

              <div className="p-2">
                {sortedFiles && sortedFiles.length > 0 ? (
                  <div className="space-y-1">
                    {sortedFiles.map((file) => {
                      const fileName = file?.name || 'Unnamed File';
                      const IconComponent = getFileIcon(fileName);
                      return (
                        <a
                          key={`${fileName}-${file.url || ''}`}
                          href={file.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-all group ${!file.url ? 'opacity-50 pointer-events-none' : ''}`}
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center group-hover:bg-primary/10 group-hover:scale-110 transition-all">
                              <IconComponent className="w-5 h-5 text-foreground/40 group-hover:text-primary transition-colors" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-foreground/80 group-hover:text-white truncate" title={fileName}>
                                {fileName}
                              </p>
                              <span className="text-[10px] font-bold text-foreground/20 uppercase tracking-widest">
                                {fileName.split('.').pop()} Resource
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <span className="text-[10px] font-bold text-foreground/30">
                              {formatBytes(file.size)}
                            </span>
                            <ArrowTopRightOnSquareIcon className="w-4 h-4 text-foreground/20 group-hover:text-primary transition-colors" />
                          </div>
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState title="No Files" message="No resources available for this course yet." />
                )}
              </div>
            </div>

            {/* Video Lectures */}
            {metadata.youtubePlaylistId && (
              <div className="space-y-6">
                <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                  <span className="w-4 h-4 bg-red-500 rounded flex items-center justify-center">
                    <span className="border-l-4 border-l-white border-y-4 border-y-transparent ml-0.5" />
                  </span>
                  Full Lecture Playlist
                </h2>
                <div className="aspect-video rounded-3xl overflow-hidden border border-white/5 bg-surface-1 shadow-2xl">
                  <iframe
                    src={`https://www.youtube.com/embed/videoseries?list=${metadata.youtubePlaylistId}`}
                    title="YouTube video playlist player"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                    className="w-full h-full"
                    loading="lazy"
                  ></iframe>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar (Quick Actions & Metadata) */}
          <aside className="lg:w-80 space-y-8 flex-shrink-0">
            {/* Quick Actions (Enroll/Moodle) */}
            <div className="p-8 rounded-3xl bg-surface-1 border border-white/5 shadow-2xl space-y-6">
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Quick Links</h3>

              <div className="space-y-3">
                {metadata.moodleCourseUrl && (
                  <a
                    href={metadata.moodleCourseUrl}
                    target="_blank"
                    className="w-full h-14 bg-primary hover:bg-primary-light !text-white text-[11px] font-black rounded-xl flex items-center justify-center transition-all uppercase tracking-[0.15em] gap-3 shadow-xl shadow-primary/30 active:scale-95"
                  >
                    Moodle Page <ArrowTopRightOnSquareIcon className="w-4 h-4 !text-white" />
                  </a>
                )}
                {metadata.moodleForumUrl && (
                  <a
                    href={metadata.moodleForumUrl}
                    target="_blank"
                    className="w-full h-14 bg-surface-2 hover:bg-surface-3 text-foreground/80 text-xs font-black rounded-xl flex items-center justify-center transition-all uppercase tracking-widest border border-white/5"
                  >
                    Discussion Forum
                  </a>
                )}
                {metadata.moodleAssignmentsUrl && (
                  <a
                    href={metadata.moodleAssignmentsUrl}
                    target="_blank"
                    className="w-full h-14 bg-surface-2 hover:bg-surface-3 text-foreground/80 text-xs font-black rounded-xl flex items-center justify-center transition-all uppercase tracking-widest border border-white/5"
                  >
                    View Assignments
                  </a>
                )}
              </div>

              <div className="pt-6 border-t border-white/5">
                <p className="text-[11px] text-foreground/40 leading-relaxed font-medium">
                  Resources on this page are fetched in real-time. Contact Faculty for missing file requests.
                </p>
              </div>
            </div>

            {/* Detailed Metadata Folder */}
            <div className="space-y-6 px-4">
              <div>
                <h4 className="text-[10px] font-black text-primary uppercase tracking-widest mb-3">Academic Info</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-foreground/30 uppercase">Departments</p>
                    <p className="text-sm font-bold text-foreground/80">{metadata.departments?.join(', ') || 'General'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-foreground/30 uppercase">Level</p>
                    <p className="text-sm font-bold text-foreground/80">{metadata.level || 'Unknown'} Level</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-foreground/30 uppercase">Semester</p>
                    <p className="text-sm font-bold text-foreground/80">Semester {metadata.semester || 'I'}</p>
                  </div>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}