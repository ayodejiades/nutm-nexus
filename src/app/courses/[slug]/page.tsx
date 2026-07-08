import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import CourseDetailClient from "./CourseDetailClient";
import ErrorDisplay from "@/components/ErrorDisplay";
import { getCourseDetails, getCourses } from "@/lib/courses";

export const revalidate = 300;

type Params = { params: Promise<{ slug: string }> };

// Prerender every course at build time (revalidated every 5 min via ISR).
export async function generateStaticParams() {
  try {
    const courses = await getCourses();
    return courses.map((c) => ({ slug: c.slug }));
  } catch {
    return [];
  }
}

// Per-course title/description + OG so a shared /courses/<slug> link unfurls
// with the actual course, not the generic site card.
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  try {
    const details = await getCourseDetails(slug);
    if (!details) return { title: "Course not found" };
    const { metadata } = details;
    const title = `${metadata.code} — ${metadata.title}`;
    const description = (metadata.description ?? "NUTM course resources.").slice(0, 200);
    return {
      title,
      description,
      openGraph: { title: `${title} · NUTM Nexus`, description, type: "article" },
      twitter: { card: "summary_large_image", title: `${title} · NUTM Nexus`, description },
    };
  } catch {
    return {};
  }
}

export default async function CourseDetailPage({ params }: Params) {
  const { slug } = await params;

  let details;
  try {
    details = await getCourseDetails(slug);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return (
      <div className="max-w-4xl mx-auto">
        <Link href="/" className="text-primary hover:underline mb-6 inline-block text-sm">← Back</Link>
        <ErrorDisplay message="Could Not Load Course Details" details={message} />
      </div>
    );
  }

  if (!details) notFound();
  return <CourseDetailClient details={details} slug={slug} />;
}
