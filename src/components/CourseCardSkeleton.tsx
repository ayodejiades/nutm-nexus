export default function CourseCardSkeleton() {
  const shimmerClass = "bg-white/[0.03] overflow-hidden relative after:absolute after:inset-0 after:-translate-x-full after:animate-[shimmer_2s_infinite] after:bg-gradient-to-r after:from-transparent after:via-white/[0.05] after:to-transparent";
  
  return (
    <div className="coursera-card overflow-hidden flex flex-col h-full border border-white/5 bg-white/[0.02]">
      {/* Image Area Skeleton */}
      <div className={`aspect-video w-full ${shimmerClass}`} />

      <div className="p-5 flex flex-col flex-grow">
        {/* Dept & Level Skeleton */}
        <div className="flex justify-between items-center mb-3">
          <div className={`h-3 w-16 rounded ${shimmerClass}`} />
          <div className={`h-3 w-10 rounded ${shimmerClass}`} />
        </div>

        {/* Title Skeleton */}
        <div className="space-y-2 mb-4">
          <div className={`h-5 w-full rounded ${shimmerClass}`} />
          <div className={`h-5 w-2/3 rounded ${shimmerClass}`} />
        </div>

        {/* Instructor Skeleton */}
        <div className="flex items-center gap-2 mb-4">
          <div className={`h-3.5 w-3.5 rounded-full ${shimmerClass}`} />
          <div className={`h-3 w-32 rounded ${shimmerClass}`} />
        </div>

        {/* Footer Skeleton */}
        <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
          <div className="flex gap-3">
            <div className={`h-3 w-12 rounded ${shimmerClass}`} />
            <div className={`h-3 w-12 rounded ${shimmerClass}`} />
          </div>
          <div className={`h-3 w-16 rounded ${shimmerClass}`} />
        </div>
      </div>
    </div>
  );
}
