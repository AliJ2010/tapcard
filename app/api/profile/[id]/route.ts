import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const data = await req.json();
  const { customLinks, slug, ...profileData } = data;
  if (slug) {
    const existing = await prisma.profile.findUnique({ where: { slug } });
    if (existing && existing.id !== id) {
      return NextResponse.json({ error: "Slug already taken" }, { status: 400 });
    }
  }
  const profile = await prisma.profile.update({
    where: { id, userId: (session.user as any).id },
    data: {
      ...profileData,
      ...(slug ? { slug } : {}),
      ...(customLinks !== undefined ? {
        customLinks: {
          deleteMany: {},
          create: customLinks.map((l: any, i: number) => ({ ...l, order: i })),
        },
      } : {}),
    },
    include: { customLinks: { orderBy: { order: "asc" } }, taps: { orderBy: { createdAt: "desc" }, take: 100 } },
  });
  return NextResponse.json(profile);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.profile.delete({ where: { id, userId: (session.user as any).id } });
  return NextResponse.json({ success: true });
}
