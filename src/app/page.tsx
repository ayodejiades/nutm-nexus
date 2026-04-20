"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import CourseCard from "@/components/CourseCard";
import CourseCardSkeleton from "@/components/CourseCardSkeleton";
import ErrorDisplay from "@/components/ErrorDisplay";
import QuickPeekModal from "@/components/QuickPeekModal";
import { MagnifyingGlassIcon, FunnelIcon, BoltIcon, SignalIcon, ClockIcon, XMarkIcon } from "@heroicons/react/24/outline";

// Types
interface Course {
  slug: string;
  title: string;
  code: string;
  description: string;
  instructor?: string;
  departments?: string[];
  level?: number;
  credits?: number;
  semester?: "I" | "II";
}

// Helpers
async function fetchCourses(): Promise<Course[]> {
  const res = await fetch("/api/courses", { cache: "no-store" });
  if (!res.ok) {
    const errorBody = await res.text().catch(() => `Status ${res.status}`);
    let details = `Status: ${res.status}`;
    try {
      const jsonError = JSON.parse(errorBody);
      details = jsonError.error || jsonError.details || jsonError.message || details;
    } catch {
      details = errorBody || details;
    }
    throw new Error(details);
  }
  return await res.json();
}

// --- Animated Counter Hook ---
function useAnimatedCounter(target: number, duration = 800) {
  const [count, setCount] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (target === prevTarget.current) return;
    prevTarget.current = target;
    const start = 0;
    const startTime = Date.now();

    const tick = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(start + (target - start) * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [target, duration]);

  return count;
}

// --- Search Highlight Component ---
function HighlightText({ text, query }: { text: string; query: string }) {
  if (!query || query.length < 2) return <>{text}</>;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-primary/20 text-primary rounded-sm px-0.5">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

// --- Recently Visited ---
function getRecentlyVisited(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("nexus_recent") || "[]");
  } catch {
    return [];
  }
}

// --- Filter Select ---
interface FilterOption {
  value: string;
  label: string;
}

interface FilterSelectProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: FilterOption[];
  allLabel?: string;
}

