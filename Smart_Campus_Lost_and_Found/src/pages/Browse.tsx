import { useEffect, useState, useMemo } from 'react';
import { supabase, type Item, type Category, type Location } from '@/lib/supabase';
import { getCategoryIcon } from '@/lib/types';
import { statusColor, statusLabel, timeAgo, formatDate } from '@/lib/utils';
import { Search, MapPin, Clock, Filter, X, Package, ArrowLeft, CheckCircle2, AlertCircle, MessageSquare, User as UserIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import Modal from '@/components/Modal';

export default function Browse() {
  const { user } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  useEffect(() => {
    Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('locations').select('*').order('sort_order'),
    ]).then(([catRes, locRes]) => {
      setCategories(catRes.data ?? []);
      setLocations(locRes.data ?? []);
    });
  }, []);

  useEffect(() => {
    let query = supabase
      .from('items')
      .select('*, category:categories(*), location:locations(*), reporter:profiles(*)')
      .order('created_at', { ascending: false });

    if (typeFilter !== 'all') query = query.eq('type', typeFilter);
    if (categoryFilter) query = query.eq('category_id', categoryFilter);
    if (locationFilter) query = query.eq('location_id', locationFilter);
    if (statusFilter !== 'all') query = query.eq('status', statusFilter);

    query.then(({ data }) => {
      setItems((data ?? []) as Item[]);
      setLoading(false);
    });
  }, [typeFilter, categoryFilter, locationFilter, statusFilter]);

  const filteredItems = useMemo(() => {
    if (!search) return items;
    const q = search.toLowerCase();
    return items.filter((item) =>
      item.title.toLowerCase().includes(q) ||
      (item.description?.toLowerCase().includes(q) ?? false) ||
      (item.color?.toLowerCase().includes(q) ?? false) ||
      (item.brand?.toLowerCase().includes(q) ?? false) ||
      (item.category?.name.toLowerCase().includes(q) ?? false) ||
      (item.location?.name.toLowerCase().includes(q) ?? false)
    );
  }, [items, search]);

  const activeFilters = (typeFilter !== 'all' ? 1 : 0) + (categoryFilter ? 1 : 0) + (locationFilter ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0);

  const clearFilters = () => {
    setTypeFilter('all');
    setCategoryFilter('');
    setLocationFilter('');
    setStatusFilter('active');
    setSearch('');
  };

  // Potential matches: when viewing a lost item, show found items with same category
  const potentialMatches = useMemo(() => {
    if (!selectedItem || selectedItem.type !== 'lost') return [];
    return items.filter(
      (i) => i.type === 'found' && i.status === 'active' && i.category_id === selectedItem.category_id && i.id !== selectedItem.id
    );
  }, [selectedItem, items]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Browse Items</h1>
        <p className="text-slate-500">Search and filter through all reported lost and found items.</p>
      </div>

      {/* Search bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-11"
            placeholder="Search by title, description, color, brand..."
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`btn-secondary relative ${showFilters ? 'border-blue-400 text-blue-600' : ''}`}
        >
          <Filter className="w-5 h-5" />
          <span className="hidden sm:inline">Filters</span>
          {activeFilters > 0 && (
            <span className="absolute -top-2 -right-2 w-5 h-5 bg-blue-600 text-white text-xs rounded-full flex items-center justify-center">
              {activeFilters}
            </span>
          )}
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="card p-4 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-slide-down">
          <div>
            <label className="label">Type</label>
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as 'all' | 'lost' | 'found')} className="select-field">
              <option value="all">All Items</option>
              <option value="lost">Lost Items</option>
              <option value="found">Found Items</option>
            </select>
          </div>
          <div>
            <label className="label">Category</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="select-field">
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Location</label>
            <select value={locationFilter} onChange={(e) => setLocationFilter(e.target.value)} className="select-field">
              <option value="">All Locations</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Status</label>
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select-field">
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="matched">Matched</option>
              <option value="claimed">Claimed</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>
          {activeFilters > 0 && (
            <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
              <button onClick={clearFilters} className="btn-ghost text-sm">
                <X className="w-4 h-4" />
                Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {loading ? 'Loading...' : `${filteredItems.length} item${filteredItems.length !== 1 ? 's' : ''} found`}
        </p>
      </div>

      {/* Items grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="w-11 h-11 bg-slate-200 rounded-xl mb-3" />
              <div className="h-4 bg-slate-200 rounded mb-2 w-3/4" />
              <div className="h-3 bg-slate-200 rounded mb-3 w-1/2" />
              <div className="h-3 bg-slate-200 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filteredItems.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-700 mb-1">No items found</h3>
          <p className="text-slate-500 text-sm">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => {
            const Icon = getCategoryIcon(item.category?.icon ?? 'Package');
            const isLost = item.type === 'lost';
            return (
              <button
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="card p-5 text-left hover:shadow-md hover:border-blue-200 transition-all duration-200 group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    isLost ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`badge ${statusColor(item.status)}`}>
                    {statusLabel(item.status)}
                  </span>
                </div>
                <h3 className="font-semibold text-slate-800 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className={`badge ${
                    isLost ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  }`}>
                    {isLost ? 'Lost' : 'Found'}
                  </span>
                  {item.category && <span className="text-xs text-slate-500">{item.category.name}</span>}
                </div>
                {item.description && (
                  <p className="text-sm text-slate-500 mb-3 line-clamp-2">{item.description}</p>
                )}
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  {item.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {item.location.name}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {timeAgo(item.report_date)}
                  </span>
                </div>
                {item.status === 'resolved' && (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Returned to owner
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Item detail modal */}
      {selectedItem && (
        <ItemDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          currentUserId={user?.id ?? ''}
          potentialMatches={potentialMatches}
          onMatchClick={(item) => setSelectedItem(item)}
        />
      )}
    </div>
  );
}

