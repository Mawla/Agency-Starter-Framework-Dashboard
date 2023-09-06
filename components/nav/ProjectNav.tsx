"use client";

import { usePathname } from "next/navigation";
import { Button } from "../ui/button";
import Link from "next/link";

export default function ProjectNav({
  links,
}: {
  links: { label: string; href: string }[];
}) {
  const pathname = usePathname();

  return (
    <div className="flex gap-2">
      {links.map(({ label, href }) => {
        const isActive = pathname === href;

        return (
          <Button variant={isActive ? "default" : "outline"}>
            <Link href={href} className="flex gap-1 items-center">
              {label}
            </Link>
          </Button>
        );
      })}
    </div>
  );
}
