import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await prisma.profile.findUnique({
    where: { slug },
    include: { customLinks: { orderBy: { order: "asc" } } },
  });
  if (!profile || !profile.isPublic) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  // Increment views
  await prisma.profile.update({
    where: { id: profile.id },
    data: { views: { increment: 1 } },
  });
  return NextResponse.json(profile);
}
