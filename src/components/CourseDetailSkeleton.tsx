export default function CourseDetailSkeleton() {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-300 rounded w-1/4 mb-4"></div> {/* Back link skeleton */}
        <div className="h-8 bg-gray-300 rounded w-3/5 mb-2"></div> {/* Title Skeleton */}
        <div className="h-5 bg-gray-300 rounded w-full mb-4"></div>  {/* Description Skeleton */}
        <div className="h-4 bg-gray-300 rounded w-1/3 mb-6"></div> {/* Instructor Skeleton */}
  
        {/* Files Section Skeleton */}
        <div className="mb-8">
          <div className="h-7 bg-gray-300 rounded w-1/4 mb-3"></div> {/* Files Header Skeleton */}
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded w-1/2"></div> {/* File 1 Skeleton */}
            <div className="h-4 bg-gray-300 rounded w-2/3"></div> {/* File 2 Skeleton */}
            <div className="h-4 bg-gray-300 rounded w-5/6"></div> {/* File 3 Skeleton */}
          </div>
        </div>
  
        {/* YouTube Section Skeleton */}
        <div className="mb-8">
           <div className="h-7 bg-gray-300 rounded w-1/4 mb-3"></div> {/* Video Header Skeleton */}
           <div className="aspect-w-16 aspect-h-9 bg-gray-300 rounded"></div> {/* Video Embed Skeleton */}
        </div>
      </div>
    );
  }