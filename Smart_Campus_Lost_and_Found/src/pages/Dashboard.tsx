import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase, type Item, type Claim } from '@/lib/supabase';
import { Search, Package, TrendingUp, Clock, CheckCircle2, AlertCircle, ArrowRight, PlusCircle } from 'lucide-react';
import type { Page } from '@/components/Layout';

type Props = { onNavigate: (page: Page) => void };

export default function Dashboard({ onNavigate }: Props) {
  const { profile, user } = useAuth();
  const [stats, setStats] = useState({
    totalLost: 0,
    totalFound: 0,
    resolved: 0,
    myReports: 0,
    myClaims: 0,
    pendingClaims: 0,
  });
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      if (!user) return;
      const [lost, found, resolved, myReports, myClaims, pendingClaims, recent] = await Promise.all([
        supabase.from('items').select('*', { count: 'exact', head: true }).eq('type', 'lost').eq('status', 'active'),
        supabase.from('items').select('*', { count: 'exact', head: true }).eq('type', 'found').eq('status', 'active'),
        supabase.from('items').select('*', { count: 'exact', head: true }).eq('status', 'resolved'),
        supabase.from('items').select('*', { count: 'exact', head: true }).eq('reported_by', user.id),
        supabase.from('claims').select('*', { count: 'exact', head: true }).eq('claimant_id', user.id),
        supabase.from('claims').select('*', { count: 'exact', head: true }).eq('claimant_id', user.id).eq('status', 'pending'),
        supabase.from('items').select('*, category:categories(*), location:locations(*)').order('created_at', { ascending: false }).limit(6),
      ]);

      setStats({
        totalLost: lost.count ?? 0,
        totalFound: found.count ?? 0,
        resolved: resolved.count ?? 0,
        myReports: myReports.count ?? 0,
        myClaims: myClaims.count ?? 0,
        pendingClaims: pendingClaims.count ?? 0,
      });
      setRecentItems((recent.data ?? []) as Item[]);
      setLoading(false);
    }
    fetchStats();
  }, [user]);

  const statCards = [
    { label: 'Active Lost Items', value: stats.totalLost, icon: AlertCircle, color: 'text-red-600 bg-red-50' },
    { label: 'Active Found Items', value: stats.totalFound, icon: Package, color: 'text-emerald-600 bg-emerald-50' },
    { label: 'Resolved Returns', value: stats.resolved, icon: CheckCircle2, color: 'text-blue-600 bg-blue-50' },
    { label: 'My Reports', value: stats.myReports, icon: TrendingUp, color: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Hero banner */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-2xl p-6 lg:p-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-1/3 w-40 h-40 bg-cyan-300/10 rounded-full translate-y-1/2" />
        <div className="relative z-10">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">
            Welcome back, {profile?.full_name?.split(' ')[0] ?? 'Student'}
          </h1>
          <p className="text-blue-100 max-w-2xl mb-5">
            Track lost items, report found belongings, and help reconnect the campus community.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('report-lost')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-blue-700 font-medium rounded-lg hover:bg-blue-50 transition-all duration-200 active:scale-[0.98]"
            >
              <PlusCircle className="w-5 h-5" />
              Report Lost Item
            </button>
            <button
              onClick={() => onNavigate('report-found')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur text-white font-medium rounded-lg border border-white/30 hover:bg-white/20 transition-all duration-200 active:scale-[0.98]"
            >
              <PlusCircle className="w-5 h-5" />
              Report Found Item
            </button>
            <button
              onClick={() => onNavigate('browse')}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 backdrop-blur text-white font-medium rounded-lg border border-white/30 hover:bg-white/20 transition-all duration-200 active:scale-[0.98]"
            >
              <Search className="w-5 h-5" />
              Browse Items
            </button>
          </div>
        </div>
      </div>

      {/* Stats grid */}
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

      {/* My activity + Recent items */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* My activity */}
        <div className="card p-6">
          <h2 className="font-semibold text-slate-800 mb-4">My Activity</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">My Reports</span>
              <span className="font-semibold text-slate-800">{stats.myReports}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">My Claims</span>
              <span className="font-semibold text-slate-800">{stats.myClaims}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-slate-100">
              <span className="text-sm text-slate-600">Pending Claims</span>
              <span className="font-semibold text-amber-600">{stats.pendingClaims}</span>
            </div>
            <button
              onClick={() => onNavigate('my-claims')}
              className="w-full mt-3 flex items-center justify-between px-3 py-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-sm text-slate-700 font-medium"
            >
              View My Claims
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('my-reports')}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors text-sm text-slate-700 font-medium"
            >
              View My Reports
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Recent items */}
        <div className="card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-800">Recently Reported</h2>
            <button
              onClick={() => onNavigate('browse')}
              className="text-sm text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1"
            >
              View All <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <Clock className="w-8 h-8 mx-auto mb-2 animate-pulse" />
              Loading...
            </div>
          ) : recentItems.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <Package className="w-8 h-8 mx-auto mb-2" />
              No items reported yet
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {recentItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onNavigate('browse')}
                  className="flex items-center gap-3 p-3 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all cursor-pointer"
                >
                  <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    item.type === 'lost' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    <Package className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-700 truncate">{item.title}</p>
                    <p className="text-xs text-slate-400">
                      {item.type === 'lost' ? 'Lost' : 'Found'} · {new Date(item.report_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
