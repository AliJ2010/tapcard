import Link from "next/link";
import { Check, Nfc } from "lucide-react";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    color: "border-slate-700",
    btn: "bg-slate-700 hover:bg-slate-600",
    features: ["1 digital card", "Public profile page", "Save Contact (vCard)", "QR code", "Basic themes", "\"Powered by RelayCrd\" badge"],
    href: "/signup",
    cta: "Get Started Free",
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "per month",
    color: "border-purple-500",
    btn: "bg-purple-600 hover:bg-purple-500",
    badge: "Most Popular",
    features: ["Up to 3 digital cards", "All themes", "Tap analytics", "No RelayCrd branding", "Custom URL slug", "Priority support"],
    href: "/signup",
    cta: "Start Pro",
  },
  {
    name: "Business",
    price: "$19.99",
    period: "per month",
    color: "border-amber-500",
    btn: "bg-amber-500 hover:bg-amber-400",
    features: ["Up to 10 digital cards", "Team management", "Everything in Pro", "Admin dashboard", "Early access to new features", "Dedicated support"],
    href: "/signup",
    cta: "Start Business",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-950 to-slate-900 text-white">
      <nav className="flex items-center justify-between px-6 py-5 max-w-6xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold">
          <Nfc className="text-purple-400" size={26} /> RelayCrd
        </Link>
        <div className="flex gap-3">
          <Link href="/login" className="px-4 py-2 text-sm text-slate-300 hover:text-white">Sign In</Link>
          <Link href="/signup" className="px-4 py-2 text-sm bg-purple-600 hover:bg-purple-500 rounded-lg font-medium">Get Started</Link>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-extrabold mb-4">Simple, transparent pricing</h1>
        <p className="text-slate-400 text-lg mb-14">Start free. Upgrade when you need more.</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          {plans.map(plan => (
            <div key={plan.name} className={`relative bg-white/5 border-2 ${plan.color} rounded-2xl p-7 flex flex-col`}>
              {(plan as any).badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-semibold px-3 py-1 rounded-full">
                  {(plan as any).badge}
                </div>
              )}
              <div className="mb-6">
                <div className="text-sm font-medium text-slate-400 mb-1">{plan.name}</div>
                <div className="text-4xl font-extrabold">{plan.price}</div>
                <div className="text-slate-500 text-sm">{plan.period}</div>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map(f => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                    <Check size={16} className="text-green-400 shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
              <Link href={plan.href} className={`block text-center py-3 rounded-xl font-semibold text-white transition-colors ${plan.btn}`}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
