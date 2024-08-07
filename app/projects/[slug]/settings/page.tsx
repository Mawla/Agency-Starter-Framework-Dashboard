import DeleteButton from "@/components/project/DeleteButton";
import DeployButton from "@/components/project/DeployButton";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { slug: string } }) {
  const slug = params.slug;

  if (!slug) {
    notFound();
  }

  return (
    <div className="py-10 border-t">
      <div className="flex gap-4 items-center mb-10">
        <DeleteButton project={slug} />

        <DeployButton project={slug} />
      </div>

      <ul className="list-disc list-inside">
        <li>domains</li>
        <li>deployments</li>
        <li>redeploy</li>
      </ul>
    </div>
  );
}
