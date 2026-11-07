import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase, type Claim, type Item, type Profile } from '@/lib/supabase';
import { statusColor, statusLabel, formatDateTime } from '@/lib/utils';
import Modal from '@/components/Modal';
import { ClipboardList, Clock, CheckCircle2, XCircle, Package, User as UserIcon, MessageSquare, Calendar } from 'lucide-react';

type ClaimWithRelations = Claim & {
  item: Item & { category?: { name: string } | null; location?: { name: string } | null };
  claimant: Profile | null;
};

export default function AdminClaims() {
  const { user } = useAuth();
  const [claims, setClaims] = useState<ClaimWithRelations[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending');
  const [selectedClaim, setSelectedClaim] = useState<ClaimWithRelations | null>(null);
  const [action, setAction] = useState<'approve' | 'reject' | null>(null);
  const [handoverNotes, setHandoverNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    fetchClaims();
  }, [filter]);

  const fetchClaims = async () => {
    setLoading(true);
    let query = supabase
      .from('claims')
      .select('*, item:items(*, category:categories(name), location:locations(name)), claimant:profiles!claims_claimant_id_profiles_fkey(*)')
      .order('created_at', { ascending: false });

    if (filter !== 'all') query = query.eq('status', filter);

    const { data } = await query;
    setClaims((data ?? []) as ClaimWithRelations[]);
    setLoading(false);
  };

  const handleAction = async () => {
    if (!selectedClaim || !action || !user) return;
    setProcessing(true);

    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    const { error: claimError } = await supabase
      .from('claims')
      .update({
        status: newStatus,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        handover_notes: handoverNotes || null,
        handover_date: action === 'approve' ? new Date().toISOString() : null,
      })
      .eq('id', selectedClaim.id);

    if (claimError) {
      setProcessing(false);
      return;
    }

    if (action === 'approve') {
      await supabase.from('items').update({ status: 'resolved' }).eq('id', selectedClaim.item_id);
    }

    setProcessing(false);
    setAction(null);
    setHandoverNotes('');
    setSelectedClaim(null);
    fetchClaims();
  };

  const filterTabs: { key: typeof filter; label: string }[] = [
    { key: 'pending', label: 'Pending' },
    { key: 'approved', label: 'Approved' },
    { key: 'rejected', label: 'Rejected' },
    { key: 'all', label: 'All' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Manage Claims</h1>
        <p className="text-slate-500">Review and approve or reject claims submitted by users.</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 border-b border-slate-200">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
              filter === tab.key
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card p-12 text-center text-slate-400">
          <Clock className="w-8 h-8 mx-auto mb-2 animate-pulse" />
          Loading...
        </div>
      ) : claims.length === 0 ? (
        <div className="card p-12 text-center">
          <ClipboardList className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-700 mb-1">No {filter} claims</h3>
          <p className="text-slate-500 text-sm">
            {filter === 'pending' ? 'All claims have been reviewed.' : `No ${filter} claims to display.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {claims.map((claim) => (
            <div key={claim.id} className="card p-5">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
                    <Package className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-800 truncate">
                      {claim.item?.title ?? 'Unknown item'}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={`badge ${statusColor(claim.status)}`}>
                        {statusLabel(claim.status)}
                      </span>
                      <span className="text-xs text-slate-400">{formatDateTime(claim.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Claimant info */}
              <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg mb-3">
                <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">{claim.claimant?.full_name ?? 'Unknown'}</p>
                  {claim.claimant?.student_id && (
                    <p className="text-xs text-slate-400">Student ID: {claim.claimant.student_id}</p>
                  )}
                </div>
              </div>

              {/* Claim message */}
              <div className="bg-slate-50 rounded-lg p-3 mb-3">
                <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                  <MessageSquare className="w-3.5 h-3.5" /> Claim message:
                </p>
                <p className="text-sm text-slate-600">{claim.message}</p>
                {claim.verification_answer && (
                  <p className="text-xs text-slate-500 mt-2">
                    <span className="font-medium">Verification: </span>{claim.verification_answer}
                  </p>
                )}
              </div>

              {/* Actions */}
              {claim.status === 'pending' && (
                <div className="flex gap-3">
                  <button
                    onClick={() => { setSelectedClaim(claim); setAction('approve'); }}
                    className="btn-primary flex-1 text-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    Approve Claim
                  </button>
                  <button
                    onClick={() => { setSelectedClaim(claim); setAction('reject'); }}
                    className="btn-danger flex-1 text-sm"
                  >
                    <XCircle className="w-4 h-4" />
                    Reject Claim
                  </button>
                </div>
              )}

              {claim.status === 'approved' && claim.handover_date && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm">
                  <Calendar className="w-4 h-4" />
                  Approved on {formatDateTime(claim.handover_date)}
                  {claim.handover_notes && <span className="ml-2">— {claim.handover_notes}</span>}
                </div>
              )}

              {claim.status === 'rejected' && claim.handover_notes && (
                <div className="flex items-center gap-2 px-3 py-2.5 bg-red-50 text-red-700 rounded-lg text-sm">
                  <XCircle className="w-4 h-4" />
                  Rejected — {claim.handover_notes}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action modal */}
      {selectedClaim && action && (
        <Modal
          open={true}
          onClose={() => { setSelectedClaim(null); setAction(null); setHandoverNotes(''); }}
          title={action === 'approve' ? 'Approve Claim' : 'Reject Claim'}
        >
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-700 mb-1">{selectedClaim.item?.title}</p>
              <p className="text-xs text-slate-500">
                Claimant: {selectedClaim.claimant?.full_name}
              </p>
            </div>

            <div>
              <label className="label">
                {action === 'approve' ? 'Handover notes (optional)' : 'Reason for rejection'}
              </label>
              <textarea
                value={handoverNotes}
                onChange={(e) => setHandoverNotes(e.target.value)}
                rows={3}
                className="input-field resize-none"
                placeholder={
                  action === 'approve'
                    ? 'e.g., Item handed over at admin office, ID verified...'
                    : 'e.g., Verification details did not match...'
                }
              />
            </div>

            {action === 'approve' && (
              <div className="px-4 py-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                Approving this claim will mark the item as resolved and record the handover.
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={handleAction}
                disabled={processing}
                className={action === 'approve' ? 'btn-primary flex-1' : 'btn-danger flex-1'}
              >
                {processing ? 'Processing...' : action === 'approve' ? 'Confirm Approval' : 'Confirm Rejection'}
              </button>
              <button
                onClick={() => { setSelectedClaim(null); setAction(null); setHandoverNotes(''); }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
