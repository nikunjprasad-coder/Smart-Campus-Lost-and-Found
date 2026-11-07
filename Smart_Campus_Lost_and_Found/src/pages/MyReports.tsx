import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase, type Item, type Claim } from '@/lib/supabase';
import { getCategoryIcon } from '@/lib/types';
import { statusColor, statusLabel, formatDate, formatDateTime } from '@/lib/utils';
import { Package, ClipboardList, CheckCircle2, Clock, XCircle, MessageSquare } from 'lucide-react';

export default function MyReports() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [claimsByItem, setClaimsByItem] = useState<Record<string, Claim[]>>({});
  const [loading, setLoading] = useState(true);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('items')
      .select('*, category:categories(*), location:locations(*)')
      .eq('reported_by', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        const itemsData = (data ?? []) as Item[];
        setItems(itemsData);
        if (itemsData.length > 0) {
          supabase
            .from('claims')
            .select('*, claimant:profiles!claims_claimant_id_profiles_fkey(*)')
            .in('item_id', itemsData.map((i) => i.id))
            .order('created_at', { ascending: false })
            .then(({ data: claims }) => {
              const grouped: Record<string, Claim[]> = {};
              (claims ?? []).forEach((c) => {
                const claim = c as Claim;
                if (!grouped[claim.item_id]) grouped[claim.item_id] = [];
                grouped[claim.item_id].push(claim);
              });
              setClaimsByItem(grouped);
              setLoading(false);
            });
        } else {
          setLoading(false);
        }
      });
  }, [user]);

  const handleWithdrawClaim = async (claimId: string) => {
    await supabase.from('claims').update({ status: 'withdrawn' }).eq('id', claimId);
    window.location.reload();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">My Reports</h1>
        <p className="text-slate-500">Items you have reported and any claims submitted on them.</p>
      </div>

      {loading ? (
        <div className="card p-12 text-center text-slate-400">
          <Clock className="w-8 h-8 mx-auto mb-2 animate-pulse" />
          Loading...
        </div>
      ) : items.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-700 mb-1">No reports yet</h3>
          <p className="text-slate-500 text-sm">You haven't reported any lost or found items.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const Icon = getCategoryIcon(item.category?.icon ?? 'Package');
            const isLost = item.type === 'lost';
            const claims = claimsByItem[item.id] ?? [];
            const pendingCount = claims.filter((c) => c.status === 'pending').length;

            return (
              <div key={item.id} className="card overflow-hidden">
                <div
                  className="p-5 flex items-center gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors"
                  onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isLost ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-800 truncate">{item.title}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`badge ${
                        isLost ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {isLost ? 'Lost' : 'Found'}
                      </span>
                      <span className={`badge ${statusColor(item.status)}`}>
                        {statusLabel(item.status)}
                      </span>
                      <span className="text-xs text-slate-400">{formatDate(item.report_date)}</span>
                    </div>
                  </div>
                  {claims.length > 0 && (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium">
                        <ClipboardList className="w-4 h-4" />
                        {claims.length}
                      </div>
                      {pendingCount > 0 && (
                        <div className="px-2.5 py-1 bg-amber-50 text-amber-600 rounded-lg text-sm font-medium">
                          {pendingCount} pending
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {expandedItem === item.id && claims.length > 0 && (
                  <div className="border-t border-slate-100 p-4 space-y-3 animate-slide-down">
                    <h4 className="text-sm font-semibold text-slate-700">Claims on this item</h4>
                    {claims.map((claim) => (
                      <div key={claim.id} className="p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                              <MessageSquare className="w-4 h-4 text-slate-500" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-700">
                                {claim.claimant?.full_name ?? 'Unknown user'}
                              </p>
                              <p className="text-xs text-slate-400">{formatDateTime(claim.created_at)}</p>
                            </div>
                          </div>
                          <span className={`badge ${statusColor(claim.status)}`}>
                            {statusLabel(claim.status)}
                          </span>
                        </div>
                        <p className="text-sm text-slate-600 mt-2">{claim.message}</p>
                        {claim.verification_answer && (
                          <p className="text-xs text-slate-500 mt-1">
                            <span className="font-medium">Verification: </span>
                            {claim.verification_answer}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {expandedItem === item.id && claims.length === 0 && (
                  <div className="border-t border-slate-100 p-4 text-center text-sm text-slate-400 animate-slide-down">
                    No claims submitted for this item yet.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
