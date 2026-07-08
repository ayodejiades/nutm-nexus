// Server-only data access for course content (GitHub-backed).
// Imported by Server Components so course data is rendered into the HTML
// (good first paint + SEO) instead of fetched client-side.
import { cache } from "react";
import { Octokit } from "@octokit/rest";

export type Category = "notes" | "assignments" | "tests" | "exams";

export interface CourseFile {
  name: string;
  url?: string | null;
  size: number;
  category: Category;
  cohort: string | null;
}

export interface CourseMetadata {
  title: string;
  code: string;
  description: string;
  instructor?: string;
  youtubePlaylistId?: string;
  moodleCourseUrl?: string;
  moodleForumUrl?: string;
  moodleAssignmentsUrl?: string;
  departments?: string[];
  level?: number;
  credits?: number;
  semester?: "I" | "II";
  quizzes?: unknown[];
}

export type CourseSummary = CourseMetadata & { slug: string };

export interface CourseDetails {
  metadata: CourseMetadata;
  files: CourseFile[];
}

const owner = process.env.GITHUB_REPO_OWNER;
const repo = process.env.GITHUB_REPO_NAME;
const coursesPath = "courses";

let octokit: Octokit | null = null;
if (process.env.GITHUB_TOKEN) {
  octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });
} else {
  console.error("Octokit not initialized: GITHUB_TOKEN missing.");
}

function requireClient(): Octokit {
  if (!octokit || !owner || !repo) {
    throw new Error("GitHub content source is not configured (token/owner/repo).");
  }
  return octokit;
}

const CATEGORY_ALIASES: Record<string, Category> = {
  notes: "notes", note: "notes", lectures: "notes", lecture: "notes", slides: "notes",
  assignments: "assignments", assignment: "assignments", homework: "assignments", hw: "assignments",
  tests: "tests", test: "tests", quizzes: "tests", quiz: "tests", cat: "tests",
  exams: "exams", exam: "exams", "past-exams": "exams", pastexams: "exams", finals: "exams",
};

// Recursively lists files under a course directory, tagging each with the
// category + cohort implied by its path. Sibling dirs are walked in parallel.
async function walkCourseDir(client: Octokit, dirPath: string, courseRoot: string): Promise<CourseFile[]> {
  const { data } = await client.repos.getContent({ owner: owner!, repo: repo!, path: dirPath });
  if (!Array.isArray(data)) return [];

  const directFiles: CourseFile[] = [];
  const subdirWalks: Array<Promise<CourseFile[]>> = [];

  for (const item of data) {
    if (item.type === "dir") {
      subdirWalks.push(walkCourseDir(client, item.path, courseRoot));
    } else if (item.type === "file" && item.name !== "metadata.json") {
      const relative = item.path.startsWith(`${courseRoot}/`)
        ? item.path.slice(courseRoot.length + 1)
        : item.name;
      const segments = relative.split("/");
      const category = segments.length > 1 ? (CATEGORY_ALIASES[segments[0].toLowerCase()] ?? "notes") : "notes";
      const cohort = segments.length > 2 ? segments[1] : null;
      directFiles.push({ name: item.name, url: item.download_url, size: item.size ?? 0, category, cohort });
    }
  }

  const nested = (await Promise.all(subdirWalks)).flat();
  return [...directFiles, ...nested];
}

// Lists every course with valid metadata. Throws on a fatal source error.
// Wrapped in cache() so repeated calls within one request/render are deduped.
export const getCourses = cache(async (): Promise<CourseSummary[]> => {
  const gh = requireClient();
  const { data: rootContent } = await gh.repos.getContent({ owner: owner!, repo: repo!, path: coursesPath });
  if (!Array.isArray(rootContent)) {
    throw new Error("Course directory not found in repository.");
  }

  const courses = await Promise.all(
    rootContent
      .filter((item) => item.type === "dir")
      .map(async (dir): Promise<CourseSummary | null> => {
        try {
          const { data } = await gh.repos.getContent({
            owner: owner!, repo: repo!, path: `${dir.path}/metadata.json`, mediaType: { format: "raw" },
          });
          const metadata = JSON.parse(data as unknown as string) as CourseMetadata;
          if (!metadata.title || !metadata.code || !metadata.description) return null;
          return { slug: dir.name, ...metadata };
        } catch {
          return null;
        }
      })
  );

  return courses.filter((c): c is CourseSummary => c !== null);
});

// Returns a single course's metadata + tagged files, or null if not found.
export const getCourseDetails = cache(async (slug: string): Promise<CourseDetails | null> => {
  const gh = requireClient();
  const coursePath = `${coursesPath}/${slug}`;

  let metadata: CourseMetadata;
  try {
    const { data } = await gh.repos.getContent({
      owner: owner!, repo: repo!, path: `${coursePath}/metadata.json`, mediaType: { format: "raw" },
    });
    metadata = JSON.parse(data as unknown as string) as CourseMetadata;
  } catch (error: unknown) {
    if ((error as { status?: number })?.status === 404) return null;
    throw error;
  }

  let files: CourseFile[] = [];
  try {
    files = await walkCourseDir(gh, coursePath, coursePath);
  } catch (error: unknown) {
    if ((error as { status?: number })?.status !== 404) throw error;
  }

  return { metadata, files };
});
