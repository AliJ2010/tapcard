"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Nfc, Eye, Edit, QrCode, Copy, Check, ExternalLink, BarChart2, Share2 } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

type Profile = {
  id: string;
  slug: string;
  fullName: string;
  jobTitle?: string;
  company?: string;
  views: number;
  isPublic: boolean;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/profile").then((r) => r.json()).then(setProfile);
    }
  }, [status]);

  if (status === "loading" || !profile) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const profileUrl = `${window.location.origin}/${profile.slug}`;

  function copyLink() {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Sidebar/Nav */}
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Nfc className="text-purple-400" size={24} />
          TapCard
        </Link>
        <div className="flex items-center gap-4">
          {(session?.user as any)?.isAdmin && (
            <Link href="/admin" className="text-sm text-slate-400 hover:text-white">Admin</Link>
          )}
          <Link href="/nfc-setup" className="text-sm text-slate-400 hover:text-white">NFC Setup</Link>
          <button
            onClick={() => import("next-auth/react").then(m => m.signOut({ callbackUrl: "/" }))}
            className="text-sm text-slate-500 hover:text-white"
          >
            Sign out
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Welcome back, {profile.fullName.split(" ")[0]} 👋</h1>
          <p className="text-slate-400 mt-1">Manage your digital business card</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2"><Eye size={15} /> Profile Views</div>
            <div className="text-3xl font-bold text-purple-400">{profile.views}</div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2"><BarChart2 size={15} /> Status</div>
            <div className={`text-lg font-semibold ${profile.isPublic ? "text-green-400" : "text-red-400"}`}>
              {profile.isPublic ? "Public" : "Private"}
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 text-slate-400 text-sm mb-2"><Share2 size={15} /> Your URL</div>
            <div className="text-sm text-slate-300 truncate">/{profile.slug}</div>
          </div>
        </div>

        {/* Card Preview & Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Card */}
          <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/20 border border-purple-700/30 rounded-2xl p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-purple-600/40 flex items-center justify-center text-2xl font-bold text-purple-300 shrink-0">
                {profile.fullName.charAt(0)}
              </div>
              <div>
                <h2 className="text-xl font-bold">{profile.fullName}</h2>
                {profile.jobTitle && <p className="text-purple-300 text-sm">{profile.jobTitle}</p>}
                {profile.company && <p className="text-slate-400 text-sm">{profile.company}</p>}
              </div>
            </div>
            <div className="flex gap-3 flex-wrap">
              <Link
                href={`/${profile.slug}`}
                target="_blank"
                className="flex items-center gap-1.5 text-sm bg-white/10 hover:bg-white/15 rounded-lg px-3 py-2 transition-colors"
              >
                <ExternalLink size={14} /> View Profile
              </Link>
              <Link
                href="/edit"
                className="flex items-center gap-1.5 text-sm bg-purple-600 hover:bg-purple-500 rounded-lg px-3 py-2 transition-colors"
              >
                <Edit size={14} /> Edit Card
              </Link>
            </div>
          </div>

          {/* Share */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="font-semibold mb-4">Share Your Card</h3>
            <div className="flex gap-2 mb-4">
              <input
                readOnly
                value={profileUrl}
                className="flex-1 bg-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 border border-slate-700"
              />
              <button
                onClick={copyLink}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors"
              >
                {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
              </button>
            </div>
            <button
              onClick={() => setShowQR(!showQR)}
              className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 mb-4"
            >
              <QrCode size={16} />
              {showQR ? "Hide" : "Show"} QR Code
            </button>
            {showQR && (
              <div className="flex justify-center p-4 bg-white rounded-xl">
                <QRCodeCanvas value={profileUrl} size={160} />
              </div>
            )}
            <Link
              href="/nfc-setup"
              className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mt-4 transition-colors"
            >
              <Nfc size={16} />
              How to set up NFC tag →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
