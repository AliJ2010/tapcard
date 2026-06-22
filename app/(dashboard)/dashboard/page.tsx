"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Nfc, Eye, Edit, QrCode, Copy, Check, ExternalLink, Plus, Trash2, BarChart2, Smartphone, Monitor, Crown } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

type Tap = { id: string; device: string | null; createdAt: string };
type Profile = {
  id: string;
  slug: string;
  fullName: string;
  jobTitle?: string;
  company?: string;
  cardName: string;
  theme: string;
  isPublic: boolean;
  taps: Tap[];
};

const PLAN_LIMITS: Record<string, number> = { free: 1, pro: 3, business: 10 };

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [loading, setLoading] = useState(true);

  const plan = (session?.user as any)?.plan || "free";
  const limit = PLAN_LIMITS[plan] || 1;

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/profile").then(r => r.json()).then(data => {
        setProfiles(data);
        if (data.length > 0) setActiveId(data[0].id);
        setLoading(false);
      });
    }
  }, [status]);

  const active = profiles.find(p => p.id === activeId);
  const profileUrl = active && typeof window !== "undefined" ? `${window.location.origin}/${active.slug}` : "";

  function copyLink() {
    navigator.clipboard.writeText(profileUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function addCard() {
    const name = prompt("Card name (e.g. Work, Personal):");
    if (!name) return;
    const fullName = (session?.user as any)?.name || session?.user?.email?.split("@")[0] || "My Name";
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ fullName, cardName: name }),
    });
    const data = await res.json();
    if (!res.ok) { alert(data.error); return; }
    setProfiles(p => [...p, data]);
    setActiveId(data.id);
  }

  async function deleteCard(id: string) {
    if (profiles.length === 1) { alert("You need at least one card."); return; }
    if (!confirm("Delete this card?")) return;
    await fetch(`/api/profile/${id}`, { method: "DELETE" });
    const next = profiles.filter(p => p.id !== id);
    setProfiles(next);
    setActiveId(next[0]?.id || null);
  }

  if (loading || status === "loading") return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const totalTaps = active?.taps.length || 0;
  const mobileTaps = active?.taps.filter(t => t.device === "mobile").length || 0;
  const desktopTaps = active?.taps.filter(t => t.device === "desktop").length || 0;
  const last7 = active?.taps.filter(t => new Date(t.createdAt) > new Date(Date.now() - 7 * 86400000)).length || 0;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
          <Nfc className="text-purple-400" size={24} />
          RelayCrd
        </Link>
        <div className="flex items-center gap-4">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${plan === "business" ? "bg-amber-500/20 text-amber-400" : plan === "pro" ? "bg-purple-500/20 text-purple-400" : "bg-slate-700 text-slate-400"}`}>
            {plan.charAt(0).toUpperCase() + plan.slice(1)}
          </span>
          {(session?.user as any)?.isAdmin && <Link href="/admin" className="text-sm text-slate-400 hover:text-white">Admin</Link>}
          <Link href="/nfc-setup" className="text-sm text-slate-400 hover:text-white">NFC Setup</Link>
          <button onClick={() => import("next-auth/react").then(m => m.signOut({ callbackUrl: "/" }))} className="text-sm text-slate-500 hover:text-white">Sign out</button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Card Tabs */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          {profiles.map(p => (
            <div key={p.id} className="flex items-center gap-1">
              <button
                onClick={() => setActiveId(p.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeId === p.id ? "bg-purple-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"}`}
              >
                {p.cardName}
              </button>
              {profiles.length > 1 && (
                <button onClick={() => deleteCard(p.id)} className="text-slate-600 hover:text-red-400 p-1">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          ))}
          {profiles.length < limit ? (
            <button onClick={addCard} className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white border border-dashed border-slate-700 hover:border-slate-500 transition-colors">
              <Plus size={14} /> Add Card
            </button>
          ) : plan !== "business" && (
            <Link href="/pricing" className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-amber-400 border border-dashed border-amber-700 hover:border-amber-500 transition-colors">
              <Crown size={14} /> Upgrade for more
            </Link>
          )}
        </div>

        {active && (
          <>
            {/* Analytics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Eye size={11} /> Total Taps</div>
                <div className="text-2xl font-bold text-purple-400">{totalTaps}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><BarChart2 size={11} /> Last 7 Days</div>
                <div className="text-2xl font-bold text-green-400">{last7}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Smartphone size={11} /> Mobile</div>
                <div className="text-2xl font-bold text-blue-400">{mobileTaps}</div>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <div className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Monitor size={11} /> Desktop</div>
                <div className="text-2xl font-bold text-slate-400">{desktopTaps}</div>
              </div>
            </div>

            {/* Card + Share */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/20 border border-purple-700/30 rounded-2xl p-6">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-14 h-14 rounded-full bg-purple-600/40 flex items-center justify-center text-xl font-bold text-purple-300 shrink-0">
                    {active.fullName.charAt(0)}
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-0.5">{active.cardName}</div>
                    <h2 className="text-lg font-bold">{active.fullName}</h2>
                    {active.jobTitle && <p className="text-purple-300 text-sm">{active.jobTitle}</p>}
                    {active.company && <p className="text-slate-400 text-sm">{active.company}</p>}
                  </div>
                </div>
                <div className="flex gap-3 flex-wrap">
                  <Link href={`/${active.slug}`} target="_blank" className="flex items-center gap-1.5 text-sm bg-white/10 hover:bg-white/15 rounded-lg px-3 py-2 transition-colors">
                    <ExternalLink size={14} /> View
                  </Link>
                  <Link href={`/edit/${active.id}`} className="flex items-center gap-1.5 text-sm bg-purple-600 hover:bg-purple-500 rounded-lg px-3 py-2 transition-colors">
                    <Edit size={14} /> Edit Card
                  </Link>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                <h3 className="font-semibold mb-4">Share</h3>
                <div className="flex gap-2 mb-4">
                  <input readOnly value={profileUrl} className="flex-1 bg-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 border border-slate-700" />
                  <button onClick={copyLink} className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors">
                    {copied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
                  </button>
                </div>
                <button onClick={() => setShowQR(!showQR)} className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 mb-4">
                  <QrCode size={16} /> {showQR ? "Hide" : "Show"} QR Code
                </button>
                {showQR && (
                  <div className="flex justify-center p-4 bg-white rounded-xl">
                    <QRCodeCanvas value={profileUrl} size={150} />
                  </div>
                )}
                <Link href="/nfc-setup" className="flex items-center gap-2 text-sm text-slate-400 hover:text-white mt-4">
                  <Nfc size={16} /> NFC Setup Guide →
                </Link>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
