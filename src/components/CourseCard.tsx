// src/components/CourseCard.tsx
import Link from 'next/link';

interface CourseCardProps {
  slug: string;
  title: string;
  code: string;
  description: string;
}

export default function CourseCard({ slug, title, code, description }: CourseCardProps) {
  return (
    // Remove legacyBehavior and the inner <a> tag.
    // Apply className and other props directly to the Link component.
    <Link
      href={`/courses/${slug}`}
      className="group block rounded-lg border border-gray-200 bg-white p-6 shadow transition duration-200 ease-in-out hover:border-gray-300 hover:shadow-md"
    >
      {/* The content is now directly inside Link */}
      <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 transition-colors duration-200 group-hover:text-primary">
        {code} - {title}
      </h5>
      <p className="font-normal text-gray-700 line-clamp-3">{description}</p>
    </Link>
  );
}