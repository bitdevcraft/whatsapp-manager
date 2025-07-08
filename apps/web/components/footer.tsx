import { Facebook, Instagram, Linkedin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
export default function Footer() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-8 flex flex-col justify-center items-center gap-8">
      <div className="flex justify-between items-center w-full">
        <Image src={"/logo.png"} alt="logo" width={100} height={100} />
        <div className="flex gap-4">
          <Link target="_blank" href={"https://www.facebook.com/ingenious.ae"}>
            <Facebook strokeWidth={1.5} />
          </Link>
          <Link
            target="_blank"
            href={"https://www.instagram.com/ingenious_digitalmarketing/"}
          >
            <Instagram strokeWidth={1.5} />
          </Link>
          <Link
            target="_blank"
            href={
              "https://www.linkedin.com/company/ingenious-digital-marketing-management"
            }
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
