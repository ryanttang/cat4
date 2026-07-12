import { getPublishedAboutSections } from "@/lib/data";
import { brand } from "@/lib/brand";

export const metadata = { title: "About" };

export default async function AboutPage() {
  const sections = await getPublishedAboutSections();

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="text-4xl font-bold text-cat4-light">About {brand.name}</h1>
      <p className="mt-3 text-lg text-cat4-light/70">
        {brand.description}
      </p>

      <div className="mt-12 space-y-12">
        {sections.map((section) => (
          <section key={section.id}>
            <h2 className="text-2xl font-bold text-cat4-light">{section.title}</h2>
            <p className="mt-4 text-lg text-cat4-light/80">{section.body}</p>
          </section>
        ))}
      </div>

      {sections.length === 0 && (
        <p className="mt-10 text-center text-cat4-light/60">Content coming soon.</p>
      )}
    </div>
  );
}