function ItemDetailModal({
  item,
  onClose,
  currentUserId,
  potentialMatches,
  onMatchClick,
}: {
  item: Item;
  onClose: () => void;
  currentUserId: string;
  potentialMatches: Item[];
  onMatchClick: (item: Item) => void;
}) {
  const { user } = useAuth();
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimMessage, setClaimMessage] = useState('');
  const [claimVerification, setClaimVerification] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [claimResult, setClaimResult] = useState<'success' | 'error' | null>(null);
  const [existingClaim, setExistingClaim] = useState(false);

  const Icon = getCategoryIcon(item.category?.icon ?? 'Package');
  const isLost = item.type === 'lost';
  const isOwner = item.reported_by === currentUserId;
  const canClaim = !isOwner && item.type === 'found' && item.status === 'active';

  useEffect(() => {
    if (canClaim && user) {
      supabase
        .from('claims')
        .select('id')
        .eq('item_id', item.id)
        .eq('claimant_id', user.id)
        .maybeSingle()
        .then(({ data }) => setExistingClaim(!!data));
    }
  }, [canClaim, user, item.id]);

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSubmitting(true);
    setClaimResult(null);

    const { error } = await supabase.from('claims').insert({
      item_id: item.id,
      claimant_id: user.id,
      message: claimMessage,
      verification_answer: claimVerification || null,
      status: 'pending',
    });

    setSubmitting(false);
    if (error) {
      setClaimResult('error');
    } else {
      setClaimResult('success');
    }
  };

  return (
    <Modal open={true} onClose={onClose} title="Item Details" maxWidth="max-w-2xl">
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isLost ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
          }`}>
            <Icon className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-slate-800">{item.title}</h3>
            <div className="flex items-center gap-2 mt-1">
              <span className={`badge ${
                isLost ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
              }`}>
                {isLost ? 'Lost' : 'Found'}
              </span>
              <span className={`badge ${statusColor(item.status)}`}>
                {statusLabel(item.status)}
              </span>
            </div>
          </div>
        </div>

        {/* Image */}
        {item.image_url && (
          <img src={item.image_url} alt={item.title} className="w-full max-h-64 object-cover rounded-xl" />
        )}

        {/* Description */}
        {item.description && (
          <div>
            <h4 className="text-sm font-semibold text-slate-700 mb-1">Description</h4>
            <p className="text-sm text-slate-600">{item.description}</p>
          </div>
        )}

        {/* Details grid */}
        <div className="grid sm:grid-cols-2 gap-3">
          {item.category && (
            <DetailRow icon={<Package className="w-4 h-4" />} label="Category" value={item.category.name} />
          )}
          {item.location && (
            <DetailRow icon={<MapPin className="w-4 h-4" />} label="Location" value={item.location.name} />
          )}
          {item.color && (
            <DetailRow icon={<Package className="w-4 h-4" />} label="Color" value={item.color} />
          )}
          {item.brand && (
            <DetailRow icon={<Package className="w-4 h-4" />} label="Brand" value={item.brand} />
          )}
          {item.incident_date && (
            <DetailRow icon={<Clock className="w-4 h-4" />} label={isLost ? 'Lost Date' : 'Found Date'} value={formatDate(item.incident_date)} />
          )}
          <DetailRow icon={<Clock className="w-4 h-4" />} label="Reported" value={formatDate(item.report_date)} />
        </div>

        {/* Reporter info */}
        {item.reporter && (
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="w-9 h-9 bg-slate-200 rounded-full flex items-center justify-center">
              <UserIcon className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-700">{item.reporter.full_name}</p>
              <p className="text-xs text-slate-500">Reported this item</p>
            </div>
          </div>
        )}

        {/* Potential matches */}
        {potentialMatches.length > 0 && (
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <h4 className="text-sm font-semibold text-amber-800 mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Potential Matches ({potentialMatches.length})
            </h4>
            <p className="text-xs text-amber-700 mb-3">
              These found items are in the same category. Click to view details.
            </p>
            <div className="space-y-2">
              {potentialMatches.slice(0, 3).map((match) => {
                const MatchIcon = getCategoryIcon(match.category?.icon ?? 'Package');
                return (
                  <button
                    key={match.id}
                    onClick={() => onMatchClick(match)}
                    className="w-full flex items-center gap-3 p-2.5 bg-white rounded-lg border border-amber-100 hover:border-amber-300 transition-all text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <MatchIcon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-700 truncate">{match.title}</p>
                      <p className="text-xs text-slate-400">
                        {match.location?.name ?? 'Unknown location'} · {timeAgo(match.report_date)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Owner notice */}
        {isOwner && (
          <div className="px-4 py-3 bg-blue-50 text-blue-700 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            This is your report. You'll be notified when someone claims this item.
          </div>
        )}

        {/* Claim section */}
        {canClaim && !showClaimForm && !existingClaim && claimResult !== 'success' && (
          <button onClick={() => setShowClaimForm(true)} className="btn-primary w-full">
            <MessageSquare className="w-5 h-5" />
            Submit a Claim
          </button>
        )}

        {existingClaim && (
          <div className="px-4 py-3 bg-amber-50 text-amber-700 rounded-lg text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            You have already submitted a claim for this item.
          </div>
        )}

        {claimResult === 'success' && (
          <div className="px-4 py-3 bg-emerald-50 text-emerald-700 rounded-lg text-sm flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            Your claim has been submitted! The admin will review it shortly.
          </div>
        )}

        {showClaimForm && claimResult !== 'success' && (
          <form onSubmit={handleClaimSubmit} className="space-y-4 p-4 bg-slate-50 rounded-xl">
            <h4 className="font-semibold text-slate-700">Submit Your Claim</h4>
            <p className="text-xs text-slate-500">
              Provide details to verify you are the rightful owner.
            </p>
            {claimResult === 'error' && (
              <div className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm">
                Failed to submit claim. Please try again.
              </div>
            )}
            <div>
              <label className="label">Why do you believe this is yours? *</label>
              <textarea
                required
                value={claimMessage}
                onChange={(e) => setClaimMessage(e.target.value)}
                rows={3}
                className="input-field resize-none"
                placeholder="Describe specific details only the owner would know..."
              />
            </div>
            <div>
              <label className="label">Verification detail (optional)</label>
              <input
                type="text"
                value={claimVerification}
                onChange={(e) => setClaimVerification(e.target.value)}
                className="input-field"
                placeholder="e.g., serial number, unique markings, contents..."
              />
            </div>
            <div className="flex gap-3">
              <button type="submit" disabled={submitting} className="btn-primary flex-1">
                {submitting ? 'Submitting...' : 'Submit Claim'}
              </button>
              <button type="button" onClick={() => setShowClaimForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        )}

        {item.contact_info && !isOwner && (
          <div className="px-4 py-3 bg-slate-50 rounded-lg text-sm text-slate-600">
            <span className="font-medium">Contact: </span>{item.contact_info}
          </div>
        )}
      </div>
    </Modal>
  );
}

function DetailRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 p-3 bg-slate-50 rounded-lg">
      <span className="text-slate-400 flex-shrink-0">{icon}</span>
      <div className="min-w-0">
        <p className="text-xs text-slate-400">{label}</p>
        <p className="text-sm font-medium text-slate-700 truncate">{value}</p>
      </div>
    </div>
  );
}
