export function formatDate(date: string | null): string {
  if (!date) return 'Unknown';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | null): string {
  if (!date) return 'Unknown';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function timeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return formatDate(date);
}

export function statusColor(status: string): string {
  switch (status) {
    case 'active': return 'bg-blue-100 text-blue-700 border-blue-200';
    case 'matched': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'claimed': return 'bg-purple-100 text-purple-700 border-purple-200';
    case 'resolved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'expired': return 'bg-gray-100 text-gray-500 border-gray-200';
    case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
    case 'withdrawn': return 'bg-gray-100 text-gray-500 border-gray-200';
    default: return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

export function statusLabel(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
