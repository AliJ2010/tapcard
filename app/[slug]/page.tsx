import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { generateVCard, formatUrl } from "@/lib/utils";
import PublicProfile from "@/components/PublicProfile";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await prisma.profile.findUnique({ where: { slug } });
  if (!profile) return { title: "Profile Not Found" };
  return {
    title: `${profile.fullName} — TapCard`,
    description: profile.bio || `${profile.jobTitle || ""} ${profile.company ? "at " + profile.company : ""}`.trim(),
  };
}

export default async function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await prisma.profile.findUnique({
    where: { slug },
    include: { customLinks: { orderBy: { order: "asc" } } },
  });

  if (!profile || !profile.isPublic) notFound();

  // Increment views (fire and forget)
  prisma.profile.update({ where: { id: profile.id }, data: { views: { increment: 1 } } }).catch(() => {});

  const vcard = generateVCard(profile);

  return <PublicProfile profile={profile as any} vcard={vcard} />;
}
