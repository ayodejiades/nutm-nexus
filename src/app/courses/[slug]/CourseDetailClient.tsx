"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import EmptyState from "@/components/EmptyState";
import { ArrowTopRightOnSquareIcon, BookOpenIcon, UserIcon } from "@heroicons/react/24/outline";
import { getFileIcon } from "@/lib/utils";
import type { CourseDetails, CourseFile, Category } from "@/lib/courses";

const PATTERNS = [
  (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full opacity-10">
      <circle cx="50" cy="50" r="30" stroke="white" strokeWidth="0.5" strokeDasharray="2 2" />
      <circle cx="50" cy="50" r="15" stroke="white" strokeWidth="0.5" />
      <path d="M0 50H100M50 0V100" stroke="white" strokeWidth="0.2" />
    </svg>
  ),
  (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full opacity-10">
      <path d="M10 90 L40 50 L60 70 L90 20" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M0 80Q50 80 100 20" stroke="white" strokeWidth="0.5" opacity="0.3" />
    </svg>
  ),
  (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full opacity-10">
      <path d="M50 10L84.6 30V70L50 90L15.4 70V30L50 10Z" stroke="white" strokeWidth="0.5" />
      <circle cx="50" cy="50" r="2" fill="white" />
    </svg>
  ),
  (
    <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute inset-0 w-full h-full opacity-10">
      <path d="M0 50C20 30 40 70 60 50C80 30 100 70 120 50" stroke="white" strokeWidth="1" fill="none" />
      <path d="M0 60C20 40 40 80 60 60C80 40 100 80 120 60" stroke="white" strokeWidth="0.5" opacity="0.5" />
    </svg>
  ),
];

const CATEGORY_TABS: { key: Category; label: string }[] = [
  { key: "notes", label: "Notes" },
  { key: "assignments", label: "Assignments" },
  { key: "tests", label: "Tests" },
  { key: "exams", label: "Past Exams" },
];

