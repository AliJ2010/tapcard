"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, ExternalLink, Users, BarChart2, MousePointer } from "lucide-react";

type Profile = { slug: string; fullName: string; taps: { id: string }[] };
type User = { id: string; email: string; isAdmin: boolean; plan: string; createdAt: string; profiles: Profile[] };
type Stats = { totalUsers: number; totalProfiles: number; totalTaps: number };

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated" && !(session?.user as any)?.isAdmin) { router.push("/dashboard"); return; }
    if (status === "authenticated") {
      fetch("/api/admin/users").then(r => r.json()).then(data => {
        setUsers(data.users);
        setStats(data.stats);
        setLoading(false);
      });
    }
  }, [status, session, router]);

  async function deleteUser(userId: string) {
    if (!confirm("Delete this user and all their data?")) return;
    await fetch("/api/admin/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) });
    setUsers(u => u.filter(x => x.id !== userId));
  }

  async function changePlan(userId: string, plan: string) {
    await fetch("/api/admin/users", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId, plan }) });
    setUsers(u => u.map(x => x.id === userId ? { ...x, plan } : x));
  }

  if (loading) return (
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
        <span className="font-bold ml-auto">Admin Panel — RelayCrd</span>
      </nav>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-2"><Users size={15} /> Total Users</div>
              <div className="text-3xl font-bold text-purple-400">{stats.totalUsers}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-2"><BarChart2 size={15} /> Total Profiles</div>
              <div className="text-3xl font-bold text-blue-400">{stats.totalProfiles}</div>
            </div>
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 text-slate-400 text-sm mb-2"><MousePointer size={15} /> Total Taps</div>
              <div className="text-3xl font-bold text-green-400">{stats.totalTaps}</div>
            </div>
          </div>
        )}

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs text-slate-500 uppercase tracking-wide">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Plan</th>
                <th className="px-4 py-3">Profiles</th>
                <th className="px-4 py-3">Taps</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-4">
                    <div className="font-medium text-sm">{user.email}</div>
                    {user.isAdmin && <span className="text-xs bg-purple-600/20 text-purple-400 px-2 py-0.5 rounded-full">Admin</span>}
                  </td>
                  <td className="px-4 py-4">
                    <select
                      value={user.plan}
                      onChange={e => changePlan(user.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer focus:outline-none focus:ring-1 focus:ring-purple-500 ${user.plan === "business" ? "bg-amber-500/20 text-amber-400" : user.plan === "pro" ? "bg-purple-500/20 text-purple-400" : "bg-slate-700 text-slate-400"}`}
                    >
                      <option value="free">free</option>
                      <option value="pro">pro</option>
                      <option value="business">business</option>
                    </select>
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-400">
                    {user.profiles.map(p => (
                      <Link key={p.slug} href={`/${p.slug}`} target="_blank" className="flex items-center gap-1 text-purple-400 hover:text-purple-300">
                        {p.fullName} <ExternalLink size={11} />
                      </Link>
                    ))}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-400">
                    {user.profiles.reduce((sum, p) => sum + p.taps.length, 0)}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-4">
                    {!user.isAdmin && (
                      <button onClick={() => deleteUser(user.id)} className="text-slate-600 hover:text-red-400 transition-colors">
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
