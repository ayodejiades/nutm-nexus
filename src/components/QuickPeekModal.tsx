"use client";

import React, { useEffect, useRef, useCallback } from "react";
import { XMarkIcon, UserIcon, BeakerIcon, CalendarIcon, AcademicCapIcon } from "@heroicons/react/24/outline";
import CourseImage from "./CourseImage";

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

interface QuickPeekModalProps {
  course: Course | null;
  onClose: () => void;
}

export default function QuickPeekModal({ course, onClose }: QuickPeekModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  const handleClose = useCallback(() => {
    dialogRef.current?.close();
    document.body.style.overflow = "unset";
    onClose();
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (course) {
      // Ensure dialog is not already open before calling showModal
      if (!dialog.open) {
        dialog.showModal();
      }
      document.body.style.overflow = "hidden";
    } else {
      if (dialog.open) {
        dialog.close();
      }
      document.body.style.overflow = "unset";
    }

    // Handle native dialog close (e.g. Escape key)
    const handleNativeClose = () => {
      document.body.style.overflow = "unset";
      onClose();
    };
    dialog.addEventListener("close", handleNativeClose);

    return () => {
      document.body.style.overflow = "unset";
      dialog.removeEventListener("close", handleNativeClose);
    };
  }, [course, onClose]);

  if (!course) return null;

  return (
    <dialog
      ref={dialogRef}
      className="bg-transparent backdrop:bg-black/80 backdrop:backdrop-blur-sm p-4 w-full max-w-3xl focus:outline-none m-auto"
      onClick={(e) => {
        // Close when clicking the backdrop (the dialog element itself)
        if (e.target === dialogRef.current) handleClose();
      }}
    >
      <div className="bg-surface-1 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row max-h-[85vh]">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 z-50 p-2 bg-black/50 hover:bg-black/70 text-white/50 hover:text-white rounded-full transition-all border border-white/10"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>

        {/* Visual Sidebar — constrained height on mobile, fixed width on desktop */}
        <div className="w-full md:w-2/5 relative max-h-[200px] md:max-h-none shrink-0 overflow-hidden">
          <CourseImage title={course.title} code={course.code} className="!aspect-auto h-full w-full" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface-1 via-transparent to-transparent md:bg-gradient-to-r" />
        </div>

        {/* Content Area */}
        <div className="w-full md:w-3/5 p-8 md:p-10 overflow-y-auto">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded text-[10px] font-black tracking-widest uppercase">
              {course.departments?.[0] || "General"}
            </span>
            <span className="text-[10px] font-bold text-foreground/40 tracking-widest uppercase italic">
              Level {course.level || 100}
            </span>
          </div>

          <h2 className="text-3xl font-black text-white leading-tight mb-4 tracking-tight">
            {course.title}
          </h2>

          <div className="flex flex-wrap gap-6 mb-8 border-y border-white/5 py-6">
            <div className="flex items-center gap-2">
              <UserIcon className="w-4 h-4 text-primary" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Instructor</span>
                <span className="text-sm font-semibold text-white/80">{course.instructor || "NUTM Faculty"}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <BeakerIcon className="w-4 h-4 text-accent" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Credits</span>
                <span className="text-sm font-semibold text-white/80">{course.credits || 3} Credits</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4 text-accent-secondary" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">Semester</span>
                <span className="text-sm font-semibold text-white/80">Semester {course.semester || "I"}</span>
              </div>
            </div>
          </div>

          <div className="prose prose-invert prose-sm max-w-none text-foreground/60 leading-relaxed mb-8">
            <h4 className="text-white text-xs font-black uppercase tracking-widest mb-3">Overview</h4>
            <p className="line-clamp-6">{course.description}</p>
          </div>

          <div className="flex items-center gap-4">
            <a
              href={`/courses/${course.slug}`}
              className="flex-grow bg-primary hover:bg-primary-light text-black py-4 px-6 rounded-xl font-black text-xs uppercase tracking-widest transition-all text-center flex items-center justify-center gap-2"
            >
              <AcademicCapIcon className="w-4 h-4" />
              Full Course Details
            </a>
          </div>
        </div>
      </div>
    </dialog>
  );
}
