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

// --- File categorization ---
type Category = 'notes' | 'assignments' | 'tests' | 'exams';

interface CourseFile {
    name: string;
    url?: string | null;
    size: number;
    type: string;
    /** Path-derived category. Root-level files fall back to "notes". */
    category: Category;
    /** Cohort folder name (e.g. "2024-2025"), or null for shared/legacy files. */
    cohort: string | null;
}

// Maps the first path segment (case-insensitive, with a few aliases) to a category.
const CATEGORY_ALIASES: Record<string, Category> = {
    notes: 'notes', note: 'notes', lectures: 'notes', lecture: 'notes', slides: 'notes',
    assignments: 'assignments', assignment: 'assignments', homework: 'assignments', hw: 'assignments',
    tests: 'tests', test: 'tests', quizzes: 'tests', quiz: 'tests', cat: 'tests',
    exams: 'exams', exam: 'exams', 'past-exams': 'exams', 'pastexams': 'exams', finals: 'exams',
};

// Recursively lists files under a course directory, tagging each with category + cohort
// derived from its path relative to the course root. Sibling directories are walked in parallel.
async function walkCourseDir(
    client: Octokit,
    repoOwner: string,
    repoName: string,
    dirPath: string,
    courseRoot: string,
): Promise<CourseFile[]> {
    const { data } = await client.repos.getContent({ owner: repoOwner, repo: repoName, path: dirPath });
    if (!Array.isArray(data)) return [];

    const directFiles: CourseFile[] = [];
    const subdirWalks: Array<Promise<CourseFile[]>> = [];

    for (const item of data) {
        if (item.type === 'dir') {
            subdirWalks.push(walkCourseDir(client, repoOwner, repoName, item.path, courseRoot));
        } else if (item.type === 'file' && item.name !== 'metadata.json') {
            // Relative path under the course root, e.g. "exams/2024-2025/final.pdf"
            const relative = item.path.startsWith(`${courseRoot}/`)
                ? item.path.slice(courseRoot.length + 1)
                : item.name;
            const segments = relative.split('/');
            const category = segments.length > 1
                ? (CATEGORY_ALIASES[segments[0].toLowerCase()] ?? 'notes')
                : 'notes';
            // Cohort = the folder between category and the file, when present.
            const cohort = segments.length > 2 ? segments[1] : null;
            directFiles.push({
                name: item.name,
                url: item.download_url,
                size: item.size ?? 0,
                type: item.type,
                category,
                cohort,
            });
        }
    }

    const nested = (await Promise.all(subdirWalks)).flat();
    return [...directFiles, ...nested];
}


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

        // 2. Fetch directory contents (files), recursing into category/cohort subfolders.
        //
        // Folder convention (all parts optional — flat root files still work):
        //   courses/<slug>/<category>/<cohort>/<file>
        //   category := notes | assignments | tests | exams  (root files default to "notes")
        //   cohort   := academic-year folder, e.g. "2024-2025"  (null when absent)
        console.log(`API [${slug}]: Fetching file tree from ${coursePath}`);
        let files: CourseFile[];
        try {
            files = await walkCourseDir(octokit, owner, repo, coursePath, coursePath);
            console.log(`API [${slug}]: Found ${files.length} files.`);
        } catch (error: unknown) { // Use 'error' directly
             const status = (error as { status?: number })?.status;
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
