// src/app/api/courses/route.ts
import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

// Ensure environment variables are checked *outside* the handler if possible
// This prevents attempting to initialize Octokit without credentials
if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO_OWNER || !process.env.GITHUB_REPO_NAME) {
    console.error("FATAL ERROR: GitHub API environment variables not set.");
    // Optionally, throw an error during build/startup if preferred,
    // but this might hide the error until runtime if only checked here.
}

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const owner = process.env.GITHUB_REPO_OWNER!;
const repo = process.env.GITHUB_REPO_NAME!;
const coursesPath = 'courses';

export async function GET() {
  // Re-check variables inside handler in case they were set late (less ideal)
  if (!owner || !repo || !process.env.GITHUB_TOKEN) {
       console.error("API Route Error: GitHub env vars missing at runtime.");
       return NextResponse.json({ error: 'Server configuration error regarding GitHub access.' }, { status: 500 });
   }

  console.log(`API: Fetching courses from ${owner}/${repo}/${coursesPath}`); // Log entry

  try {
    const { data: rootContent } = await octokit.repos.getContent({
      owner,
      repo,
      path: coursesPath,
      // Add cache busting header for development if needed
      // headers: { 'If-None-Match': '' }
    });

    // Check if the path exists and is a directory
     if (!Array.isArray(rootContent)) {
         // Handle case where 'courses' path might be a file or non-existent
         console.error(`API Error: Path '${coursesPath}' is not a directory or does not exist.`);
         // Check if it was a 404 specifically
         if ((rootContent as any)?.status === 404) {
              return NextResponse.json({ error: `Course directory '${coursesPath}' not found in repository.` }, { status: 404 });
         }
         return NextResponse.json({ error: 'Invalid course directory structure in repository.' }, { status: 500 });
     }

    const courseDirs = rootContent;

    const coursesPromises = courseDirs
      .filter((item) => item.type === 'dir')
      .map(async (dir) => {
        const metadataPath = `${dir.path}/metadata.json`;
        try {
          const { data: metadataContent } = await octokit.repos.getContent({
            owner,
            repo,
            path: metadataPath,
            mediaType: { format: 'raw' }, // Get raw content
          });

          // Assert as string - raw format returns string for text files
          const metadataString = metadataContent as unknown as string;
          const metadata = JSON.parse(metadataString); // Parse the JSON

          // Add basic validation for required fields (optional but recommended)
           if (!metadata.title || !metadata.code || !metadata.description) {
               console.warn(`Skipping directory ${dir.name}: metadata.json missing required fields (title, code, description).`);
               return null;
           }

          console.log(`API: Successfully processed metadata for ${dir.name}`);
          return {
            slug: dir.name,
            ...metadata,
          };
        } catch (error: any) {
          // Handle file not found (404) for metadata.json gracefully
          if (error.status === 404) {
              console.warn(`Skipping directory ${dir.name}: metadata.json not found at ${metadataPath}`);
          } else {
              console.error(`API Error: Failed to fetch or parse metadata for ${dir.name} at ${metadataPath}:`, error.message || error);
          }
          return null; // Skip directories with missing/invalid metadata
        }
      });

    // Wait for all metadata fetches and filter out nulls (skipped directories)
    const courses = (await Promise.all(coursesPromises)).filter(course => course !== null);

    console.log(`API: Returning ${courses.length} courses.`);
    return NextResponse.json(courses);

  } catch (error: any) {
    console.error('API Error: Error fetching courses list from GitHub:', error.message || error);
    // Provide more specific GitHub API error if possible
    const status = error.status || 500;
    const message = error.status ? `GitHub API Error (${error.status})` : 'Failed to fetch courses from repository';
    return NextResponse.json({ error: message, details: error.data?.message || error.message || 'Unknown server error' }, { status });
  }
}
