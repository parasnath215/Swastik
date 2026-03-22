import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Users, Plus, Edit2, Trash2, Key } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function UsersManagement() {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore(state => state.user);
  
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', role: 'OPERATOR'
  });

  const { data: users, isLoading } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const res = await api.get('/users');
      return res.data;
    }
  });

  const createUser = useMutation({
    mutationFn: async (data: any) => await api.post('/users', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setFormData({ name: '', email: '', password: '', role: 'OPERATOR' });
    },
    onError: (err: any) => alert(err.response?.data?.error || 'Failed to create user')
  });

  const updateUser = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => await api.put(`/users/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setIsEditing(null);
      setFormData({ name: '', email: '', password: '', role: 'OPERATOR' });
    },
    onError: (err: any) => alert(err.response?.data?.error || 'Failed to update user')
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => await api.delete(`/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
    onError: (err: any) => alert(err.response?.data?.error || 'Failed to delete user')
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditing) {
      updateUser.mutate({ id: isEditing, data: formData });
    } else {
      createUser.mutate(formData);
    }
  };

  const handleEdit = (user: any) => {
    setIsEditing(user.id);
    setFormData({ name: user.name, email: user.email, password: '', role: user.role });
  };

  const handleCancel = () => {
    setIsEditing(null);
    setFormData({ name: '', email: '', password: '', role: 'OPERATOR' });
  };

  const roles = ['SUPER_ADMIN', 'ADMIN', 'SALES', 'OPERATOR'];

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center">
          <Users className="w-8 h-8 mr-3 text-blue-400" /> Users & Roles
        </h1>
        <p className="text-slate-400 mt-2 font-medium">Manage personnel access, credentials, and permissions across the platform.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FORM SECTION */}
        <div className="lg:col-span-1">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
             <div className="absolute -right-10 -top-10 w-40 h-40 bg-blue-500/5 rounded-full blur-[40px] pointer-events-none"></div>
             <h3 className="text-xl font-bold text-white mb-6 flex items-center">
               {isEditing ? <Edit2 className="w-5 h-5 mr-2 text-teal-400" /> : <Plus className="w-5 h-5 mr-2 text-blue-400" />}
               {isEditing ? 'Edit User' : 'Add New User'}
             </h3>
             <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
               <div>
                 <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1 mb-1 block">Full Name</label>
                 <input type="text" required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all" placeholder="John Doe" />
               </div>
               <div>
                 <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1 mb-1 block">Email Address</label>
                 <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all" placeholder="john@sriswastik.com" />
               </div>
               <div>
                 <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1 mb-1 block">Role (Access Level)</label>
                 <select required value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all">
                   {roles.map(r => <option key={r} value={r}>{r}</option>)}
                 </select>
               </div>
               <div>
                 <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider pl-1 mb-1 flex items-center">
                   Password {isEditing && <span className="ml-2 text-[10px] text-amber-500">(Leave blank to keep same)</span>}
                 </label>
                 <div className="relative">
                   <Key className="absolute left-3 top-3.5 w-4 h-4 text-slate-500" />
                   <input type="password" required={!isEditing} minLength={6} value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-10 pr-4 py-3 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 outline-none transition-all" placeholder="••••••••" />
                 </div>
               </div>
               
               <div className="pt-4 flex gap-3">
                 {isEditing && (
                   <button type="button" onClick={handleCancel} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition-colors">
                     Cancel
                   </button>
                 )}
                 <button type="submit" disabled={createUser.isPending || updateUser.isPending} className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all active:scale-[0.98]">
                   {isEditing ? 'Update User' : 'Create User'}
                 </button>
               </div>
             </form>
          </div>
        </div>

        {/* LIST SECTION */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-xl min-h-[500px]">
            <h3 className="text-xl font-bold text-white mb-6">Active Personnel</h3>
            
            {isLoading ? (
              <div className="flex items-center justify-center py-20 text-slate-400">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div> Loading User Matrix...
              </div>
            ) : (
              <div className="bg-[#0f172a] rounded-2xl border border-slate-700/50 overflow-hidden shadow-inner">
                <table className="w-full text-left text-sm text-slate-300">
                  <thead className="bg-[#1e293b] text-xs uppercase font-black tracking-widest text-slate-500 border-b border-slate-800">
                    <tr>
                      <th className="px-6 py-4 w-1/3">Name / Email</th>
                      <th className="px-6 py-4 w-1/4">Role Context</th>
                      <th className="px-6 py-4 w-1/4">Created On</th>
                      <th className="px-6 py-4 text-center">Manage</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {users?.map((u: any) => (
                      <tr key={u.id} className="hover:bg-slate-800/40 transition-colors group">
                        <td className="px-6 py-4">
                          <p className="font-bold text-slate-200">{u.name}</p>
                          <p className="text-xs text-slate-500 mt-0.5">{u.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded border ${
                            u.role === 'SUPER_ADMIN' ? 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20' :
                            u.role === 'ADMIN' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                            u.role === 'SALES' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            'bg-blue-500/10 text-blue-400 border-blue-500/20'
                          }`}>
                            {u.role.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-400 text-xs font-semibold">
                          {new Date(u.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <div className="flex justify-center gap-2 opacity-10 lg:opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEdit(u)} className="p-2 bg-slate-800 hover:bg-teal-500/20 text-slate-400 hover:text-teal-400 border border-slate-700 hover:border-teal-500/30 rounded-lg transition-all" title="Edit Access">
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {currentUser?.id !== u.id && (
                              <button onClick={() => { if(confirm('Permanently wipe user access records?')) deleteUser.mutate(u.id); }} className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/30 rounded-lg transition-all" title="Wipe User">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            <p className="text-center text-xs font-black uppercase tracking-widest text-slate-600 mt-6">
              Critical System Interface: Unauthorized changes strictly prohibited
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
