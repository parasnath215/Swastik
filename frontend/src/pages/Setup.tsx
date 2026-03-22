import { useState, type FormEvent } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { Settings, Plus, Trash2, Play, Box } from 'lucide-react';

type TabType = 'machines' | 'processes' | 'materials';

export default function Setup() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabType>('machines');
  const [formData, setFormData] = useState({ name: '', description: '', hourlyRate: 0, unitCost: 0 });

  // Fetching
  const { data: machines, isLoading: mLoading } = useQuery({ queryKey: ['machines'], queryFn: async () => (await api.get('/resources/machines')).data });
  const { data: processes, isLoading: pLoading } = useQuery({ queryKey: ['processes'], queryFn: async () => (await api.get('/resources/processes')).data });
  const { data: materials, isLoading: matLoading } = useQuery({ queryKey: ['materials'], queryFn: async () => (await api.get('/resources/materials')).data });

  // Current data and loading state based on tab
  const dataMap = { machines, processes, materials };
  const loadingMap = { machines: mLoading, processes: pLoading, materials: matLoading };
  const currentData = dataMap[activeTab];
  const isLoading = loadingMap[activeTab];

  // Mutations
  const createResource = useMutation({
    mutationFn: async (data: any) => {
      await api.post(`/resources/${activeTab}`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [activeTab] });
      setFormData({ name: '', description: '', hourlyRate: 0, unitCost: 0 });
    },
    onError: (err: any) => alert(err.response?.data?.error || 'Failed to create resource')
  });

  const deleteResource = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/resources/${activeTab}/${id}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [activeTab] }),
    onError: (err: any) => alert(err.response?.data?.error || 'Failed to delete resource')
  });

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    createResource.mutate(formData);
  };

  const tabs: { id: TabType; label: string; icon: React.ElementType }[] = [
    { id: 'machines', label: 'Machines', icon: Settings },
    { id: 'processes', label: 'Processes', icon: Play },
    { id: 'materials', label: 'Materials', icon: Box },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center">
          <Settings className="w-8 h-8 mr-3 text-blue-400" /> Setup & Configuration
        </h1>
        <p className="text-slate-400 mt-2">Manage machines, processes, and raw materials for production.</p>
      </div>

      <div className="flex space-x-2 mb-6 border-b border-slate-800 pb-2">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center px-4 py-2 rounded-lg font-semibold text-sm transition-all shadow-sm ${
              activeTab === tab.id 
                ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
            }`}
          >
            <tab.icon className="w-4 h-4 mr-2" /> {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-xl font-bold text-white mb-4">Add New {activeTab.slice(0, -1)}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                  placeholder={`e.g., ${activeTab === 'materials' ? 'Steel Alloy' : 'CNC Machine 1'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-1">Description (Optional)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600 resize-none h-24"
                  placeholder="Additional details..."
                />
              </div>
              
              {activeTab === 'machines' && (
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Hourly Rate (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.hourlyRate}
                    onChange={(e) => setFormData({ ...formData, hourlyRate: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                  />
                </div>
              )}

              {activeTab === 'materials' && (
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Unit Cost (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.unitCost}
                    onChange={(e) => setFormData({ ...formData, unitCost: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-950/80 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-slate-600"
                  />
                </div>
              )}

              <button 
                type="submit" 
                disabled={createResource.isPending || !formData.name}
                className="w-full flex justify-center items-center py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white rounded-lg font-semibold transition-colors shadow-md"
              >
                {createResource.isPending ? 'Adding...' : <><Plus className="w-4 h-4 mr-2" /> Add {activeTab.slice(0, -1)}</>}
              </button>
            </form>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-lg min-h-[400px]">
             <h3 className="text-xl font-bold text-white mb-4 capitalize">Existing {activeTab}</h3>
             
             {isLoading ? (
               <div className="text-slate-400 flex items-center justify-center py-10">
                 <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-3"></div> Loading...
               </div>
             ) : (currentData?.length === 0) ? (
               <div className="text-center py-10 text-slate-500 border border-dashed border-slate-700 rounded-xl">
                 No {activeTab} configured yet.
               </div>
             ) : (
               <div className="space-y-3">
                 {currentData?.map((item: any) => (
                   <div key={item.id} className="flex justify-between items-center bg-slate-950/60 border border-slate-800 p-4 rounded-xl hover:border-slate-700 transition-colors">
                     <div>
                       <h4 className="font-semibold text-slate-200">{item.name}</h4>
                       {item.description && <p className="text-sm text-slate-500 mt-1">{item.description}</p>}
                       {activeTab === 'machines' && <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-wide">Rate: ₹{item.hourlyRate}/Hr</p>}
                       {activeTab === 'materials' && <p className="text-xs font-bold text-slate-400 mt-2 uppercase tracking-wide">Unit Cost: ₹{item.unitCost}</p>}
                     </div>
                     <div className="flex space-x-2">
                       {/* Edit functionality left out for brevity, but easy to add if needed */}
                       <button 
                         onClick={() => {
                           if (confirm('Are you sure you want to delete this item?')) {
                             deleteResource.mutate(item.id);
                           }
                         }}
                         className="p-2 bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-slate-700 hover:border-red-500/30 rounded-lg transition-all"
                         title="Delete"
                       >
                         <Trash2 className="w-4 h-4" />
                       </button>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}
