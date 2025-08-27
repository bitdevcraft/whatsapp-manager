import { Button } from "@workspace/ui/components/button";
import Image from "next/image";
import Link from "next/link";

import { NavbarMenu } from "./navbar-menu";
export default function Navbar() {
  return (
    <div className="max-w-5xl mx-auto absolute top-0 left-0 right-0 z-999">
      <div className="flex justify-between items-center px-4 py-6">
        <Link href={"/"}>
          <Image
            alt="Next.js logo"
            className="dark:invert"
            height={38}
            priority
            src="/logo.png"
            width={180}
          />
        </Link>
        <ul className="flex justify-end items-center gap-4">
          <li>
            <NavbarMenu />
          </li>
          <li>
            <Link href={"/sign-in"}>
              <Button>Login</Button>
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}
