"use client";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Trash2, ExternalLink, Users } from "lucide-react";

type User = {
  id: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  profile: { slug: string; fullName: string; views: number } | null;
};

export default function AdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") { router.push("/login"); return; }
    if (status === "authenticated" && !(session?.user as any)?.isAdmin) { router.push("/dashboard"); return; }
    if (status === "authenticated") {
      fetch("/api/admin/users").then(r => r.json()).then(data => { setUsers(data); setLoading(false); });
    }
  }, [status, session, router]);

  async function deleteUser(userId: string) {
    if (!confirm("Delete this user and all their data?")) return;
    await fetch("/api/admin/users", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userId }) });
    setUsers(u => u.filter(x => x.id !== userId));
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
        <span className="font-bold ml-auto">Admin Panel</span>
      </nav>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Users size={22} className="text-purple-400" />
          <h1 className="text-2xl font-bold">All Users</h1>
          <span className="ml-auto text-slate-500 text-sm">{users.length} total</span>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 text-left text-xs text-slate-500 uppercase tracking-wide">
                <th className="px-4 py-3">User</th>
                <th className="px-4 py-3">Profile</th>
                <th className="px-4 py-3">Views</th>
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
                    {user.profile ? (
                      <Link href={`/${user.profile.slug}`} target="_blank" className="flex items-center gap-1 text-sm text-purple-400 hover:text-purple-300">
                        {user.profile.fullName} <ExternalLink size={12} />
                      </Link>
                    ) : <span className="text-slate-600 text-sm">No profile</span>}
                  </td>
                  <td className="px-4 py-4 text-sm text-slate-400">{user.profile?.views ?? 0}</td>
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
