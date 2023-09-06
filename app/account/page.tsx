import { UserProfile } from "@clerk/nextjs";
import Link from "next/link";

export default function Page() {
  return (
    <div className="grid grid-cols-6">
      <div className="col-span-1 p-10">
        <ul className="divide-y divide-y-gray-100">
          <li className="p-2">
            <Link href="/projects">Websites</Link>
          </li>
          <li className="p-2">
            <Link href="/account" className="font-semibold text-blue-600">
              Account
            </Link>
          </li>
        </ul>
      </div>
      <div className="col-span-5 p-10">
        <UserProfile />
      </div>
    </div>
  );
}
