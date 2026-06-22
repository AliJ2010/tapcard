import Link from "next/link";
import { ArrowLeft, Nfc, Smartphone, CheckCircle, ExternalLink } from "lucide-react";

const steps = [
  {
    title: "Get an NFC Tag",
    desc: "Buy any writable NFC tag (NTAG213/215/216). You can find them on Amazon for ~$1 each. Cards, stickers, and keychains all work.",
  },
  {
    title: "Download an NFC Writer App",
    desc: "Install a free NFC writer app on your Android phone. \"NFC Tools\" (iOS/Android) is the most popular.",
    ios: "https://apps.apple.com/app/nfc-tools/id1252962749",
    android: "https://play.google.com/store/apps/details?id=com.wakdev.wdnfc",
  },
  {
    title: "Copy Your Profile URL",
    desc: "Go to your RelayCrd dashboard and copy your unique profile URL. It looks like: relaycrd.app/your-name",
  },
  {
    title: "Write the URL to Your Tag",
    desc: 'Open NFC Tools → Write → Add Record → URL. Paste your profile URL and tap "Write". Hold your phone to the tag for 1-2 seconds.',
  },
  {
    title: "Test It!",
    desc: "Hold your phone near the tag (without the app open). It should open your profile in the browser automatically.",
  },
];

export default function NFCSetupPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <nav className="bg-slate-900 border-b border-slate-800 px-6 py-4 flex items-center gap-4">
        <Link href="/dashboard" className="text-slate-400 hover:text-white flex items-center gap-2 text-sm">
          <ArrowLeft size={16} /> Dashboard
        </Link>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="text-center mb-12">
          <div className="w-16 h-16 bg-purple-600/20 border border-purple-600/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Nfc className="text-purple-400" size={32} />
          </div>
          <h1 className="text-3xl font-bold mb-3">NFC Setup Guide</h1>
          <p className="text-slate-400">Set up your NFC tag in 5 simple steps. Takes less than 2 minutes.</p>
        </div>

        <div className="space-y-4 mb-12">
          {steps.map((step, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">
                  {i + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                  {(step.ios || step.android) && (
                    <div className="flex gap-3 mt-3">
                      {step.ios && (
                        <a href={step.ios} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300">
                          <ExternalLink size={12} /> iOS App
                        </a>
                      )}
                      {step.android && (
                        <a href={step.android} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300">
                          <ExternalLink size={12} /> Android App
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-br from-purple-900/40 to-pink-900/20 border border-purple-700/30 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <Smartphone className="text-purple-400 shrink-0 mt-0.5" size={22} />
            <div>
              <h3 className="font-semibold mb-1">iPhone Users</h3>
              <p className="text-sm text-slate-400">
                iPhones with NFC (iPhone 7+) can read NFC tags natively — no app needed. Just hold your iPhone near the tag and a notification will appear to open your profile. For writing, use the &quot;NFC Tools&quot; app.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-semibold transition-colors">
            <CheckCircle size={18} /> Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
