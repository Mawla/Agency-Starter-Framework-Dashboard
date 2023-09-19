import CreateForm from "@/components/create/CreateForm";
import CreateLog from "@/components/create/CreateLog";

export default async function Page() {
  return (
    <div className="grid lg:grid-cols-4 gap-10 p-10">
      <div className="lg:col-span-2 2xl:col-span-1">
        <CreateForm />
      </div>

      <div className="border h-full lg:col-span-2 2xl:col-span-3 p-4 font-mono text-sm bg-gray-100">
        <CreateLog />
      </div>
    </div>
  );
}
