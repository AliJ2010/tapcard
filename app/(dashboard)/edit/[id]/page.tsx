"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Nfc, Loader2, Plus, Trash2, ArrowLeft, Check, GripVertical, Image } from "lucide-react";
import { UploadButton } from "@uploadthing/react";
import type { OurFileRouter } from "@/lib/uploadthing";
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove, SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type CustomLink = { label: string; url: string; icon: string };
type Profile = {
  id: string; slug: string; fullName: string; jobTitle: string; company: string; bio: string;
  phone: string; email: string; website: string; linkedin: string; instagram: string;
  twitter: string; whatsapp: string; photoUrl: string; bannerUrl: string;
  isPublic: boolean; theme: string; cardName: string; sectionOrder: string;
  accentColor: string; bgColor: string; gradientFrom: string; gradientTo: string;
  customLinks: CustomLink[];
};

const EMPTY: Profile = {
  id: "", slug: "", fullName: "", jobTitle: "", company: "", bio: "",
  phone: "", email: "", website: "", linkedin: "", instagram: "", twitter: "",
  whatsapp: "", photoUrl: "", bannerUrl: "", isPublic: true, theme: "dark", cardName: "My Card",
  sectionOrder: "contact,social,links", accentColor: "", bgColor: "", gradientFrom: "#7c3aed", gradientTo: "#db2777",
  customLinks: [],
};

const PRESETS = [
  { id: "dark", label: "Dark", bg: "#0f172a", accent: "#9333ea" },
  { id: "light", label: "Light", bg: "#ffffff", accent: "#4f46e5" },
  { id: "gradient", label: "Gradient", bg: "", accent: "#a855f7" },
  { id: "minimal", label: "Minimal", bg: "#f9fafb", accent: "#111827" },
  { id: "custom", label: "Custom", bg: "", accent: "" },
];

const SECTION_LABELS: Record<string, string> = { contact: "Contact", social: "Social Links", links: "Custom Buttons" };

function Field({ label, value, onChange, type = "text", placeholder = "" }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-300 mb-1.5">{label}</label>
      {type === "textarea" ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} rows={3} placeholder={placeholder}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors resize-none" />
      ) : (
        <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition-colors" />
      )}
    </div>
  );
}

function SortableSection({ id }: { id: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id });
  const style = { transform: CSS.Transform.toString(transform), transition };
  return (
    <div ref={setNodeRef} style={style} className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 cursor-default">
      <button {...attributes} {...listeners} className="text-slate-500 hover:text-slate-300 cursor-grab active:cursor-grabbing">
        <GripVertical size={16} />
      </button>
      <span className="text-sm text-slate-300">{SECTION_LABELS[id] || id}</span>
    </div>
  );
}

function ColorSwatch({ color, onClick, selected }: { color: string; onClick: () => void; selected: boolean }) {
  return (
    <button type="button" onClick={onClick}
      style={{ backgroundColor: color }}
      className={`w-8 h-8 rounded-full border-2 transition-all ${selected ? "border-white scale-110" : "border-transparent"}`}
    />
  );
}

const QUICK_COLORS = [
  "#ffffff", "#111827", "#ef4444", "#f97316", "#eab308",
  "#22c55e", "#06b6d4", "#3b82f6", "#8b5cf6", "#ec4899",
  "#6366f1", "#14b8a6", "#f59e0b", "#84cc16", "#e11d48",
];

