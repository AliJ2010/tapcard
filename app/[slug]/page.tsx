import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { generateVCard } from "@/lib/utils";
import PublicProfile from "@/components/PublicProfile";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await prisma.profile.findUnique({ where: { slug } });
  if (!profile) return { title: "Profile Not Found" };
  return {
    title: `${profile.fullName} — RelayCrd`,
    description: profile.bio || `${profile.jobTitle || ""} ${profile.company ? "at " + profile.company : ""}`.trim(),
  };
}

export default async function ProfilePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const profile = await prisma.profile.findUnique({
    where: { slug },
    include: { customLinks: { orderBy: { order: "asc" } }, user: { select: { plan: true } } },
  });
  if (!profile || !profile.isPublic) notFound();
  const vcard = generateVCard(profile);
  return <PublicProfile profile={profile as any} vcard={vcard} />;
}
