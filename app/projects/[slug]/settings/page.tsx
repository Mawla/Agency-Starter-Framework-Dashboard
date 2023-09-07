import DeleteButton from "@/components/project/DeleteButton";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { slug: string } }) {
  const slug = params.slug;

  if (!slug) {
    notFound();
  }

  return (
    <div className="py-10 border-t">
      <DeleteButton project={slug} />
      <hr />
      manage settings here
      <hr />
      <ul>
        <li>domains</li>
        <li>deployments</li>
        <li>redeploy</li>
      </ul>
    </div>
  );
}
