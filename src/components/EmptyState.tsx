// src/components/EmptyState.tsx
import { FolderOpenIcon } from '@heroicons/react/24/outline'; // Example icon

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: React.ElementType; // Allow passing custom icon component
}

export default function EmptyState({
    title = "Nothing Here Yet",
    message = "Check back later for updates.",
    icon: Icon = FolderOpenIcon // Default icon
}: EmptyStateProps) {
  return (
    <div className="p-8 text-center border-2 border-dashed border-gray-300 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/20 rounded-lg my-8 max-w-lg mx-auto">
       <Icon className="h-14 w-14 text-gray-400 dark:text-gray-500 mx-auto mb-4" aria-hidden="true" />
       <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</h3>
       <p className="text-gray-500 dark:text-gray-400 text-sm">{message}</p>
    </div>
  );
}