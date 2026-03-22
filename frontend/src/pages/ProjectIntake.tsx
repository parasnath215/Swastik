import React, { useState } from 'react';
import api from '../lib/api';
import { Save, User, Phone, MapPin, Ruler, IndianRupee } from 'lucide-react';

export default function ProjectIntake() {
  const [formData, setFormData] = useState({
    name: '', phone: '', address: '', dimensions: '', budget: ''
  });
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/projects', formData);
      setSuccess('Project successfully created!');
      setFormData({ name: '', phone: '', address: '', dimensions: '', budget: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white tracking-tight">Project Intake</h1>
        <p className="text-slate-400 mt-2">Create a new lead and capture requirements.</p>
      </div>

      {success && (
        <div className="p-4 mb-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl font-medium animate-in fade-in slide-in-from-top-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Client Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input required name="name" value={formData.name} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-white transition-all outline-none" placeholder="Acme Corp" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input name="phone" value={formData.phone} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-white transition-all outline-none" placeholder="+1 (555) 000-0000" />
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input name="address" value={formData.address} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-white transition-all outline-none" placeholder="123 Industrial Blvd" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Dimensions (sqm/sqft)</label>
            <div className="relative">
              <Ruler className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input name="dimensions" value={formData.dimensions} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-white transition-all outline-none" placeholder="1500 sqft" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Budget (₹)</label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input type="number" required name="budget" value={formData.budget} onChange={handleChange} className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-white transition-all outline-none" placeholder="50000" />
            </div>
          </div>
        </div>

        <div className="pt-4 flex justify-end">
          <button disabled={loading} type="submit" className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-semibold shadow-lg shadow-blue-500/25 transition-all active:scale-[0.98] disabled:opacity-70">
            {loading ? 'Saving...' : <><Save className="w-5 h-5 mr-2" /> Save Project</>}
          </button>
        </div>
      </form>
    </div>
  );
}
