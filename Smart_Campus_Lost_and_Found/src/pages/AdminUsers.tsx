import { useState, useEffect, useCallback } from 'react';
import { supabase, type Profile } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { ShieldCheck, Users, ArrowUpRight, ArrowDownRight, Loader2, Search, Mail, IdCard } from 'lucide-react';

export default function AdminUsers() {
  const { profile } = useAuth();
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      setError(error.message);
    } else {
      setUsers((data as Profile[]) || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleRole = async (user: Profile) => {
    setActionLoading(user.user_id);
    setError(null);
    setSuccess(null);
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    const { error } = await supabase.rpc('promote_user', {
      target_user_id: user.user_id,
      new_role: newRole,
    });
    if (error) {
      setError(error.message);
    } else {
      setSuccess(`${user.full_name} is now ${newRole === 'admin' ? 'an administrator' : 'a regular user'}.`);
      setUsers(prev => prev.map(u => u.user_id === user.user_id ? { ...u, role: newRole as 'user' | 'admin' } : u));
    }
    setActionLoading(null);
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    return u.full_name.toLowerCase().includes(q)
      || (u.student_id?.toLowerCase().includes(q) ?? false);
  });

  const adminCount = users.filter(u => u.role === 'admin').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">User Management</h1>
        <p className="text-slate-500 mt-1">Promote or demote users between admin and regular roles.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{users.length}</p>
              <p className="text-sm text-slate-500">Total Users</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{adminCount}</p>
              <p className="text-sm text-slate-500">Administrators</p>
            </div>
          </div>
        </div>
        <div className="card p-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-slate-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{users.length - adminCount}</p>
              <p className="text-sm text-slate-500">Regular Users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="px-4 py-3 rounded-lg text-sm bg-red-50 text-red-700 border border-red-200 animate-slide-down">
          {error}
        </div>
      )}
      {success && (
        <div className="px-4 py-3 rounded-lg text-sm bg-emerald-50 text-emerald-700 border border-emerald-200 animate-slide-down">
          {success}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-10"
          placeholder="Search by name or student ID..."
        />
      </div>

      {/* User list */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider hidden sm:table-cell">Student ID</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Role</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((user) => {
                const isSelf = user.user_id === profile?.user_id;
                return (
                  <tr key={user.user_id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                          user.role === 'admin' ? 'bg-amber-100' : 'bg-slate-200'
                        }`}>
                          <span className={`text-sm font-medium ${user.role === 'admin' ? 'text-amber-700' : 'text-slate-600'}`}>
                            {user.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-800 truncate">
                            {user.full_name}
                            {isSelf && <span className="text-xs text-slate-400 ml-1.5">(You)</span>}
                          </p>
                          <p className="text-xs text-slate-400 truncate sm:hidden flex items-center gap-1">
                            <IdCard className="w-3 h-3" />
                            {user.student_id || 'No ID'}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-sm text-slate-600">{user.student_id || '—'}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        user.role === 'admin'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {user.role === 'admin' && <ShieldCheck className="w-3 h-3" />}
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleToggleRole(user)}
                        disabled={actionLoading === user.user_id || isSelf}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 ${
                          isSelf
                            ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                            : user.role === 'admin'
                              ? 'bg-red-50 text-red-600 hover:bg-red-100'
                              : 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                        }`}
                      >
                        {actionLoading === user.user_id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : user.role === 'admin' ? (
                          <>
                            <ArrowDownRight className="w-3.5 h-3.5" />
                            Demote
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                            Promote
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-400">
            <Mail className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No users found matching your search.</p>
          </div>
        )}
      </div>

      <div className="card p-4 bg-blue-50/50 border-blue-200">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-slate-600">
            <p className="font-medium text-slate-700 mb-1">How admin accounts work</p>
            <ul className="space-y-1 text-xs text-slate-500">
              <li>The first user to register is automatically made an admin.</li>
              <li>New admins can be created at signup using the admin registration code: <code className="px-1.5 py-0.5 bg-slate-200 rounded font-mono text-xs">CAMPUS-ADMIN-2026</code></li>
              <li>Existing admins can promote or demote other users from this page.</li>
              <li>You cannot demote your own admin account to prevent lockout.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
