import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { Calendar, Settings, ChevronLeft, ChevronRight, Layers, Box } from 'lucide-react';
import { addDays, subDays, startOfDay, differenceInHours, format } from 'date-fns';

export default function GanttReport() {
  const [viewDate, setViewDate] = useState(startOfDay(new Date()));
  const daysToShow = 7; // Show 1 week at a time
  
  const startDate = viewDate;
  const endDate = addDays(viewDate, daysToShow);

  const { data: machines, isLoading: mLoading } = useQuery({ queryKey: ['machines'], queryFn: async () => (await api.get('/resources/machines')).data });
  const { data: tasks, isLoading: tLoading } = useQuery({ queryKey: ['tasks'], queryFn: async () => (await api.get('/scheduler/tasks')).data });
  const { data: materials, isLoading: matLoading } = useQuery({ queryKey: ['materials'], queryFn: async () => (await api.get('/resources/materials')).data });

  const getMaterialName = (id: string | null) => {
    if (!id || !materials) return 'Unknown Material';
    return materials.find((m: any) => m.id === id)?.name || 'Unknown Material';
  };

  const hoursInView = daysToShow * 24;

  const handlePrev = () => setViewDate(subDays(viewDate, 7));
  const handleNext = () => setViewDate(addDays(viewDate, 7));

  if (mLoading || tLoading || matLoading) {
    return <div className="flex h-64 items-center justify-center text-slate-400">Loading Gantt Data...</div>;
  }

  // Generate hour markers for the header
  const timeMarkers = [];
  for (let d = 0; d < daysToShow; d++) {
     const currentDay = addDays(startDate, d);
     timeMarkers.push(
       <div key={d} className="flex-1 text-center font-bold text-xs uppercase tracking-widest text-slate-500 border-l border-slate-800 relative h-8 flex items-center justify-center bg-slate-900/40">
         {format(currentDay, 'EEE, MMM d')}
       </div>
     );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center">
            <Layers className="w-8 h-8 mr-3 text-emerald-400" /> Gantt & Production Report
          </h1>
          <p className="text-slate-400 mt-2 font-medium">Track which machine takes how much time on which materials.</p>
        </div>
        
        <div className="flex items-center gap-4 bg-slate-900 border border-slate-700 p-2 rounded-xl shadow-inner">
          <button onClick={handlePrev} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"><ChevronLeft className="w-5 h-5" /></button>
          <div className="flex items-center text-sm font-bold text-white uppercase tracking-wider px-2">
            <Calendar className="w-4 h-4 mr-2 text-emerald-500" />
            {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
          </div>
          <button onClick={handleNext} className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"><ChevronRight className="w-5 h-5" /></button>
        </div>
      </div>

      <div className="bg-[#0f172a] rounded-3xl border border-slate-800 shadow-2xl overflow-hidden relative">
        {/* Decorative Grid BG */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px)] bg-[size:calc(100%/7)_100%] opacity-20 pointer-events-none"></div>

        <div className="flex flex-col relative z-10 overflow-x-auto">
          {/* GANTT HEADER */}
          <div className="flex min-w-[800px] border-b border-slate-800 sticky top-0 bg-[#0f172a]/95 backdrop-blur z-20">
             <div className="w-64 shrink-0 bg-slate-900/80 p-4 border-r border-slate-800 flex items-center shadow-[4px_0_10px_rgba(0,0,0,0.2)] font-black text-slate-400 text-xs uppercase tracking-widest z-10">
                Machine Resource
             </div>
             <div className="flex-1 flex">
                {timeMarkers}
             </div>
          </div>

          {/* GANTT ROWS */}
          <div className="min-w-[800px] pb-10">
            {machines?.map((machine: any) => {
               // Filter tasks for this machine that overlap with the view window
               const machineTasks = tasks?.filter((t: any) => {
                 if (t.machineId !== machine.id) return false;
                 const tStart = new Date(t.startTime);
                 const tEnd = new Date(t.endTime);
                 return (tEnd > startDate && tStart < endDate);
               }) || [];

               return (
                 <div key={machine.id} className="flex border-b border-slate-800/50 group hover:bg-slate-800/20 transition-colors relative">
                    <div className="w-64 shrink-0 bg-slate-900/40 p-4 border-r border-slate-800 relative z-10 group-hover:bg-slate-800/40 transition-colors flex flex-col justify-center">
                       <h4 className="font-bold text-slate-200 flex items-center">
                         <Settings className="w-4 h-4 mr-2 text-slate-500" /> {machine.name}
                       </h4>
                       <p className="text-[10px] uppercase font-black tracking-widest text-emerald-500/80 mt-1">₹{machine.hourlyRate}/hr Rate</p>
                    </div>

                    <div className="flex-1 relative h-24">
                       {/* Grid lines for each day to map visual tracking */}
                       {[...Array(daysToShow)].map((_, i) => (
                         <div key={i} className="absolute top-0 bottom-0 border-l border-slate-800/30" style={{ left: `${(i / daysToShow) * 100}%` }}></div>
                       ))}

                       {/* Task Bars */}
                       {machineTasks.map((task: any) => {
                          const tStart = new Date(task.startTime);
                          const tEnd = new Date(task.endTime);

                          // Calculate bounded positions for the view window
                          const effectiveStart = tStart < startDate ? startDate : tStart;
                          const effectiveEnd = tEnd > endDate ? endDate : tEnd;
                          
                          // Convert to percentages
                          const startDiff = differenceInHours(effectiveStart, startDate);
                          const durationH = differenceInHours(effectiveEnd, effectiveStart);

                          const leftPct = Math.max(0, (startDiff / hoursInView) * 100);
                          const widthPct = Math.min(100 - leftPct, (durationH / hoursInView) * 100);

                          const materialName = getMaterialName(task.materialId);

                          return (
                            <div 
                              key={task.id}
                              className="absolute top-3 bottom-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] border border-emerald-400/50 overflow-hidden cursor-pointer hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:scale-[1.01] transition-all z-10 flex flex-col justify-center px-3"
                              style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                              title={`Project: ${task.phase?.project?.name}\nMaterial: ${materialName}\nCost: ₹${task.actualCost}`}
                            >
                               <div className="truncate font-black text-white text-xs drop-shadow-md tracking-wide">
                                 {task.phase?.project?.name || 'Project'} - {task.phase?.name || 'Phase'}
                               </div>
                               <div className="truncate text-[10px] font-bold text-emerald-100/90 uppercase tracking-widest mt-0.5 flex items-center">
                                 <Box className="w-3 h-3 mr-1 inline-block opacity-70" /> {materialName}
                               </div>
                               {(task.actualCost > 0) && (
                                 <div className="absolute right-3 top-0 bottom-0 flex items-center text-xs font-black text-emerald-100 drop-shadow-lg">
                                   ₹{task.actualCost}
                                 </div>
                               )}
                            </div>
                          );
                       })}
                    </div>
                 </div>
               );
            })}
            
            {machines?.length === 0 && (
              <div className="p-12 text-center text-slate-500 font-bold">No Machines Configured. Go to Setup to add tracking resources.</div>
            )}
          </div>
        </div>
      </div>
      
      {/* SUMMARY WIDGET */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl flex items-center shadow-lg">
            <div className="p-3 bg-emerald-500/10 rounded-xl mr-4 border border-emerald-500/20"><Layers className="w-6 h-6 text-emerald-400" /></div>
            <div><p className="text-xs font-black text-slate-500 uppercase tracking-widest">Active Gantt Tasks</p><p className="text-2xl font-bold text-white mt-1">{tasks?.length || 0}</p></div>
         </div>
      </div>
    </div>
  );
}
