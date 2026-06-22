import Link from "next/link";
import { Nfc, Smartphone, QrCode, Share2, UserCheck, Zap } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <div className="flex items-center gap-2 text-xl font-bold">
          <Nfc className="text-purple-400" size={28} />
          TapCard
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="px-4 py-2 text-sm text-slate-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link href="/signup" className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-500 rounded-lg font-medium transition-colors">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="text-center px-6 pt-20 pb-32 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-purple-900/50 border border-purple-700/50 rounded-full px-4 py-1.5 text-sm text-purple-300 mb-8">
          <Zap size={14} />
          The future of networking is here
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold mb-6 leading-tight">
          Your business card,<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
            just one tap away
          </span>
        </h1>
        <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto">
          Create a stunning digital profile. Share it with an NFC card, QR code, or link. Update anytime — no reprinting ever.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/signup" className="px-8 py-3.5 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold text-lg transition-colors">
            Create Your Card — Free
          </Link>
          <Link href="/ali-jebai" className="px-8 py-3.5 border border-slate-700 hover:border-slate-500 rounded-xl font-semibold text-lg transition-colors text-slate-300">
            See a Demo
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold text-center mb-12 text-slate-200">Everything you need</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: Nfc, title: "NFC Ready", desc: "Write your profile URL to any NFC tag. Tap to share instantly." },
            { icon: QrCode, title: "QR Code Included", desc: "Every profile gets a QR code — share without NFC too." },
            { icon: Smartphone, title: "Mobile First", desc: "Looks stunning on every device, optimized for fast loading." },
            { icon: UserCheck, title: "Save to Contacts", desc: "One-tap vCard download so contacts never get lost." },
            { icon: Share2, title: "Always Up to Date", desc: "Update your info anytime. No need to reprint or reprogram." },
            { icon: Zap, title: "Instant Setup", desc: "Create your profile in minutes. Share within seconds." },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/8 transition-colors">
              <div className="w-11 h-11 rounded-xl bg-purple-600/20 flex items-center justify-center mb-4">
                <Icon className="text-purple-400" size={22} />
              </div>
              <h3 className="font-semibold text-lg mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center px-6 pb-24">
        <div className="max-w-xl mx-auto bg-gradient-to-br from-purple-900/60 to-pink-900/30 border border-purple-700/40 rounded-3xl p-10">
          <h2 className="text-3xl font-bold mb-4">Ready to tap in?</h2>
          <p className="text-slate-400 mb-8">Join professionals who have ditched paper cards forever.</p>
          <Link href="/signup" className="inline-block px-8 py-3.5 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold transition-colors">
            Create Your Free Card
          </Link>
        </div>
      </section>

      <footer className="text-center text-slate-600 text-sm pb-8">
        © 2024 TapCard. Built for the future of networking.
      </footer>
    </div>
  );
}
