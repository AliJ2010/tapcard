import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { profileId } = await req.json();
  const ua = req.headers.get("user-agent") || "";
  const device = /mobile|android|iphone|ipad/i.test(ua) ? "mobile" : "desktop";
  await prisma.tap.create({ data: { profileId, device } });
  return NextResponse.json({ success: true });
}