const FilterSelect = ({
  label,
  value,
  onChange,
  options,
  allLabel = "All",
}: FilterSelectProps) => (
  <div className="flex flex-col gap-1.5 min-w-[120px]">
    <label className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest ml-1">
      {label}
    </label>
    <select
      value={value}
      onChange={onChange}
      className="bg-[#1B222B] border border-white/5 text-sm rounded-lg px-3 py-2 text-foreground focus:outline-none focus:border-primary/50 transition-colors cursor-pointer"
    >
      <option value="">{allLabel}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default function HomePage() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedSemester, setSelectedSemester] = useState<"" | "I" | "II">("");
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCourses()
      .then(setCourses)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  // Load recently visited
  useEffect(() => {
    setRecentSlugs(getRecentlyVisited());
  }, []);

  // ⌘K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        searchInputRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filterOptions = useMemo(() => {
    const depts = Array.from(
      new Set(courses.flatMap((c) => c.departments || []))
    ).sort();
    const levels = Array.from(
      new Set(
        courses
          .map((c) => c.level)
          .filter((l): l is number => typeof l === "number")
      )
    ).sort((a, b) => a - b);
    return {
      departments: depts.map((d) => ({ value: d, label: d })),
      levels: levels.map((l) => ({ value: l.toString(), label: `${l} Level` })),
      semesters: [
        { value: "I", label: "Semester I" },
        { value: "II", label: "Semester II" },
      ],
    };
  }, [courses]);

  const filteredCourses = useMemo(() => {
    let result = courses;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.code.toLowerCase().includes(q) ||
          c.description.toLowerCase().includes(q)
      );
    }
    if (selectedDept)
      result = result.filter((c) => c.departments?.includes(selectedDept));
    if (selectedLevel)
      result = result.filter((c) => c.level?.toString() === selectedLevel);
    if (selectedSemester)
      result = result.filter((c) => c.semester === selectedSemester);
    return result.sort((a, b) => a.code.localeCompare(b.code));
  }, [courses, searchQuery, selectedDept, selectedLevel, selectedSemester]);

  // Recently visited courses (resolved from loaded courses)
  const recentCourses = useMemo(() => {
    if (!recentSlugs.length || !courses.length) return [];
    return recentSlugs
      .map((slug) => courses.find((c) => c.slug === slug))
      .filter((c): c is Course => !!c)
      .slice(0, 5);
  }, [recentSlugs, courses]);

  // Active filters for smart empty state
  const activeFilters = useMemo(() => {
    const filters: { label: string; clear: () => void }[] = [];
    if (searchQuery) filters.push({ label: `"${searchQuery}"`, clear: () => setSearchQuery("") });
    if (selectedDept) filters.push({ label: selectedDept, clear: () => setSelectedDept("") });
    if (selectedLevel) filters.push({ label: `Level ${selectedLevel}`, clear: () => setSelectedLevel("") });
    if (selectedSemester) filters.push({ label: `Semester ${selectedSemester}`, clear: () => setSelectedSemester("") });
    return filters;
  }, [searchQuery, selectedDept, selectedLevel, selectedSemester]);

  // Animated stats
  const courseCount = useAnimatedCounter(courses.length);
  const deptCount = useAnimatedCounter(new Set(courses.flatMap(c => c.departments || [])).size);
  const filteredCount = useAnimatedCounter(filteredCourses.length);

  // Greeting
  const firstName = session?.user?.name?.split(" ")[0];

  const clearAllFilters = useCallback(() => {
    setSearchQuery("");
    setSelectedDept("");
    setSelectedLevel("");
    setSelectedSemester("");
  }, []);

  return (
    <div className="space-y-16 py-8 min-h-screen">
      <QuickPeekModal course={previewCourse} onClose={() => setPreviewCourse(null)} />

      {/* --- Dynamic Hero Section --- */}
      <section className="relative pt-12 pb-24 overflow-hidden border-b border-white/5">
        {/* Animated Background Gradients */}
        <div className="absolute top-0 right-0 -mr-40 -mt-20 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full animate-float opacity-30" />
        <div className="absolute bottom-0 left-0 -ml-40 -mb-20 w-[500px] h-[500px] bg-accent/10 blur-[100px] rounded-full animate-float opacity-20" style={{ animationDelay: '-2s' }} />

        {/* Subtle Scanline Overlay */}
        <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_3s_infinite]" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto px-4">
          {/* Personalized Greeting */}
          {firstName ? (
            <>
              <p className="text-sm sm:text-base text-foreground/40 mb-2 animate-fade-in font-medium">
                Welcome back, <span className="text-primary font-bold">{firstName}</span>
              </p>
              <h1 className="text-5xl sm:text-6xl md:text-[7rem] font-black tracking-tightest leading-[0.85] mb-6 sm:mb-8 animate-fade-in drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                Nexus.
              </h1>
            </>
          ) : (
            <>
              <div className="mb-6 animate-fade-in">
                <Image
                  src="/nexus-icon.png"
                  alt="Nexus"
                  width={64}
                  height={64}
                  className="w-16 h-16 sm:w-20 sm:h-20 drop-shadow-[0_0_20px_rgba(34,197,94,0.3)]"
                  priority
                />
              </div>
              <h1 className="text-5xl sm:text-6xl md:text-[7rem] font-black tracking-tightest leading-[0.85] mb-6 sm:mb-8 animate-fade-in drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                Nexus.
              </h1>
            </>
          )}

          <p className="text-base sm:text-xl text-foreground/50 mb-8 sm:mb-12 max-w-2xl font-medium leading-relaxed animate-fade-in" style={{ animationDelay: '200ms' }}>
            The official resource hub of <span className="text-white font-bold">NUTM&apos;s Peer-2-Peer Tutorial</span>.
          </p>

          <div className="w-full max-w-2xl relative group/search animate-fade-in shadow-2xl shadow-black/50" style={{ animationDelay: '400ms' }}>
            <div className="absolute inset-0 bg-primary/10 blur-3xl opacity-10 group-focus-within/search:opacity-20 transition-opacity" />
            <MagnifyingGlassIcon className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 h-5 sm:h-6 w-5 sm:w-6 text-foreground/20 group-focus-within/search:text-primary transition-colors z-20" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by code, title, or keywords..."
              className="relative w-full bg-surface-1 border border-white/5 rounded-2xl py-4 sm:py-6 pl-12 sm:pl-16 pr-14 text-base sm:text-lg text-foreground placeholder-foreground/20 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all z-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {/* Clear button or ⌘K shortcut */}
            {searchQuery ? (
              <button
                onClick={() => { setSearchQuery(""); searchInputRef.current?.focus(); }}
                className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-foreground/50 hover:text-white transition-all"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            ) : (
              <div className="absolute right-6 top-1/2 -translate-y-1/2 z-20 hidden md:flex items-center gap-1.5 px-2 py-1 bg-white/5 rounded border border-white/10 text-[9px] font-black text-foreground/30">
                <span className="text-foreground/50">⌘</span>
                <span>K</span>
              </div>
            )}
          </div>

          {/* Animated Stats Bar */}
          <div className="mt-12 sm:mt-16 grid grid-cols-3 gap-4 sm:gap-6 w-full max-w-3xl animate-fade-in" style={{ animationDelay: '600ms' }}>
            {[
              { label: "Courses", value: courseCount },
              { label: "Departments", value: deptCount },
              { label: "Showing", value: filteredCount }
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center gap-1 border-r last:border-0 border-white/5 py-2">
                <span className="text-xl sm:text-2xl font-black text-white tabular-nums">{stat.value}</span>
                <span className="text-[9px] sm:text-[10px] font-black text-foreground/20 uppercase tracking-widest">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Recently Visited Section --- */}
      {recentCourses.length > 0 && !searchQuery && !selectedDept && !selectedLevel && !selectedSemester && (
        <section className="section-container animate-fade-in">
          <div className="flex items-center gap-2 mb-6">
            <ClockIcon className="w-4 h-4 text-foreground/30" />
            <h2 className="text-xs font-black text-foreground/30 uppercase tracking-[0.2em]">Recently Visited</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2">
            {recentCourses.map((course) => (
              <Link
                key={course.slug}
                href={`/courses/${course.slug}`}
                className="flex-shrink-0 group bg-surface-1/40 border border-white/5 hover:border-primary/20 rounded-xl px-5 py-4 transition-all min-w-[200px] max-w-[280px]"
              >
                <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest mb-1">{course.code}</p>
                <p className="text-sm font-bold text-white group-hover:text-primary transition-colors truncate">{course.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* --- Filter & Browse Section --- */}
      <section className="section-container">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 pt-8">
          {/* Sidebar-style Filters — horizontal scroll on mobile, vertical sidebar on desktop */}
          <aside className="lg:w-64 flex-shrink-0">
            <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-surface-1 border border-white/5 shadow-xl">
              <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-4 sm:mb-8 flex items-center gap-2">
                <FunnelIcon className="w-4 h-4 text-primary" />
                Refine Search
              </h2>

              <div className="flex lg:flex-col gap-4 sm:gap-8 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                <FilterSelect
                  label="Department"
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  options={filterOptions.departments}
                />
                <FilterSelect
                  label="Level"
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  options={filterOptions.levels}
                />
                <FilterSelect
                  label="Semester"
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value as "" | "I" | "II")}
                  options={filterOptions.semesters}
                />

                {activeFilters.length > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 text-[10px] font-black text-foreground/60 rounded-xl transition-all uppercase tracking-widest border border-white/5 shrink-0"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>

            <div className="hidden lg:block p-8 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/5 border border-white/5 relative overflow-hidden group mt-6">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-120 transition-transform duration-500">
                <SignalIcon className="w-20 h-20 text-white" />
              </div>
              <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                <BoltIcon className="w-3.5 h-3.5 text-primary" />
                Need Help?
              </h4>
              <p className="text-[11px] text-foreground/50 leading-relaxed mb-6">
                Can&apos;t find what you&apos;re looking for? Check the about page for more info.
              </p>
              <Link href="/about" className="inline-flex items-center gap-2 text-[10px] font-black text-primary hover:underline uppercase tracking-widest">
                Learn More
                <ArrowRightIcon className="w-3 h-3" />
              </Link>
            </div>
          </aside>

          {/* Course Grid Area */}
          <div className="flex-grow">
            <div className="flex justify-between items-end mb-10 pb-4 border-b border-white/5">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight mb-1">
                  Available <span className="text-primary">Courses</span>
                </h2>
              </div>
              <span className="text-[10px] font-black text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 uppercase tracking-widest">
                {filteredCourses.length} RESULTS
              </span>
            </div>

            <div className="min-h-[600px]">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <CourseCardSkeleton key={i} />
                  ))}
                </div>
              ) : error ? (
                <ErrorDisplay message="Connection Error" details={error} />
              ) : filteredCourses.length === 0 ? (
                /* --- Smart Empty State --- */
                <div className="p-12 text-center border border-white/5 bg-surface-1 rounded-3xl my-8 max-w-xl mx-auto shadow-2xl">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <MagnifyingGlassIcon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 tracking-tight">No Matches Found</h3>
                  <p className="text-foreground/40 text-sm font-medium mb-6">
                    No courses match your current filters. Try removing one:
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    {activeFilters.map((filter, i) => (
                      <button
                        key={i}
                        onClick={filter.clear}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 rounded-lg text-xs font-bold text-foreground/60 hover:text-red-400 transition-all"
                      >
                        {filter.label}
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    ))}
                    <button
                      onClick={clearAllFilters}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-lg text-xs font-bold text-primary transition-all"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCourses.map((course) => (
                    <CourseCard
                      key={course.slug}
                      {...course}
                      searchQuery={searchQuery}
                      onQuickPeek={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setPreviewCourse(course);
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

const ArrowRightIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
  </svg>
);
