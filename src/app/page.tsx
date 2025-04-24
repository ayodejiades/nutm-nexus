// src/app/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import CourseCard from '@/components/CourseCard';
import CourseCardSkeleton from '@/components/CourseCardSkeleton';
import ErrorDisplay from '@/components/ErrorDisplay';
import EmptyState from '@/components/EmptyState';
// FIX: Removed unused AdjustmentsHorizontalIcon from import
import { MagnifyingGlassIcon, ArrowDownIcon, ArrowUpIcon } from '@heroicons/react/24/outline';

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
        const res = await fetch(apiUrl, { cache: 'no-store' }); // Dev: no-store, Prod: consider revalidate
        if (!res.ok) {
             const errorText = await res.text().catch(() => `Status ${res.status}`);
             let details = `Status: ${res.status}. ${errorText}`;
             try {
                 // FIX: Prefix unused var _ignoredError
                 const jsonError = JSON.parse(errorText);
                 details = jsonError.error || jsonError.message || details;
             } catch (_ignoredError) { /* Ignore parsing error */ }
             console.error("Failed fetch courses. Details:", details);
             throw new Error(`Failed to fetch courses. ${details}`);
        }
        const data = await res.json();
        console.log(`Fetched ${data?.length ?? 0} courses.`);
        return data as Course[];
    } catch (error: unknown) { // FIX: Use unknown type
        console.error("Error caught in fetchCourses function:", error);
        // FIX: Use type guard for message
        const message = (error instanceof Error) ? error.message : "An unknown error occurred during data fetching.";
        throw new Error(message); // Re-throw as Error object
    }
}


// --- FilterSelect Component ---
interface FilterSelectProps { label: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: Array<{ value: string | number; label: string }>; allLabel?: string; htmlForId?: string; }
function FilterSelect({ label, value, onChange, options, allLabel = "All", htmlForId }: FilterSelectProps) {
    const id = htmlForId || label.toLowerCase().replace(/\s+/g, '-');
    return (
        <div>
            <label htmlFor={id} className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</label>
            <select id={id} value={value} onChange={onChange} className="block w-full rounded-md border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-foreground dark:text-white py-1.5 pl-3 pr-8 text-sm focus:border-primary focus:ring-primary focus:outline-none transition duration-150 ease-in-out shadow-sm">
                <option value="">{allLabel}</option>
                {options.map(opt => (<option key={opt.value} value={opt.value}>{opt.label}</option>))}
            </select>
        </div>
    );
}

