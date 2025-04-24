// src/app/api/courses/[slug]/route.ts
import { NextResponse, NextRequest } from 'next/server';
import { Octokit } from '@octokit/rest';

// --- Env Var Checks ---
if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO_OWNER || !process.env.GITHUB_REPO_NAME) { console.error("FATAL ERROR: GitHub API environment variables not set during init."); }
let octokit: Octokit | null = null;
try { if (process.env.GITHUB_TOKEN) { octokit = new Octokit({ auth: process.env.GITHUB_TOKEN }); } else { console.error("Octokit not initialized: GITHUB_TOKEN missing."); } } catch (e) { console.error("Failed to initialize Octokit", e); }

const owner = process.env.GITHUB_REPO_OWNER!;
const repo = process.env.GITHUB_REPO_NAME!;
const coursesPath = 'courses';

// --- Type Guard ---
function isRouteContext(context: unknown): context is { params: { slug: string } } { /* ... implementation ... */ }

// Route Handler
export async function GET(
    request: NextRequest,
    context: unknown
): Promise<NextResponse> {

    if (!isRouteContext(context)) { /* ... handle invalid context ... */ }
    const { slug } = context.params;

    if (!octokit || !owner || !repo) { /* ... handle missing config ... */ }

    const coursePath = `${coursesPath}/${slug}`;
    const metadataPath = `${coursePath}/metadata.json`;
    console.log(`API [${slug}]: Fetching details for path: ${coursePath}`);

    try {
        // 1. Fetch metadata
        console.log(`API [${slug}]: Fetching metadata from ${metadataPath}`);
        let metadata: Record<string, unknown>;
        try {
             const { data: metadataContent } = await octokit.repos.getContent({ owner, repo, path: metadataPath, mediaType: { format: 'raw' } });
             metadata = JSON.parse(metadataContent as unknown as string);
             console.log(`API [${slug}]: Metadata found and parsed.`);
        } catch (error: unknown) {
             const status = (error as { status?: number })?.status;
             const message = (error instanceof Error) ? error.message : String(error);
             if (status === 404) {
                 console.error(`API Error [${slug}]: metadata.json not found at path: ${metadataPath}. Raw Error:`, error);
                 return NextResponse.json({ error: `Course metadata not found for '${slug}'` }, { status: 404 });
             }
             console.error(`API Error [${slug}]: Failed fetch/parse metadata from ${metadataPath}:`, error);
             throw error; // Re-throw
        }

        // 2. Fetch directory contents (files)
        console.log(`API [${slug}]: Fetching file list from ${coursePath}`);

        // FIX: Disable prefer-const for this specific line as files.push modifies it
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
        } catch (error: unknown) {
             const status = (error as { status?: number })?.status;
             const message = (error instanceof Error) ? error.message : String(error);
             if (status === 404) {
                 console.error(`API Error [${slug}]: Course directory not found at ${coursePath}. Raw Error:`, error);
                 return NextResponse.json({ error: `Course path not found for '${slug}'` }, { status: 404 });
             }
             console.error(`API Error [${slug}]: Failed to fetch course contents from ${coursePath}:`, error);
             throw error; // Re-throw
        }

        // 3. Return combined data
        console.log(`API [${slug}]: Returning details successfully.`);
        return NextResponse.json({ metadata, files });

    } catch (error: unknown) {
         console.error(`API Error [${slug}]: Unhandled error in GET handler:`, error);
         const status = (error as { status?: number })?.status || 500;
         const githubMessage = (error as { data?: { message?: string } })?.data?.message;
         const errorMessage = (error instanceof Error) ? error.message : String(error);
         const message = status === 500 ? `Server error processing request for course '${slug}'` : `GitHub API Error (${status})`;
         const details = githubMessage || errorMessage;
         return NextResponse.json({ error: message, details: details }, { status });
    }
}

// Optional: Revalidation config
export const revalidate = 300;

// --- Type Guard --- (Keep this helper function)
function isRouteContext(context: unknown): context is { params: { slug: string } } {
    if (typeof context !== 'object' || context === null) return false;
    const potentialContext = context as { params?: unknown };
    if (typeof potentialContext.params !== 'object' || potentialContext.params === null) return false;
    const potentialParams = potentialContext.params as { slug?: unknown };
    return typeof potentialParams.slug === 'string';
             }
