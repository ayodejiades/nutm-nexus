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
    <div className="p-12 border border-red-500/10 bg-surface-1 rounded-3xl text-center my-8 max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
      {/* Subtle indicator */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/50 to-transparent" />
      
      <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>

      <h3 className="text-xl font-bold text-white mb-2 tracking-tight">{message}</h3>
      {details && <p className="text-foreground/40 text-sm font-medium italic">{details}</p>}
    </div>
  );
}