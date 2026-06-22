"use client";
import { Phone, Mail, Globe, MessageCircle, Download, Share2, ExternalLink, Link } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useState, useEffect } from "react";
import { formatUrl } from "@/lib/utils";

type Profile = {
  id: string;
  fullName: string;
  jobTitle?: string | null;
  company?: string | null;
  bio?: string | null;
  photoUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  whatsapp?: string | null;
  slug: string;
  theme: string;
  sectionOrder: string;
  customLinks: { label: string; url: string; icon: string }[];
  user: { plan: string };
};

const THEMES: Record<string, { bg: string; card: string; border: string; text: string; sub: string; accent: string; banner: string }> = {
  dark: {
    bg: "bg-gradient-to-b from-slate-900 to-slate-950",
    card: "bg-slate-900",
    border: "border-slate-800",
    text: "text-white",
    sub: "text-slate-400",
    accent: "bg-purple-600",
    banner: "bg-gradient-to-r from-purple-700 via-purple-600 to-pink-600",
  },
  light: {
    bg: "bg-gradient-to-b from-gray-50 to-white",
    card: "bg-white",
    border: "border-gray-200",
    text: "text-gray-900",
    sub: "text-gray-500",
    accent: "bg-indigo-600",
    banner: "bg-gradient-to-r from-indigo-400 via-blue-400 to-cyan-400",
  },
  gradient: {
    bg: "bg-gradient-to-b from-violet-950 via-purple-900 to-fuchsia-950",
    card: "bg-white/10 backdrop-blur-sm",
    border: "border-white/20",
    text: "text-white",
    sub: "text-purple-200",
    accent: "bg-fuchsia-500",
    banner: "bg-gradient-to-r from-violet-500 via-fuchsia-500 to-pink-500",
  },
  minimal: {
    bg: "bg-white",
    card: "bg-gray-50",
    border: "border-gray-100",
    text: "text-gray-900",
    sub: "text-gray-400",
    accent: "bg-gray-900",
    banner: "bg-gray-900",
  },
};

