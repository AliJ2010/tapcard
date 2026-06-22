"use client";
import { Phone, Mail, Globe, MessageCircle, Download, Share2, ExternalLink, Link } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { useState } from "react";
import { formatUrl } from "@/lib/utils";

type Profile = {
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
  customLinks: { label: string; url: string; icon: string }[];
};

export default function PublicProfile({ profile, vcard }: { profile: Profile; vcard: string }) {
  const [showQR, setShowQR] = useState(false);
  const profileUrl = typeof window !== "undefined" ? window.location.href : "";

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-950">
      {/* Header Banner */}
      <div className="h-32 bg-gradient-to-r from-purple-700 via-purple-600 to-pink-600" />

      <div className="max-w-sm mx-auto px-4 -mt-16 pb-12">
        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          {profile.photoUrl ? (
            <img
              src={profile.photoUrl}
              alt={profile.fullName}
              className="w-28 h-28 rounded-full border-4 border-slate-950 object-cover shadow-xl"
            />
          ) : (
            <div className="w-28 h-28 rounded-full border-4 border-slate-950 bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-4xl font-bold text-white shadow-xl">
              {profile.fullName.charAt(0)}
            </div>
          )}
          <h1 className="text-2xl font-bold text-white mt-4 text-center">{profile.fullName}</h1>
          {profile.jobTitle && <p className="text-purple-300 text-sm font-medium mt-0.5 text-center">{profile.jobTitle}</p>}
          {profile.company && <p className="text-slate-400 text-sm text-center">{profile.company}</p>}
          {profile.bio && <p className="text-slate-300 text-sm text-center mt-3 leading-relaxed">{profile.bio}</p>}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={downloadVCard}
            className="flex items-center justify-center gap-2 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold text-white text-sm transition-colors"
          >
            <Download size={16} /> Save Contact
          </button>
          <button
            onClick={share}
            className="flex items-center justify-center gap-2 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl font-semibold text-white text-sm transition-colors"
          >
            <Share2 size={16} /> Share
          </button>
        </div>

        {/* Contact Links */}
        <div className="space-y-3 mb-6">
          {profile.phone && (
            <a href={`tel:${profile.phone}`} className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3.5 hover:border-purple-600 transition-colors group">
              <Phone size={18} className="text-green-400 shrink-0" />
              <div>
                <div className="text-xs text-slate-500">Phone</div>
                <div className="text-white text-sm font-medium">{profile.phone}</div>
              </div>
              <ExternalLink size={14} className="ml-auto text-slate-600 group-hover:text-slate-400" />
            </a>
          )}
          {profile.email && (
            <a href={`mailto:${profile.email}`} className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3.5 hover:border-purple-600 transition-colors group">
              <Mail size={18} className="text-blue-400 shrink-0" />
              <div>
                <div className="text-xs text-slate-500">Email</div>
                <div className="text-white text-sm font-medium">{profile.email}</div>
              </div>
              <ExternalLink size={14} className="ml-auto text-slate-600 group-hover:text-slate-400" />
            </a>
          )}
          {profile.website && (
            <a href={formatUrl(profile.website)} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3.5 hover:border-purple-600 transition-colors group">
              <Globe size={18} className="text-purple-400 shrink-0" />
              <div>
                <div className="text-xs text-slate-500">Website</div>
                <div className="text-white text-sm font-medium">{profile.website}</div>
              </div>
              <ExternalLink size={14} className="ml-auto text-slate-600 group-hover:text-slate-400" />
            </a>
          )}
          {profile.whatsapp && (
            <a href={`https://wa.me/${profile.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3.5 hover:border-purple-600 transition-colors group">
              <MessageCircle size={18} className="text-green-400 shrink-0" />
              <div>
                <div className="text-xs text-slate-500">WhatsApp</div>
                <div className="text-white text-sm font-medium">{profile.whatsapp}</div>
              </div>
              <ExternalLink size={14} className="ml-auto text-slate-600 group-hover:text-slate-400" />
            </a>
          )}
        </div>

        {/* Social Links */}
        {(profile.linkedin || profile.instagram || profile.twitter) && (
          <div className="flex justify-center gap-4 mb-6">
            {profile.linkedin && (
              <a href={formatUrl(profile.linkedin)} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-600/30 rounded-xl hover:bg-blue-600/30 transition-colors text-sm text-blue-400 font-medium">
                <Link size={16} /> LinkedIn
              </a>
            )}
            {profile.instagram && (
              <a href={formatUrl(profile.instagram)} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-pink-600/20 border border-pink-600/30 rounded-xl hover:bg-pink-600/30 transition-colors text-sm text-pink-400 font-medium">
                <Link size={16} /> Instagram
              </a>
            )}
            {profile.twitter && (
              <a href={formatUrl(profile.twitter)} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-sky-600/20 border border-sky-600/30 rounded-xl hover:bg-sky-600/30 transition-colors text-sm text-sky-400 font-medium">
                <Link size={16} /> Twitter
              </a>
            )}
          </div>
        )}

        {/* Custom Links */}
        {profile.customLinks.length > 0 && (
          <div className="space-y-3 mb-6">
            {profile.customLinks.map((link, i) => (
              <a
                key={i}
                href={formatUrl(link.url)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3.5 bg-slate-900 border border-slate-800 hover:border-purple-600 rounded-xl text-white text-sm font-medium transition-colors"
              >
                {link.label}
                <ExternalLink size={13} className="text-slate-500" />
              </a>
            ))}
          </div>
        )}

        {/* QR Code Toggle */}
        <button
          onClick={() => setShowQR(!showQR)}
          className="w-full py-2.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
        >
          {showQR ? "Hide" : "Show"} QR Code
        </button>
        {showQR && (
          <div className="flex justify-center mt-3 p-4 bg-white rounded-2xl">
            <QRCodeCanvas value={typeof window !== "undefined" ? window.location.href : ""} size={160} />
          </div>
        )}

        {/* Branding */}
        <div className="text-center mt-8 text-xs text-slate-700">
          Powered by <span className="text-slate-500">TapCard</span>
        </div>
      </div>
    </div>
  );
}
