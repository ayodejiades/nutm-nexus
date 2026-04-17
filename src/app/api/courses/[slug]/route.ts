// src/app/api/courses/[slug]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { Octokit } from '@octokit/rest';

// --- Env Var Checks ---
// Ensure these throw an error or handle appropriately if missing in production
if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO_OWNER || !process.env.GITHUB_REPO_NAME) {
    console.error("FATAL ERROR: GitHub API environment variables not set during init.");
}

let octokit: Octokit | null = null;
try {
    // Initialize Octokit only if token exists
    if (process.env.GITHUB_TOKEN) {
        octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    } else {
         console.error("Octokit not initialized: GITHUB_TOKEN missing.");
    }
} catch (e) {
    console.error("Failed to initialize Octokit", e);
}

const owner = process.env.GITHUB_REPO_OWNER!;
const repo = process.env.GITHUB_REPO_NAME!;
const coursesPath = 'courses';


// Type for Route Context in Next.js 15+
type RouteContext = {
    params: Promise<{ slug: string }>;
};

// Route Handler
export async function GET(
    request: NextRequest,
    context: RouteContext
): Promise<NextResponse> {

    // Await params as required in Next.js 15+
    const { slug } = await context.params;

    if (!slug) {
        return NextResponse.json({ error: 'Missing slug parameter.' }, { status: 400 });
    }

    // Runtime checks for config
    if (!octokit || !owner || !repo) {
        const missing = [!octokit && "Octokit", !owner && "Owner", !repo && "Repo"].filter(Boolean).join(', ');
        console.error(`API Route Error [${slug}]: Config missing at runtime (${missing}).`);
        return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    const coursePath = `${coursesPath}/${slug}`;
    const metadataPath = `${coursePath}/metadata.json`; // Used below in logs/fetches
    console.log(`API [${slug}]: Fetching details for path: ${coursePath}`);

    try {
        // 1. Fetch metadata
        console.log(`API [${slug}]: Fetching metadata from ${metadataPath}`);
        let metadata: Record<string, unknown>;
        try {
             const { data: metadataContent } = await octokit.repos.getContent({
                 owner, repo, path: metadataPath, mediaType: { format: 'raw' }
                });
             try {
                 metadata = JSON.parse(metadataContent as unknown as string);
             } catch (e) {
                 console.error(`API Error [${slug}]: Failed to parse metadata.json:`, e);
                 return NextResponse.json({ error: 'Invalid course metadata format.' }, { status: 500 });
             }
             console.log(`API [${slug}]: Metadata found and parsed.`);
        } catch (error: unknown) { // Catch block uses 'error' variable
             const status = (error as { status?: number })?.status;
             // const message = (error instanceof Error) ? error.message : String(error);
             if (status === 404) {
                 // Use metadataPath in the log
                 console.error(`API Error [${slug}]: metadata.json not found at path: ${metadataPath}. Raw Error:`, error); // Log raw error
                 return NextResponse.json({ error: `Course metadata not found for '${slug}'` }, { status: 404 });
             }
             // Log other errors, using the error variable directly
             console.error(`API Error [${slug}]: Failed fetch/parse metadata from ${metadataPath}:`, error); // Log raw error
             throw error; // Re-throw to be caught by outer catch
        }

        // 2. Fetch directory contents (files)
        console.log(`API [${slug}]: Fetching file list from ${coursePath}`);
        // Disable prefer-const for this specific line as files.push modifies it
        // eslint-disable-next-line prefer-const
        let files: Array<{ name: string; url?: string | null; size: number; type: string }> = [];
        try {
            const { data: courseContents } = await octokit.repos.getContent({ owner, repo, path: coursePath });
            if (Array.isArray(courseContents)) {
               const fetchedFiles = courseContents
                  .filter(item => item.type === 'file' && item.name !== 'metadata.json')
                  .map(file => ({ name: file.name, url: file.download_url, size: file.size ?? 0, type: file.type }));
               files.push(...fetchedFiles); // Modifying 'files' array
               console.log(`API [${slug}]: Found ${files.length} files.`);
            } else {
                 console.warn(`API [${slug}]: Path ${coursePath} did not return an array of contents.`);
                 return NextResponse.json({ error: `Course path not found or invalid for '${slug}'` }, { status: 404 });
            }
        } catch (error: unknown) { // Use 'error' directly
             const status = (error as { status?: number })?.status;
             // const message = (error instanceof Error) ? error.message : String(error);
             if (status === 404) {
                 console.error(`API Error [${slug}]: Course directory not found at ${coursePath}. Raw Error:`, error); // Log raw error
                 return NextResponse.json({ error: `Course path not found for '${slug}'` }, { status: 404 });
             }
             console.error(`API Error [${slug}]: Failed to fetch course contents from ${coursePath}:`, error); // Log raw error
             throw error; // Re-throw
        }

        // 3. Return combined data
        console.log(`API [${slug}]: Returning details successfully.`);
        return NextResponse.json({ metadata, files });

    } catch (error: unknown) { // Use 'error' directly
         console.error(`API Error [${slug}]: Unhandled error in GET handler:`, error); // Log raw error
         const status = (error as { status?: number })?.status || 500;
         const githubMessage = (error as { data?: { message?: string } })?.data?.message;
         const errorMessage = (error instanceof Error) ? error.message : String(error);
         const message = status === 500 ? `Server error processing request for course '${slug}'` : `GitHub API Error (${status})`;
         const details = githubMessage || errorMessage;
         return NextResponse.json({ error: message, details: details }, { status });
    }
}

// Optional: Revalidation config
export const revalidate = 300; // Revalidate every 5 minutes
