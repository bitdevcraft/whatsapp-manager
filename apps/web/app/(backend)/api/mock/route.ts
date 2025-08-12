// app/api/projects/route.ts

import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // 1. grab cursor from URL ?cursor=…
  const { searchParams } = new URL(request.url);
  const cursor = parseInt(searchParams.get("cursor") ?? "0", 10);
  const pageSize = 4;

  // 2. build mock page of data
  const data = Array.from({ length: pageSize }, (_, i) => ({
    id: i + cursor,
    name: `Project ${i + cursor} (server time: ${Date.now()})`,
  }));

  // 3. calculate pagination cursors
  // @ts-expect-error undefined
  const nextId = cursor < 20 ? data[pageSize - 1].id + 1 : null;
  // @ts-expect-error undefined
  const previousId = cursor > -20 ? data[0].id - pageSize : null;

  // 4. simulate a small delay (optional)
  await new Promise((resolve) => setTimeout(resolve, 300));

  // 5. return JSON
  return NextResponse.json({ data, nextId, previousId });
}
