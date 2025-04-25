import Link from 'next/link';

interface CourseCardProps {
  slug: string;
  title: string;
  code: string;
  description: string;
  departments?: string[];
  level?: number;
  semester?: "I" | "II";
}

export default function CourseCard({ slug, title, code, description, departments, level, semester }: CourseCardProps) {
  const displayDepartment = departments?.[0] || '';

  return (
    <Link
      href={`/courses/${slug}`}
      className="group block rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/50 p-6 shadow-sm transition duration-300 ease-in-out hover:shadow-lg hover:border-primary/40 dark:hover:border-primary/60 hover:-translate-y-1 overflow-hidden"
    >
      <div className="flex justify-between items-center mb-3 flex-wrap gap-x-2 gap-y-1">
          <span className="inline-block bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary-light px-2.5 py-0.5 rounded-full text-xs font-semibold">
            {code}
          </span>
          <div className="flex items-center gap-x-2">
            {level && <span className="text-xs text-gray-500 dark:text-gray-400">{level} Level</span>}
            {semester && <span className="text-xs text-gray-500 dark:text-gray-400 border-l border-gray-300 dark:border-gray-600 pl-2">Sem {semester}</span>}
          </div>
      </div>

      <h3 className="mb-2 text-lg font-semibold tracking-tight text-gray-900 dark:text-gray-100 group-hover:text-primary dark:group-hover:text-primary-light transition-colors duration-200">
        {title}
      </h3>

      {displayDepartment && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 truncate" title={departments?.join(', ')}>
              {displayDepartment}{departments && departments.length > 1 ? '...' : ''}
          </p>
      )}

      <p className="text-sm font-normal text-gray-700 dark:text-gray-400 line-clamp-3 mb-4">
        {description}
      </p>

       <span className="mt-2 text-xs font-medium text-primary/80 dark:text-primary-light/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ease-in-out block">
         View Details →
       </span>
    </Link>
  );
}