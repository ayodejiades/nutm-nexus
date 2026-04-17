"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import CourseCard from "@/components/CourseCard";
import CourseCardSkeleton from "@/components/CourseCardSkeleton";
import ErrorDisplay from "@/components/ErrorDisplay";
import EmptyState from "@/components/EmptyState";
import { MagnifyingGlassIcon, FunnelIcon } from "@heroicons/react/24/outline";

// Types
interface Course {
  slug: string;
  title: string;
  code: string;
  description: string;
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
  <div className="flex flex-col gap-1.5">
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
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedSemester, setSelectedSemester] = useState<"" | "I" | "II">("");

  useEffect(() => {
    fetchCourses()
      .then(setCourses)
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
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

  return (
    <div className="space-y-16 py-8">
      {/* --- Coursera-style Hero Section --- */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 -mr-40 -mt-20 w-[600px] h-[600px] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-0 left-0 -ml-40 -mb-20 w-[400px] h-[400px] bg-accent/5 blur-[100px] rounded-full" />

        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto px-4">
          <h1 className="text-6xl md:text-8xl font-black tracking-tightest leading-[0.95] mb-8 animate-fade-in">
            Enhance <span className="text-gradient-primary">Learning</span>.
          </h1>

          <p className="text-xl text-foreground/50 mb-12 max-w-2xl font-medium leading-relaxed animate-fade-in" style={{ animationDelay: '200ms' }}>
            The hub for world-class lecture notes, academic essentials, and interactive resources at NUTM.
          </p>

          <div className="w-full max-w-2xl relative group/search animate-fade-in shadow-2xl shadow-black/50" style={{ animationDelay: '400ms' }}>
            <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-20 group-focus-within/search:opacity-40 transition-opacity" />
            <MagnifyingGlassIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-foreground/20 group-focus-within/search:text-primary transition-colors z-20" />
            <input
              type="text"
              placeholder="Search by code, title, or keywords..."
              className="relative w-full bg-surface-1/80 backdrop-blur-2xl border border-white/5 rounded-2xl py-6 pl-16 pr-6 text-lg text-foreground placeholder-foreground/20 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all z-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* --- Filter & Browse Section --- */}
      <section className="section-container">
        <div className="flex flex-col lg:flex-row gap-12 pt-8 border-t border-white/5">
          {/* Sidebar-style Filters (Sticky on Desktop) */}
          <aside className="lg:w-64 space-y-8 flex-shrink-0">
            <div>
              <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <FunnelIcon className="w-4 h-4 text-primary" />
                Refine Search
              </h2>

              <div className="space-y-6">
                <FilterSelect
                  label="Department"
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  options={filterOptions.departments}
                />
                <FilterSelect
                  label="Academic Level"
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

                {(searchQuery || selectedDept || selectedLevel || selectedSemester) && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setSelectedDept("");
                      setSelectedLevel("");
                      setSelectedSemester("");
                    }}
                    className="w-full py-3 bg-white/5 hover:bg-white/10 text-[10px] font-black text-foreground/60 rounded-xl transition-all uppercase tracking-widest border border-white/5"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/5 border border-white/5">
              <h4 className="text-xs font-bold text-white mb-2">Need Help?</h4>
              <p className="text-[11px] text-foreground/50 leading-relaxed mb-4">
                Can't find what you're looking for? Check the documentation or contact support.
              </p>
              <Link href="/about" className="text-[10px] font-black text-primary hover:underline uppercase tracking-widest">
                Learn More
              </Link>
            </div>
          </aside>

          {/* Course Grid Area */}
          <div className="flex-grow">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-white tracking-tight">
                Available <span className="text-primary italic">Courses</span>
              </h2>
              <span className="text-xs font-bold text-foreground/30 uppercase tracking-widest">
                Showing {filteredCourses.length} Results
              </span>
            </div>

            <div className="min-h-[400px]">
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
                  {[...Array(6)].map((_, i) => (
                    <CourseCardSkeleton key={i} />
                  ))}
                </div>
              ) : error ? (
                <ErrorDisplay message="Unable to load courses" details={error} />
              ) : filteredCourses.length === 0 ? (
                <EmptyState
                  title="No courses found"
                  message="Try adjusting your filters or search terms."
                />
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-8">
                  {filteredCourses.map((course) => (
                    <CourseCard key={course.slug} {...course} />
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
