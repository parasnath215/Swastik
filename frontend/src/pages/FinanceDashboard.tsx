
import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, IndianRupee, Activity, PieChart } from 'lucide-react';

export default function FinanceDashboard() {
  const { data: finances } = useQuery({
    queryKey: ['finances'],
    queryFn: async () => {
      const res = await api.get('/finance/dashboard');
      return res.data;
    }
  });

  const totalBudget = finances?.reduce((acc:any, curr:any) => acc + curr.budget, 0) || 0;
  const totalSpent = finances?.reduce((acc:any, curr:any) => acc + curr.totalExpenses, 0) || 0;
  const variance = totalBudget - totalSpent;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Finance Dashboard</h1>
        <p className="text-slate-400 mt-2 font-medium">Real-time budget vs actual expense tracking for all active phases.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-8 rounded-3xl shadow-xl relative overflow-hidden group hover:border-blue-500/30 transition-colors">
           <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl transition-all group-hover:bg-blue-500/20"></div>
           <div className="flex justify-between items-start mb-4 relative z-10">
             <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Allocated Budget</p>
               <h3 className="text-4xl font-black text-white mt-2 tracking-tight">₹{totalBudget.toLocaleString()}</h3>
             </div>
             <div className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 text-blue-400 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
               <IndianRupee className="w-6 h-6" />
             </div>
           </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-8 rounded-3xl shadow-xl relative overflow-hidden group hover:border-rose-500/30 transition-colors">
           <div className="absolute -right-6 -top-6 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl transition-all group-hover:bg-rose-500/20"></div>
           <div className="flex justify-between items-start mb-4 relative z-10">
             <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Project Expenses</p>
               <h3 className="text-4xl font-black text-white mt-2 tracking-tight">₹{totalSpent.toLocaleString()}</h3>
             </div>
             <div className="p-4 bg-gradient-to-br from-rose-500/20 to-orange-500/20 text-rose-400 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
               <TrendingUp className="w-6 h-6" />
             </div>
           </div>
        </div>

        <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 p-8 rounded-3xl shadow-xl relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
           <div className="absolute -right-6 -top-6 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl transition-all group-hover:bg-emerald-500/20"></div>
           <div className="flex justify-between items-start mb-4 relative z-10">
             <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Net Variance (Margin)</p>
               <h3 className={`text-4xl font-black mt-2 tracking-tight ${variance >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                 ₹{variance.toLocaleString()}
               </h3>
             </div>
             <div className={`p-4 rounded-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] ${variance >= 0 ? 'bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400' : 'bg-gradient-to-br from-rose-500/20 to-pink-500/20 text-rose-400'}`}>
               <Activity className="w-6 h-6" />
             </div>
           </div>
        </div>
      </div>

      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-3xl shadow-2xl mt-8">
        <h3 className="text-xl font-bold text-white mb-8 flex items-center">
          <div className="p-2 bg-blue-500/10 rounded-lg mr-3">
             <PieChart className="w-5 h-5 text-blue-400" />
          </div>
          Budget vs Actual Expenses by Project
        </h3>
        <div className="h-[450px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={finances || []} margin={{ top: 20, right: 30, left: 10, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="projectName" stroke="#64748b" tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} axisLine={false} tickLine={false} tickMargin={15} />
              <YAxis stroke="#64748b" tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 500}} axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} tickMargin={15} />
              <Tooltip 
                cursor={{ fill: '#1e293b', opacity: 0.4 }}
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '16px', color: '#f8fafc', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', padding: '12px 16px', fontWeight: 600 }}
                itemStyle={{ color: '#e2e8f0', fontSize: '14px', paddingTop: '4px' }}
                labelStyle={{ color: '#94a3b8', fontSize: '12px', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}
              />
              <Legend wrapperStyle={{ paddingTop: '30px', fontSize: '14px', fontWeight: 500, color: '#e2e8f0' }} iconType="circle" />
              <Bar dataKey="budget" name="Budget Allocated" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={60} />
              <Bar dataKey="totalExpenses" name="Actual Expenses" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
