import CreateForm from "@/components/forms/CreateForm";

export default async function Page() {
  return (
    <div className="grid grid-cols-4 gap-10 p-10">
      <div className="">
        <CreateForm />
      </div>

      <div className="border h-full col-span-3 p-4 font-mono text-sm bg-gray-100">
        …deploy log here?
      </div>
    </div>
  );
}
