import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { tags } = (await req.json()) as { tags: string[] };

  if (!tags) {
    return NextResponse.json({ error: "Missing tag" }, { status: 400 });
  }

  tags.forEach((tag) => {
    revalidateTag(tag, "max");
  });

  return NextResponse.json({ success: true });
}
