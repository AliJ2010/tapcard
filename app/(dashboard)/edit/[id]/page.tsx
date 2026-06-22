"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Nfc, Loader2, Plus, Trash2, ArrowLeft, Check, GripVertical } from "lucide-react";
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
  id: string;
  slug: string;
  fullName: string;
  jobTitle: string;
  company: string;
  bio: string;
  phone: string;
  email: string;
  website: string;
  linkedin: string;
  instagram: string;
  twitter: string;
  whatsapp: string;
  photoUrl: string;
  isPublic: boolean;
  theme: string;
  cardName: string;
  sectionOrder: string;
  customLinks: CustomLink[];
};

const EMPTY: Profile = {
  id: "", slug: "", fullName: "", jobTitle: "", company: "", bio: "",
  phone: "", email: "", website: "", linkedin: "", instagram: "", twitter: "",
  whatsapp: "", photoUrl: "", isPublic: true, theme: "dark", cardName: "My Card",
  sectionOrder: "contact,social,links", customLinks: [],
};

const THEMES = [
  { id: "dark", label: "Dark", colors: "from-slate-900 to-slate-950" },
  { id: "light", label: "Light", colors: "from-gray-50 to-white" },
  { id: "gradient", label: "Gradient", colors: "from-violet-950 to-fuchsia-950" },
  { id: "minimal", label: "Minimal", colors: "from-white to-gray-50" },
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
        const p = profiles.find((x: Profile) => x.id === id);
        if (!p) { router.push("/dashboard"); return; }
        setForm({
          id: p.id, slug: p.slug || "", fullName: p.fullName || "",
          jobTitle: p.jobTitle || "", company: p.company || "", bio: p.bio || "",
          phone: p.phone || "", email: p.email || "", website: p.website || "",
          linkedin: p.linkedin || "", instagram: p.instagram || "", twitter: p.twitter || "",
          whatsapp: p.whatsapp || "", photoUrl: p.photoUrl || "", isPublic: p.isPublic,
          theme: p.theme || "dark", cardName: p.cardName || "My Card",
          sectionOrder: p.sectionOrder || "contact,social,links",
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
            <Field label="Full Name *" value={form.fullName} onChange={set("fullName") as any} placeholder="Ali Jebai" />
            <Field label="Job Title" value={form.jobTitle} onChange={set("jobTitle") as any} placeholder="Founder & CEO" />
            <Field label="Company" value={form.company} onChange={set("company") as any} placeholder="RelayCrd" />
            <Field label="Bio" value={form.bio} onChange={set("bio") as any} type="textarea" placeholder="Short bio..." />

            {/* Photo Upload */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">Profile Photo</label>
              {form.photoUrl && (
                <img src={form.photoUrl} alt="Profile" className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-purple-500" />
              )}
              <UploadButton<OurFileRouter, "profilePhoto">
                endpoint="profilePhoto"
                onClientUploadComplete={(res) => {
                  if (res?.[0]) set("photoUrl")(res[0].ufsUrl);
                }}
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

          {/* Theme */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-slate-200 border-b border-slate-800 pb-3">Theme</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {THEMES.map(theme => (
                <button key={theme.id} type="button" onClick={() => set("theme")(theme.id)}
                  className={`relative rounded-xl overflow-hidden h-16 bg-gradient-to-br ${theme.colors} border-2 transition-colors ${form.theme === theme.id ? "border-purple-500" : "border-transparent"}`}>
                  <span className="absolute inset-0 flex items-end justify-center pb-2">
                    <span className={`text-xs font-medium ${theme.id === "light" || theme.id === "minimal" ? "text-gray-800" : "text-white"}`}>{theme.label}</span>
                  </span>
                  {form.theme === theme.id && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center">
                      <Check size={10} className="text-white" />
                    </span>
                  )}
                </button>
              ))}
            </div>
          </section>

          {/* Section Order */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-slate-200 border-b border-slate-800 pb-3">Section Order</h2>
            <p className="text-xs text-slate-500">Drag to reorder how sections appear on your profile</p>
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={sections} strategy={verticalListSortingStrategy}>
                <div className="space-y-2">
                  {sections.map(id => <SortableSection key={id} id={id} />)}
                </div>
              </SortableContext>
            </DndContext>
          </section>

          {/* Settings */}
          <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <h2 className="font-semibold text-slate-200 border-b border-slate-800 pb-3">Settings</h2>
            <Field label="Custom URL Slug" value={form.slug} onChange={set("slug") as any} placeholder="ali-jebai" />
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
