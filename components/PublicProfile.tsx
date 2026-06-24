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
  bannerUrl?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  linkedin?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  whatsapp?: string | null;
  slug: string;
  theme: string;
  accentColor?: string | null;
  bgColor?: string | null;
  gradientFrom?: string | null;
  gradientTo?: string | null;
  sectionOrder: string;
  customLinks: { label: string; url: string; icon: string }[];
  user: { plan: string };
};

type ThemeVars = {
  bgStyle: React.CSSProperties;
  bannerStyle: React.CSSProperties;
  cardStyle: React.CSSProperties;
  borderStyle: React.CSSProperties;
  accentStyle: React.CSSProperties; accentText: string;
  text: string;
  sub: string;
};

function isLight(hex: string): boolean {
  const c = hex.replace("#", "");
  if (c.length < 6) return false;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  return (r * 299 + g * 587 + b * 114) / 1000 > 128;
}

function buildTheme(profile: Profile): ThemeVars {
  const { theme, accentColor, bgColor, gradientFrom, gradientTo } = profile;

  if (theme === "gradient") {
    const gFrom = gradientFrom || "#7c3aed";
    const gTo = gradientTo || "#db2777";
    const accent = accentColor || "#a855f7";
    return {
      bgStyle: { background: `linear-gradient(to bottom, ${gFrom}, ${gTo})` },
      bannerStyle: { background: `linear-gradient(135deg, ${gFrom}, ${gTo})` },
      cardStyle: { backgroundColor: "rgba(255,255,255,0.1)", backdropFilter: "blur(8px)" },
      borderStyle: { borderColor: "rgba(255,255,255,0.2)" },
      accentStyle: { backgroundColor: accent }, accentText: isLight(accent) ? "text-gray-900" : "text-white",
      text: "text-white",
      sub: "text-purple-200",
    };
  }

  if (theme === "light") {
    const accent = accentColor || "#4f46e5";
    return {
      bgStyle: { background: "linear-gradient(to bottom, #f9fafb, #ffffff)" },
      bannerStyle: { background: "linear-gradient(135deg, #818cf8, #38bdf8)" },
      cardStyle: { backgroundColor: "#ffffff" },
      borderStyle: { borderColor: "#e5e7eb" },
      accentStyle: { backgroundColor: accent }, accentText: isLight(accent) ? "text-gray-900" : "text-white",
      text: "text-gray-900",
      sub: "text-gray-500",
    };
  }

  if (theme === "minimal") {
    const accent = accentColor || "#111827";
    return {
      bgStyle: { backgroundColor: "#ffffff" },
      bannerStyle: { backgroundColor: "#111827" },
      cardStyle: { backgroundColor: "#f9fafb" },
      borderStyle: { borderColor: "#f3f4f6" },
      accentStyle: { backgroundColor: accent }, accentText: isLight(accent) ? "text-gray-900" : "text-white",
      text: "text-gray-900",
      sub: "text-gray-400",
    };
  }

  if (theme === "custom" || bgColor) {
    const bg = bgColor || "#0f172a";
    const accent = accentColor || "#9333ea";
    const gFrom = gradientFrom || accent;
    const gTo = gradientTo || "#db2777";
    const light = isLight(bg);
    return {
      bgStyle: { backgroundColor: bg },
      bannerStyle: { background: `linear-gradient(135deg, ${gFrom}, ${gTo})` },
      cardStyle: { backgroundColor: light ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.07)" },
      borderStyle: { borderColor: light ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)" },
      accentStyle: { backgroundColor: accent }, accentText: isLight(accent) ? "text-gray-900" : "text-white",
      text: light ? "text-gray-900" : "text-white",
      sub: light ? "text-gray-500" : "text-slate-400",
    };
  }

  // dark (default)
  const accent = accentColor || "#9333ea";
  return {
    bgStyle: { background: "linear-gradient(to bottom, #0f172a, #020617)" },
    bannerStyle: { background: "linear-gradient(135deg, #6d28d9, #9333ea, #db2777)" },
    cardStyle: { backgroundColor: "#0f172a" },
    borderStyle: { borderColor: "#1e293b" },
    accentStyle: { backgroundColor: accent }, accentText: isLight(accent) ? "text-gray-900" : "text-white",
    text: "text-white",
    sub: "text-slate-400",
  };
}

