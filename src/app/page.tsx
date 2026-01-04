"use client";

import React, { useState, useEffect, useMemo } from "react";
import Image from "next/image";
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
  if (!res.ok) throw new Error("Could not load courses.");
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
    <div className="space-y-12">
      {/* Enhanced Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-[#1B222B]/40 border border-white/5 p-8 md:p-20 group">
        {/* Animated Background Orbs */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-primary/10 blur-[120px] rounded-full transition-all duration-1000 group-hover:bg-primary/20" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 bg-accent/5 blur-[100px] rounded-full" />

        <div className="relative flex flex-col lg:flex-row items-center justify-between gap-16 z-10">
          <div className="max-w-2xl text-center lg:text-left animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter text-foreground mb-6 leading-[1.1]">
              Elevate Your{" "}
              <span className="text-gradient-primary">Learning</span>{" "}
              Experience.
            </h1>
            <p className="text-xl text-foreground/50 mb-10 leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium">
              Access the most comprehensive library of NUTM lecture notes,
              tutorials, and academic essentials.
            </p>

            <div className="relative max-w-lg mx-auto lg:mx-0 group/search">
              <div className="absolute inset-0 bg-primary/20 blur-2xl opacity-0 group-focus-within/search:opacity-100 transition-opacity duration-500" />
              <MagnifyingGlassIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-6 w-6 text-foreground/20 group-focus-within/search:text-primary transition-colors z-20" />
              <input
                type="text"
                placeholder="Search resources by code, title, or keyword..."
                className="relative w-full bg-[#0B0E13]/60 backdrop-blur-xl border border-white/10 rounded-2xl py-5 pl-14 pr-6 text-base text-foreground placeholder-foreground/20 focus:outline-none focus:border-primary/50 focus:ring-4 focus:ring-primary/10 transition-all shadow-2xl z-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2 bg-primary/10 hover:bg-primary text-primary hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-all z-20 shadow-lg">
                SEARCH
              </button>
            </div>
          </div>

          <div className="relative w-full max-w-md xl:max-w-lg animate-float">
            <div className="absolute inset-0 bg-primary/5 blur-[60px] rounded-full" />
            <Image
              src="/hero-illustration.png"
              alt="Study Illustration"
              width={500}
              height={500}
              className="relative w-full h-auto object-contain opacity-90 drop-shadow-[0_20px_50px_rgba(0,135,81,0.2)]"
              priority
            />
          </div>
        </div>
      </section>

      {/* Filter Section */}
      <section className="bg-background/80 backdrop-blur-md sticky top-20 z-30 py-4 border-b border-white/5">
        <div className="flex flex-wrap items-end gap-4 sm:gap-6">
          <div className="flex items-center gap-2 text-foreground/30 px-2 py-2">
            <FunnelIcon className="w-5 h-5" />
            <span className="text-xs font-bold uppercase tracking-widest hidden md:block">
              Filters
            </span>
          </div>
          <FilterSelect
            label="Department"
            value={selectedDept}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setSelectedDept(e.target.value)
            }
            options={filterOptions.departments}
          />
          <FilterSelect
            label="Level"
            value={selectedLevel}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setSelectedLevel(e.target.value)
            }
            options={filterOptions.levels}
          />
          <FilterSelect
            label="Semester"
            value={selectedSemester}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setSelectedSemester(e.target.value as "" | "I" | "II")
            }
            options={filterOptions.semesters}
          />
          {(searchQuery ||
            selectedDept ||
            selectedLevel ||
            selectedSemester) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedDept("");
                setSelectedLevel("");
                setSelectedSemester("");
              }}
              className="text-xs font-bold text-primary hover:text-primary-light transition-colors py-2"
            >
              RESET ALL
            </button>
          )}
        </div>
      </section>

      {/* Grid */}
      <div className="min-h-[400px]">
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : error ? (
          <ErrorDisplay message="Unable to load courses" details={error} />
        ) : filteredCourses.length === 0 ? (
          <EmptyState
            title="No courses found"
            message="Try adjusting your filters or search."
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredCourses.map((course) => (
              <CourseCard key={course.slug} {...course} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
