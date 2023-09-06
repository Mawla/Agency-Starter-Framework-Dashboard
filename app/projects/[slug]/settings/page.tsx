import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { slug: string } }) {
  const slug = params.slug;

  if (!slug) {
    notFound();
  }

  return (
    <div className="py-10 border-t">
      manage settings here
      <ul>
        <li>domains</li>
        <li>deployments</li>
        <li>redeploy</li>
      </ul>
    </div>
  );
}