export default function EditPage() {
  const { status } = useSession();
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [form, setForm] = useState<Profile>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [sections, setSections] = useState(["contact", "social", "links"]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated" && id) {
      fetch("/api/profile").then(r => r.json()).then(profiles => {
        const p = profiles.find((x: any) => x.id === id);
        if (!p) { router.push("/dashboard"); return; }
        setForm({
          id: p.id, slug: p.slug || "", fullName: p.fullName || "",
          jobTitle: p.jobTitle || "", company: p.company || "", bio: p.bio || "",
          phone: p.phone || "", email: p.email || "", website: p.website || "",
          linkedin: p.linkedin || "", instagram: p.instagram || "", twitter: p.twitter || "",
          whatsapp: p.whatsapp || "", photoUrl: p.photoUrl || "", bannerUrl: p.bannerUrl || "",
          isPublic: p.isPublic, theme: p.theme || "dark", cardName: p.cardName || "My Card",
          sectionOrder: p.sectionOrder || "contact,social,links",
          accentColor: p.accentColor || "", bgColor: p.bgColor || "",
          gradientFrom: p.gradientFrom || "#7c3aed", gradientTo: p.gradientTo || "#db2777",
          customLinks: p.customLinks || [],
        });
        setSections((p.sectionOrder || "contact,social,links").split(","));
      });
    }
  }, [status, id, router]);

  function set(key: keyof Profile) {
    return (value: string | boolean) => setForm(f => ({ ...f, [key]: value }));
  }

  function addLink() {
    setForm(f => ({ ...f, customLinks: [...f.customLinks, { label: "", url: "", icon: "link" }] }));
  }

  function updateLink(i: number, key: keyof CustomLink, val: string) {
    setForm(f => { const links = [...f.customLinks]; links[i] = { ...links[i], [key]: val }; return { ...f, customLinks: links }; });
  }

  function removeLink(i: number) {
    setForm(f => ({ ...f, customLinks: f.customLinks.filter((_, j) => j !== i) }));
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = sections.indexOf(active.id as string);
      const newIndex = sections.indexOf(over.id as string);
      const next = arrayMove(sections, oldIndex, newIndex);
      setSections(next);
      setForm(f => ({ ...f, sectionOrder: next.join(",") }));
    }
  }

  function selectPreset(preset: typeof PRESETS[0]) {
    if (preset.id === "gradient") {
      setForm(f => ({ ...f, theme: "gradient", bgColor: "", accentColor: preset.accent }));
    } else if (preset.id === "custom") {
      setForm(f => ({ ...f, theme: "custom" }));
    } else {
      setForm(f => ({ ...f, theme: preset.id, bgColor: preset.bg, accentColor: preset.accent }));
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const res = await fetch(`/api/profile/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, sectionOrder: sections.join(",") }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) { setError(data.error || "Failed to save"); }
    else { setSaved(true); setTimeout(() => setSaved(false), 2000); }
  }

  const isGradient = form.theme === "gradient" || form.theme === "custom";

  if (status === "loading") return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="text-slate-400 hover:text-white flex items-center gap-2 text-sm">
          <ArrowLeft size={16} /> Dashboard
        </Link>
        <div className="flex items-center gap-2 font-bold text-lg ml-auto">
          <Nfc className="text-purple-400" size={22} /> RelayCrd
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-1">Edit Card — {form.cardName}</h1>
        <p className="text-slate-400 text-sm mb-6">Changes reflect instantly on your public profile</p>

        <form onSubmit={handleSave} className="space-y-6">
          {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-lg px-4 py-3">{error}</div>}

          {/* Basic Info */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-slate-200 border-b border-slate-800 pb-3">Basic Info</h2>
            <Field label="Card Name" value={form.cardName} onChange={set("cardName") as any} placeholder="Work, Personal..." />
            <Field label="Full Name *" value={form.fullName} onChange={set("fullName") as any} placeholder="Jane Smith" />
            <Field label="Job Title" value={form.jobTitle} onChange={set("jobTitle") as any} placeholder="Founder & CEO" />
            <Field label="Company" value={form.company} onChange={set("company") as any} placeholder="RelayCrd" />
            <Field label="Bio" value={form.bio} onChange={set("bio") as any} type="textarea" placeholder="Short bio..." />

            {/* Profile Photo */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Profile Photo</label>
              {form.photoUrl && (
                <img src={form.photoUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-purple-500" />
              )}
              <UploadButton<OurFileRouter, "profilePhoto">
                endpoint="profilePhoto"
                onClientUploadComplete={(res) => { if (res?.[0]) set("photoUrl")(res[0].ufsUrl); }}
                onUploadError={(err) => setError(err.message)}
                appearance={{
                  button: "bg-slate-700 hover:bg-slate-600 text-white text-sm px-4 py-2 rounded-lg",
                  allowedContent: "text-slate-500 text-xs",
                }}
              />
            </div>
          </section>

          {/* Contact */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-slate-200 border-b border-slate-800 pb-3">Contact</h2>
            <Field label="Phone" value={form.phone} onChange={set("phone") as any} type="tel" placeholder="+1 555 000 0000" />
            <Field label="Email" value={form.email} onChange={set("email") as any} type="email" placeholder="you@example.com" />
            <Field label="Website" value={form.website} onChange={set("website") as any} placeholder="yoursite.com" />
          </section>

          {/* Social */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-slate-200 border-b border-slate-800 pb-3">Social Links</h2>
            <Field label="LinkedIn" value={form.linkedin} onChange={set("linkedin") as any} placeholder="linkedin.com/in/yourname" />
            <Field label="Instagram" value={form.instagram} onChange={set("instagram") as any} placeholder="instagram.com/yourhandle" />
            <Field label="Twitter / X" value={form.twitter} onChange={set("twitter") as any} placeholder="twitter.com/yourhandle" />
            <Field label="WhatsApp" value={form.whatsapp} onChange={set("whatsapp") as any} placeholder="+1 555 000 0000" />
          </section>

          {/* Custom Links */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="font-semibold text-slate-200">Custom Buttons</h2>
              <button type="button" onClick={addLink} className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300">
                <Plus size={16} /> Add
              </button>
            </div>
            {form.customLinks.length === 0 && <p className="text-sm text-slate-500">No custom buttons yet.</p>}
            {form.customLinks.map((link, i) => (
              <div key={i} className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <input placeholder="Label (e.g. Book a Call)" value={link.label} onChange={e => updateLink(i, "label", e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500" />
                  <input placeholder="URL" value={link.url} onChange={e => updateLink(i, "url", e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500" />
                </div>
                <button type="button" onClick={() => removeLink(i)} className="text-slate-500 hover:text-red-400 mt-2"><Trash2 size={16} /></button>
              </div>
            ))}
          </section>

          {/* Appearance */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6">
            <h2 className="font-semibold text-slate-200 border-b border-slate-800 pb-3">Appearance</h2>

            {/* Banner Image */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Banner Image</label>
              {form.bannerUrl ? (
                <div className="relative mb-3">
                  <img src={form.bannerUrl} alt="Banner" className="w-full h-24 object-cover rounded-xl" />
                  <button type="button" onClick={() => set("bannerUrl")("")}
                    className="absolute top-2 right-2 bg-black/60 hover:bg-black/80 text-white rounded-lg px-2 py-1 text-xs">
                    Remove
                  </button>
                </div>
              ) : (
                <div className="w-full h-24 rounded-xl bg-slate-800 border border-dashed border-slate-600 flex items-center justify-center mb-3 text-slate-500">
                  <Image size={20} className="mr-2" /> No banner yet
                </div>
              )}
              <UploadButton<OurFileRouter, "bannerImage">
                endpoint="bannerImage"
                onClientUploadComplete={(res) => { if (res?.[0]) set("bannerUrl")(res[0].ufsUrl); }}
                onUploadError={(err) => setError(err.message)}
                appearance={{
                  button: "bg-slate-700 hover:bg-slate-600 text-white text-sm px-4 py-2 rounded-lg",
                  allowedContent: "text-slate-500 text-xs",
                }}
              />
            </div>

            {/* Theme Presets */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Style</label>
              <div className="grid grid-cols-5 gap-2">
                {PRESETS.map(preset => (
                  <button key={preset.id} type="button" onClick={() => selectPreset(preset)}
                    className={`relative rounded-xl h-14 border-2 transition-all overflow-hidden ${form.theme === preset.id ? "border-purple-500" : "border-transparent"}`}
                    style={preset.id === "gradient"
                      ? { background: `linear-gradient(135deg, ${form.gradientFrom}, ${form.gradientTo})` }
                      : preset.id === "custom"
                      ? { background: form.bgColor || "#6366f1" }
                      : { backgroundColor: preset.bg || "#7c3aed" }
                    }>
                    <span className={`absolute inset-0 flex items-end justify-center pb-1.5 text-xs font-medium ${preset.bg === "#ffffff" || preset.bg === "#f9fafb" ? "text-gray-700" : "text-white"}`}>
                      {preset.label}
                    </span>
                    {form.theme === preset.id && (
                      <span className="absolute top-1 right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                        <Check size={9} className="text-white" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Color */}
            {form.theme !== "gradient" && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Background Color</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {QUICK_COLORS.map(c => (
                    <ColorSwatch key={c} color={c} selected={form.bgColor === c} onClick={() => setForm(f => ({ ...f, bgColor: c, theme: "custom" }))} />
                  ))}
                </div>
                <div className="flex items-center gap-3">
                  <input type="color" value={form.bgColor || "#0f172a"}
                    onChange={e => setForm(f => ({ ...f, bgColor: e.target.value, theme: "custom" }))}
                    className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
                  <input type="text" value={form.bgColor} onChange={e => setForm(f => ({ ...f, bgColor: e.target.value, theme: "custom" }))}
                    placeholder="#0f172a"
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500" />
                </div>
              </div>
            )}

            {/* Gradient Colors */}
            {(form.theme === "gradient" || form.theme === "custom") && (
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-3">Gradient Colors</label>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <div className="text-xs text-slate-500 mb-2">From</div>
                    <div className="flex items-center gap-2">
                      <input type="color" value={form.gradientFrom}
                        onChange={e => setForm(f => ({ ...f, gradientFrom: e.target.value }))}
                        className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
                      <input type="text" value={form.gradientFrom}
                        onChange={e => setForm(f => ({ ...f, gradientFrom: e.target.value }))}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-slate-500 mb-2">To</div>
                    <div className="flex items-center gap-2">
                      <input type="color" value={form.gradientTo}
                        onChange={e => setForm(f => ({ ...f, gradientTo: e.target.value }))}
                        className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
                      <input type="text" value={form.gradientTo}
                        onChange={e => setForm(f => ({ ...f, gradientTo: e.target.value }))}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500" />
                    </div>
                  </div>
                </div>
                {/* Live preview */}
                <div className="mt-3 h-12 rounded-xl"
                  style={{ background: `linear-gradient(135deg, ${form.gradientFrom}, ${form.gradientTo})` }} />
              </div>
            )}

            {/* Accent Color */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Accent / Button Color</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {QUICK_COLORS.map(c => (
                  <ColorSwatch key={c} color={c} selected={form.accentColor === c} onClick={() => setForm(f => ({ ...f, accentColor: c }))} />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <input type="color" value={form.accentColor || "#9333ea"}
                  onChange={e => setForm(f => ({ ...f, accentColor: e.target.value }))}
                  className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
                <input type="text" value={form.accentColor} onChange={e => setForm(f => ({ ...f, accentColor: e.target.value }))}
                  placeholder="#9333ea"
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500" />
              </div>
            </div>
          </section>

          {/* Section Order */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-slate-200 border-b border-slate-800 pb-3">Section Order</h2>
            <p className="text-xs text-slate-500">Drag to reorder how sections appear on your profile</p>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sections} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {sections.map(sid => <SortableSection key={sid} id={sid} />)}
                </div>
              </SortableContext>
            </DndContext>
          </section>

          {/* Settings */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-slate-200 border-b border-slate-800 pb-3">Settings</h2>
            <Field label="Custom URL Slug" value={form.slug} onChange={set("slug") as any} placeholder="your-name" />
            <div className="flex items-center justify-between">
              <div>
                <div className="font-medium text-sm text-slate-200">Public Profile</div>
                <div className="text-xs text-slate-500">Anyone with your link can view your card</div>
              </div>
              <button type="button" onClick={() => set("isPublic")(!form.isPublic)}
                className={`relative w-11 h-6 rounded-full transition-colors ${form.isPublic ? "bg-purple-600" : "bg-slate-700"}`}>
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${form.isPublic ? "translate-x-5" : ""}`} />
              </button>
            </div>
          </section>

          <button type="submit" disabled={saving}
            className="w-full py-3.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2">
            {saving ? <Loader2 size={18} className="animate-spin" /> : saved ? <Check size={18} /> : null}
            {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
