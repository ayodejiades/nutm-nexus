"use client"; 

import { useState, useEffect } from 'react';
import CourseCard from '@/components/CourseCard';
import CourseCardSkeleton from '@/components/CourseCardSkeleton';
import ErrorDisplay from '@/components/ErrorDisplay';
import EmptyState from '@/components/EmptyState';

interface Course {
  slug: string;
  title: string;
  code: string;
  description: string;
}

async function fetchCourses(): Promise<Course[]> {
  // Using relative path which works for client-side fetching to internal API route
  const apiUrl = '/api/courses';
  try {
    // Optional: Add a small delay for testing loading state
    // await new Promise(resolve => setTimeout(resolve, 1500));

    const res = await fetch(apiUrl);

    if (!res.ok) {
      const errorBody = await res.text();
      console.error(`Failed to fetch courses: ${res.status} ${res.statusText}`, errorBody);
      throw new Error(`Failed to fetch courses. Status: ${res.status}`);
    }
    const data = await res.json();
    return data as Course[];
  } catch (error) {
    console.error("Error in fetchCourses:", error);
    // Re-throw the error to be caught in the component
    throw error;
  }
}

export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch data when component mounts
    fetchCourses()
      .then(data => {
        setCourses(data);
        setError(null);
      })
      .catch(err => {
        setError(err.message || "An unknown error occurred while fetching courses.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []); // Empty dependency array ensures this runs only once on mount

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Render multiple skeletons */}
          {[...Array(6)].map((_, index) => (
            <CourseCardSkeleton key={index} />
          ))}
        </div>
      );
    }

    if (error) {
      return <ErrorDisplay message="Could Not Load Courses" details={error} />;
    }

    if (courses.length === 0) {
        return <EmptyState title="No Courses Found" message="There are currently no courses available to display." />;
    }

    // Data loaded successfully and is not empty
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <CourseCard
            key={course.slug}
            slug={course.slug}
            title={course.title}
            code={course.code}
            description={course.description}
          />
        ))}
      </div>
    );
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6 text-primary-dark">Available Courses</h1>
      {renderContent()}
    </div>
  );
}