import HomeClient from "./HomeClient";
import { getCourses } from "@/lib/courses";

// Statically rendered with the course list baked into the HTML, revalidated
// every 5 minutes (ISR). Fixes first paint + makes courses crawlable.
export const revalidate = 300;

export default async function HomePage() {
  try {
    const courses = await getCourses();
    return <HomeClient courses={courses} />;
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return <HomeClient courses={[]} loadError={message} />;
  }
}
