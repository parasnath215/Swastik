import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import { CheckCircle, AlertCircle, Trash2, Settings, Wrench, Box, Plus, ChevronDown, ChevronRight, Play } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function PhaseManager() {
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);
  const [newPhaseNames, setNewPhaseNames] = useState<Record<string, string>>({});
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const res = await api.get('/projects');
      return res.data;
    }
  });

  const { data: machines } = useQuery({ queryKey: ['machines'], queryFn: async () => (await api.get('/resources/machines')).data });
  const { data: processes } = useQuery({ queryKey: ['processes'], queryFn: async () => (await api.get('/resources/processes')).data });
  const { data: materials } = useQuery({ queryKey: ['materials'], queryFn: async () => (await api.get('/resources/materials')).data });

  const updateProjectStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      await api.patch(`/projects/${id}/status`, { status });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
    onError: (err: any) => alert(err.response?.data?.error || 'Failed to update project')
  });

  const updatePhase = useMutation({
    mutationFn: async ({ id, data }: { id: string, data: any }) => {
      await api.patch(`/phases/${id}/status`, data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
    onError: (err: any) => alert(err.response?.data?.error || 'Failed to update phase')
  });

  const addResource = useMutation({
    mutationFn: async ({ phaseId }: { phaseId: string }) => {
      await api.post(`/phases/${phaseId}/resources`, {});
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
    onError: (err: any) => alert(err.response?.data?.error || 'Failed to add row')
  });

  const updateResource = useMutation({
    mutationFn: async ({ resId, data }: { resId: string; data: any }) => {
      await api.patch(`/phases/resources/${resId}`, data);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
    onError: (err: any) => alert(err.response?.data?.error || 'Failed to update row')
  });

  const deleteResource = useMutation({
    mutationFn: async ({ resId }: { resId: string }) => {
      await api.delete(`/phases/resources/${resId}`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
    onError: (err: any) => alert(err.response?.data?.error || 'Failed to delete row')
  });

  const createPhase = useMutation({
    mutationFn: async ({ projectId, name, order }: { projectId: string; name: string; order: number }) => {
      await api.post('/phases', { projectId, name, order });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setNewPhaseNames({});
    },
    onError: (err: any) => {
      alert(err.response?.data?.error || 'Failed to create phase');
    }
  });

  const deleteProject = useMutation({
    mutationFn: async (projectId: string) => {
      await api.delete(`/projects/${projectId}`);
    },
    onSuccess: (_, projectId) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      if (selectedProjectId === projectId) setSelectedProjectId(null);
    },
    onError: (err: any) => alert(err.response?.data?.error || 'Failed to delete project')
  });

  // Auto-select phase logistics when accordion opens
  useEffect(() => {
    const activeProject = projects?.find((p: any) => p.id === selectedProjectId);
    if (activeProject?.phases?.length > 0) {
       const phaseExists = activeProject.phases.find((p: any) => p.id === selectedPhaseId);
       if (!phaseExists) setSelectedPhaseId(activeProject.phases[0].id);
    } else {
       setSelectedPhaseId(null);
    }
  }, [selectedProjectId, projects, selectedPhaseId]);

  if (isLoading) return <div className="text-slate-400 flex items-center h-full justify-center"><div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mr-4"></div> Loading...</div>;

  return (
    <div className="bg-transparent text-slate-200 flex flex-col gap-6">
       
       <div className="flex justify-between items-center mb-2">
         <h1 className="text-3xl font-black text-white tracking-tight">Phase Management</h1>
         <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">{projects?.length || 0} Total Projects</span>
       </div>

       {projects?.map((activeProject: any) => {
          const isExpanded = selectedProjectId === activeProject.id;
          const totalPhases = activeProject.phases?.length || 0;
          const completedPhases = activeProject.phases?.filter((p: any) => p.status === 'ACCEPTED').length || 0;
          const progressPercentage = totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;
          
          const activePhase = isExpanded ? activeProject.phases?.find((p: any) => p.id === selectedPhaseId) : null;

          return (
            <div key={activeProject.id} className="bg-[#0f172a] rounded-[2rem] border border-slate-800/80 shadow-[0_0_40px_rgba(0,0,0,0.5)] flex flex-col overflow-hidden transition-all duration-300">
               
               {/* ACCORDION HEADER */}
               <div 
                 onClick={() => setSelectedProjectId(isExpanded ? null : activeProject.id)}
                 className="flex flex-col md:flex-row md:items-center justify-between p-6 sm:p-8 cursor-pointer hover:bg-[#1e293b]/20 transition-colors relative overflow-hidden group"
               >
                 <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-[80px] -mr-10 -mt-20 pointer-events-none group-hover:bg-teal-500/10 transition-colors"></div>
                 
                 <div className="flex items-center gap-6 relative z-10 flex-1 min-w-0 pr-6">
                   <div className={`p-3 rounded-xl transition-colors ${isExpanded ? 'bg-teal-500/10 text-teal-400' : 'bg-slate-800 text-slate-400 group-hover:text-slate-200'}`}>
                     {isExpanded ? <ChevronDown className="w-6 h-6" /> : <ChevronRight className="w-6 h-6" />}
                   </div>
                   <div className="min-w-0">
                     <h1 className="text-2xl font-black text-white tracking-tight flex items-center flex-wrap gap-4 truncate">
                       <span className="truncate">{activeProject.name}</span>
                       <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded border shrink-0 ${
                         activeProject.status === 'LEAD' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                         activeProject.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                         'bg-slate-900/80 text-teal-400 border-teal-500/20'
                       }`}>
                         {activeProject.status.replace('_', ' ')}
                       </span>
                     </h1>
                   </div>
                 </div>
                 
                 <div className="mt-6 md:mt-0 flex items-center justify-between md:justify-end gap-6 relative z-10 md:w-1/2 lg:w-1/3 shrink-0 pl-14 md:pl-0">
                    <div className="flex-1 max-w-xs flex items-center gap-4">
                      <span className="text-xs font-black text-slate-400 w-12 tracking-wider shrink-0 text-right">{progressPercentage}%</span>
                      <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={`h-full transition-all duration-1000 ease-out relative ${progressPercentage === 100 ? 'bg-teal-400 shadow-[0_0_10px_rgba(45,212,191,0.5)]' : 'bg-blue-500 shadow-[0_0_10px_rgba(37,99,235,0.5)]'}`} 
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                       {activeProject.status === 'LEAD' && (user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Releasing this project will push it to the Operator Dashboard. Proceed?')) {
                                 updateProjectStatus.mutate({ id: activeProject.id, status: 'IN_PROGRESS' });
                              }
                            }}
                            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] shrink-0"
                          >
                            <Play className="w-3.5 h-3.5 mr-2" fill="currentColor" /> Start Work
                          </button>
                       )}
                       
                       {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (confirm('Permanently delete project?')) deleteProject.mutate(activeProject.id);
                            }}
                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/20 shrink-0"
                            title="Delete Project"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}
                    </div>
                 </div>
               </div>

               {/* ACCORDION BODY (MASTER-DETAIL WORKSPACE) */}
               {isExpanded && (
                 <div className="border-t border-slate-800/80 flex flex-col lg:flex-row bg-[#1e293b]/20 min-h-[500px]">
                   
                   {/* LEFT SIDEBAR: VERTICAL TIMELINE */}
                   <div className="w-full lg:w-80 bg-[#0f172a]/50 p-6 border-r border-slate-800/80 flex flex-col relative shrink-0">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-8 ml-2">Production Phases</h3>
                      
                      <div className="absolute left-[45px] top-[85px] bottom-10 w-0.5 bg-slate-800 z-0 hidden lg:block"></div>

                      <div className="space-y-2 relative z-10 flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[400px]">
                        {(activeProject.phases ? [...activeProject.phases] : []).sort((a:any,b:any) => a.order - b.order).map((phase: any) => {
                          const isActive = phase.status === 'IN_PROGRESS';
                          const isAccepted = phase.status === 'ACCEPTED';
                          const isSelected = selectedPhaseId === phase.id;

                          return (
                            <div 
                              key={phase.id} 
                              onClick={() => setSelectedPhaseId(phase.id)}
                              className={`flex items-start cursor-pointer group transition-all duration-300 p-3 rounded-xl relative ${isSelected ? 'bg-slate-800/80 shadow-lg border border-slate-700/50' : 'hover:bg-slate-800/40 border border-transparent'}`}
                            >
                              <div className="relative justify-center items-center w-10 h-10 mr-4 shrink-0 -ml-1 hidden lg:flex">
                                 {isActive && (
                                   <span className="absolute w-6 h-6 bg-teal-400/30 rounded-full animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></span>
                                 )}
                                 <div className={`w-4 h-4 rounded-full z-10 border-[3px] transition-all duration-500 ${
                                   isAccepted ? 'bg-teal-400 border-teal-400 shadow-[0_0_12px_rgba(45,212,191,0.6)]' :
                                   isActive ? 'bg-[#0f172a] border-teal-400 ring-4 ring-teal-400/10' :
                                   'bg-slate-800 border-slate-600 group-hover:border-slate-400'
                                 }`}></div>
                              </div>
                              <div className="flex-1 pt-1">
                                <h4 className={`text-sm font-bold transition-colors mb-0.5 ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                                   Phase {phase.order}: {phase.name}
                                </h4>
                                <p className={`text-[10px] font-black uppercase tracking-widest ${
                                   isAccepted ? 'text-teal-500' :
                                   isActive ? 'text-blue-400' : 'text-slate-500'
                                }`}>{phase.status.replace('_', ' ')}</p>
                              </div>
                            </div>
                          );
                        })}

                        {/* ADD NEW PHASE INPUT */}
                        {(user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN') && (
                          <div className="mt-8 pt-6 border-t border-slate-800/80 relative z-10">
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Add new phase..."
                                className="w-full bg-[#0f172a] border border-slate-700 rounded-xl pl-4 pr-10 py-3 text-sm text-slate-200 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 transition-all placeholder:text-slate-600 shadow-inner"
                                value={newPhaseNames[activeProject.id] || ''}
                                onChange={(e) => setNewPhaseNames({ ...newPhaseNames, [activeProject.id]: e.target.value })}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' && newPhaseNames[activeProject.id]) {
                                    createPhase.mutate({ 
                                      projectId: activeProject.id, 
                                      name: newPhaseNames[activeProject.id], 
                                      order: (activeProject.phases && activeProject.phases.length > 0) ? Math.max(...activeProject.phases.map((p:any) => p.order)) + 1 : 1 
                                    });
                                  }
                                }}
                              />
                              <button 
                                onClick={() => {
                                  if (newPhaseNames[activeProject.id]) {
                                    createPhase.mutate({ 
                                      projectId: activeProject.id, 
                                      name: newPhaseNames[activeProject.id], 
                                      order: (activeProject.phases && activeProject.phases.length > 0) ? Math.max(...activeProject.phases.map((p:any) => p.order)) + 1 : 1 
                                    });
                                  }
                                }}
                                className="absolute right-2 top-0 bottom-0 my-auto h-8 w-8 flex items-center justify-center text-slate-400 hover:text-teal-400 transition-colors"
                              >
                                <Plus className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                   </div>

                   {/* RIGHT WORKSPACE: ACTIVE PHASE DETAILS */}
                   <div className="flex-1 flex flex-col relative bg-transparent overflow-hidden">
                      {activePhase ? (
                        <>
                          {/* PHASE HEADER */}
                          <div className="p-8 border-b border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1e293b]/10">
                             <div>
                               <h2 className="text-3xl font-extrabold text-white tracking-tight flex items-center">
                                 Phase {activePhase.order}: {activePhase.name}
                               </h2>
                               <div className="mt-3 flex items-center">
                                 <span className={`text-xs font-black uppercase tracking-widest px-3 py-1 rounded-md border shadow-sm ${
                                   activePhase.status === 'ACCEPTED' ? 'bg-teal-500/10 text-teal-400 border-teal-500/20' : 
                                   activePhase.status === 'IN_PROGRESS' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 
                                   'bg-slate-900 border-slate-700 text-slate-400'
                                 }`}>
                                   {activePhase.status.replace('_', ' ')}
                                 </span>
                               </div>
                             </div>
                             
                             {/* ACTION BUTTONS */}
                             {user?.role !== 'OPERATOR' && (
                                <div className="flex flex-wrap gap-3">
                                   {/* If project isn't started yet, don't allow arbitrary phase starting */}
                                   {activeProject.status !== 'LEAD' && activePhase.status === 'PENDING' && (
                                     <button onClick={() => updatePhase.mutate({ id: activePhase.id, data: { status: 'IN_PROGRESS' } })} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all shadow-[0_0_20px_rgba(37,99,235,0.4)] hover:shadow-[0_0_25px_rgba(37,99,235,0.6)]">
                                       Mark Phase Active
                                     </button>
                                   )}
                                   {activePhase.status === 'IN_PROGRESS' && (
                                     <button onClick={() => updatePhase.mutate({ id: activePhase.id, data: { status: 'ACCEPTED' } })} className="flex items-center px-6 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl text-sm font-extrabold transition-all shadow-[0_0_20px_rgba(20,184,166,0.4)] hover:shadow-[0_0_25px_rgba(20,184,166,0.6)]">
                                       <CheckCircle className="w-4 h-4 mr-2 stroke-[3px]" /> Force Complete
                                     </button>
                                   )}
                                </div>
                             )}
                          </div>

                          {/* DATA TABLE AREA */}
                          <div className="p-8 flex-1 overflow-y-auto custom-scrollbar bg-[#0f172a]/20">
                            <div className="flex justify-between items-center mb-6">
                              <h3 className="text-lg font-extrabold text-slate-200 tracking-wide">Machine & Material Routings</h3>
                              <button 
                                onClick={() => addResource.mutate({ phaseId: activePhase.id })}
                                className="group flex items-center text-sm font-bold text-blue-400 bg-blue-500/5 hover:bg-blue-500/15 px-4 py-2.5 rounded-xl transition-all border border-blue-500/20 hover:border-blue-500/40 shadow-sm"
                              >
                                <Plus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" /> Add Row
                              </button>
                            </div>

                            <div className="bg-[#0f172a] rounded-[1rem] border border-slate-700/50 shadow-xl overflow-x-auto">
                              <table className="w-full text-left text-sm text-slate-300 border-collapse min-w-[600px]">
                                <thead className="bg-[#1e293b] text-[11px] uppercase font-black tracking-widest text-slate-500 border-b border-slate-800">
                                  <tr>
                                    <th className="px-6 py-4 w-[30%]"><div className="flex items-center"><Settings className="w-4 h-4 mr-2 stroke-[2.5px]" /> Machine</div></th>
                                    <th className="px-6 py-4 w-[30%]"><div className="flex items-center"><Wrench className="w-4 h-4 mr-2 stroke-[2.5px]" /> Process</div></th>
                                    <th className="px-6 py-4 w-[30%]"><div className="flex items-center"><Box className="w-4 h-4 mr-2 stroke-[2.5px]" /> Material</div></th>
                                    <th className="px-6 py-4 w-[10%] text-center">Actions</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/60">
                                  {activePhase.resources?.length === 0 && (
                                     <tr><td colSpan={4} className="px-6 py-16 text-center text-slate-500 font-semibold border-t border-slate-800 border-dashed">No routings assigned. The operator will not be able to commence work.</td></tr>
                                  )}
                                  {activePhase.resources?.map((res: any) => (
                                    <tr key={res.id} className="hover:bg-slate-800/40 transition-colors group">
                                      <td className="px-6 py-4 relative">
                                        <select 
                                          value={res.machineId || ''} 
                                          onChange={(e) => updateResource.mutate({ resId: res.id, data: { machineId: e.target.value } })}
                                          className="w-full bg-[#1e293b] border border-slate-700/80 rounded-lg pl-3 pr-8 py-2.5 text-slate-200 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 appearance-none font-medium transition-colors"
                                        >
                                          <option value="">-- Resource --</option>
                                          {machines?.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                                        </select>
                                      </td>
                                      <td className="px-6 py-4 relative">
                                        <select 
                                          value={res.processId || ''} 
                                          onChange={(e) => updateResource.mutate({ resId: res.id, data: { processId: e.target.value } })}
                                          className="w-full bg-[#1e293b] border border-slate-700/80 rounded-lg pl-3 pr-8 py-2.5 text-slate-200 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 appearance-none font-medium transition-colors"
                                        >
                                          <option value="">-- Optional --</option>
                                          {processes?.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                        </select>
                                      </td>
                                      <td className="px-6 py-4 relative">
                                        <select 
                                          value={res.materialId || ''} 
                                          onChange={(e) => updateResource.mutate({ resId: res.id, data: { materialId: e.target.value } })}
                                          className="w-full bg-[#1e293b] border border-slate-700/80 rounded-lg pl-3 pr-8 py-2.5 text-slate-200 outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500/50 appearance-none font-medium transition-colors"
                                        >
                                          <option value="">-- Optional --</option>
                                          {materials?.map((m: any) => <option key={m.id} value={m.id}>{m.name}</option>)}
                                        </select>
                                      </td>
                                      <td className="px-6 py-4 text-center">
                                        <button 
                                          onClick={() => deleteResource.mutate({ resId: res.id })}
                                          className="p-2.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all opacity-50 group-hover:opacity-100"
                                          title="Remove row"
                                        >
                                          <Trash2 className="w-5 h-5" />
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                            
                            {activePhase.resources?.length > 0 && (
                              <p className="text-[11px] text-slate-500 font-medium mt-6 text-center uppercase tracking-widest">
                                Data applies instantly upon selection and syncs with operator view.
                              </p>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex flex-col justify-center items-center text-slate-500 bg-gradient-to-b from-transparent to-[#0f172a]/20">
                          <div className="w-24 h-24 mb-6 rounded-full bg-slate-800/50 flex flex-col items-center justify-center border border-slate-700 shadow-inner">
                            <AlertCircle className="w-10 h-10 text-slate-600" />
                          </div>
                          <h3 className="text-xl font-bold text-slate-300">Phase Engine Unselected</h3>
                          <p className="text-sm mt-2 font-medium max-w-xs text-center leading-relaxed">Select a phase from the vertical timeline array on the left to deploy resource templates.</p>
                        </div>
                      )}
                   </div>
                 </div>
               )}
            </div>
          );
       })}

       {projects?.length === 0 && (
          <div className="flex-1 flex justify-center items-center mt-20">
            <div className="text-center p-12 bg-[#1e293b]/40 rounded-3xl border border-slate-800/80 shadow-2xl backdrop-blur-md max-w-md w-full">
               <div className="w-20 h-20 mx-auto bg-slate-800/50 rounded-full flex items-center justify-center mb-6 shadow-inner border border-slate-700">
                 <Box className="w-8 h-8 text-slate-500" />
               </div>
               <h3 className="text-xl font-bold text-slate-300 mb-2">No Projects Detected</h3>
               <p className="text-sm text-slate-500 font-medium leading-relaxed">Head over to the Project Intake module to initiate a new manufacturing project payload.</p>
            </div>
          </div>
       )}
    </div>
  );
}
