import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase, type Claim } from '@/lib/supabase';
import { statusColor, statusLabel, formatDateTime } from '@/lib/utils';
import { ClipboardList, Clock, CheckCircle2, XCircle, Package, ArrowLeft } from 'lucide-react';

export default function MyClaims() {
  const { user } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from('claims')
      .select('*, item:items(*, category:categories(*), location:locations(*)), reviewer:profiles!claims_reviewed_by_profiles_fkey(*)')
      .eq('claimant_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setClaims((data ?? []) as Claim[]);
        setLoading(false);
      });
  }, [user]);

  const handleWithdraw = async (claimId: string) => {
    await supabase.from('claims').update({ status: 'withdrawn' }).eq('id', claimId);
    setClaims((prev) => prev.map((c) => (c.id === claimId ? { ...c, status: 'withdrawn' } : c)));
  };

  if (loading) {
    return (
      <div className="card p-12 text-center text-slate-400">
        <Clock className="w-8 h-8 mx-auto mb-2 animate-pulse" />
        Loading...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">My Claims</h1>
        <p className="text-slate-500">Claims you have submitted for found items.</p>
      </div>

      {claims.length === 0 ? (
        <div className="card p-12 text-center">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-700 mb-1">No claims yet</h3>
          <p className="text-slate-500 text-sm">Browse found items and submit a claim for any that are yours.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {claims.map((claim) => (
            <div key={claim.id} className="card p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-800 truncate">
                      {claim.item?.title ?? 'Unknown item'}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Claimed on {formatDateTime(claim.created_at)}
                    </p>
                  </div>
                </div>
                <span className={`badge ${statusColor(claim.status)} flex-shrink-0`}>
                  {statusLabel(claim.status)}
                </span>
              </div>

              <div className="bg-slate-50 rounded-lg p-3 mb-3">
                <p className="text-xs font-medium text-slate-500 mb-1">Your message:</p>
                <p className="text-sm text-slate-600">{claim.message}</p>
                {claim.verification_answer && (
                  <>
                    <p className="text-xs font-medium text-slate-500 mb-1 mt-2">Verification detail:</p>
                    <p className="text-sm text-slate-600">{claim.verification_answer}</p>
                  </>
                )}
              </div>

              {claim.status === 'approved' && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm">
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                  Your claim has been approved! Please contact the admin to arrange item handover.
                  {claim.handover_date && (
                    <span className="ml-auto text-xs">
                      Handover: {formatDateTime(claim.handover_date)}
                    </span>
                  )}
                </div>
              )}

              {claim.status === 'rejected' && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 text-red-700 rounded-lg text-sm">
                  <XCircle className="w-5 h-5 flex-shrink-0" />
                  Your claim was not approved. {claim.handover_notes && `Reason: ${claim.handover_notes}`}
                </div>
              )}

              {claim.status === 'pending' && (
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-sm text-amber-600">
                    <Clock className="w-5 h-5 flex-shrink-0" />
                    Pending admin review...
                  </div>
                  <button
                    onClick={() => handleWithdraw(claim.id)}
                    className="btn-ghost text-sm text-red-600 hover:bg-red-50"
                  >
                    Withdraw Claim
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
