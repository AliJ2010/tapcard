import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!(session?.user as any)?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const users = await prisma.user.findMany({
    include: { profiles: { include: { taps: true } } },
    orderBy: { createdAt: "desc" },
  });
  const totalTaps = await prisma.tap.count();
  const totalProfiles = await prisma.profile.count();
  return NextResponse.json({ users, stats: { totalTaps, totalProfiles, totalUsers: users.length } });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!(session?.user as any)?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { userId, plan } = await req.json();
  if (!["free", "pro", "business"].includes(plan)) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  const user = await prisma.user.update({ where: { id: userId }, data: { plan } });
  return NextResponse.json({ success: true, plan: user.plan });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!(session?.user as any)?.isAdmin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { userId } = await req.json();
  await prisma.user.delete({ where: { id: userId } });
  return NextResponse.json({ success: true });
}
