// src/app/api/courses/route.ts
import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

// Check env vars preferably outside or at least early
// Ensure these throw an error or handle appropriately if missing in production
if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO_OWNER || !process.env.GITHUB_REPO_NAME) {
  console.error("FATAL ERROR: GitHub API environment variables not set during init.");
  // In a real app, might want to throw here to prevent startup without config
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

export async function GET() {
  // Check runtime prerequisites
  if (!octokit || !owner || !repo) {
    console.error("API Route Error: Octokit or GitHub env vars missing at runtime.");
    return NextResponse.json({ error: 'Server configuration error regarding GitHub access.' }, { status: 500 });
  }
  console.log(`API: Fetching courses from ${owner}/${repo}/${coursesPath}`);

  try {
    // Fetch directory content
    const { data: rootContent } = await octokit.repos.getContent({
      owner, repo, path: coursesPath,
    });

    // Validate directory structure
    if (!Array.isArray(rootContent)) {
      console.error(`API Error: Path '${coursesPath}' is not a directory or does not exist.`);
      // Use type assertion carefully for status check
      if ((rootContent as { status?: number })?.status === 404) {
        return NextResponse.json({ error: `Course directory '${coursesPath}' not found in repository.` }, { status: 404 });
      }
      return NextResponse.json({ error: 'Invalid course directory structure in repository.' }, { status: 500 });
    }

    const courseDirs = rootContent;

    // Process each directory to get metadata
    const coursesPromises = courseDirs
      .filter((item) => item.type === 'dir') // Only process directories
      .map(async (dir) => {
        const metadataPath = `${dir.path}/metadata.json`;
        try {
          // Fetch raw metadata file content
          const { data: metadataContent } = await octokit.repos.getContent({
            owner, repo, path: metadataPath, mediaType: { format: 'raw' },
          });
          let metadata;
          try {
            const metadataString = metadataContent as unknown as string;
            metadata = JSON.parse(metadataString);
          } catch (e) {
            console.error(`API Error: Failed to parse JSON for ${dir.name}:`, e);
            return null;
          }

          // Basic validation of metadata content
          if (!metadata.title || !metadata.code || !metadata.description) {
            console.warn(`Skipping directory ${dir.name}: metadata.json missing required fields (title, code, description).`);
            return null; // Skip this course if essential data is missing
          }

          console.log(`API: Successfully processed metadata for ${dir.name}`);
          // Combine slug with metadata
          return {
            slug: dir.name,
            ...metadata,
          };
        } catch (error: unknown) { // Use unknown type for catch
          const status = (error as { status?: number })?.status; // Check status via assertion
          const message = (error instanceof Error) ? error.message : String(error);

          // Handle metadata not found gracefully
          if (status === 404) {
            console.warn(`Skipping directory ${dir.name}: metadata.json not found at ${metadataPath}`);
          } else {
            // Log other errors during metadata fetch/parse
            console.error(`API Error: Failed fetch/parse metadata for ${dir.name} at ${metadataPath}:`, message);
          }
          return null; // Skip directories with problematic metadata
        }
      });

    // Wait for all promises and filter out nulls
    const courses = (await Promise.all(coursesPromises)).filter(course => course !== null);

    console.log(`API: Returning ${courses.length} courses.`);
    return NextResponse.json(courses);

  } catch (error: unknown) { // Use unknown type for main catch
    console.error('API Error: Error fetching courses list from GitHub:', error);
    const status = (error as { status?: number })?.status || 500;
    const githubMessage = (error as { data?: { message?: string } })?.data?.message;
    const errorMessage = (error instanceof Error) ? error.message : String(error);
    const message = status === 500 ? 'Failed to fetch courses from repository' : `GitHub API Error (${status})`;
    const details = githubMessage || errorMessage;

    return NextResponse.json({ error: message, details: details }, { status });
  }
}

// Optional: Set revalidation period for caching (e.g., every 5 minutes)
export const revalidate = 300;