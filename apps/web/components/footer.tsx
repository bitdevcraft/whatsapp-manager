import { Facebook, Instagram, Linkedin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
export default function Footer() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col justify-center items-center gap-8">
      <div className="flex justify-between items-center w-full">
        <Image alt="logo" height={100} src={"/logo.webp"} width={100} />
        <div className="flex gap-4">
          <Link
            href={"https://www.facebook.com/tasweequae.com"}
            target="_blank"
          >
            <Facebook strokeWidth={1.5} />
          </Link>
          <Link
            href={"https://www.instagram.com/tasweeq_digitalmarketing/"}
            target="_blank"
          >
            <Instagram strokeWidth={1.5} />
          </Link>
          <Link
            href={
              "https://www.linkedin.com/company/tasweeq-digital-marketing-management"
            }
            target="_blank"
          >
            <Linkedin strokeWidth={1.5} />
          </Link>
        </div>
      </div>
      <hr className="w-full" />
      <div>All Rights Reserved.</div>
    </div>
  );
}
