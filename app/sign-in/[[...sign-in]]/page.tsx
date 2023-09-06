import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="grid place-items-center items-center h-screen">
      <SignIn />
    </div>
  );
}
