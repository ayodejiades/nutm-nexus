// src/app/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import CourseCard from '@/components/CourseCard';
import CourseCardSkeleton from '@/components/CourseCardSkeleton';
import ErrorDisplay from '@/components/ErrorDisplay';
import EmptyState from '@/components/EmptyState';
import { MagnifyingGlassIcon, AdjustmentsHorizontalIcon, ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';

// Interface including filterable fields
interface Course {
  slug: string;
  title: string;
  code: string;
  description: string;
  department?: string;
  level?: number;
  credits?: number;
}

// --- Fetch Function ---
async function fetchCourses(): Promise<Course[]> {
    const apiUrl = '/api/courses';
    try {
        // Use no-store during dev to always get fresh data, configure revalidation for prod
        const res = await fetch(apiUrl, { cache: 'no-store' });
        if (!res.ok) {
             const errorText = await res.text().catch(() => `Status ${res.status}`);
             let details = `Status: ${res.status}. ${errorText}`;
             try {
                 // Try to parse backend error message if JSON
                 const jsonError = JSON.parse(errorText);
                 details = jsonError.error || jsonError.message || details;
             } catch (e) { /* ignore parsing error */ }
             console.error("Failed fetch courses. Details:", details);
             throw new Error(`Failed to fetch courses. ${details}`);
        }
        const data = await res.json();
        console.log(`Fetched ${data?.length ?? 0} courses.`);
        return data as Course[];
    } catch (error: any) {
        console.error("Error caught in fetchCourses function:", error);
        // Ensure a proper error object is thrown
        throw error instanceof Error ? error : new Error(String(error));
    }
}


// --- Helper component for Select Dropdowns ---
interface FilterSelectProps {
    label: string;
    value: string | number; // Value can be string or number
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    options: Array<{ value: string | number; label: string }>;
    allLabel?: string;
    htmlForId?: string; // Explicit ID prop
}
function FilterSelect({ label, value, onChange, options, allLabel = "All", htmlForId }: FilterSelectProps) {
    const id = htmlForId || label.toLowerCase().replace(/\s+/g, '-'); // Generate ID if not provided
    return (
        <div>
            <label htmlFor={id} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                {label}
            </label>
            <select
                id={id}
                value={value}
                onChange={onChange}
                className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-foreground dark:text-white py-1.5 pl-3 pr-8 text-sm focus:border-primary focus:ring-primary focus:outline-none transition duration-150 ease-in-out shadow-sm"
            >
                <option value="">{allLabel}</option>
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
}


// --- Main Homepage Component ---
export default function HomePage() {
  // State variables
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedCredits, setSelectedCredits] = useState('');
  const [sortKey, setSortKey] = useState('code'); // Default sort
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // Default order

  // Fetch courses on mount
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    console.log("HomePage: useEffect fetching courses...");
    fetchCourses()
      .then(data => {
          console.log("HomePage: fetch successful, setting courses.");
          setCourses(data || []); // Ensure courses is always an array
          setError(null);
      })
      .catch(err => {
          console.error("HomePage: fetch failed.", err);
          setError(err.message || "An unknown error occurred while fetching courses.");
          setCourses([]); // Set empty on error
      })
      .finally(() => {
          console.log("HomePage: fetch finished.");
          setIsLoading(false);
      });
  }, []); // Empty dependency array means run once on mount

  // Generate filter options dynamically based on fetched courses
  const filterOptions = useMemo(() => {
    const departments = new Set<string>();
    const levels = new Set<number>();
    const credits = new Set<number>();
    courses.forEach(course => {
      if (course.department) departments.add(course.department);
      if (course.level !== undefined) levels.add(course.level); // Check for undefined
      if (course.credits !== undefined) credits.add(course.credits); // Check for undefined
    });
    const sortedDepartments = Array.from(departments).sort();
    const sortedLevels = Array.from(levels).sort((a, b) => a - b);
    const sortedCredits = Array.from(credits).sort((a, b) => a - b);
    return {
      departments: sortedDepartments.map(d => ({ value: d, label: d })),
      levels: sortedLevels.map(l => ({ value: l.toString(), label: `${l} Level` })),
      credits: sortedCredits.map(c => ({ value: c.toString(), label: `${c} Credit${c !== 1 ? 's' : ''}` })),
    };
  }, [courses]);


  // Apply filtering and sorting to the courses list
  const processedCourses = useMemo(() => {
    console.log(`Processing courses: Search='${searchQuery}', Dept='${selectedDept}', Level='${selectedLevel}', Credits='${selectedCredits}', Sort='${sortKey}-${sortOrder}'`);
    let filtered = courses;

    // 1. Apply search query
    if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(course =>
            (course.title?.toLowerCase() ?? '').includes(lowerCaseQuery) ||
            (course.code?.toLowerCase() ?? '').includes(lowerCaseQuery) ||
            (course.description?.toLowerCase() ?? '').includes(lowerCaseQuery)
        );
    }

    // 2. Apply dropdown filters
    if (selectedDept) {
        filtered = filtered.filter(course => course.department === selectedDept);
    }
    if (selectedLevel) {
        filtered = filtered.filter(course => course.level === parseInt(selectedLevel, 10));
    }
     if (selectedCredits) {
        filtered = filtered.filter(course => course.credits === parseInt(selectedCredits, 10));
    }

    // 3. Apply sorting
    filtered.sort((a, b) => {
        let valA: string | number | undefined;
        let valB: string | number | undefined;

        switch (sortKey) {
            case 'code': valA = a.code?.toLowerCase(); valB = b.code?.toLowerCase(); break;
            case 'title': valA = a.title?.toLowerCase(); valB = b.title?.toLowerCase(); break;
            case 'level': valA = a.level; valB = b.level; break;
            case 'credits': valA = a.credits; valB = b.credits; break;
            default: return 0; // No sorting if key is unknown
        }

        // Handle undefined values for sorting (treat as lowest)
        const definedA = valA !== undefined && valA !== null;
        const definedB = valB !== undefined && valB !== null;

        if (!definedA && !definedB) return 0;
        if (!definedA) return sortOrder === 'asc' ? -1 : 1; // Undefined comes first in asc
        if (!definedB) return sortOrder === 'asc' ? 1 : -1; // Undefined comes first in asc

        let comparison = 0;
        if (typeof valA === 'number' && typeof valB === 'number') {
             comparison = valA - valB;
        } else if (typeof valA === 'string' && typeof valB === 'string'){
             comparison = valA.localeCompare(valB);
        }
         // Add more type comparisons if needed

        return sortOrder === 'asc' ? comparison : -comparison;
    });

    console.log(`Processed courses count: ${filtered.length}`);
    return filtered;
  }, [courses, searchQuery, selectedDept, selectedLevel, selectedCredits, sortKey, sortOrder]);


  // Render the actual list of course cards or status messages
  const renderCourseList = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {[...Array(6)].map((_, index) => <CourseCardSkeleton key={index} />)}
        </div>
      );
    }
    if (error) {
      return <ErrorDisplay message="Could Not Load Courses" details={error} />;
    }
    // Check processed list for empty state
    if (processedCourses.length === 0) {
        return (searchQuery || selectedDept || selectedLevel || selectedCredits)
        ? <EmptyState title="No Matching Courses Found" message="Try adjusting your search or filters." />
        : <EmptyState title="No Courses Available" message="Looks like course materials haven't been added yet. Check back later!" />;
    }
    // Render the filtered and sorted course cards
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {processedCourses.map((course) => (
                <CourseCard
                    key={course.slug}
                    {...course} // Spread all course props
                />
            ))}
        </div>
    );
  };


  // Function to handle clicking on sort buttons
  const handleSort = (key: string) => {
      if (key === sortKey) {
          setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
      } else {
          setSortKey(key);
          setSortOrder('asc'); // Default to ascending on new key
      }
  };

  // Function to clear all filters and search
  const clearFilters = () => {
      console.log("Clearing filters and search.");
      setSearchQuery('');
      setSelectedDept('');
      setSelectedLevel('');
      setSelectedCredits('');
      setSortKey('code'); // Reset to default sort
      setSortOrder('asc');
  };


  return (
    <div className="space-y-12 md:space-y-16 pb-10">
      {/* --- Hero Section --- */}
       <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/80 via-primary to-primary-dark dark:from-primary/70 dark:via-primary/90 dark:to-primary pt-16 pb-20 px-6 sm:px-10 md:pt-24 md:pb-28 lg:pt-32 lg:pb-36 text-hero-foreground">
         {/* Background shapes */}
         <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-50 dark:opacity-70">
              <div className="absolute top-0 -left-10 w-64 h-64 bg-accent/20 dark:bg-accent/30 rounded-full filter blur-3xl animate-pulse"></div>
              <div className="absolute -bottom-10 right-0 w-72 h-72 bg-accent-secondary/20 dark:bg-accent-secondary/30 rounded-full filter blur-3xl animate-pulse animation-delay-400"></div>
         </div>
         <div className="relative z-10 max-w-3xl">
             <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-4 leading-tight">
                 Unlock Your <span className="text-hero-accent">NUTM</span> Potential.
             </h1>
             <p className="text-lg sm:text-xl opacity-90 dark:opacity-80 mb-8 max-w-xl">
                 Find lecture notes, tutorials, past questions, and video resources for your courses, all in one place.
             </p>
             {/* Search Bar */}
             <div className="mt-6 max-w-md">
                 <label htmlFor="hero-search" className="sr-only">Search courses</label>
                 <div className="relative rounded-lg shadow-sm">
                     <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                         <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
                     </div>
                     <input type="search" name="hero-search" id="hero-search"
                         value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                         className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-3 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-800/50 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary dark:focus:ring-primary-light sm:text-sm sm:leading-6 transition-colors duration-300"
                         placeholder="Search course code or title..."
                     />
                 </div>
             </div>
         </div>
      </section>

      {/* --- Filtering and Sorting Controls Section --- */}
      <section className="sticky top-16 z-30 bg-background/90 dark:bg-background/90 backdrop-blur-md py-4 -mt-4 mb-6 border-b border-gray-200 dark:border-gray-700/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 items-end">
                    {/* Filter Dropdowns */}
                    <FilterSelect htmlForId="dept-filter" label="Department" value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} options={filterOptions.departments} />
                    <FilterSelect htmlForId="level-filter" label="Level" value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} options={filterOptions.levels} />
                    <FilterSelect htmlForId="credits-filter" label="Credits" value={selectedCredits} onChange={(e) => setSelectedCredits(e.target.value)} options={filterOptions.credits} />

                    {/* Sort Controls (Adjust grid span) */}
                     <div className="col-span-2 md:col-span-1 lg:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Sort By</label>
                        <div className="flex flex-wrap gap-1 rounded-md border border-gray-300 dark:border-gray-600 p-0.5 bg-gray-100 dark:bg-gray-700/50 shadow-sm">
                             {/* Define sortable keys and labels */}
                             {[
                                {key: 'code', label: 'Code'},
                                {key: 'title', label: 'Title'},
                                {key: 'level', label: 'Level'},
                                {key: 'credits', label: 'Credits'}
                             ].map(({key, label}) => (
                                <button
                                    key={key}
                                    onClick={() => handleSort(key)}
                                    aria-label={`Sort by ${label} ${sortKey === key ? (sortOrder === 'asc' ? '(Ascending)' : '(Descending)') : ''}`}
                                    className={`flex-grow px-2 py-1 rounded text-xs font-medium transition-colors duration-150 flex items-center justify-center space-x-1 whitespace-nowrap ${
                                        sortKey === key
                                        ? 'bg-white dark:bg-gray-800 text-primary dark:text-primary-light shadow'
                                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    }`}
                                >
                                     <span>{label}</span>
                                     {/* Show icon only on active sort key */}
                                     {sortKey === key && (sortOrder === 'asc' ? <ArrowUpIcon className="w-3 h-3 flex-shrink-0"/> : <ArrowDownIcon className="w-3 h-3 flex-shrink-0"/>)}
                                </button>
                             ))}
                        </div>
                     </div>

                    {/* Clear Filters Button (Adjust grid span) */}
                    <div className="col-span-2 md:col-span-4 lg:col-span-1 flex items-end">
                         <button
                            onClick={clearFilters}
                            disabled={!searchQuery && !selectedDept && !selectedLevel && !selectedCredits} // Disable if nothing to clear
                            className="w-full text-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                         >
                            Clear All
                        </button>
                    </div>
                </div>
          </div>
      </section>


      {/* --- Course List Rendering Section --- */}
      <section id="courses" className="scroll-mt-40 pt-4"> {/* Added scroll margin top and padding */}
        {renderCourseList()}
      </section>
    </div>
  );
}