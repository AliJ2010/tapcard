import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const profile = await prisma.profile.findUnique({
    where: { userId: (session.user as any).id },
    include: { customLinks: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json(profile);
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const data = await req.json();
  const { customLinks, slug, ...profileData } = data;

  // Check slug uniqueness
  if (slug) {
    const existing = await prisma.profile.findUnique({ where: { slug } });
    const myProfile = await prisma.profile.findUnique({ where: { userId: (session.user as any).id } });
    if (existing && existing.id !== myProfile?.id) {
      return NextResponse.json({ error: "Slug already taken" }, { status: 400 });
    }
  }

  const profile = await prisma.profile.update({
    where: { userId: (session.user as any).id },
    data: {
      ...profileData,
      ...(slug ? { slug } : {}),
      ...(customLinks
        ? {
            customLinks: {
              deleteMany: {},
              create: customLinks.map((l: any, i: number) => ({ ...l, order: i })),
            },
          }
        : {}),
    },
    include: { customLinks: { orderBy: { order: "asc" } } },
  });
  return NextResponse.json(profile);
}
