import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const profiles = await prisma.profile.findMany({
    where: { userId: (session.user as any).id },
    include: { customLinks: { orderBy: { order: "asc" } }, taps: { orderBy: { createdAt: "desc" }, take: 100 } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(profiles);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const userId = (session.user as any).id;
  const plan = (session.user as any).plan;
  const count = await prisma.profile.count({ where: { userId } });
  if (plan === "free" && count >= 1) {
    return NextResponse.json({ error: "Upgrade to Pro to create multiple cards" }, { status: 403 });
  }
  if (plan === "pro" && count >= 3) {
    return NextResponse.json({ error: "Upgrade to Business for more cards" }, { status: 403 });
  }
  const { fullName, cardName } = await req.json();
  const baseSlug = generateSlug(fullName);
  let slug = baseSlug;
  let i = 1;
  while (await prisma.profile.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${i++}`;
  }
  const profile = await prisma.profile.create({
    data: { userId, slug, fullName, cardName: cardName || "My Card" },
    include: { customLinks: true, taps: true },
  });
  return NextResponse.json(profile);
}

function generateSlug(name: string): string {
  return name.toLowerCase().trim().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}
