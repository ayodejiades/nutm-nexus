"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import logo from "@/assets/images/nexus-icon.png";
import { useSession } from "next-auth/react";
import CourseCard from "@/components/CourseCard";
import ErrorDisplay from "@/components/ErrorDisplay";
import QuickPeekModal from "@/components/QuickPeekModal";
import { MagnifyingGlassIcon, FunnelIcon, BoltIcon, SignalIcon, ClockIcon, XMarkIcon } from "@heroicons/react/24/outline";
import type { CourseSummary } from "@/lib/courses";

type Course = CourseSummary;

function getRecentlyVisited(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("nexus_recent") || "[]");
  } catch {
    return [];
  }
}

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

const FilterSelect = ({ label, value, onChange, options, allLabel = "All" }: FilterSelectProps) => (
  <div className="flex flex-col gap-1.5 min-w-[120px]">
    <label className="text-[11px] font-semibold text-foreground/60 uppercase tracking-wider ml-1">{label}</label>
    <select
      value={value}
      onChange={onChange}
      className="bg-surface-2 border border-white/5 text-sm rounded-lg px-3 py-2 text-foreground focus:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 transition-colors cursor-pointer"
    >
      <option value="">{allLabel}</option>
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>{opt.label}</option>
      ))}
    </select>
  </div>
);

