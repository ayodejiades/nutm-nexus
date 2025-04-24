// src/app/api/courses/[slug]/route.ts
import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

// Check env vars
if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO_OWNER || !process.env.GITHUB_REPO_NAME) {
    console.error("FATAL ERROR: GitHub API environment variables not set during init.");
}

let octokit: Octokit | null = null;
try { octokit = new Octokit({ auth: process.env.GITHUB_TOKEN }); } catch (e) { console.error("Failed to initialize Octokit", e); }

const owner = process.env.GITHUB_REPO_OWNER!;
const repo = process.env.GITHUB_REPO_NAME!;
const coursesPath = 'courses';

interface RequestContext { params: { slug: string }; }

export async function GET(request: Request, context: RequestContext) {
    const { slug } = context.params;

    if (!octokit || !owner || !repo || !slug) {
        console.error(`API Route Error [${slug || 'unknown'}]: Octokit or GitHub env vars/slug missing at runtime.`);
        return NextResponse.json({ error: 'Server configuration error or missing slug.' }, { status: 500 });
    }

    const coursePath = `${coursesPath}/${slug}`;
    const metadataPath = `${coursePath}/metadata.json`;
    console.log(`API [${slug}]: Fetching details for path: ${coursePath}`);

    try {
        // 1. Fetch metadata
        console.log(`API [${slug}]: Fetching metadata from ${metadataPath}`);
        let metadata: Record<string, unknown>; // Use a more generic object type initially
        try {
            const { data: metadataContent } = await octokit.repos.getContent({
                owner, repo, path: metadataPath, mediaType: { format: 'raw' },
            });
            const metadataString = metadataContent as unknown as string;
            metadata = JSON.parse(metadataString); // Parse JSON
             // Add type validation if needed here
            console.log(`API [${slug}]: Metadata found and parsed.`);
        } catch (error: unknown) { // FIX: Use unknown
             // FIX: Use type assertion carefully or type guard
             const status = (error as { status?: number })?.status;
             const message = (error instanceof Error) ? error.message : String(error);
             if (status === 404) {
                 console.error(`API Error [${slug}]: metadata.json not found at ${metadataPath}.`);
                 return NextResponse.json({ error: `Course metadata not found for '${slug}'` }, { status: 404 });
             }
             console.error(`API Error [${slug}]: Failed to fetch/parse metadata:`, message);
             throw new Error(`Failed to fetch or parse metadata: ${message}`); // Re-throw other errors
        }

        // 2. Fetch directory contents (files)
        console.log(`API [${slug}]: Fetching file list from ${coursePath}`);
        let files: Array<{ name: string; url?: string | null; size: number; type: string }> = []; // Allow url to be null
        try {
            const { data: courseContents } = await octokit.repos.getContent({ owner, repo, path: coursePath });
            if (Array.isArray(courseContents)) {
               files = courseContents
                  .filter(item => item.type === 'file' && item.name !== 'metadata.json')
                  .map(file => ({
                    name: file.name,
                    url: file.download_url, // download_url can be null for submodule links etc.
                    size: file.size ?? 0, // Use nullish coalescing for size
                    type: file.type,
                  }));
               console.log(`API [${slug}]: Found ${files.length} files.`);
            } else {
                 console.warn(`API [${slug}]: Path ${coursePath} did not return an array of contents.`);
                 return NextResponse.json({ error: `Course path not found or invalid for '${slug}'` }, { status: 404 });
            }
        } catch (error: unknown) { // FIX: Use unknown
             // FIX: Use type assertion carefully or type guard
            const status = (error as { status?: number })?.status;
             const message = (error instanceof Error) ? error.message : String(error);
             if (status === 404) {
                 console.error(`API Error [${slug}]: Course directory not found at ${coursePath}.`);
                 return NextResponse.json({ error: `Course path not found for '${slug}'` }, { status: 404 });
             }
             console.error(`API Error [${slug}]: Failed to fetch course contents:`, message);
             throw new Error(`Failed to fetch course contents: ${message}`); // Re-throw other errors
        }

        // 3. Return combined data
        console.log(`API [${slug}]: Returning details successfully.`);
        return NextResponse.json({ metadata, files });

    } catch (error: unknown) { // FIX: Use unknown for main catch
        console.error(`API Error [${slug}]: Failed to fetch course details:`, error);
         // FIX: Use type assertion carefully or type guard
        const status = (error as { status?: number })?.status || 500;
        const githubMessage = (error as { data?: { message?: string } })?.data?.message;
        const errorMessage = (error instanceof Error) ? error.message : String(error);
        const message = status === 500 ? `Failed to fetch details for course '${slug}'` : `GitHub API Error (${status})`;
        const details = githubMessage || errorMessage;

        return NextResponse.json({ error: message, details: details }, { status });
    }
}
// export const revalidate = 300;