// "2024-2025" -> "2024/2025"; "class-of-28" -> "Class of 28"; else humanize.
export function formatCohort(cohort: string): string {
  if (/^\d{4}-\d{4}$/.test(cohort)) return cohort.replace("-", "/");
  if (/^class-of-\d+$/i.test(cohort)) return `Class of ${cohort.split("-").pop()}`;
  return cohort.replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  if (i >= sizes.length) return `${(bytes / Math.pow(k, sizes.length - 1)).toFixed(dm)} ${sizes[sizes.length - 1]}`;
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default function CourseDetailClient({ details, slug }: { details: CourseDetails; slug: string }) {
  const courseDetails = details;
  const { metadata } = courseDetails;

  const [fileSortKey, setFileSortKey] = useState<"name" | "size">("name");
  const [fileSortOrder, setFileSortOrder] = useState<"asc" | "desc">("asc");
  const [activeCategory, setActiveCategory] = useState<Category>("notes");
  const [activeCohort, setActiveCohort] = useState<string>("all");

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

  const categoryOf = (f: CourseFile): Category => f.category ?? "notes";

  const availableCategories = useMemo(() => {
    const present = new Set((courseDetails.files ?? []).map(categoryOf));
    return CATEGORY_TABS.filter((t) => present.has(t.key));
  }, [courseDetails.files]);

  useEffect(() => {
    if (availableCategories.length === 0) return;
    if (!availableCategories.some((t) => t.key === activeCategory)) {
      setActiveCategory(availableCategories[0].key);
    }
  }, [availableCategories, activeCategory]);

  const availableCohorts = useMemo(() => {
    const cohorts = new Set(
      (courseDetails.files ?? [])
        .filter((f) => categoryOf(f) === activeCategory && f.cohort)
        .map((f) => f.cohort as string)
    );
    return Array.from(cohorts).sort((a, b) => b.localeCompare(a));
  }, [courseDetails.files, activeCategory]);

  const sortedFiles = useMemo(() => {
    const filesToSort = (courseDetails.files ?? []).filter((f) => {
      if (categoryOf(f) !== activeCategory) return false;
      if (activeCohort !== "all" && f.cohort !== activeCohort) return false;
      return true;
    });
    filesToSort.sort((a, b) => {
      let comparison = 0;
      if (fileSortKey === "name") comparison = (a.name || "").localeCompare(b.name || "");
      else if (fileSortKey === "size") comparison = (a.size ?? 0) - (b.size ?? 0);
      return fileSortOrder === "asc" ? comparison : -comparison;
    });
    return filesToSort;
  }, [courseDetails.files, activeCategory, activeCohort, fileSortKey, fileSortOrder]);

  const handleFileSort = (key: "name" | "size") => {
    if (key === fileSortKey) setFileSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
    else { setFileSortKey(key); setFileSortOrder("asc"); }
  };

  const deterministicSum = metadata.code.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const Pattern = PATTERNS[deterministicSum % PATTERNS.length];

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      {/* --- Hero Header --- */}
      <section className="relative -mt-8 pt-24 pb-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-surface-1 to-background border-b border-white/5" />
        <div className="absolute right-0 top-0 w-1/2 h-full flex items-center justify-center transform scale-150 rotate-12 pointer-events-none">
          {Pattern}
        </div>

        <div className="section-container relative z-10">
          <Link href="/" className="inline-flex items-center text-xs font-semibold text-primary hover:text-primary-light uppercase tracking-widest mb-8 transition-colors">
            ← Back to All Courses
          </Link>

          <div className="max-w-4xl">
            <div className="flex items-center gap-3 mb-6">
              <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-lg border border-primary/20 tracking-widest uppercase">
                {metadata.code}
              </span>
              {metadata.level && (
                <span className="px-3 py-1 bg-white/5 text-foreground/70 text-xs font-bold rounded-lg border border-white/5 tracking-widest uppercase">
                  Level {metadata.level}
                </span>
              )}
            </div>

            <h1 className="text-4xl md:text-6xl font-semibold text-white leading-tightest mb-6 tracking-tight">
              {metadata.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-sm">
              <div className="flex items-center gap-3 text-white">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center border border-primary/20">
                  <UserIcon className="w-5 h-5 text-primary" />
                </div>
                <span className="font-semibold tracking-tight">By {metadata.instructor || "NUTM Faculty"}</span>
              </div>
              <div className="h-4 w-px bg-white/10 hidden sm:block" />
              <div className="flex items-center gap-3 text-foreground/50 font-semibold uppercase tracking-widest text-[10px]">
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
          <div className="lg:flex-grow space-y-12">
            <div>
              <h2 className="text-sm font-semibold text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <BookOpenIcon className="w-4 h-4 text-primary" />
                Course Overview
              </h2>
              <p className="text-xl text-foreground/50 max-w-2xl font-medium leading-relaxed mb-8 italic">
                {metadata.description}
              </p>

              <div className="flex flex-wrap gap-4">
                {metadata.moodleCourseUrl && (
                  <a
                    href={metadata.moodleCourseUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-8 py-4 bg-white/5 hover:bg-white/10 text-white rounded-xl font-semibold text-xs uppercase tracking-widest transition-all border border-white/5 flex items-center gap-2"
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
                <h2 className="text-lg font-semibold text-white tracking-tight">
                  Learning <span className="text-primary italic">Resources</span>
                </h2>

                {sortedFiles.length > 1 && (
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleFileSort("name")}
                      className={`text-[10px] font-semibold px-3 py-1.5 rounded-lg border transition-all uppercase tracking-widest ${fileSortKey === "name" ? "bg-primary/20 border-primary/40 text-primary" : "bg-surface-2 border-white/5 text-foreground/70 hover:bg-surface-3"}`}
                    >
                      Name {fileSortKey === "name" && (fileSortOrder === "asc" ? "↑" : "↓")}
                    </button>
                    <button
                      onClick={() => handleFileSort("size")}
                      className={`text-[10px] font-semibold px-3 py-1.5 rounded-lg border transition-all uppercase tracking-widest ${fileSortKey === "size" ? "bg-primary/20 border-primary/40 text-primary" : "bg-surface-2 border-white/5 text-foreground/70 hover:bg-surface-3"}`}
                    >
                      Size {fileSortKey === "size" && (fileSortOrder === "asc" ? "↑" : "↓")}
                    </button>
                  </div>
                )}
              </div>

              {/* Category tabs + cohort filter */}
              {availableCategories.length > 0 && (
                <div className="px-6 py-4 border-b border-white/5 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex flex-wrap items-center gap-2">
                    {availableCategories.map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => { setActiveCategory(tab.key); setActiveCohort("all"); }}
                        className={`text-[11px] font-semibold px-4 py-2 rounded-lg border transition-all uppercase tracking-widest ${activeCategory === tab.key ? "bg-primary/20 border-primary/40 text-primary" : "bg-surface-2 border-white/5 text-foreground/70 hover:bg-surface-3"}`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {availableCohorts.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-foreground/60 uppercase tracking-widest">Cohort</span>
                      <select
                        value={activeCohort}
                        onChange={(e) => setActiveCohort(e.target.value)}
                        aria-label="Filter by cohort"
                        className="text-[11px] font-bold bg-surface-2 border border-white/5 text-foreground/80 rounded-lg px-3 py-2 focus:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 hover:bg-surface-3 transition-all cursor-pointer"
                      >
                        <option value="all">All cohorts</option>
                        {availableCohorts.map((c) => (
                          <option key={c} value={c}>{formatCohort(c)}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              <div className="p-2">
                {sortedFiles.length > 0 ? (
                  <div className="space-y-1">
                    {sortedFiles.map((file) => {
                      const fileName = file?.name || "Unnamed File";
                      const IconComponent = getFileIcon(fileName);
                      return (
                        <a
                          key={`${fileName}-${file.url || ""}`}
                          href={file.url || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`flex items-center justify-between p-4 rounded-xl hover:bg-white/5 transition-all group ${!file.url ? "opacity-50 pointer-events-none" : ""}`}
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-10 h-10 rounded-lg bg-surface-2 flex items-center justify-center group-hover:bg-primary/10 group-hover:scale-110 transition-all">
                              <IconComponent className="w-5 h-5 text-foreground/70 group-hover:text-primary transition-colors" />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-foreground/80 group-hover:text-white truncate" title={fileName}>
                                {fileName}
                              </p>
                              <span className="text-[10px] font-bold text-foreground/55 uppercase tracking-widest">
                                {fileName.split(".").pop()}{file.cohort ? ` · ${formatCohort(file.cohort)}` : " Resource"}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 flex-shrink-0">
                            <span className="text-[10px] font-bold text-foreground/60">{formatBytes(file.size)}</span>
                            <ArrowTopRightOnSquareIcon className="w-4 h-4 text-foreground/55 group-hover:text-primary transition-colors" />
                          </div>
                        </a>
                      );
                    })}
                  </div>
                ) : (
                  <EmptyState
                    title="Nothing here yet"
                    message={
                      activeCohort !== "all"
                        ? `No ${CATEGORY_TABS.find((t) => t.key === activeCategory)?.label.toLowerCase() ?? "files"} for ${formatCohort(activeCohort)}.`
                        : `No ${CATEGORY_TABS.find((t) => t.key === activeCategory)?.label.toLowerCase() ?? "resources"} available for this course yet.`
                    }
                  />
                )}
              </div>
            </div>

            {/* Video Lectures */}
            {metadata.youtubePlaylistId && (
              <div className="space-y-6">
                <h2 className="text-sm font-semibold text-white uppercase tracking-[0.2em] flex items-center gap-2">
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

          {/* Sidebar */}
          <aside className="lg:w-80 space-y-8 flex-shrink-0">
            <div className="p-8 rounded-3xl bg-surface-1 border border-white/5 shadow-2xl space-y-6">
              <h3 className="text-xs font-semibold text-white uppercase tracking-[0.2em]">Quick Links</h3>

              <div className="space-y-3">
                {metadata.moodleCourseUrl && (
                  <a
                    href={metadata.moodleCourseUrl}
                    target="_blank"
                    className="w-full h-14 bg-primary hover:bg-primary-light !text-white text-[11px] font-semibold rounded-xl flex items-center justify-center transition-all uppercase tracking-[0.15em] gap-3 shadow-xl shadow-primary/30 active:scale-95"
                  >
                    Moodle Page <ArrowTopRightOnSquareIcon className="w-4 h-4 !text-white" />
                  </a>
                )}
                {metadata.moodleForumUrl && metadata.moodleForumUrl !== metadata.moodleCourseUrl && (
                  <a
                    href={metadata.moodleForumUrl}
                    target="_blank"
                    className="w-full h-14 bg-surface-2 hover:bg-surface-3 text-foreground/80 text-xs font-semibold rounded-xl flex items-center justify-center transition-all uppercase tracking-widest border border-white/5"
                  >
                    Discussion Forum
                  </a>
                )}
                {metadata.moodleAssignmentsUrl &&
                  metadata.moodleAssignmentsUrl !== metadata.moodleCourseUrl &&
                  metadata.moodleAssignmentsUrl !== metadata.moodleForumUrl && (
                    <a
                      href={metadata.moodleAssignmentsUrl}
                      target="_blank"
                      className="w-full h-14 bg-surface-2 hover:bg-surface-3 text-foreground/80 text-xs font-semibold rounded-xl flex items-center justify-center transition-all uppercase tracking-widest border border-white/5"
                    >
                      View Assignments
                    </a>
                  )}
              </div>

              <div className="pt-6 border-t border-white/5">
                <p className="text-[11px] text-foreground/70 leading-relaxed font-medium">
                  Contact faculty for missing file requests.
                </p>
              </div>
            </div>

            <div className="space-y-6 px-4">
              <div>
                <h4 className="text-[10px] font-semibold text-primary uppercase tracking-widest mb-3">Academic Info</h4>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold text-foreground/60 uppercase">Departments</p>
                    <p className="text-sm font-bold text-foreground/80">{metadata.departments?.join(", ") || "General"}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-foreground/60 uppercase">Level</p>
                    <p className="text-sm font-bold text-foreground/80">{metadata.level || "Unknown"} Level</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-foreground/60 uppercase">Semester</p>
                    <p className="text-sm font-bold text-foreground/80">Semester {metadata.semester || "I"}</p>
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
