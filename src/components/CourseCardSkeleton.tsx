// src/components/CourseCardSkeleton.tsx
export default function CourseCardSkeleton() {
   const skeletonBase = "bg-gray-300 dark:bg-gray-700 rounded";
   return (
     <div className="p-6 bg-white dark:bg-gray-800/30 border border-gray-200 dark:border-gray-800 rounded-xl shadow-sm animate-pulse">
       <div className="flex justify-between items-center mb-3">
          <div className={`${skeletonBase} h-4 w-1/4 rounded-full`}></div>
          <div className="flex items-center gap-x-2">
              <div className={`${skeletonBase} h-3 w-12`}></div>
              <div className={`${skeletonBase} h-3 w-10`}></div>
          </div>
       </div>
       <div className={`${skeletonBase} h-6 w-3/4 mb-3`}></div>
       <div className={`${skeletonBase} h-3 w-1/3 mb-2`}></div>
       <div className={`${skeletonBase} h-4 w-full mb-2`}></div>
       <div className={`${skeletonBase} h-4 w-5/6 mb-2`}></div>
       <div className={`${skeletonBase} h-4 w-1/2 mb-4`}></div>
       <div className={`${skeletonBase} h-3 w-1/3 mt-2`}></div>
     </div>
   );
}