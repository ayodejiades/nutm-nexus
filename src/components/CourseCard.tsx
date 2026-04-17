import Link from "next/link";
import { ArrowRightIcon, UserIcon, BeakerIcon } from "@heroicons/react/24/outline";
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
}: CourseCardProps) {
  const displayDepartment = departments?.[0] || "General";

  return (
    <Link
      href={`/courses/${slug}`}
      className="coursera-card group block h-full flex flex-col"
    >
      {/* Course Image Area */}
      <CourseImage title={title} code={code} />

      <div className="p-5 flex flex-col flex-grow">
        {/* Department & Level */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-black text-primary uppercase tracking-[0.15em]">
            {displayDepartment}
          </span>
          {level && (
            <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
              Lvl {level}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-white mb-2 line-clamp-2 leading-snug group-hover:text-primary transition-colors">
          {title}
        </h3>

        {/* Instructor */}
        <div className="flex items-center gap-2 mb-4 text-sm text-foreground/50 italic">
          <UserIcon className="w-3.5 h-3.5" />
          <span className="truncate">{instructor || "NUTM Faculty"}</span>
        </div>

        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
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
          
          <div className="flex items-center text-[10px] font-black text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
            <span>EXPLORE</span>
            <ArrowRightIcon className="w-3 h-3 ml-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}
