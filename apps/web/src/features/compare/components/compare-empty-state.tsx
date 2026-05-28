export function CompareEmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="rounded-[8px] border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </section>
  );
}
