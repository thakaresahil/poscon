// Shared layout for text pages such as About, FAQs and policies
function ContentPage({ eyebrow, title, intro, updated, children }) {
  return (
    <article className="page my-12 max-w-3xl">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h1 className="page-title mt-1">{title}</h1>
      {intro && <p className="muted mt-3 text-lg">{intro}</p>}
      {updated && <p className="mt-2 text-sm text-gray-500">Last updated: {updated}</p>}
      <div className="mt-8 flex flex-col gap-8 leading-relaxed text-gray-800">{children}</div>
    </article>
  );
}

export const Section = ({ title, children }) => (
  <section className="flex flex-col gap-3">
    <h2 className="text-xl font-semibold">{title}</h2>
    {children}
  </section>
);

export default ContentPage;