export default function HomeClient({ courses, loadError }: { courses: Course[]; loadError?: string }) {
  const { data: session } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedSemester, setSelectedSemester] = useState<"" | "I" | "II">("");
  const [previewCourse, setPreviewCourse] = useState<Course | null>(null);
  const [recentSlugs, setRecentSlugs] = useState<string[]>([]);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setRecentSlugs(getRecentlyVisited());
  }, []);

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
    const depts = Array.from(new Set(courses.flatMap((c) => c.departments || []))).sort();
    const levels = Array.from(
      new Set(courses.map((c) => c.level).filter((l): l is number => typeof l === "number"))
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
    if (selectedDept) result = result.filter((c) => c.departments?.includes(selectedDept));
    if (selectedLevel) result = result.filter((c) => c.level?.toString() === selectedLevel);
    if (selectedSemester) result = result.filter((c) => c.semester === selectedSemester);
    return [...result].sort((a, b) => a.code.localeCompare(b.code));
  }, [courses, searchQuery, selectedDept, selectedLevel, selectedSemester]);

  const recentCourses = useMemo(() => {
    if (!recentSlugs.length || !courses.length) return [];
    return recentSlugs
      .map((slug) => courses.find((c) => c.slug === slug))
      .filter((c): c is Course => !!c)
      .slice(0, 5);
  }, [recentSlugs, courses]);

  const activeFilters = useMemo(() => {
    const filters: { label: string; clear: () => void }[] = [];
    if (searchQuery) filters.push({ label: `"${searchQuery}"`, clear: () => setSearchQuery("") });
    if (selectedDept) filters.push({ label: selectedDept, clear: () => setSelectedDept("") });
    if (selectedLevel) filters.push({ label: `Level ${selectedLevel}`, clear: () => setSelectedLevel("") });
    if (selectedSemester) filters.push({ label: `Semester ${selectedSemester}`, clear: () => setSelectedSemester("") });
    return filters;
  }, [searchQuery, selectedDept, selectedLevel, selectedSemester]);

  const courseCount = courses.length;
  const deptCount = new Set(courses.flatMap((c) => c.departments || [])).size;
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

      {/* --- Hero --- */}
      <section className="relative pt-12 pb-20 border-b border-white/5">
        <div className="relative z-10 flex flex-col items-center text-center max-w-3xl mx-auto px-4">
          {firstName ? (
            <p className="text-sm sm:text-base text-foreground/60 mb-4 animate-fade-in font-medium">
              Welcome back, <span className="text-primary font-semibold">{firstName}</span>
            </p>
          ) : (
            <div className="mb-6 animate-fade-in">
              <Image src={logo} alt="" className="w-14 h-14 sm:w-16 sm:h-16" priority />
            </div>
          )}

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.05] mb-5 animate-fade-in">
            Every NUTM course,<br className="hidden sm:block" /> in one place.
          </h1>

          <p className="text-base sm:text-lg text-foreground/60 mb-10 max-w-xl font-medium leading-relaxed animate-fade-in" style={{ animationDelay: "150ms" }}>
            Notes, past papers, and quizzes from <span className="text-white font-semibold">NUTM&apos;s Peer-2-Peer Tutorial</span> — organised by department, level and cohort.
          </p>

          <div className="w-full max-w-2xl relative group/search animate-fade-in" style={{ animationDelay: "300ms" }}>
            <MagnifyingGlassIcon className="absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 h-5 sm:h-6 w-5 sm:w-6 text-foreground/70 group-focus-within/search:text-primary transition-colors z-20" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search by code, title, or keywords..."
              aria-label="Search courses"
              className="relative w-full bg-surface-1 border border-white/5 rounded-2xl py-4 sm:py-5 pl-12 sm:pl-16 pr-14 text-base sm:text-lg text-foreground placeholder-foreground/40 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all z-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => { setSearchQuery(""); searchInputRef.current?.focus(); }}
                aria-label="Clear search"
                className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 z-20 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-foreground/60 hover:text-white transition-all"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Catalog stats (static) */}
          <div className="mt-10 flex items-center justify-center gap-10 animate-fade-in" style={{ animationDelay: "450ms" }}>
            {[
              { label: "Courses", value: courseCount },
              { label: "Departments", value: deptCount },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center gap-1">
                <span className="text-2xl font-bold text-white tabular-nums">{stat.value}</span>
                <span className="text-[11px] font-semibold text-foreground/50 uppercase tracking-wider">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- Recently Visited --- */}
      {recentCourses.length > 0 && !searchQuery && !selectedDept && !selectedLevel && !selectedSemester && (
        <section className="section-container animate-fade-in">
          <div className="flex items-center gap-2 mb-6">
            <ClockIcon className="w-4 h-4 text-foreground/60" />
            <h2 className="text-xs font-semibold text-foreground/60 uppercase tracking-[0.2em]">Recently Visited</h2>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 -mx-2 px-2">
            {recentCourses.map((course) => (
              <Link
                key={course.slug}
                href={`/courses/${course.slug}`}
                className="flex-shrink-0 group bg-surface-1/40 border border-white/5 hover:border-primary/20 rounded-xl px-5 py-4 transition-all min-w-[200px] max-w-[280px]"
              >
                <p className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest mb-1">{course.code}</p>
                <p className="text-sm font-bold text-white group-hover:text-primary transition-colors truncate">{course.title}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* --- Filter & Browse --- */}
      <section className="section-container">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-12 pt-8">
          <aside className="lg:w-64 flex-shrink-0">
            <div className="p-4 sm:p-8 rounded-2xl sm:rounded-3xl bg-surface-1 border border-white/5 shadow-xl">
              <h2 className="text-sm font-semibold text-white uppercase tracking-[0.2em] mb-4 sm:mb-8 flex items-center gap-2">
                <FunnelIcon className="w-4 h-4 text-primary" />
                Refine Search
              </h2>

              <div className="flex lg:flex-col gap-4 sm:gap-8 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
                <FilterSelect label="Department" value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)} options={filterOptions.departments} />
                <FilterSelect label="Level" value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} options={filterOptions.levels} />
                <FilterSelect label="Semester" value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value as "" | "I" | "II")} options={filterOptions.semesters} />

                {activeFilters.length > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="w-full py-4 bg-white/5 hover:bg-white/10 text-[10px] font-semibold text-foreground/60 rounded-xl transition-all uppercase tracking-widest border border-white/5 shrink-0"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>

            <div className="hidden lg:block p-8 rounded-3xl bg-gradient-to-br from-primary/10 to-accent/5 border border-white/5 relative overflow-hidden group mt-6">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <SignalIcon className="w-20 h-20 text-white" />
              </div>
              <h4 className="text-xs font-bold text-white mb-3 flex items-center gap-2">
                <BoltIcon className="w-3.5 h-3.5 text-primary" />
                Need Help?
              </h4>
              <p className="text-[11px] text-foreground/50 leading-relaxed mb-6">
                Can&apos;t find what you&apos;re looking for? Check the about page for more info.
              </p>
              <Link href="/about" className="inline-flex items-center gap-2 text-[10px] font-semibold text-primary hover:underline uppercase tracking-widest">
                Learn More
                <ArrowRightIcon className="w-3 h-3" />
              </Link>
            </div>
          </aside>

          <div className="flex-grow">
            <div className="flex justify-between items-end mb-10 pb-4 border-b border-white/5">
              <h2 className="text-3xl font-semibold text-white tracking-tight mb-1">
                Available <span className="text-primary">Courses</span>
              </h2>
              <span className="text-[10px] font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20 uppercase tracking-widest">
                {filteredCourses.length} RESULTS
              </span>
            </div>

            <div className="min-h-[600px]">
              {loadError ? (
                <ErrorDisplay message="Could Not Load Courses" details={loadError} />
              ) : filteredCourses.length === 0 ? (
                <div className="p-12 text-center border border-white/5 bg-surface-1 rounded-3xl my-8 max-w-xl mx-auto shadow-2xl">
                  <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <MagnifyingGlassIcon className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2 tracking-tight">No Matches Found</h3>
                  <p className="text-foreground/70 text-sm font-medium mb-6">No courses match your current filters. Try removing one:</p>
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
