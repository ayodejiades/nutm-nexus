// src/components/CourseDetailSkeleton.tsx
export default function CourseDetailSkeleton() {
  const skeletonBase = "bg-gray-300 dark:bg-gray-700 rounded";
  const sectionStyle = "mb-8 p-6 border border-gray-200 dark:border-gray-800 rounded-lg bg-white dark:bg-gray-900/30 shadow-sm animate-pulse";
  const titleStyle = "text-2xl font-semibold mb-5 border-b border-gray-200 dark:border-gray-700 pb-3";

  return (
    <div className="max-w-4xl mx-auto animate-pulse">
       {/* Back link */}
      <div className={`${skeletonBase} h-4 w-1/4 mb-6`}></div>
       {/* Badges/Metadata */}
       <div className="flex items-center gap-2 flex-wrap mb-2">
           <div className={`${skeletonBase} h-5 w-16 rounded-full`}></div>
           <div className={`${skeletonBase} h-3 w-24`}></div>
           <div className={`${skeletonBase} h-3 w-16`}></div>
       </div>
       {/* Title */}
      <div className={`${skeletonBase} h-8 w-3/4 mb-3`}></div>
       {/* Instructor */}
      <div className={`${skeletonBase} h-4 w-1/3 mb-4`}></div>
       {/* Description */}
      <div className={`${skeletonBase} h-5 w-full mb-8`}></div>

      {/* Files Section Skeleton */}
      <div className={sectionStyle}>
        <div className={titleStyle}><div className={`${skeletonBase} h-7 w-1/3`}></div></div>
        <div className="space-y-3 mt-5">
          <div className={`${skeletonBase} h-4 w-1/2`}></div> <div className={`${skeletonBase} h-4 w-2/3`}></div> <div className={`${skeletonBase} h-4 w-3/4`}></div>
        </div>
      </div>
      {/* Moodle Section Skeleton */}
      <div className={sectionStyle}>
         <div className={titleStyle}><div className={`${skeletonBase} h-7 w-2/5`}></div></div>
         <div className="space-y-3 mt-5"><div className={`${skeletonBase} h-4 w-1/2`}></div> <div className={`${skeletonBase} h-4 w-1/3`}></div></div>
      </div>
      {/* YouTube Section Skeleton */}
       <div className={sectionStyle}>
         <div className={titleStyle}><div className={`${skeletonBase} h-7 w-1/4`}></div></div>
         <div className="aspect-w-16 aspect-h-9 mt-5 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
       </div>
    </div>
  );
}