export default function PublicProfile({ profile, vcard }: { profile: Profile; vcard: string }) {
  const [showQR, setShowQR] = useState(false);
  const t = buildTheme(profile);
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
        <a href={`tel:${profile.phone}`} className="flex items-center gap-3 border rounded-xl px-4 py-3.5 hover:opacity-80 transition-opacity" style={{ ...t.cardStyle, ...t.borderStyle }}>
          <Phone size={18} className="text-green-400 shrink-0" />
          <div><div className={`text-xs ${t.sub}`}>Phone</div><div className={`${t.text} text-sm font-medium`}>{profile.phone}</div></div>
          <ExternalLink size={14} className={`ml-auto ${t.sub}`} />
        </a>
      )}
      {profile.email && (
        <a href={`mailto:${profile.email}`} className="flex items-center gap-3 border rounded-xl px-4 py-3.5 hover:opacity-80 transition-opacity" style={{ ...t.cardStyle, ...t.borderStyle }}>
          <Mail size={18} className="text-blue-400 shrink-0" />
          <div><div className={`text-xs ${t.sub}`}>Email</div><div className={`${t.text} text-sm font-medium`}>{profile.email}</div></div>
          <ExternalLink size={14} className={`ml-auto ${t.sub}`} />
        </a>
      )}
      {profile.website && (
        <a href={formatUrl(profile.website)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 border rounded-xl px-4 py-3.5 hover:opacity-80 transition-opacity" style={{ ...t.cardStyle, ...t.borderStyle }}>
          <Globe size={18} className="text-purple-400 shrink-0" />
          <div><div className={`text-xs ${t.sub}`}>Website</div><div className={`${t.text} text-sm font-medium`}>{profile.website}</div></div>
          <ExternalLink size={14} className={`ml-auto ${t.sub}`} />
        </a>
      )}
      {profile.whatsapp && (
        <a href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 border rounded-xl px-4 py-3.5 hover:opacity-80 transition-opacity" style={{ ...t.cardStyle, ...t.borderStyle }}>
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
        <a href={formatUrl(profile.linkedin)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-600/30 rounded-xl hover:opacity-80 transition-opacity text-sm text-blue-400 font-medium">
          <Link size={14} /> LinkedIn
        </a>
      )}
      {profile.instagram && (
        <a href={formatUrl(profile.instagram)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-pink-600/20 border border-pink-600/30 rounded-xl hover:opacity-80 transition-opacity text-sm text-pink-400 font-medium">
          <Link size={14} /> Instagram
        </a>
      )}
      {profile.twitter && (
        <a href={formatUrl(profile.twitter)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-4 py-2 bg-sky-600/20 border border-sky-600/30 rounded-xl hover:opacity-80 transition-opacity text-sm text-sky-400 font-medium">
          <Link size={14} /> Twitter
        </a>
      )}
    </div>
  ) : null;

  const linksSection = profile.customLinks.length > 0 ? (
    <div key="links" className="space-y-3 mb-6">
      {profile.customLinks.map((link, i) => (
        <a key={i} href={formatUrl(link.url)} target="_blank" rel="noopener noreferrer"
          className={`flex items-center justify-center gap-2 w-full py-3.5 border hover:opacity-80 rounded-xl ${t.text} text-sm font-medium transition-opacity`}
          style={{ ...t.cardStyle, ...t.borderStyle }}>
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
    <div className="min-h-screen" style={t.bgStyle}>
      {profile.bannerUrl ? (
        <div className="h-36 w-full" style={{ backgroundImage: `url(${profile.bannerUrl})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      ) : (
        <div className="h-36 w-full" style={t.bannerStyle} />
      )}

      <div className="max-w-sm mx-auto px-4 -mt-16 pb-12">
        <div className="flex flex-col items-center mb-6">
          {profile.photoUrl ? (
            <img src={profile.photoUrl} alt={profile.fullName} className="w-28 h-28 rounded-full border-4 object-cover shadow-xl" style={{ borderColor: "rgba(0,0,0,0.5)" }} />
          ) : (
            <div className="w-28 h-28 rounded-full border-4 flex items-center justify-center text-4xl font-bold shadow-xl" style={{ color: isLight(profile.accentColor || "#9333ea") ? "#111827" : "#ffffff", ...t.accentStyle, borderColor: "rgba(0,0,0,0.5)" }}>
              {profile.fullName.charAt(0)}
            </div>
          )}
          <h1 className={`text-2xl font-bold ${t.text} mt-4 text-center`}>{profile.fullName}</h1>
          {profile.jobTitle && <p className={`text-sm font-medium mt-0.5 text-center ${t.sub}`}>{profile.jobTitle}</p>}
          {profile.company && <p className={`${t.sub} text-sm text-center`}>{profile.company}</p>}
          {profile.bio && <p className={`${t.sub} text-sm text-center mt-3 leading-relaxed`}>{profile.bio}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button onClick={downloadVCard} className={`flex items-center justify-center gap-2 py-3 hover:opacity-90 rounded-xl font-semibold text-sm transition-opacity ${t.accentText}`} style={t.accentStyle}>
            <Download size={16} /> Save Contact
          </button>
          <button onClick={share} className={`flex items-center justify-center gap-2 py-3 border hover:opacity-80 rounded-xl font-semibold ${t.text} text-sm transition-opacity`} style={{ ...t.cardStyle, ...t.borderStyle }}>
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
