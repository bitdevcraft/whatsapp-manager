import Image from "next/image";
import { NavbarMenu } from "./navbar-menu";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Button } from "@workspace/ui/components/button";
export default function Navbar() {
  return (
    <div className="max-w-5xl mx-auto absolute top-0 left-0 right-0 z-999">
      <div className="flex justify-between items-center px-4 py-6">
        <Link href={"/"}>
          <Image
            className="dark:invert"
            src="/logo.png"
            alt="Next.js logo"
            width={180}
            height={38}
            priority
          />
        </Link>
        <ul className="flex justify-end items-center gap-4">
          <li>
            <NavbarMenu />
          </li>
          <li>
            <DropdownMenu>
              <DropdownMenuTrigger>
                <Button>Login</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="space-y-1">
                <DropdownMenuItem asChild>
                  <Link
                    href={"/login"}
                    className="flex justify-start font-semibold px-4"
                  >
                    <p>Login</p>
                    <div className="flex gap-2"></div>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        </ul>
      </div>
    </div>
  );
}
