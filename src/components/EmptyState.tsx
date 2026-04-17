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
    icon: Icon = FolderOpenIcon
}: EmptyStateProps) {
  return (
    <div className="p-12 text-center border border-white/5 bg-surface-1 rounded-3xl my-8 max-w-xl mx-auto shadow-2xl">
       <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Icon className="h-8 w-8 text-primary" aria-hidden="true" />
       </div>
       <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{title}</h3>
       <p className="text-foreground/40 text-sm font-medium">{message}</p>
    </div>
  );
}