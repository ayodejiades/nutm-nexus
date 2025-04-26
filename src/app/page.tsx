// src/app/page.tsx
"use client";

import React, { useState, useEffect, useMemo } from 'react'; // Ensure React is implicitly available
import Image from 'next/image'; // Import Image component for Hero
import CourseCard from '@/components/CourseCard';
import CourseCardSkeleton from '@/components/CourseCardSkeleton';
import ErrorDisplay from '@/components/ErrorDisplay';
import EmptyState from '@/components/EmptyState';
import { MagnifyingGlassIcon, ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline'; // Ensure all needed icons are imported

// Interface definition for a Course object
interface Course {
  slug: string;
  title: string;
  code: string;
  description: string;
  departments?: string[]; // Array for multiple departments
  level?: number;
  credits?: number;
  semester?: "I" | "II"; // Semester field
}

// --- Fetch Function ---
async function fetchCourses(): Promise<Course[]> {
  const apiUrl = '/api/courses'; // Internal API endpoint
  try {
    // Fetch courses - use 'no-store' for dev, consider 'revalidate' tag/time for prod
    const res = await fetch(apiUrl, { cache: 'no-store' });

    if (!res.ok) {
      // Attempt to get error details from response body
      const errorText = await res.text().catch(() => `Status ${res.status}`);
      let details = `Status: ${res.status}. ${errorText}`;
      try {
        // Try parsing JSON error from backend API route
        const jsonError = JSON.parse(errorText);
        details = jsonError.error || jsonError.message || details;
      } catch { /* Ignore if body wasn't JSON */ }
      console.error("Failed fetch courses. Details:", details);
      // Throw an error to be caught by the component
      throw new Error(`Failed to fetch courses. ${details}`);
    }

    const data = await res.json();

    // Basic validation of the received data structure
    if (!Array.isArray(data)) {
      console.error("API returned non-array data for courses:", data);
      throw new Error("Invalid data format received from server.");
    }

    console.log(`Fetched ${data?.length ?? 0} courses.`);
    return data as Course[]; // Cast to Course array type

  } catch (error: unknown) { // Catch any error during fetch or processing
    console.error("Error caught in fetchCourses function:", error);
    // Ensure a proper error object is thrown
    const message = (error instanceof Error) ? error.message : "An unknown error occurred during data fetching.";
    throw new Error(message);
  }
}


// --- FilterSelect Helper Component ---
interface FilterSelectProps {
  label: string;
  value: string | number; // Value bound to state
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; // State update handler
  options: Array<{ value: string | number; label: string }>; // Options for the dropdown
  allLabel?: string; // Text for the "All" option
  htmlForId?: string; // Explicit ID for label/select connection
}
// Renders a styled select dropdown for filtering
function FilterSelect({ label, value, onChange, options, allLabel = "All", htmlForId }: FilterSelectProps) {
  const id = htmlForId || label.toLowerCase().replace(/\s+/g, '-'); // Generate a unique ID
  return (
    <div>
      <label htmlFor={id} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
        {label}
      </label>
      <select
        id={id}
        value={value} // Controlled component
        onChange={onChange} // Handle selection changes
        className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-foreground dark:text-white py-1.5 pl-3 pr-8 text-sm focus:border-primary focus:ring-primary focus:outline-none transition duration-150 ease-in-out shadow-sm"
      >
        {/* Default "All" option */}
        <option value="">{allLabel}</option>
        {/* Map provided options */}
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );
}


// --- Main HomePage Component ---
export default function HomePage() {
  // Component State Hooks
  const [courses, setCourses] = useState<Course[]>([]); // Stores fetched courses
  const [isLoading, setIsLoading] = useState(true); // Loading state indicator
  const [error, setError] = useState<string | null>(null); // Stores fetch error messages
  const [searchQuery, setSearchQuery] = useState(''); // Search input value
  // Filter states
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedCredits, setSelectedCredits] = useState('');
  const [selectedSemester, setSelectedSemester] = useState<"" | "I" | "II">(""); // Explicit type for semester
  // Sort states
  const [sortKey, setSortKey] = useState('code'); // Field to sort by (default: 'code')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // Sort direction (default: 'asc')

  // --- Data Fetching Effect ---
  useEffect(() => {
    setIsLoading(true); // Set loading true when effect runs
    setError(null); // Clear previous errors
    console.log("HomePage: useEffect fetching courses...");
    fetchCourses()
      .then(data => {
        console.log("HomePage: fetch successful, setting courses.");
        setCourses(data || []); // Set fetched data, ensure it's an array
        setError(null); // Clear error on success
      })
      .catch((err: unknown) => { // Catch fetch errors
        console.error("HomePage: fetch failed.", err);
        // Set error message for display using type guard
        setError(err instanceof Error ? err.message : "An unknown error occurred while fetching courses.");
        setCourses([]); // Clear courses on error
      })
      .finally(() => {
        // Always set loading false after fetch attempt completes
        console.log("HomePage: fetch finished.");
        setIsLoading(false);
      });
  }, []); // Empty dependency array: runs only once when component mounts

  // --- Memoized Filter Options ---
  // Dynamically generate unique options for dropdowns based on fetched course data
  const filterOptions = useMemo(() => {
    const departments = new Set<string>();
    const levels = new Set<number>();
    const credits = new Set<number>();

    courses.forEach(course => {
      // Safely iterate through departments array
      course.departments?.forEach(dept => { if (dept) departments.add(dept); });
      // Check for defined & non-null values before adding to Set
      if (course.level !== undefined && course.level !== null) levels.add(course.level);
      if (course.credits !== undefined && course.credits !== null) credits.add(course.credits);
    });

    // Sort options alphabetically or numerically
    const sortedDepartments = Array.from(departments).sort();
    const sortedLevels = Array.from(levels).sort((a, b) => a - b);
    const sortedCredits = Array.from(credits).sort((a, b) => a - b);

    // Format options for the FilterSelect component
    return {
      departments: sortedDepartments.map(d => ({ value: d, label: d })),
      levels: sortedLevels.map(l => ({ value: l.toString(), label: `${l} Level` })),
      credits: sortedCredits.map(c => ({ value: c.toString(), label: `${c} Credit${c !== 1 ? 's' : ''}` })),
      semesters: [ // Fixed options for Semester dropdown
        { value: "I" as const, label: "Semester I" }, // Use 'as const' for literal types
        { value: "II" as const, label: "Semester II" },
      ]
    };
  }, [courses]); // Recalculate only when the raw courses data changes


  // --- Memoized Processed Courses ---
  // Apply search, filtering, and sorting logic. Memoized for performance.
  const processedCourses = useMemo(() => {
    console.log(`Processing courses: Search='${searchQuery}', Dept='${selectedDept}', Level='${selectedLevel}', Credits='${selectedCredits}', Semester='${selectedSemester}', Sort='${sortKey}-${sortOrder}'`);
    let filtered = courses; // Start with all courses

    // 1. Apply Search Query Filter (case-insensitive)
    if (searchQuery) {
      const lowerCaseQuery = searchQuery.toLowerCase();
      filtered = filtered.filter(course =>
        (course.title?.toLowerCase() ?? '').includes(lowerCaseQuery) ||
        (course.code?.toLowerCase() ?? '').includes(lowerCaseQuery) ||
        (course.description?.toLowerCase() ?? '').includes(lowerCaseQuery)
      );
    }

    // 2. Apply Dropdown Filters
    if (selectedDept) {
      // Check if the course's departments array includes the selected department
      filtered = filtered.filter(course => course.departments?.includes(selectedDept));
    }
    if (selectedLevel) {
      // Convert selected string value back to number for comparison
      filtered = filtered.filter(course => course.level === parseInt(selectedLevel, 10));
    }
    if (selectedCredits) {
      // Convert selected string value back to number
      filtered = filtered.filter(course => course.credits === parseInt(selectedCredits, 10));
    }
    if (selectedSemester) {
      // Direct string comparison for semester
      filtered = filtered.filter(course => course.semester === selectedSemester);
    }

    // 3. Apply Sorting
    filtered.sort((a, b) => {
      let valA: string | number | undefined;
      let valB: string | number | undefined;

      // Get the values to compare based on the current sortKey
      switch (sortKey) {
        case 'code': valA = a.code?.toLowerCase(); valB = b.code?.toLowerCase(); break;
        case 'title': valA = a.title?.toLowerCase(); valB = b.title?.toLowerCase(); break;
        case 'level': valA = a.level; valB = b.level; break;
        case 'credits': valA = a.credits; valB = b.credits; break;
        case 'semester': valA = a.semester; valB = b.semester; break; // Added semester sort
        default: return 0; // No sorting if key is unknown
      }

      // Handle cases where values might be undefined or null
      const definedA = valA !== undefined && valA !== null;
      const definedB = valB !== undefined && valB !== null;

      if (!definedA && !definedB) return 0; // Both undefined, consider equal
      if (!definedA) return sortOrder === 'asc' ? -1 : 1; // Undefined values come first in ascending
      if (!definedB) return sortOrder === 'asc' ? 1 : -1; // Undefined values come first in ascending

      // Compare defined values based on type
      let comparison = 0;
      if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB; // Numerical comparison
      } else if (typeof valA === 'string' && typeof valB === 'string') {
        comparison = valA.localeCompare(valB); // String comparison (handles I vs II correctly)
      }
      // Could add date comparison logic here if needed later

      // Apply the sort order (ascending or descending)
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    console.log(`Processed courses count: ${filtered.length}`);
    return filtered; // Return the final filtered and sorted array
  }, [courses, searchQuery, selectedDept, selectedLevel, selectedCredits, selectedSemester, sortKey, sortOrder]); // Include all state dependencies


  // --- Render Course List Function ---
  // Decides what to display in the main course list area (loading, error, empty state, or cards)
  const renderCourseList = () => {
    if (isLoading) {
      // Show skeleton loaders while data is being fetched
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {[...Array(6)].map((_, index) => <CourseCardSkeleton key={index} />)}
        </div>
      );
    }
    if (error) {
      // Show error message if fetching failed
      return <ErrorDisplay message="Could Not Load Courses" details={error} />;
    }
    // Check if the processed (filtered/sorted) list is empty
    if (processedCourses.length === 0) {
      const hasActiveFilters = !!(searchQuery || selectedDept || selectedLevel || selectedCredits || selectedSemester);
      // Show different messages based on whether filters are active
      return hasActiveFilters
        ? <EmptyState title="No Matching Courses Found" message="Try adjusting your search or filters." />
        : <EmptyState title="No Courses Available" message="Course materials haven't been added yet. Check back later!" />;
    }
    // Render the grid of course cards using the processed data
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {processedCourses.map((course) => (
          <CourseCard
            key={course.slug} // Use unique slug as key
            {...course} // Spread all course properties as props to the card
          />
        ))}
      </div>
    );
  };

  // --- Clear Filters Handler ---
  // Resets all filter and search states to their defaults
  const clearFilters = () => {
    console.log("Clearing filters and search.");
    setSearchQuery('');
    setSelectedDept('');
    setSelectedLevel('');
    setSelectedCredits('');
    setSelectedSemester(''); // Reset semester filter
    setSortKey('code'); // Reset sort key to default
    setSortOrder('asc'); // Reset sort order to default
  };


  // --- JSX Rendering ---
  return (
    <div className="space-y-12 md:space-y-16 pb-10">
      {/* --- Hero Section --- */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/80 via-primary to-primary-dark dark:from-primary/70 dark:via-primary/90 dark:to-primary pt-16 pb-20 px-6 sm:px-10 md:pt-24 md:pb-28 lg:py-24 text-hero-foreground">
        {/* Background decorative shapes */}
        <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-50 dark:opacity-70">
          <div className="absolute top-0 -left-10 w-64 h-64 bg-accent/20 dark:bg-accent/30 rounded-full filter blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-10 right-0 w-72 h-72 bg-accent-secondary/20 dark:bg-accent-secondary/30 rounded-full filter blur-3xl animate-pulse animation-delay-400"></div>
        </div>
        {/* Flex container for text and image */}
        <div className="relative z-10 container mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-16">
          {/* Text Content Area */}
          <div className="max-w-xl lg:max-w-2xl text-center lg:text-left">
            <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-4 leading-tight">
              Unlock Your <span className="text-hero-accent">NUTM</span><span style={{ color: '#008751' }}> Potential</span>.
            </h1>
            <p className="text-lg sm:text-xl opacity-90 dark:opacity-80 mb-8">
              Find lecture notes, tutorials, past questions, and video resources for your courses, all in one place.
            </p>
            {/* Hero Search Bar */}
            <div className="mt-6 max-w-md mx-auto lg:mx-0">
              <label htmlFor="hero-search" className="sr-only">Search courses</label>
              <div className="relative rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                </div>
                <input
                  type="search"
                  name="hero-search"
                  id="hero-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-3 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-800/50 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary dark:focus:ring-primary-light sm:text-sm sm:leading-6 transition-colors duration-300"
                  placeholder="Search course code or title..."
                />
              </div>
            </div>
          </div>
          {/* Image Area */}
          <div className="w-full max-w-sm lg:max-w-md xl:max-w-lg hidden lg:block flex-shrink-0">
            <Image
              src="/hero-illustration.png"
              alt="Illustration of students studying"
              width={300}
              height={300}
              className="w-full h-auto object-contain"
              priority
            />
          </div>
        </div>
      </section>

      {/* --- Filtering and Sorting Controls Section --- */}
      <section className="sticky top-16 z-30 bg-background/90 dark:bg-background/90 backdrop-blur-md py-4 -mt-4 mb-6 border-b border-gray-200 dark:border-gray-700/50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Grid layout for filter/sort controls */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 items-end">
            {/* Filter Dropdowns using helper component */}
            <FilterSelect htmlForId="dept-filter" label="Department" value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} options={filterOptions.departments} />
            <FilterSelect htmlForId="level-filter" label="Level" value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} options={filterOptions.levels} />
            <FilterSelect htmlForId="credits-filter" label="Credits" value={selectedCredits} onChange={(e) => setSelectedCredits(e.target.value)} options={filterOptions.credits} />
            <FilterSelect htmlForId="semester-filter" label="Semester" value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value as "" | "I" | "II")} options={filterOptions.semesters} />

            {/* Sort By Dropdown */}
            <div className="col-span-1"> {/* Adjusted span */}
              <label htmlFor="sort-by" className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Sort By</label>
              <select
                id="sort-by"
                value={sortKey}
                onChange={(e) => { setSortKey(e.target.value); setSortOrder('asc'); }} // Update key, reset order
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-foreground dark:text-white py-1.5 pl-3 pr-8 text-sm focus:border-primary focus:ring-primary focus:outline-none transition duration-150 ease-in-out shadow-sm"
              >
                {/* Define sort options */}
                {[{ key: 'code', label: 'Code' }, { key: 'title', label: 'Title' }, { key: 'level', label: 'Level' }, { key: 'credits', label: 'Credits' }, { key: 'semester', label: 'Semester' }].map(opt => (
                  <option key={opt.key} value={opt.key}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Sort Order Toggle Button */}
            <div className="col-span-1 flex items-end">
              <button
                type="button"
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                aria-label={`Toggle sort order ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                title={`Change to ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                className="w-full flex items-center justify-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
              >
                {/* Display appropriate icon based on sortOrder */}
                {sortOrder === 'asc' ? (<ArrowUpIcon className="w-4 h-4 mr-1" aria-hidden="true" />)
                  : (<ArrowDownIcon className="w-4 h-4 mr-1" aria-hidden="true" />)}
                <span>{sortOrder === 'asc' ? 'Asc' : 'Desc'}</span>
              </button>
            </div>

            {/* Clear Filters Button */}
            <div className="col-span-2 sm:col-span-1 lg:col-span-1 flex items-end"> {/* Adjusted span */}
              <button
                onClick={clearFilters} // Call clear handler
                // Disable if no filters are active
                disabled={!searchQuery && !selectedDept && !selectedLevel && !selectedCredits && !selectedSemester}
                className="w-full text-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Course List Rendering Section */}
      {/* Adjust scroll margin top if filter bar height changes */}
      <section id="courses" className="scroll-mt-40 pt-4">
        {/* Render the list, skeleton, error, or empty state */}
        {renderCourseList()}
      </section>
    </div>
  );
}
