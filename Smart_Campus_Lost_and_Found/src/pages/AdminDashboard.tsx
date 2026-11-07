import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Package, AlertCircle, CheckCircle2, ClipboardList, TrendingUp, Clock, Users } from 'lucide-react';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalItems: 0,
    activeLost: 0,
    activeFound: 0,
    resolved: 0,
    pendingClaims: 0,
    totalClaims: 0,
  });
  const [recentClaims, setRecentClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('items').select('*', { count: 'exact', head: true }),
      supabase.from('items').select('*', { count: 'exact', head: true }).eq('type', 'lost').eq('status', 'active'),
      supabase.from('items').select('*', { count: 'exact', head: true }).eq('type', 'found').eq('status', 'active'),
      supabase.from('items').select('*', { count: 'exact', head: true }).eq('status', 'resolved'),
      supabase.from('claims').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
      supabase.from('claims').select('*', { count: 'exact', head: true }),
      supabase
        .from('claims')
        .select('*, item:items(title, type), claimant:profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(5),
    ]).then((results) => {
      setStats({
        totalUsers: results[0].count ?? 0,
        totalItems: results[1].count ?? 0,
        activeLost: results[2].count ?? 0,
        activeFound: results[3].count ?? 0,
        resolved: results[4].count ?? 0,
        pendingClaims: results[5].count ?? 0,
        totalClaims: results[6].count ?? 0,
      });
      setRecentClaims(results[7].data ?? []);
      setLoading(false);
    });
  }, []);

  const statCards = [
    { label: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Total Items', value: stats.totalItems, icon: Package, color: 'text-slate-600 bg-slate-100' },
    { label: 'Active Lost', value: stats.activeLost, icon: AlertCircle, color: 'text-red-600 bg-red-50' },
    { label: 'Active Found', value: stats.activeFound, icon: Package, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Resolved', value: stats.resolved, icon: CheckCircle2, color: 'text-blue-600 bg-blue-50' },
    { label: 'Pending Claims', value: stats.pendingClaims, icon: Clock, color: 'text-amber-600 bg-amber-50' },
    { label: 'Total Claims', value: stats.totalClaims, icon: ClipboardList, color: 'text-purple-600 bg-purple-50' },
    { label: 'Resolution Rate', value: stats.totalItems > 0 ? `${Math.round((stats.resolved / stats.totalItems) * 100)}%` : '0%', icon: TrendingUp, color: 'text-emerald-600 bg-emerald-50' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Admin Dashboard</h1>
        <p className="text-slate-500">Overview of the campus lost and found system.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>
              <stat.icon className="w-5 h-5" />
            </div>
            <div className="text-3xl font-bold text-slate-800">
              {loading ? '—' : stat.value}
            </div>
            <div className="text-sm text-slate-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Recent claims */}
      <div className="card p-6">
        <h2 className="font-semibold text-slate-800 mb-4">Recent Claims</h2>
        {loading ? (
          <div className="py-8 text-center text-slate-400">
            <Clock className="w-8 h-8 mx-auto mb-2 animate-pulse" />
            Loading...
          </div>
        ) : recentClaims.length === 0 ? (
          <div className="py-8 text-center text-slate-400">
            <ClipboardList className="w-8 h-8 mx-auto mb-2" />
            No claims submitted yet.
          </div>
        ) : (
          <div className="space-y-3">
            {recentClaims.map((claim) => (
              <div key={claim.id} className="flex items-center gap-4 p-3 rounded-lg border border-slate-100 hover:border-blue-200 transition-all">
                <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {claim.claimant?.full_name ?? 'Unknown'} claimed "{claim.item?.title ?? 'Unknown'}"
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(claim.created_at).toLocaleDateString()}
                  </p>
                </div>
                <span className={`badge ${
                  claim.status === 'pending' ? 'bg-amber-100 text-amber-700 border-amber-200' :
                  claim.status === 'approved' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                  claim.status === 'rejected' ? 'bg-red-100 text-red-700 border-red-200' :
                  'bg-gray-100 text-gray-500 border-gray-200'
                }`}>
                  {claim.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
