export default function CourseCardSkeleton() {
    return (
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow animate-pulse">
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div> {/* Title Skeleton */}
        <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>   {/* Description Line 1 */}
        <div className="h-4 bg-gray-300 rounded w-5/6 mb-2"></div>   {/* Description Line 2 */}
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>      {/* Description Line 3 */}
      </div>
    );
  }