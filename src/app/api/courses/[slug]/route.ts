// src/app/api/courses/[slug]/route.ts
import { NextResponse, NextRequest } from 'next/server'; // Using NextRequest might be safer
import { Octokit } from '@octokit/rest';

// Check env vars
if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO_OWNER || !process.env.GITHUB_REPO_NAME) {
    console.error("FATAL ERROR: GitHub API environment variables not set during init.");
}

let octokit: Octokit | null = null;
try {
    if (process.env.GITHUB_TOKEN) {
        octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
    } else {
        console.error("Octokit not initialized: GITHUB_TOKEN missing.");
    }
} catch (e) { console.error("Failed to initialize Octokit", e); }

const owner = process.env.GITHUB_REPO_OWNER!;
const repo = process.env.GITHUB_REPO_NAME!;
const coursesPath = 'courses';

// FIX: Use 'any' for the context argument to bypass strict type check
export async function GET(request: NextRequest, context: any) {
    // Access params via the 'any' typed context, add checks
    const slug = context?.params?.slug;

    // **Crucial check**: Ensure slug was actually extracted
    if (!slug || typeof slug !== 'string') {
         console.error("API Route Error: Slug is missing or invalid in context params:", context?.params);
         return NextResponse.json({ error: 'Course slug is required in the URL path.' }, { status: 400 });
    }

    // Runtime checks for other prerequisites
    if (!octokit || !owner || !repo) {
        const missing = [!octokit && "Octokit", !owner && "Owner", !repo && "Repo"].filter(Boolean).join(', ');
        console.error(`API Route Error [${slug}]: Config missing at runtime (${missing}).`);
        return NextResponse.json({ error: 'Server configuration error.' }, { status: 500 });
    }

    const coursePath = `${coursesPath}/${slug}`;
    const metadataPath = `${coursePath}/metadata.json`;
    console.log(`API [${slug}]: Fetching details for path: ${coursePath}`);

    try {
        // 1. Fetch metadata
        console.log(`API [${slug}]: Fetching metadata from ${metadataPath}`);
        let metadata: Record<string, unknown>;
        try {
            const { data: metadataContent } = await octokit.repos.getContent({
                owner, repo, path: metadataPath, mediaType: { format: 'raw' },
            });
            const metadataString = metadataContent as unknown as string;
            metadata = JSON.parse(metadataString);
            console.log(`API [${slug}]: Metadata found and parsed.`);
        } catch (error: unknown) {
            const status = (error as { status?: number })?.status;
            const message = (error instanceof Error) ? error.message : String(error);
            if (status === 404) {
                console.error(`API Error [${slug}]: metadata.json not found at ${metadataPath}.`);
                return NextResponse.json({ error: `Course metadata not found for '${slug}'` }, { status: 404 });
            }
            console.error(`API Error [${slug}]: Failed to fetch/parse metadata:`, message);
            throw new Error(`Failed to fetch or parse metadata: ${message}`);
        }


        // 2. Fetch directory contents (files)
        console.log(`API [${slug}]: Fetching file list from ${coursePath}`);
        let files: Array<{ name: string; url?: string | null; size: number; type: string }> = [];
        try {
            const { data: courseContents } = await octokit.repos.getContent({ owner, repo, path: coursePath });
            if (Array.isArray(courseContents)) {
               files = courseContents
                  .filter(item => item.type === 'file' && item.name !== 'metadata.json')
                  .map(file => ({
                    name: file.name,
                    url: file.download_url,
                    size: file.size ?? 0,
                    type: file.type,
                  }));
               console.log(`API [${slug}]: Found ${files.length} files.`);
            } else {
                 console.warn(`API [${slug}]: Path ${coursePath} did not return an array of contents.`);
                 return NextResponse.json({ error: `Course path not found or invalid for '${slug}'` }, { status: 404 });
            }
        } catch (error: unknown) {
            const status = (error as { status?: number })?.status;
            const message = (error instanceof Error) ? error.message : String(error);
            if (status === 404) {
                console.error(`API Error [${slug}]: Course directory not found at ${coursePath}.`);
                return NextResponse.json({ error: `Course path not found for '${slug}'` }, { status: 404 });
            }
            console.error(`API Error [${slug}]: Failed to fetch course contents:`, message);
            throw new Error(`Failed to fetch course contents: ${message}`);
        }

        // 3. Return combined data
        console.log(`API [${slug}]: Returning details successfully.`);
        return NextResponse.json({ metadata, files });

    } catch (error: unknown) {
        console.error(`API Error [${slug}]: Unhandled error fetching course details:`, error);
        const status = (error as { status?: number })?.status || 500;
        const githubMessage = (error as { data?: { message?: string } })?.data?.message;
        const errorMessage = (error instanceof Error) ? error.message : String(error);
        const message = status === 500 ? `Server error processing request for course '${slug}'` : `GitHub API Error (${status})`;
        const details = githubMessage || errorMessage;
        return NextResponse.json({ error: message, details: details }, { status });
    }
}

// Optional: Set revalidation period
export const revalidate = 300; // Revalidate every 5 minutes
