import type { Item, Category, Location } from '@/lib/supabase';
import { getCategoryIcon } from '@/lib/types';
import { statusColor, statusLabel, timeAgo } from '@/lib/utils';
import { MapPin, Clock, SearchIcon, CheckCircle2 } from 'lucide-react';

type Props = {
  item: Item & { category?: Category | null; location?: Location | null };
  onClick: () => void;
};

export default function ItemCard({ item, onClick }: Props) {
  const Icon = getCategoryIcon(item.category?.icon ?? 'Package');
  const isLost = item.type === 'lost';

  return (
    <button
      onClick={onClick}
      className="card p-5 text-left hover:shadow-md hover:border-blue-200 transition-all duration-200 group animate-fade-in"
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
          isLost
            ? 'bg-red-50 text-red-600 border-red-100'
            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
        }`}>
          {isLost ? 'Lost' : 'Found'}
        </span>
        {item.category && (
          <span className="text-xs text-slate-500">{item.category.name}</span>
        )}
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
      {item.status === 'matched' && (
        <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-600 font-medium">
          <SearchIcon className="w-4 h-4" />
          Potential match found
        </div>
      )}
    </button>
  );
}
