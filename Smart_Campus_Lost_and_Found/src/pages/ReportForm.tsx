import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { supabase, type Category, type Location } from '@/lib/supabase';
import type { Page } from '@/components/Layout';
import { Search, Package, TrendingUp, Clock, CheckCircle2, AlertCircle, ArrowRight, PlusCircle, Loader2 } from 'lucide-react';

type Props = {
  type: 'lost' | 'found';
  onNavigate: (page: Page) => void;
};

export default function ReportForm({ type, onNavigate }: Props) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [locationId, setLocationId] = useState('');
  const [color, setColor] = useState('');
  const [brand, setBrand] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [incidentDate, setIncidentDate] = useState('');

  useEffect(() => {
    Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('locations').select('*').order('sort_order'),
    ]).then(([catRes, locRes]) => {
      setCategories(catRes.data ?? []);
      setLocations(locRes.data ?? []);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    setError(null);

    const { error } = await supabase.from('items').insert({
      type,
      title,
      description: description || null,
      category_id: categoryId || null,
      location_id: locationId || null,
      color: color || null,
      brand: brand || null,
      image_url: imageUrl || null,
      contact_info: contactInfo || null,
      incident_date: incidentDate || null,
      status: 'active',
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-xl mx-auto animate-fade-in">
        <div className="card p-8 text-center">
          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-emerald-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">
            {type === 'lost' ? 'Lost Item Reported!' : 'Found Item Reported!'}
          </h2>
          <p className="text-slate-500 mb-6">
            {type === 'lost'
              ? 'Your lost item has been posted. You will be notified if someone reports finding a matching item.'
              : 'Thank you for reporting this found item. The owner can now submit a claim to recover it.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => onNavigate('browse')} className="btn-primary">
              Browse Items
            </button>
            <button
              onClick={() => {
                setSuccess(false);
                setTitle('');
                setDescription('');
                setCategoryId('');
                setLocationId('');
                setColor('');
                setBrand('');
                setImageUrl('');
                setContactInfo('');
                setIncidentDate('');
              }}
              className="btn-secondary"
            >
              Report Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isLost = type === 'lost';

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-1">
          {isLost ? 'Report a Lost Item' : 'Report a Found Item'}
        </h1>
        <p className="text-slate-500">
          {isLost
            ? 'Provide details about what you lost to help others identify it.'
            : 'Provide details about what you found so the owner can claim it.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {error && (
          <div className="px-4 py-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200 animate-slide-down">
            {error}
          </div>
        )}

        <div>
          <label className="label">Item Title *</label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input-field"
            placeholder={isLost ? 'e.g., Black iPhone 13 with blue case' : 'e.g., Found: Black wallet near library'}
          />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="input-field resize-none"
            placeholder="Add any distinguishing features, contents, or other details..."
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Category</label>
            <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} className="select-field">
              <option value="">Select category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Location</label>
            <select value={locationId} onChange={(e) => setLocationId(e.target.value)} className="select-field">
              <option value="">Select location...</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Color</label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="input-field"
              placeholder="e.g., Black, Blue"
            />
          </div>
          <div>
            <label className="label">Brand</label>
            <input
              type="text"
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="input-field"
              placeholder="e.g., Apple, Nike"
            />
          </div>
        </div>

        <div>
          <label className="label">
            {isLost ? 'When did you lose it?' : 'When did you find it?'}
          </label>
          <input
            type="date"
            value={incidentDate}
            onChange={(e) => setIncidentDate(e.target.value)}
            className="input-field"
          />
        </div>

        <div>
          <label className="label">Image URL (optional)</label>
          <input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            className="input-field"
            placeholder="https://example.com/photo.jpg"
          />
        </div>

        <div>
          <label className="label">Contact Info (optional)</label>
          <input
            type="text"
            value={contactInfo}
            onChange={(e) => setContactInfo(e.target.value)}
            className="input-field"
            placeholder="Phone or email for the claimant to reach you"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading} className="btn-primary flex-1">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                {isLost ? 'Report Lost Item' : 'Report Found Item'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
          <button type="button" onClick={() => onNavigate('dashboard')} className="btn-secondary">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
