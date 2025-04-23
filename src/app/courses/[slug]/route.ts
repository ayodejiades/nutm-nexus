import { NextResponse } from 'next/server';
import { Octokit } from '@octokit/rest';

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
const owner = process.env.GITHUB_REPO_OWNER!;
const repo = process.env.GITHUB_REPO_NAME!;
const coursesPath = 'courses';

export async function GET(
  request: Request, // Use standard Request type
  { params }: { params: { slug: string } }
) {
  const { slug } = params;
  if (!slug) {
    return NextResponse.json({ error: 'Course slug is required' }, { status: 400 });
  }

  const coursePath = `${coursesPath}/${slug}`;

  try {
    // 1. Fetch metadata
    const { data: metadataContent } = await octokit.repos.getContent({
      owner,
      repo,
      path: `${coursePath}/metadata.json`,
      mediaType: { format: 'raw' },
    });
    const metadataString = metadataContent as unknown as string;
    const metadata = JSON.parse(metadataString);

    // 2. Fetch directory contents (files)
    const { data: courseContents } = await octokit.repos.getContent({
      owner,
      repo,
      path: coursePath,
    });

    if (!Array.isArray(courseContents)) {
       return NextResponse.json({ error: 'Could not list course contents' }, { status: 500 });
    }

    const files = courseContents
      .filter(item => item.type === 'file' && item.name !== 'metadata.json')
      .map(file => ({
        name: file.name,
        url: file.download_url, // Direct download URL (may require auth depending on repo visibility)
        // Alternatively, use html_url for viewing on GitHub: file.html_url
        size: file.size,
      }));

    return NextResponse.json({ metadata, files });

  } catch (error: any) {
     // Check for 404 specifically for metadata not found
     if (error.status === 404) {
         return NextResponse.json({ error: `Course or metadata not found for slug: ${slug}` }, { status: 404 });
     }
    console.error(`Error fetching course details for ${slug}:`, error);
    return NextResponse.json({ error: 'Failed to fetch course details' }, { status: 500 });
  }
}