// src/app/api/courses/[slug]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { Octokit } from '@octokit/rest';

// --- Env Var Checks ---
// ... (Keep checks as before) ...
if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO_OWNER || !process.env.GITHUB_REPO_NAME) { console.error("FATAL ERROR: GitHub API environment variables not set during init."); }
let octokit: Octokit | null = null;
try { if (process.env.GITHUB_TOKEN) { octokit = new Octokit({ auth: process.env.GITHUB_TOKEN }); } else { console.error("Octokit not initialized: GITHUB_TOKEN missing."); } } catch (e) { console.error("Failed to initialize Octokit", e); }

const owner = process.env.GITHUB_REPO_OWNER!;
const repo = process.env.GITHUB_REPO_NAME!;
const coursesPath = 'courses';


// --- Type Guard for Context ---
// This function checks if the unknown context has the expected shape
function isRouteContext(context: unknown): context is { params: { slug: string } } {
    return (
        typeof context === 'object' &&
        context !== null &&
        'params' in context &&
        typeof (context as any).params === 'object' &&
        (context as any).params !== null &&
        'slug' in (context as any).params &&
        typeof (context as any).params.slug === 'string'
    );
}


// FIX: Type context as unknown and use the type guard
export async function GET(
    request: NextRequest,
    context: unknown // Use unknown type
): Promise<NextResponse> {

    // Use the type guard to safely access params
    if (!isRouteContext(context)) {
        console.error("API Route Error: Invalid context structure received:", context);
        return NextResponse.json({ error: 'Invalid request context.' }, { status: 400 });
    }

    // Now we know context has the shape { params: { slug: string } }
    const { slug } = context.params;

    // Runtime checks (keep these)
    if (!octokit || !owner || !repo) { /* ... handle missing config ... */ }

    const coursePath = `${coursesPath}/${slug}`;
    const metadataPath = `${coursePath}/metadata.json`;
    console.log(`API [${slug}]: Fetching details for path: ${coursePath}`);

    try {
        // 1. Fetch metadata
        let metadata: Record<string, unknown>;
        try { /* ... fetch metadata logic ... */ }
        catch (error: unknown) { /* ... handle metadata error ... */ }

        // 2. Fetch directory contents (files)
        let files: Array<{ name: string; url?: string | null; size: number; type: string }> = [];
        try { /* ... fetch files logic ... */ }
        catch (error: unknown) { /* ... handle directory error ... */ }

        // 3. Return combined data
        console.log(`API [${slug}]: Returning details successfully.`);
        return NextResponse.json({ metadata, files });

    } catch (error: unknown) {
         /* ... handle main errors ... */
         console.error(`API Error [${slug}]: Unhandled error fetching course details:`, error);
         const status = (error as { status?: number })?.status || 500;
         // ... rest of error handling ...
         return NextResponse.json({ error: "Server processing error", details: (error as Error).message }, { status });
    }
}

// Optional: Set revalidation period
export const revalidate = 300;
