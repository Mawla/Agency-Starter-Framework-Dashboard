import { Toaster } from "@/components/ui/toaster";

import "./globals.css";
import type { Metadata } from "next";
import { ClerkProvider, UserButton } from "@clerk/nextjs";
import Link from "next/link";
import Logo from "@/components/brand/Logo";
import { dark } from "@clerk/themes";

export const metadata: Metadata = {
  title: "Saas Growth Websites",
  description: "SaaS Growth websites",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="min-h-screen">
          <div className="bg-slate-900 p-3 min-h-screen text-white">
            <div className="pb-3 flex items-center">
              <div className="w-[200px] shrink-0">
                <Link href="/projects">
                  <Logo />
                </Link>
              </div>

              <div className="ml-auto">
                <UserButton
                  showName={true}
                  appearance={{ baseTheme: dark }}
                  afterSignOutUrl="/sign-in"
                />
              </div>
            </div>
            <div className="bg-white rounded-t-lg shadow-sm border border-gray-100 text-slate-800">
              {children}
            </div>
          </div>
          <Toaster />
        </body>
      </html>
    </ClerkProvider>
  );
}
