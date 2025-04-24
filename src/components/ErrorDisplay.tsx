// src/components/ErrorDisplay.tsx
interface ErrorDisplayProps {
  message?: string;
  details?: string;
}

export default function ErrorDisplay({
  message = "Something Went Wrong",
  details,
}: ErrorDisplayProps) {
  return (
    <div className="p-6 border border-red-300 dark:border-red-700 bg-red-50 dark:bg-red-900/20 rounded-lg text-center my-8 max-w-2xl mx-auto">
      <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500 dark:text-red-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <h3 className="text-xl font-semibold text-red-700 dark:text-red-300 mb-2">{message}</h3>
      {details && <p className="text-red-600 dark:text-red-400 text-sm">{details}</p>}
       {/* Optional: Add a retry button here later */}
    </div>
  );
}