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

// --- Type Guard ---
function isRouteContext(context: unknown): context is { params: { slug: string } } { /* ... implementation ... */ }

// Route Handler
export async function GET(
    request: NextRequest,
    context: unknown
): Promise<NextResponse> {

    if (!isRouteContext(context)) {
        console.error("API Route Error: Invalid context structure received:", context);
        return NextResponse.json({ error: 'Invalid request context.' }, { status: 400 });
    }
    const { slug } = context.params;

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
        console.log(`API [${slug}]: Fetching file list from ${coursePath}`);

        // FIX: Disable prefer-const for this specific line because files.push() modifies it
        // eslint-disable-next-line prefer-const
        let files: Array<{ name: string; url?: string | null; size: number; type: string }> = [];

        try {
            const { data: courseContents } = await octokit.repos.getContent({ owner, repo, path: coursePath });
            if (Array.isArray(courseContents)) {
               const fetchedFiles = courseContents
                  .filter(item => item.type === 'file' && item.name !== 'metadata.json')
                  .map(file => ({ name: file.name, url: file.download_url, size: file.size ?? 0, type: file.type }));
               files.push(...fetchedFiles); // Modifying 'files' array here
               console.log(`API [${slug}]: Found ${files.length} files.`);
            } else { /* ... handle non-array content ... */ }
        } catch (_error: unknown) { /* ... handle file fetch error ... */ }

        // 3. Return combined data
        console.log(`API [${slug}]: Returning details successfully.`);
        return NextResponse.json({ metadata, files });

    } catch (error: unknown) { /* ... handle main errors ... */ }
}

// Optional: Revalidation config
export const revalidate = 300;
