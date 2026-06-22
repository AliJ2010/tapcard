import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { generateSlug } from "@/lib/utils";

export async function POST(req: NextRequest) {
  const { email, password, fullName } = await req.json();
  if (!email || !password || !fullName) {
    return NextResponse.json({ error: "All fields required" }, { status: 400 });
  }
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use" }, { status: 400 });
  }
  const hashed = await bcrypt.hash(password, 12);
  const baseSlug = generateSlug(fullName);
  let slug = baseSlug;
  let i = 1;
  while (await prisma.profile.findUnique({ where: { slug } })) {
    slug = `${baseSlug}-${i++}`;
  }
  const user = await prisma.user.create({
    data: {
      email,
      password: hashed,
      profile: {
        create: { slug, fullName, email },
      },
    },
  });
  return NextResponse.json({ success: true, userId: user.id });
}
