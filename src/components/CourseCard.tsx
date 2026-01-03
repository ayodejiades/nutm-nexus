import Link from "next/link";
import { ArrowRightIcon } from "@heroicons/react/24/outline";

interface CourseCardProps {
  slug: string;
  title: string;
  code: string;
  description: string;
  departments?: string[];
  level?: number;
  semester?: "I" | "II";
}

export default function CourseCard({
  slug,
  title,
  code,
  description,
  departments,
  level,
  semester,
}: CourseCardProps) {
  const displayDepartment = departments?.[0] || "";

  return (
    <Link
      href={`/courses/${slug}`}
      className="group block rounded-xl border border-white/5 bg-white/[0.02] p-6 shadow-sm transition-all duration-300 hover:border-primary/50 hover:bg-white/[0.04] hover:-translate-y-1"
    >
      <div className="flex justify-between items-center mb-4">
        <span className="inline-block bg-primary/10 text-primary px-3 py-1 rounded-md text-xs font-bold tracking-wider">
          {code}
        </span>
        <div className="flex items-center gap-x-3 text-[10px] font-bold uppercase tracking-widest text-foreground/40">
          {level && <span>Lvl {level}</span>}
          {semester && (
            <span className="border-l border-white/10 pl-3">
              SEM {semester}
            </span>
          )}
        </div>
      </div>

      <h3 className="mb-2 text-xl font-bold tracking-tight text-foreground group-hover:text-primary-light transition-colors">
        {title}
      </h3>

      {displayDepartment && (
        <p className="text-xs font-semibold text-primary/60 mb-3 uppercase tracking-wide">
          {displayDepartment}
          {departments && departments.length > 1 ? "..." : ""}
        </p>
      )}

      <p className="text-sm font-normal text-foreground/60 line-clamp-2 mb-6 leading-relaxed">
        {description}
      </p>

      <div className="flex items-center text-xs font-bold text-primary group-hover:gap-2 transition-all">
        <span>VIEW RESOURCES</span>
        <ArrowRightIcon className="w-4 h-4 ml-1" />
      </div>
    </Link>
  );
}
