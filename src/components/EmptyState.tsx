interface EmptyStateProps {
    title: string;
    message: string;
  }
  
  export default function EmptyState({ title, message }: EmptyStateProps) {
    return (
      <div className="p-8 text-center border border-gray-200 bg-gray-50 rounded-lg">
         {/* Optional: Add an icon here */}
         <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
           <path strokeLinecap="round" strokeLinejoin="round" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
         </svg>
         <h3 className="text-xl font-semibold text-gray-700 mb-2">{title}</h3>
         <p className="text-gray-500">{message}</p>
      </div>
    );
  }