// src/components/CourseCardSkeleton.tsx
export default function CourseCardSkeleton() {
    return (
      <div className="p-6 bg-white dark:bg-gray-800/30 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm animate-pulse">
        {/* Badge Skeleton */}
         <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded-full w-1/4 mb-4"></div>
        {/* Title Skeleton */}
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
        {/* Description Skeleton */}
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-5/6 mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
         {/* Hint Skeleton */}
         <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/3 mt-2"></div>
      </div>
    );
  }