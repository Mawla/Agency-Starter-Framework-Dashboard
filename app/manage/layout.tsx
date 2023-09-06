import Logo from "@/components/brand/Logo";
import "../globals.css";
import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-slate-900 p-3 min-h-screen text-white">
      <div className="pb-3 flex items-center">
        <div className="w-[200px] shrink-0">
          <Link href="/manage">
            <Logo />
          </Link>
        </div>

        <div className="ml-auto">
          <UserButton showName={true} appearance={{ baseTheme: dark }} />
        </div>
      </div>
      <div className="bg-white rounded-t-lg shadow-sm border border-gray-100 text-slate-800">
        {children}
      </div>
    </div>
  );
}
