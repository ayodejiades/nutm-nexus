// src/components/CourseCard.tsx
import Link from 'next/link';

interface CourseCardProps {
  slug: string;
  title: string;
  code: string;
  description: string;
  // Include optional fields used by filters if needed for display on card
  department?: string;
  level?: number;
}

export default function CourseCard({ slug, title, code, description, department, level }: CourseCardProps) {
  return (
    <Link
      href={`/courses/${slug}`}
      className="group block rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 shadow-sm transition duration-300 ease-in-out hover:shadow-lg hover:border-primary/40 dark:hover:border-primary/60 hover:-translate-y-1 overflow-hidden"
    >
      {/* Top Section: Code & Level/Dept */}
      <div className="flex justify-between items-center mb-3">
          <span className="inline-block bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light px-2.5 py-0.5 rounded-full text-xs font-semibold">
            {code}
          </span>
          {level && <span className="text-xs text-gray-500 dark:text-gray-400">{level} Level</span>}
      </div>

      {/* Title */}
      <h3 className="mb-2 text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100 group-hover:text-primary dark:group-hover:text-primary-light transition-colors duration-200">
        {title}
      </h3>

       {/* Department (Optional) */}
       {department && <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{department}</p>}

      {/* Description */}
      <p className="text-sm font-normal text-gray-700 dark:text-gray-400 line-clamp-3 mb-4">
        {description}
      </p>

       {/* Hint */}
       <span className="mt-2 text-xs font-medium text-primary/80 dark:text-primary-light/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out block">
         View Details →
       </span>
    </Link>
  );
}