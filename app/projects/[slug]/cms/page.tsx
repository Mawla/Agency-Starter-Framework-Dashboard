import { getProjectURL } from "@/lib/queries/get-project";
import { notFound } from "next/navigation";

export default async function Page({ params }: { params: { slug: string } }) {
  const slug = params.slug;

  if (!slug) {
    notFound();
  }

  const url = await getProjectURL(slug);

  return (
    <div>
      <iframe
        src={`https://${url}/cms/desk/en;allPages`}
        className="w-[calc(100vw-24px)] h-[calc(100vh-72px)] -mx-10"
      ></iframe>
    </div>
  );
}
