import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

// Initialize Octokit (GitHub API client)
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const owner = process.env.GITHUB_REPO_OWNER!;
const repo = process.env.GITHUB_REPO_NAME!;
const coursesPath = 'courses'; // Path to the courses directory in your repo

export async function GET() {
  try {
    // Fetch the list of directories (courses) inside the 'courses' path
    const { data: courseDirs } = await octokit.repos.getContent({
      owner,
      repo,
      path: coursesPath,
    });

    if (!Array.isArray(courseDirs)) {
      console.error('Expected an array of directories for courses');
      return NextResponse.json({ error: 'Failed to fetch course structure' }, { status: 500 });
    }

    // Filter out non-directories and fetch metadata for each course
    const coursesPromises = courseDirs
      .filter((item) => item.type === 'dir')
      .map(async (dir) => {
        try {
          const { data: metadataContent } = await octokit.repos.getContent({
            owner,
            repo,
            path: `${dir.path}/metadata.json`,
            // Request raw content using media type
            mediaType: { format: 'raw' },
          });

          // Type assertion because raw format returns string | ArrayBuffer
          const metadataString = metadataContent as unknown as string;
          const metadata = JSON.parse(metadataString);
          return {
            slug: dir.name, // Use directory name as slug
            ...metadata,
          };
        } catch (error) {
          console.error(`Failed to fetch metadata for ${dir.name}:`, error);
          return null; // Skip courses with missing/invalid metadata
        }
      });

    const courses = (await Promise.all(coursesPromises)).filter(course => course !== null);

    return NextResponse.json(courses);

  } catch (error) {
    console.error('Error fetching courses from GitHub:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}

// Ensure environment variables are set
if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_REPO_OWNER || !process.env.GITHUB_REPO_NAME) {
  console.error("FATAL ERROR: GitHub environment variables (GITHUB_TOKEN, GITHUB_REPO_OWNER, GITHUB_REPO_NAME) are not set.");
}