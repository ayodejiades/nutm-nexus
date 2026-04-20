import Link from "next/link";
import { ArrowRightIcon, UserIcon, BeakerIcon, EyeIcon } from "@heroicons/react/24/outline";
import CourseImage from "./CourseImage";

interface CourseCardProps {
  slug: string;
  title: string;
  code: string;
  description: string;
  instructor?: string;
  departments?: string[];
  level?: number;
  credits?: number;
  semester?: "I" | "II";
  searchQuery?: string;
  onQuickPeek?: (e: React.MouseEvent) => void;
  className?: string;
}

function HighlightText({ text, query }: { text: string; query?: string }) {
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

export default function CourseCard({
  slug,
  title,
  code,
  description,
  instructor,
  departments,
  level,
  credits,
  semester,
  searchQuery,
  onQuickPeek,
  className = "",
}: CourseCardProps) {
  const displayDepartment = departments?.[0] || "General";

  return (
    <div className={`group relative h-full flex flex-col ${className}`}>
      {/* Quick Peek Trigger Overlay */}
      <button
        onClick={onQuickPeek}
        className="absolute top-4 right-4 z-30 p-2.5 bg-black/60 backdrop-blur-md text-white/70 hover:text-white rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-90 group-hover:scale-100 hover:bg-primary hover:text-black border border-white/10"
        title="Quick Preview"
      >
        <EyeIcon className="w-5 h-5" />
      </button>

      <Link
        href={`/courses/${slug}`}
        className="coursera-card block h-full flex flex-col"
      >
        {/* Course Image Area */}
        <CourseImage title={title} code={code} />

        <div className="p-5 flex flex-col flex-grow">
          {/* Department & Level */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-black text-foreground/40 uppercase tracking-[0.15em]">
              {displayDepartment}
            </span>
            {level && (
              <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
                Lvl {level}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-snug group-hover:text-primary transition-colors" style={{ textWrap: 'balance' } as React.CSSProperties}>
            <HighlightText text={title} query={searchQuery} />
          </h3>

          {/* Description */}
          <p className="text-xs text-foreground/40 leading-relaxed line-clamp-2 mb-4">
            <HighlightText text={description} query={searchQuery} />
          </p>

          {/* Instructor */}
          <div className="flex items-center gap-2 text-sm text-foreground/50 italic mt-auto">
            <UserIcon className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{instructor || "NUTM Faculty"}</span>
          </div>

          <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {credits && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-foreground/40">
                  <BeakerIcon className="w-3 h-3 text-accent" />
                  <span>{credits} Cr</span>
                </div>
              )}
              {semester && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-foreground/40 uppercase">
                  <span>SEM {semester}</span>
                </div>
              )}
            </div>

            <div className="flex items-center text-[10px] font-black text-foreground/40 group-hover:text-primary transition-all group-hover:translate-x-1">
              <span>EXPLORE</span>
              <ArrowRightIcon className="w-3 h-3 ml-1" />
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