// --- Main HomePage Component ---
export default function HomePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('');
  const [selectedCredits, setSelectedCredits] = useState('');
  const [sortKey, setSortKey] = useState('code');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // --- useEffect for Fetching ---
  useEffect(() => {
    setIsLoading(true); setError(null);
    fetchCourses()
      .then(data => { setCourses(data || []); })
      .catch((err: unknown) => { // FIX: Use unknown
        // FIX: Use type guard and prefix unused var 'e' if only using message
        setError(err instanceof Error ? err.message : "Unknown fetch error");
        setCourses([]);
      })
      .finally(() => { setIsLoading(false); });
  }, []);

  // --- useMemo for Filter Options ---
  const filterOptions = useMemo(() => {
    const departments = new Set<string>();
    const levels = new Set<number>();
    const credits = new Set<number>();
    courses.forEach(course => {
      if (course.department) departments.add(course.department);
      if (course.level !== undefined) levels.add(course.level);
      if (course.credits !== undefined) credits.add(course.credits);
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

  // --- useMemo for Processing Courses ---
  const processedCourses = useMemo(() => {
    let filtered = courses;
    // Apply search
    if (searchQuery) {
        const lowerCaseQuery = searchQuery.toLowerCase();
        filtered = filtered.filter(course =>
            (course.title?.toLowerCase() ?? '').includes(lowerCaseQuery) ||
            (course.code?.toLowerCase() ?? '').includes(lowerCaseQuery) ||
            (course.description?.toLowerCase() ?? '').includes(lowerCaseQuery)
        );
    }
    // Apply filters
    if (selectedDept) { filtered = filtered.filter(course => course.department === selectedDept); }
    if (selectedLevel) { filtered = filtered.filter(course => course.level === parseInt(selectedLevel, 10)); }
    if (selectedCredits) { filtered = filtered.filter(course => course.credits === parseInt(selectedCredits, 10)); }
    // Apply sorting
    filtered.sort((a, b) => {
        let valA: string | number | undefined; let valB: string | number | undefined;
        switch (sortKey) {
            case 'code': valA = a.code?.toLowerCase(); valB = b.code?.toLowerCase(); break;
            case 'title': valA = a.title?.toLowerCase(); valB = b.title?.toLowerCase(); break;
            case 'level': valA = a.level; valB = b.level; break;
            case 'credits': valA = a.credits; valB = b.credits; break;
            default: return 0;
        }
        const definedA = valA !== undefined && valA !== null; const definedB = valB !== undefined && valB !== null;
        if (!definedA && !definedB) return 0; if (!definedA) return sortOrder === 'asc' ? -1 : 1; if (!definedB) return sortOrder === 'asc' ? 1 : -1;
        let comparison = 0;
        if (typeof valA === 'number' && typeof valB === 'number') { comparison = valA - valB; }
        else if (typeof valA === 'string' && typeof valB === 'string'){ comparison = valA.localeCompare(valB); }
        return sortOrder === 'asc' ? comparison : -comparison;
    });
    return filtered;
   }, [courses, searchQuery, selectedDept, selectedLevel, selectedCredits, sortKey, sortOrder]);

  // --- Render Course List Function ---
  const renderCourseList = () => {
    if (isLoading) { return ( <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"> {[...Array(6)].map((_, index) => <CourseCardSkeleton key={index} />)} </div> ); }
    if (error) { return <ErrorDisplay message="Could Not Load Courses" details={error} />; }
    if (processedCourses.length === 0) { return (searchQuery || selectedDept || selectedLevel || selectedCredits) ? <EmptyState title="No Matching Courses Found" message="Try adjusting your search or filters." /> : <EmptyState title="No Courses Available" message="Course materials haven't been added yet." />; }
    return ( <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"> {processedCourses.map((course) => ( <CourseCard key={course.slug} {...course} /> ))} </div> );
  };

  // --- Sort Handler ---
  const handleSort = (key: string) => { if (key === sortKey) { setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc'); } else { setSortKey(key); setSortOrder('asc'); } };

  // --- Clear Filters Handler ---
  const clearFilters = () => { setSearchQuery(''); setSelectedDept(''); setSelectedLevel(''); setSelectedCredits(''); setSortKey('code'); setSortOrder('asc'); };


  return (
    <div className="space-y-12 md:space-y-16 pb-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/80 via-primary to-primary-dark dark:from-primary/70 dark:via-primary/90 dark:to-primary pt-16 pb-20 px-6 sm:px-10 md:pt-24 md:pb-28 lg:pt-32 lg:pb-36 text-hero-foreground">
         <div aria-hidden="true" className="absolute inset-0 -z-10 opacity-50 dark:opacity-70"> <div className="absolute top-0 -left-10 w-64 h-64 bg-accent/20 dark:bg-accent/30 rounded-full filter blur-3xl animate-pulse"></div> <div className="absolute -bottom-10 right-0 w-72 h-72 bg-accent-secondary/20 dark:bg-accent-secondary/30 rounded-full filter blur-3xl animate-pulse animation-delay-400"></div> </div>
         <div className="relative z-10 max-w-3xl">
             <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-4 leading-tight"> Unlock Your <span className="text-hero-accent">NUTM</span> Potential. </h1>
             <p className="text-lg sm:text-xl opacity-90 dark:opacity-80 mb-8 max-w-xl"> Find lecture notes, tutorials, past questions, and video resources for your courses, all in one place. </p>
             <div className="mt-6 max-w-md">
                 <label htmlFor="hero-search" className="sr-only">Search courses</label>
                 <div className="relative rounded-lg shadow-sm">
                     <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" /></div>
                     <input type="search" name="hero-search" id="hero-search" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="block w-full rounded-lg border-0 py-2.5 pl-10 pr-3 text-gray-900 dark:text-gray-200 bg-white dark:bg-gray-800/50 ring-1 ring-inset ring-gray-300 dark:ring-gray-700 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-primary dark:focus:ring-primary-light sm:text-sm sm:leading-6 transition-colors duration-300" placeholder="Search course code or title..." />
                 </div>
             </div>
         </div>
      </section>

      {/* Filtering/Sorting Controls Section */}
      <section className="sticky top-16 z-30 bg-background/90 dark:bg-background/90 backdrop-blur-md py-4 -mt-4 mb-6 border-b border-gray-200 dark:border-gray-700/50">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 items-end">
                    <FilterSelect htmlForId="dept-filter" label="Department" value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} options={filterOptions.departments} />
                    <FilterSelect htmlForId="level-filter" label="Level" value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} options={filterOptions.levels} />
                    <FilterSelect htmlForId="credits-filter" label="Credits" value={selectedCredits} onChange={(e) => setSelectedCredits(e.target.value)} options={filterOptions.credits} />
                     <div className="col-span-2 md:col-span-1 lg:col-span-2">
                        <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Sort By</label>
                        <div className="flex flex-wrap gap-1 rounded-md border border-gray-300 dark:border-gray-600 p-0.5 bg-gray-100 dark:bg-gray-700/50 shadow-sm">
                             {[ {key: 'code', label: 'Code'}, {key: 'title', label: 'Title'}, {key: 'level', label: 'Level'}, {key: 'credits', label: 'Credits'} ].map(({key, label}) => (
                                <button key={key} onClick={() => handleSort(key)} aria-label={`Sort by ${label} ${sortKey === key ? (sortOrder === 'asc' ? '(Ascending)' : '(Descending)') : ''}`}
                                    className={`flex-grow px-2 py-1 rounded text-xs font-medium transition-colors duration-150 flex items-center justify-center space-x-1 whitespace-nowrap ${ sortKey === key ? 'bg-white dark:bg-gray-800 text-primary dark:text-primary-light shadow' : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600' }`} >
                                     <span>{label}</span>
                                     {sortKey === key && (sortOrder === 'asc' ? <ArrowUpIcon className="w-3 h-3 flex-shrink-0"/> : <ArrowDownIcon className="w-3 h-3 flex-shrink-0"/>)}
                                </button>
                             ))}
                        </div>
                     </div>
                    <div className="col-span-2 md:col-span-4 lg:col-span-1 flex items-end">
                         <button onClick={clearFilters} disabled={!searchQuery && !selectedDept && !selectedLevel && !selectedCredits} className="w-full text-center px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed" > Clear All </button>
                    </div>
                </div>
          </div>
      </section>

      {/* Course List Rendering Section */}
      <section id="courses" className="scroll-mt-40 pt-4">
        {renderCourseList()}
      </section>
    </div>
  );
}