export default function PublicProfile({ profile, vcard }: { profile: Profile; vcard: string }) {
  const [showQR, setShowQR] = useState(false);
  const t = THEMES[profile.theme] || THEMES.dark;
  const isPro = profile.user?.plan !== "free";

  useEffect(() => {
    fetch("/api/tap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profileId: profile.id }),
    }).catch(() => {});
  }, [profile.id]);

  function downloadVCard() {
    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${profile.fullName.replace(/\s+/g, "_")}.vcf`;
    a.click();
  }

  function share() {
    if (navigator.share) {
      navigator.share({ title: profile.fullName, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }

  const sections = profile.sectionOrder ? profile.sectionOrder.split(",") : ["contact", "social", "links"];

  const contactSection = (
    <div key="contact" className="space-y-3 mb-6">
      {profile.phone && (
        <a href={`tel:${profile.phone}`} className={`flex items-center gap-3 ${t.card} border ${t.border} rounded-xl px-4 py-3.5 hover:opacity-80 transition-opacity group`}>
          <Phone size={18} className="text-green-400 shrink-0" />
          <div><div className={`text-xs ${t.sub}`}>Phone</div><div className={`${t.text} text-sm font-medium`}>{profile.phone}</div></div>
          <ExternalLink size={14} className={`ml-auto ${t.sub}`} />
        </a>
      )}
      {profile.email && (
        <a href={`mailto:${profile.email}`} className={`flex items-center gap-3 ${t.card} border ${t.border} rounded-xl px-4 py-3.5 hover:opacity-80 transition-opacity group`}>
          <Mail size={18} className="text-blue-400 shrink-0" />
          <div><div className={`text-xs ${t.sub}`}>Email</div><div className={`${t.text} text-sm font-medium`}>{profile.email}</div></div>
          <ExternalLink size={14} className={`ml-auto ${t.sub}`} />
        </a>
      )}
      {profile.website && (
        <a href={formatUrl(profile.website)} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 ${t.card} border ${t.border} rounded-xl px-4 py-3.5 hover:opacity-80 transition-opacity group`}>
          <Globe size={18} className="text-purple-400 shrink-0" />
          <div><div className={`text-xs ${t.sub}`}>Website</div><div className={`${t.text} text-sm font-medium`}>{profile.website}</div></div>
          <ExternalLink size={14} className={`ml-auto ${t.sub}`} />
        </a>
      )}
      {profile.whatsapp && (
        <a href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-3 ${t.card} border ${t.border} rounded-xl px-4 py-3.5 hover:opacity-80 transition-opacity group`}>
          <MessageCircle size={18} className="text-green-400 shrink-0" />
          <div><div className={`text-xs ${t.sub}`}>WhatsApp</div><div className={`${t.text} text-sm font-medium`}>{profile.whatsapp}</div></div>
          <ExternalLink size={14} className={`ml-auto ${t.sub}`} />
        </a>
      )}
    </div>
  );

  const socialSection = (profile.linkedin || profile.instagram || profile.twitter) ? (
    <div key="social" className="flex flex-wrap justify-center gap-3 mb-6">
      {profile.linkedin && (
        <a href={formatUrl(profile.linkedin)} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-600/30 rounded-xl hover:opacity-80 transition-opacity text-sm text-blue-400 font-medium`}>
          <Link size={14} /> LinkedIn
        </a>
      )}
      {profile.instagram && (
        <a href={formatUrl(profile.instagram)} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 px-4 py-2 bg-pink-600/20 border border-pink-600/30 rounded-xl hover:opacity-80 transition-opacity text-sm text-pink-400 font-medium`}>
          <Link size={14} /> Instagram
        </a>
      )}
      {profile.twitter && (
        <a href={formatUrl(profile.twitter)} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 px-4 py-2 bg-sky-600/20 border border-sky-600/30 rounded-xl hover:opacity-80 transition-opacity text-sm text-sky-400 font-medium`}>
          <Link size={14} /> Twitter
        </a>
      )}
    </div>
  ) : null;

  const linksSection = profile.customLinks.length > 0 ? (
    <div key="links" className="space-y-3 mb-6">
      {profile.customLinks.map((link, i) => (
        <a key={i} href={formatUrl(link.url)} target="_blank" rel="noopener noreferrer"
          className={`flex items-center justify-center gap-2 w-full py-3.5 ${t.card} border ${t.border} hover:opacity-80 rounded-xl ${t.text} text-sm font-medium transition-opacity`}>
          {link.label} <ExternalLink size={13} className={t.sub} />
        </a>
      ))}
    </div>
  ) : null;

  const sectionMap: Record<string, React.ReactNode> = {
    contact: contactSection,
    social: socialSection,
    links: linksSection,
  };

  return (
    <div className={`min-h-screen ${t.bg}`}>
      <div className={`h-32 ${t.banner}`} />
      <div className="max-w-sm mx-auto px-4 -mt-16 pb-12">
        <div className="flex flex-col items-center mb-6">
          {profile.photoUrl ? (
            <img src={profile.photoUrl} alt={profile.fullName} className="w-28 h-28 rounded-full border-4 border-slate-950 object-cover shadow-xl" />
          ) : (
            <div className={`w-28 h-28 rounded-full border-4 border-slate-950 ${t.accent} flex items-center justify-center text-4xl font-bold text-white shadow-xl`}>
              {profile.fullName.charAt(0)}
            </div>
          )}
          <h1 className={`text-2xl font-bold ${t.text} mt-4 text-center`}>{profile.fullName}</h1>
          {profile.jobTitle && <p className="text-purple-300 text-sm font-medium mt-0.5 text-center">{profile.jobTitle}</p>}
          {profile.company && <p className={`${t.sub} text-sm text-center`}>{profile.company}</p>}
          {profile.bio && <p className={`${t.sub} text-sm text-center mt-3 leading-relaxed`}>{profile.bio}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button onClick={downloadVCard} className={`flex items-center justify-center gap-2 py-3 ${t.accent} hover:opacity-90 rounded-xl font-semibold text-white text-sm transition-opacity`}>
            <Download size={16} /> Save Contact
          </button>
          <button onClick={share} className={`flex items-center justify-center gap-2 py-3 ${t.card} border ${t.border} hover:opacity-80 rounded-xl font-semibold ${t.text} text-sm transition-opacity`}>
            <Share2 size={16} /> Share
          </button>
        </div>

        {sections.map(s => sectionMap[s])}

        <button onClick={() => setShowQR(!showQR)} className={`w-full py-2.5 text-sm ${t.sub} hover:opacity-80 transition-opacity`}>
          {showQR ? "Hide" : "Show"} QR Code
        </button>
        {showQR && (
          <div className="flex justify-center mt-3 p-4 bg-white rounded-2xl">
            <QRCodeCanvas value={typeof window !== "undefined" ? window.location.href : ""} size={160} />
          </div>
        )}

        {!isPro && (
          <a href="/" className={`block text-center mt-8 text-xs ${t.sub} hover:opacity-80`}>
            Powered by <span className="font-semibold">RelayCrd</span>
          </a>
        )}
      </div>
    </div>
  );
}
