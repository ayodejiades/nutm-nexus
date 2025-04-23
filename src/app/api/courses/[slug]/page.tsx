"use client"; 

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CourseDetailSkeleton from '@/components/CourseDetailSkeleton';
import ErrorDisplay from '@/components/ErrorDisplay';
import EmptyState from '@/components/EmptyState';

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
}

interface CourseDetails {
  metadata: CourseMetadata;
  files: CourseFile[];
}

// Function to format bytes (keep this helper)
function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0 || !bytes) return '0 Bytes'; // Handle zero or undefined
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Fetch function remains largely the same, but called client-side
async function fetchCourseDetails(slug: string): Promise<CourseDetails | null> {
  const apiUrl = `/api/courses/${slug}`; // Relative path for client-side fetch
  try {
    // Optional: Add a small delay for testing loading state
    // await new Promise(resolve => setTimeout(resolve, 1500));

    const res = await fetch(apiUrl);
    if (!res.ok) {
      if (res.status === 404) return null; // Course not found, handled separately
      const errorBody = await res.text();
      console.error(`Failed fetch course details: ${res.status}`, errorBody);
      throw new Error(`Failed to fetch course details. Status: ${res.status}`);
    }
    return await res.json() as CourseDetails;
  } catch (error) {
    console.error(`Error fetching details for ${slug}:`, error);
    throw error; // Re-throw
  }
}


export default function CourseDetailPage({ params }: { params: { slug: string } }) {
  const { slug } = params;
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    setIsLoading(true);
    setIsNotFound(false);
    setError(null);

    fetchCourseDetails(slug)
      .then(data => {
        if (data === null) {
          setIsNotFound(true);
        } else {
          setCourseDetails(data);
        }
      })
      .catch(err => {
        setError(err.message || "An unknown error occurred");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [slug]); // Re-fetch if slug changes

  // Render Logic
  if (isLoading) {
    return <CourseDetailSkeleton />;
  }

  if (error) {
    return <ErrorDisplay message="Could Not Load Course Details" details={error} />;
  }

  if (isNotFound || !courseDetails) {
    return (
        <div>
            <Link href="/" className="text-primary hover:underline mb-4 inline-block transition duration-150">
                ← Back to Courses
            </Link>
            <ErrorDisplay message="Course Not Found" details={`The course with ID '${slug}' could not be found.`} />
        </div>
    );
  }

  // Data loaded successfully
  const { metadata, files } = courseDetails;

  return (
    <div>
      <Link href="/" className="text-primary hover:underline mb-6 inline-block transition duration-150">
        ← Back to Courses
      </Link>
      <h1 className="text-3xl font-bold text-primary-dark mb-2">{metadata.code} - {metadata.title}</h1>
      <p className="text-lg text-gray-700 mb-4">{metadata.description}</p>
      {metadata.instructor && <p className="text-gray-600 mb-6">Instructor: {metadata.instructor}</p>}

      {/* Tutorial Files Section - Improved styling */}
      <div className="mb-8 p-4 border rounded-lg bg-gray-50">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800 border-b pb-2">Tutorial Files</h2>
        {files.length > 0 ? (
          <ul className="space-y-3">
            {files.map((file) => (
              <li key={file.name} className="flex justify-between items-center group">
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline group-hover:text-primary-dark transition duration-150"
                >
                  {/* Optional: Add a file icon based on type */}
                  📄 {file.name}
                </a>
                <span className="text-gray-500 text-sm ml-2">{formatBytes(file.size)}</span>
              </li>
            ))}
          </ul>
        ) : (
            <EmptyState title="No Files Yet" message="There are currently no tutorial files uploaded for this course." />
        )}
      </div>

      {/* YouTube Playlist Section */}
      {metadata.youtubePlaylistId && (
         <div className="mb-8">
            <h2 className="text-2xl font-semibold mb-3 text-gray-800">Video Lectures</h2>
            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden shadow-lg"> {/* Added styling */}
              <iframe
                src={`https://www.youtube.com/embed/videoseries?list=${metadata.youtubePlaylistId}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin" // Modern referrer policy
                allowFullScreen
                className="w-full h-full"
                loading="lazy" // Lazy load the iframe
              ></iframe>
            </div>
         </div>
      )}
    </div>
  );
}