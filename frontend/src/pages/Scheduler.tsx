import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import api from '../lib/api';
import { Clock, AlertTriangle, Calendar, Briefcase, Zap, CheckCircle2, X, Send, Activity, Settings } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

const getDefaultDate = () => {
  const d = new Date();
  d.setHours(9, 0, 0, 0);
  if (d < new Date()) {
    d.setDate(d.getDate() + 1);
  }
  return d;
};

export default function Scheduler() {
  const queryClient = useQueryClient();
  const user = useAuthStore(state => state.user);
  
  // UI State
  const [activeTab, setActiveTab] = useState<'PENDING' | 'ACTIVE' | 'ACCEPTED'>('PENDING');
  const [scheduleModalPhase, setScheduleModalPhase] = useState<any | null>(null);
  
  // Form State
  const [runtimeHours, setRuntimeHours] = useState<number>(24);
  const [startDate, setStartDate] = useState<Date>(getDefaultDate());
  const [selectedMachineId, setSelectedMachineId] = useState<string>('');
  const [selectedProcessId, setSelectedProcessId] = useState<string>('');
  const [selectedMaterialId, setSelectedMaterialId] = useState<string>('');
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [timelineMachineFilter, setTimelineMachineFilter] = useState<string>('');
  const [timelineProcessFilter, setTimelineProcessFilter] = useState<string>('');
  const [timelineProjectFilter, setTimelineProjectFilter] = useState<string>('');
  const [viewMode, setViewMode] = useState<'MACHINES' | 'PROCESSES'>('MACHINES');
  const [operatorNotes, setOperatorNotes] = useState<Record<string, string>>({});

  // Queries
  const { data: tasks } = useQuery({ queryKey: ['tasks'], queryFn: async () => (await api.get('/scheduler/tasks')).data });
  const { data: projects } = useQuery({ queryKey: ['projects'], queryFn: async () => (await api.get('/projects')).data });
  const { data: machines } = useQuery({ queryKey: ['machines'], queryFn: async () => (await api.get('/resources/machines')).data });
  const { data: processes } = useQuery({ queryKey: ['processes'], queryFn: async () => (await api.get('/resources/processes')).data });
  const { data: materials } = useQuery({ queryKey: ['materials'], queryFn: async () => (await api.get('/resources/materials')).data });

  // Mutation
  const scheduleMutation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/scheduler/schedule', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setConflictError(null);
      setScheduleModalPhase(null); // Close Modal on success
      setStartDate(getDefaultDate()); // Reset Form
    },
    onError: (err: any) => {
      setConflictError(err.response?.data?.error || 'Failed to schedule task.');
    }
  });

  const submitUpdateMutation = useMutation({
    mutationFn: async ({ projectId, content }: { projectId: string, content: string }) => {
      await api.post(`/projects/${projectId}/updates`, { content });
    },
    onSuccess: (_, variables) => {
      setOperatorNotes(prev => ({ ...prev, [variables.projectId]: '' }));
      alert('Update submitted to Admin!');
    },
    onError: (err: any) => alert(err.response?.data?.error || 'Failed to submit update')
  });

  // Calculate The Running Tasks
  const activeBookings = useMemo(() => {
    if (!tasks) return [];
    const now = new Date();
    // Find all future or currently running tasks
    const activeTasks = tasks.filter((t: any) => new Date(t.endTime) > now);
    
    // Sort chronologically by start time
    activeTasks.sort((a: any, b: any) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    return activeTasks.filter((t: any) => {
      const isProcessPhase = t.phase?.name?.toLowerCase().includes('process');
      if (viewMode === 'MACHINES') {
        return !isProcessPhase;
      } else {
        return isProcessPhase;
      }
    });
  }, [tasks, viewMode]);

  // Flatten phases for left navigation
  const phaseList = useMemo(() => {
    if (!projects) return [];
    let allPhases: any[] = [];
    projects.forEach((p: any) => {
      // Gatekeeping: Operator ONLY sees projects that have been formally 'Started' by Admin
      if (p.status === 'LEAD') return;
      
      if (p.phases) {
        p.phases.forEach((phase: any) => {
          allPhases.push({
            ...phase,
            projectName: p.name,
            projectStatus: p.status,
            priority: (phase.order % 3 === 1) ? 'High' : (phase.order % 2 === 0) ? 'Medium' : 'Low'
          });
        });
      }
    });

    const now = new Date();

    return allPhases.filter(p => {
      const isProcessPhase = p.name?.toLowerCase().includes('process');
      if (viewMode === 'MACHINES') {
        return !isProcessPhase;
      } else {
        return isProcessPhase;
      }
    }).map(p => {
      // Is there an active task booking for this specific phase?
      const phaseTasks = tasks?.filter((t: any) => t.phaseId === p.id) || [];
      const hasUpcomingBooking = phaseTasks.some((t: any) => new Date(t.endTime) > now);
      
      let calculatedState = 'PENDING';
      if (hasUpcomingBooking) calculatedState = 'ACTIVE';
      else if (p.status === 'ACCEPTED' || (phaseTasks.length > 0 && !hasUpcomingBooking)) {
        // If entirely in the past or physically accepted
        calculatedState = 'ACCEPTED';
      }

      return { ...p, calculatedState };
    });
  }, [projects, tasks, viewMode]);

  const displayedTasks = phaseList.filter(p => p.calculatedState === activeTab);

  // Helper: Conflict Check Logic
  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setConflictError(null);

    if ((!selectedMachineId && !selectedProcessId) || !startDate || !runtimeHours || !scheduleModalPhase) {
      setConflictError("Please fill all required fields. You must select at least a Machine or a Process.");
      return;
    }

    const start = startDate.getTime();
    const end = start + (runtimeHours * 60 * 60 * 1000);

    if (tasks) {
      const isConflict = tasks.some((existingTask: any) => {
        let isResourceConflict = false;
        if (selectedMachineId && existingTask.machineId === selectedMachineId) isResourceConflict = true;
        if (selectedProcessId && existingTask.processId === selectedProcessId) isResourceConflict = true;
        if (!isResourceConflict) return false;

        const eStart = new Date(existingTask.startTime).getTime();
        const eEnd = new Date(existingTask.endTime).getTime();
        return (start < eEnd && end > eStart);
      });

      if (isConflict) {
        setConflictError("RESOURCE UNAVAILABLE: This machine or process is already booked during the selected timeframe.");
        return;
      }
    }

    scheduleMutation.mutate({
      phaseId: scheduleModalPhase.id,
      machineId: selectedMachineId || null,
      processId: selectedProcessId || null,
      materialId: selectedMaterialId || null,
      startTime: startDate.toISOString(),
      duration: runtimeHours * 60 
    });
  };

  const getOccupiedDates = () => {
    if (!tasks) return [];
    if (!selectedMachineId && !selectedProcessId) return [];
    return tasks.filter((t: any) => {
      let isMatch = false;
      if (selectedMachineId && t.machineId === selectedMachineId) isMatch = true;
      if (selectedProcessId && t.processId === selectedProcessId) isMatch = true;
      return isMatch;
    }).map((t: any) => new Date(t.startTime));
  };

  // Timeline Prep
  const getStringColor = (str: string) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    const h = Math.abs(hash) % 360;
    return `hsl(${h}, 80%, 45%)`;
  };

  const timelineEvents = tasks?.filter((t: any) => {
    if (timelineProjectFilter && t.phase?.projectId !== timelineProjectFilter) return false;
    
    if (viewMode === 'MACHINES') {
      if (!t.machineId) return false;
      if (timelineMachineFilter && t.machineId !== timelineMachineFilter) return false;
      return true;
    } else {
      if (!t.processId) return false;
      if (timelineProcessFilter && t.processId !== timelineProcessFilter) return false;
      return true;
    }
  }).map((t: any) => {
    const bgColor = viewMode === 'MACHINES' 
      ? getStringColor(t.machineId) 
      : getStringColor(t.processId);
    return {
      id: t.id,
      title: `${t.phase?.project?.name} - P${t.phase?.order}`,
      start: t.startTime,
      end: t.endTime,
      backgroundColor: bgColor,
      borderColor: bgColor
    };
  }) || [];

  return (
    <div className="space-y-6">
      
      {/* SCHEDULING MODAL OVERLAY */}
      {scheduleModalPhase && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 backdrop-blur-sm bg-slate-950/80">
          <div className="bg-[#0f172a] border border-slate-700 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => { setScheduleModalPhase(null); setConflictError(null); }}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="bg-gradient-to-r from-blue-900/40 to-[#0f172a] p-8 border-b border-slate-800">
              <h3 className="text-2xl font-black text-white">Book Machine or Process</h3>
              <p className="text-blue-400 font-bold uppercase tracking-wider text-sm mt-1">{scheduleModalPhase.projectName} - Phase {scheduleModalPhase.order}</p>
            </div>

            <form onSubmit={handleScheduleSubmit} className="p-8 flex flex-col gap-8">
              {conflictError && (
                <div className="p-4 bg-red-500/10 border-l-4 border-red-500 rounded-lg flex items-start gap-3 shadow-sm animate-in shake">
                  <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400 font-bold uppercase tracking-wide leading-relaxed">{conflictError}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {viewMode === 'MACHINES' && (
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Target Machine</label>
                    <select 
                      value={selectedMachineId} 
                      onChange={e => setSelectedMachineId(e.target.value)} 
                      className="w-full h-14 px-4 bg-slate-900 border border-slate-700 text-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all font-semibold appearance-none"
                    >
                      <option value="">-- Select Target Machine --</option>
                      {machines?.map((m: any) => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                {viewMode === 'PROCESSES' && (
                  <div className="space-y-3">
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Target Process</label>
                    <select 
                      value={selectedProcessId} 
                      onChange={e => setSelectedProcessId(e.target.value)} 
                      className="w-full h-14 px-4 bg-slate-900 border border-slate-700 text-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all font-semibold appearance-none"
                    >
                      <option value="">-- Select Target Process --</option>
                      {processes?.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.name}</option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="space-y-3 md:col-span-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Target Material</label>
                  <select 
                    value={selectedMaterialId} 
                    onChange={e => setSelectedMaterialId(e.target.value)} 
                    className="w-full h-14 px-4 bg-slate-900 border border-slate-700 text-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all font-semibold appearance-none"
                  >
                    <option value="">-- Select Active Material --</option>
                    {materials?.map((m: any) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3 md:col-span-2">
                  <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Start Time (Occupied Dates in Red)</label>
                  <div className="custom-datepicker-wrapper">
                    <DatePicker 
                      selected={startDate}
                      onChange={(date: Date | null) => date && setStartDate(date)} 
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      timeCaption="time"
                      dateFormat="MMMM d, yyyy h:mm aa"
                      highlightDates={[
                        {
                          "react-datepicker__day--highlighted-custom-red": getOccupiedDates(),
                        }
                      ]}
                      className="w-full h-14 px-4 bg-slate-900 border border-slate-700 text-slate-200 rounded-xl outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 transition-all block [color-scheme:dark] font-bold" 
                    />
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-2xl shadow-inner mt-4">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="w-full md:w-1/3">
                    <label className="block text-xs font-black text-slate-500 uppercase tracking-widest pl-1 mb-3">Est. Runtime (Hours)</label>
                    <div className="relative">
                      <input 
                        required type="number" min="1" max="720" value={runtimeHours} 
                        onChange={e => setRuntimeHours(parseInt(e.target.value) || 0)} 
                        className="w-full h-16 pl-4 pr-16 bg-[#0f172a] border-2 border-slate-700 text-3xl font-black text-white rounded-xl outline-none focus:border-blue-500 text-center transition-all bg-gradient-to-b from-[#0f172a] to-slate-900 shadow-inner" 
                      />
                      <span className="absolute right-4 top-0 bottom-0 flex items-center text-slate-500 font-bold uppercase tracking-wider text-sm pointer-events-none">HRS</span>
                    </div>
                  </div>

                  <div className="w-full md:w-2/3 border-t md:border-t-0 md:border-l border-slate-800 pt-6 md:pt-0 md:pl-8">
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-3 flex justify-between">
                      <span>Booking Preview</span>
                      <span className="text-blue-400 font-bold">{Math.ceil(runtimeHours / 24)} Day(s) Reserved</span>
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {[...Array(Math.max(1, Math.min(10, Math.ceil(runtimeHours / 24))))].map((_, i) => (
                        <div key={i} className="w-8 h-12 bg-blue-500 rounded-md shadow-[0_0_15px_rgba(37,99,235,0.4)] relative border border-blue-400">
                          <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent"></div>
                        </div>
                      ))}
                      {Math.ceil(runtimeHours / 24) > 10 && (
                        <div className="w-8 h-12 flex items-center justify-center font-bold text-slate-500">+</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-800/80">
                <button 
                  type="submit" 
                  disabled={scheduleMutation.isPending}
                  className="w-full h-16 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-lg font-black uppercase tracking-widest shadow-[0_0_30px_rgba(37,99,235,0.3)] transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {scheduleMutation.isPending ? 'Processing...' : 'Confirm Booking'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center border-2 border-slate-700 shadow-inner">
             <Briefcase className="w-8 h-8 text-slate-400" />
          </div>
          <div>
            <h1 className="text-3xl font-black text-white tracking-tight uppercase">Dashboard: <span className="text-blue-400">{user?.name || 'System Operator'}</span></h1>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="flex items-center text-xs font-bold text-emerald-400 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse"></span> Shift Status: Active
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-800/50 p-1.5 rounded-xl border border-slate-700">
          <button 
            onClick={() => setViewMode('MACHINES')}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${viewMode === 'MACHINES' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Settings className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /> Machine View
          </button>
          <button 
            onClick={() => setViewMode('PROCESSES')}
            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-colors ${viewMode === 'PROCESSES' ? 'bg-teal-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
          >
            <Activity className="w-4 h-4 inline-block mr-1.5 -mt-0.5" /> Process View
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 min-h-[500px]">
        
        {/* LEFT COLUMN: ASSIGNED TASKS (TABBED NAVIGATION) */}
        <div className="w-full lg:w-1/3 flex flex-col gap-4">
          
          <div className="flex bg-slate-900 rounded-xl p-1 border border-slate-800 shadow-sm">
            {(['PENDING', 'ACTIVE', 'ACCEPTED'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                  activeTab === tab 
                    ? 'bg-blue-500/20 text-blue-400 shadow-sm border border-blue-500/30' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar max-h-[700px]">
            {displayedTasks.length === 0 && (
              <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl border-dashed">
                <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400 font-bold">No {activeTab.toLowerCase()} orders.</p>
              </div>
            )}
            
            {displayedTasks.map(task => (
                <div key={task.id} className="p-5 rounded-2xl border border-slate-800 bg-slate-900/80 hover:border-slate-600 transition-all group relative">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded border ${
                        task.priority === 'High' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                        task.priority === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        Priority: {task.priority}
                      </span>
                      <h3 className="text-lg font-bold text-white mt-3 leading-tight">{task.projectName}</h3>
                      <p className="text-sm font-medium text-slate-400 mt-0.5">Phase {task.order}: {task.name}</p>
                    </div>
                  </div>
                  
                  {activeTab === 'PENDING' && (
                    <button 
                      onClick={() => {
                        setScheduleModalPhase(task);
                        if (task.resources && task.resources.length > 0) {
                          // Find first resource row with a machineId
                          const resWithMachine = task.resources.find((r: any) => r.machineId);
                          if (resWithMachine) setSelectedMachineId(resWithMachine.machineId);
                          else setSelectedMachineId('');
                          
                          // Find first resource row with a processId
                          const resWithProcess = task.resources.find((r: any) => r.processId);
                          if (resWithProcess) setSelectedProcessId(resWithProcess.processId);
                          else setSelectedProcessId('');
                          
                          // Find first resource row with a materialId or materialsList
                          const resWithMaterial = task.resources.find((r: any) => r.materialId || r.materialsList);
                          if (resWithMaterial) {
                            if (resWithMaterial.materialId) {
                              setSelectedMaterialId(resWithMaterial.materialId);
                            } else if (resWithMaterial.materialsList) {
                              try {
                                const list = JSON.parse(resWithMaterial.materialsList);
                                if (list && list.length > 0) setSelectedMaterialId(list[0]);
                                else setSelectedMaterialId('');
                              } catch (e) { setSelectedMaterialId(''); }
                            } else {
                              setSelectedMaterialId('');
                            }
                          } else {
                            setSelectedMaterialId('');
                          }

                          // Find first resource row with an expectedDuration
                          const resWithDuration = task.resources.find((r: any) => r.expectedDuration);
                          if (resWithDuration) {
                            setRuntimeHours(resWithDuration.expectedDuration);
                          } else {
                            setRuntimeHours(24);
                          }
                        } else {
                          setSelectedMachineId('');
                          setSelectedProcessId('');
                          setSelectedMaterialId('');
                          setRuntimeHours(24);
                        }
                        setStartDate(getDefaultDate());
                      }}
                      className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold uppercase tracking-wider transition-colors shadow-sm shadow-blue-500/20"
                    >
                      Schedule Task
                    </button>
                  )}
                  {activeTab === 'ACTIVE' && (
                    <div className="w-full py-3 text-center bg-emerald-500/10 text-emerald-400 rounded-xl text-sm font-bold uppercase tracking-wider border border-emerald-500/20 flex items-center justify-center">
                      <Clock className="w-4 h-4 mr-2" /> Task in Progress
                    </div>
                  )}
                  {activeTab === 'ACCEPTED' && (
                    <div className="w-full py-3 text-center bg-slate-800 text-slate-400 rounded-xl text-sm font-bold uppercase tracking-wider border border-slate-700 flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 mr-2" /> Complete
                    </div>
                  )}
                </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: ACTIVE WORKSPACE / FORM */}
        <div className="flex-1">
          <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest pl-2 flex items-center mb-4">
            <Zap className="w-4 h-4 mr-2 text-amber-500" /> Current Dashboard Focus ({activeBookings.length})
          </h2>
          
          <div className="bg-[#0f172a] border border-slate-800 rounded-3xl overflow-hidden shadow-2xl min-h-[600px] flex flex-col relative h-[calc(100%-2rem)]">
            
            {activeBookings.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-10 text-center bg-gradient-to-b from-slate-900/50 to-transparent">
                <div className="w-24 h-24 rounded-full bg-slate-800/50 border border-slate-700 flex items-center justify-center mb-6 shadow-inner">
                  <CheckCircle2 className="w-10 h-10 text-slate-600" />
                </div>
                <h3 className="text-2xl font-black text-slate-300">No Running Tasks</h3>
                <p className="text-slate-500 mt-2 max-w-sm">You have no active or scheduled {viewMode === 'MACHINES' ? 'machines' : 'processes'}. Select "Schedule Task" under your pending orders to begin processing.</p>
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <div className="grid grid-cols-1 gap-6">
                  {activeBookings.map((booking: any) => (
                    <div key={booking.id} className="animate-in fade-in duration-500 bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-lg flex flex-col">
                      <div className="bg-gradient-to-r from-blue-900/40 to-[#0f172a] p-6 border-b border-slate-800 relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[60px] pointer-events-none -mt-20 -mr-20"></div>
                        <h3 className="text-xl font-black text-white relative z-10">{booking.phase?.project?.name}</h3>
                        <p className="text-blue-400 font-bold uppercase tracking-wider text-xs mt-1 relative z-10">Phase {booking.phase?.order}: {booking.phase?.name}</p>
                      </div>

                      <div className="p-6 flex-1 flex flex-col gap-5">
                        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-5 relative overflow-hidden flex flex-col lg:flex-row gap-5 lg:items-center justify-between">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-[40px] pointer-events-none -mt-10 -mr-10"></div>
                          
                          <div>
                            <h4 className="text-blue-400 font-black uppercase tracking-widest text-[10px] mb-2 flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span> Primary Operations</h4>
                            <p className="text-lg font-bold text-white leading-tight">{viewMode === 'MACHINES' ? 'Machine' : 'Process'} Locked & Scheduled</p>
                            <p className="text-xs text-slate-400 mt-1 font-medium">Currently processing on <span className="text-slate-200 font-bold">{booking.machine?.name || booking.process?.name || 'a resource'}</span>.</p>
                            <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider font-bold">Expires: {new Date(booking.endTime).toLocaleString()}</p>
                          </div>

                          <div className="flex flex-col gap-2 shrink-0">
                             <button 
                               onClick={() => {
                                 if (confirm('Are you sure you want to finish this task early? The resource will be freed up immediately.')) {
                                   api.patch(`/scheduler/tasks/${booking.id}`, { action: 'finish_early' })
                                     .then(() => queryClient.invalidateQueries({ queryKey: ['tasks'] }))
                                     .catch(err => alert(err.response?.data?.error || 'Failed to update'));
                                 }
                               }}
                               className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg font-bold text-xs tracking-wider uppercase transition-colors"
                             >
                               Finish Early
                             </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                            <h4 className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-3">Extend {viewMode === 'MACHINES' ? 'Machine' : 'Process'} Reservation</h4>
                            <div className="flex gap-3">
                              <div className="relative flex-1">
                                <input 
                                  id={`extend-${booking.id}`}
                                  type="number" 
                                  min="1"
                                  defaultValue="10"
                                  className="w-full h-10 pl-3 pr-12 bg-[#0f172a] border border-slate-700 text-sm font-bold text-white rounded-lg outline-none focus:border-blue-500 transition-colors shadow-inner" 
                                />
                                <span className="absolute right-3 top-0 bottom-0 flex items-center text-slate-500 font-bold uppercase tracking-wider text-[10px] pointer-events-none">HRS</span>
                              </div>
                              <button
                                onClick={() => {
                                  const input = document.getElementById(`extend-${booking.id}`) as HTMLInputElement;
                                  const hrs = parseInt(input.value);
                                  if (hrs > 0) {
                                    api.patch(`/scheduler/tasks/${booking.id}`, { action: 'add_hours', hours: hrs })
                                       .then(() => queryClient.invalidateQueries({ queryKey: ['tasks'] }))
                                       .catch(err => alert(err.response?.data?.error || 'Failed to update'));
                                  }
                                }}
                                className="h-10 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg font-bold uppercase tracking-wider text-[10px] transition-colors shrink-0"
                              >
                                + Add
                              </button>
                            </div>
                          </div>

                          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5">
                            <h4 className="text-slate-400 font-black uppercase tracking-widest text-[10px] mb-3">Submit Project Update</h4>
                            <div className="flex gap-3">
                              <input 
                                type="text"
                                value={operatorNotes[booking.phase.projectId] || ''}
                                onChange={(e) => setOperatorNotes(prev => ({ ...prev, [booking.phase.projectId]: e.target.value }))}
                                placeholder="Type updates..."
                                className="flex-1 h-10 bg-[#0f172a] border border-slate-700 text-xs text-white rounded-lg px-3 outline-none focus:border-blue-500 transition-colors shadow-inner"
                              />
                              <button
                                onClick={() => {
                                  const note = operatorNotes[booking.phase.projectId];
                                  if (note?.trim()) {
                                    submitUpdateMutation.mutate({ projectId: booking.phase.projectId, content: note });
                                  }
                                }}
                                disabled={submitUpdateMutation.isPending}
                                className="h-10 px-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg font-bold uppercase tracking-wider text-[10px] transition-colors shrink-0 flex items-center"
                              >
                                <Send className="w-3 h-3 mr-1.5" /> Send
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: MACHINE TIMELINE (GANTT) */}
      <div className="bg-[#0f172a] border border-slate-800 p-8 rounded-3xl shadow-2xl relative overflow-hidden mt-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h3 className="text-xl font-black text-slate-200 flex items-center tracking-tight">
              <Calendar className="w-5 h-5 mr-3 text-blue-500" /> {viewMode === 'MACHINES' ? 'Machine Allocation Gantt' : 'Process Allocation Gantt'}
            </h3>
            <p className="text-sm text-slate-500 font-bold mt-1">Horizontal tracking of upcoming shop floor load</p>
          </div>
          
          <div className="flex items-center space-x-3 bg-slate-900 border border-slate-700 p-2 rounded-xl text-sm shadow-inner flex-wrap gap-y-2">
             {(timelineMachineFilter || timelineProcessFilter) && (
               <span className="flex items-center mr-2 px-3 tracking-widest uppercase font-black text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 py-1.5 rounded-lg">
                 Filtered
               </span>
             )}
             
             <select 
               value={timelineProjectFilter} 
               onChange={e => setTimelineProjectFilter(e.target.value)}
               className="bg-slate-800 border-none text-slate-200 text-sm font-bold rounded-lg px-4 py-2 outline-none focus:ring-1 focus:ring-blue-500 min-w-[200px]"
             >
               <option value="">All Projects</option>
               {projects?.filter((p:any) => p.status !== 'LEAD').map((p: any) => (
                 <option key={p.id} value={p.id}>{p.name}</option>
               ))}
             </select>

             {viewMode === 'MACHINES' ? (
               <select 
                 value={timelineMachineFilter} 
                 onChange={e => setTimelineMachineFilter(e.target.value)}
                 className="bg-slate-800 border-none text-slate-200 text-sm font-bold rounded-lg px-4 py-2 outline-none focus:ring-1 focus:ring-blue-500 min-w-[200px]"
               >
                 <option value="">All Machines Master List</option>
                 {machines?.map((m: any) => (
                   <option key={m.id} value={m.id}>{m.name}</option>
                 ))}
               </select>
             ) : (
               <select 
                 value={timelineProcessFilter} 
                 onChange={e => setTimelineProcessFilter(e.target.value)}
                 className="bg-slate-800 border-none text-slate-200 text-sm font-bold rounded-lg px-4 py-2 outline-none focus:ring-1 focus:ring-blue-500 min-w-[200px]"
               >
                 <option value="">All Processes Master List</option>
                 {processes?.map((p: any) => (
                   <option key={p.id} value={p.id}>{p.name}</option>
                 ))}
               </select>
             )}
          </div>
        </div>

        <div className="calendar-container rounded-2xl overflow-hidden border border-slate-800/80 p-2 bg-slate-900/50">
          <FullCalendar
            plugins={[dayGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,dayGridWeek' }}
            events={timelineEvents}
            height="500px"
          />
        </div>
      </div>

      <style>{`
        .calendar-container .fc { --fc-page-bg-color: transparent; --fc-neutral-bg-color: #0f172a; --fc-neutral-text-color: #64748b; --fc-border-color: #1e293b; --fc-today-bg-color: rgba(59, 130, 246, 0.05); }
        .calendar-container .fc-theme-standard td, .calendar-container .fc-theme-standard th { border-color: #1e293b; }
        .calendar-container .fc-button-primary { background-color: #1e293b !important; border-color: #334155 !important; border-radius: 0.5rem !important; font-weight: 800 !important; text-transform: uppercase !important; letter-spacing: 0.05em; font-size: 0.75rem !important;}
        .calendar-container .fc-button-primary:hover { background-color: #334155 !important; }
        .calendar-container .fc-button-active { background-color: #2563eb !important; border-color: #1d4ed8 !important; }
        .calendar-container .fc-event { border-radius: 4px; padding: 4px; font-size: 0.75rem; font-weight: 800; border: 1px solid rgba(0,0,0,0.2) !important; box-shadow: inset 0 1px 0 rgba(255,255,255,0.2); transition: transform 0.2s; cursor: pointer; text-transform: uppercase; letter-spacing: 0.02em; }
        .calendar-container .fc-event:hover { transform: scale(1.02); }
        .calendar-container .fc-toolbar-title { color: #f8fafc; font-weight: 900; font-size: 1.5rem !important; letter-spacing: -0.02em; }
        .calendar-container .fc-col-header-cell-cushion { color: #94a3b8; font-weight: 800; padding: 16px; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; }
        .calendar-container .fc-daygrid-day-number { color: #64748b; font-weight: 800; padding: 8px; font-size: 0.875rem; }
        .react-datepicker__day--highlighted-custom-red { background-color: #ef4444 !important; color: white !important; font-weight: bold; }
        .custom-datepicker-wrapper .react-datepicker-wrapper { width: 100%; }
        .custom-datepicker-wrapper .react-datepicker__input-container { width: 100%; }
      `}</style>
    </div>
  );
}
