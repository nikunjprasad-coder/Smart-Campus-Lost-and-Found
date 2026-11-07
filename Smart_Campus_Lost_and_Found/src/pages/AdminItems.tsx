import { useEffect, useState } from 'react';
import { supabase, type Item, type Category, type Location } from '@/lib/supabase';
import { getCategoryIcon } from '@/lib/types';
import { statusColor, statusLabel, formatDate } from '@/lib/utils';
import Modal from '@/components/Modal';
import { Package, Clock, Search, Trash2, Edit3, X, Check } from 'lucide-react';

export default function AdminItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'lost' | 'found'>('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editItem, setEditItem] = useState<Item | null>(null);
  const [editStatus, setEditStatus] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchItems();
    Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('locations').select('*').order('sort_order'),
    ]).then(([catRes, locRes]) => {
      setCategories(catRes.data ?? []);
      setLocations(locRes.data ?? []);
    });
  }, [typeFilter, statusFilter]);

  const fetchItems = async () => {
    setLoading(true);
    let query = supabase
      .from('items')
      .select('*, category:categories(*), location:locations(*), reporter:profiles(*)')
      .order('created_at', { ascending: false });

    if (typeFilter !== 'all') query = query.eq('type', typeFilter);
    if (statusFilter !== 'all') query = query.eq('status', statusFilter);

    const { data } = await query;
    setItems((data ?? []) as Item[]);
    setLoading(false);
  };

  const filtered = items.filter((item) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.description?.toLowerCase().includes(q) ?? false)
    );
  });

  const handleSaveStatus = async () => {
    if (!editItem) return;
    setSaving(true);
    await supabase.from('items').update({ status: editStatus }).eq('id', editItem.id);
    setSaving(false);
    setEditItem(null);
    fetchItems();
  };

  const handleDelete = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) return;
    await supabase.from('items').delete().eq('id', itemId);
    fetchItems();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 mb-1">Manage Items</h1>
        <p className="text-slate-500">View, update status, and remove reported items.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-11"
            placeholder="Search items..."
          />
        </div>
        <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as 'all' | 'lost' | 'found')} className="select-field w-auto">
          <option value="all">All Types</option>
          <option value="lost">Lost</option>
          <option value="found">Found</option>
        </select>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="select-field w-auto">
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="matched">Matched</option>
          <option value="claimed">Claimed</option>
          <option value="resolved">Resolved</option>
          <option value="expired">Expired</option>
        </select>
      </div>

      {/* Items table */}
      {loading ? (
        <div className="card p-12 text-center text-slate-400">
          <Clock className="w-8 h-8 mx-auto mb-2 animate-pulse" />
          Loading...
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-700 mb-1">No items found</h3>
          <p className="text-slate-500 text-sm">No items match your filters.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          {/* Desktop table */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Category</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Location</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => {
                  const Icon = getCategoryIcon(item.category?.icon ?? 'Package');
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            item.type === 'lost' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">{item.title}</p>
                            <p className="text-xs text-slate-400 truncate">{item.reporter?.full_name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`badge ${
                          item.type === 'lost' ? 'bg-red-50 text-red-600 border-red-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {item.type === 'lost' ? 'Lost' : 'Found'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{item.category?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{item.location?.name ?? '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`badge ${statusColor(item.status)}`}>{statusLabel(item.status)}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-500">{formatDate(item.report_date)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setEditItem(item); setEditStatus(item.status); }}
                            className="p-2 rounded-lg hover:bg-blue-50 text-slate-500 hover:text-blue-600 transition-colors"
                            title="Edit status"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
                            title="Delete item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="lg:hidden divide-y divide-slate-100">
            {filtered.map((item) => {
              const Icon = getCategoryIcon(item.category?.icon ?? 'Package');
              return (
                <div key={item.id} className="p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        item.type === 'lost' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{item.title}</p>
                        <p className="text-xs text-slate-400">{item.category?.name} · {item.location?.name ?? 'No location'}</p>
                      </div>
                    </div>
                    <span className={`badge ${statusColor(item.status)} flex-shrink-0`}>{statusLabel(item.status)}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => { setEditItem(item); setEditStatus(item.status); }}
                      className="btn-ghost text-sm flex-1"
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit Status
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="btn-ghost text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Edit modal */}
      {editItem && (
        <Modal open={true} onClose={() => setEditItem(null)} title="Update Item Status">
          <div className="space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <p className="text-sm font-medium text-slate-700">{editItem.title}</p>
              <p className="text-xs text-slate-400 mt-0.5">
                {editItem.type === 'lost' ? 'Lost' : 'Found'} · {formatDate(editItem.report_date)}
              </p>
            </div>

            <div>
              <label className="label">Status</label>
              <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="select-field">
                <option value="active">Active</option>
                <option value="matched">Matched</option>
                <option value="claimed">Claimed</option>
                <option value="resolved">Resolved</option>
                <option value="expired">Expired</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button onClick={handleSaveStatus} disabled={saving} className="btn-primary flex-1">
                <Check className="w-4 h-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => setEditItem(null)} className="btn-secondary">
                <X className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
