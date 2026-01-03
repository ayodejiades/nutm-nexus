export default function CourseCardSkeleton() {
  const skeletonBase = "bg-white/5 rounded-md animate-pulse";
  return (
    <div className="p-6 border border-white/5 bg-white/[0.02] rounded-xl shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <div className={`${skeletonBase} h-6 w-20`}></div>
        <div className="flex gap-3">
          <div className={`${skeletonBase} h-3 w-10`}></div>
          <div className={`${skeletonBase} h-3 w-10`}></div>
        </div>
      </div>
      <div className={`${skeletonBase} h-7 w-3/4 mb-3`}></div>
      <div className={`${skeletonBase} h-4 w-1/3 mb-4`}></div>
      <div className={`${skeletonBase} h-4 w-full mb-2`}></div>
      <div className={`${skeletonBase} h-4 w-5/6 mb-6`}></div>
      <div className={`${skeletonBase} h-4 w-32`}></div>
    </div>
  );
}
