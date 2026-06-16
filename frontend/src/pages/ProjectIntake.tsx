import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Save, User, Phone, MapPin, Ruler, IndianRupee, FileUp, X } from 'lucide-react';

export default function ProjectIntake() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', phone: '', address: '', dimensions: '', budget: '', processId: '', materialId: ''
  });
  const [processes, setProcesses] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [fileError, setFileError] = useState('');

  useEffect(() => {
    api.get('/resources/processes').then(res => setProcesses(res.data)).catch(console.error);
    api.get('/resources/materials').then(res => setMaterials(res.data)).catch(console.error);
  }, []);

  const evaluateMath = (expr: string) => {
    try {
      if (/^[0-9+\-*/().\s]+$/.test(expr)) {
        // eslint-disable-next-line
        const result = new Function(`return ${expr}`)();
        return isNaN(result) ? expr : String(result);
      }
    } catch (e) {
      return expr;
    }
    return expr;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'dimensions' || name === 'budget') {
      setFormData(prev => ({ ...prev, [name]: evaluateMath(value) }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, val]) => data.append(key, val));
      files.forEach(file => data.append('files', file));

      await api.post('/projects', data);
      setSuccess('Project successfully created!');
      setFormData({ name: '', phone: '', address: '', dimensions: '', budget: '', processId: '', materialId: '' });
      setFiles([]);
      setTimeout(() => {
        setSuccess('');
        // Navigate to Phase Manager after successful creation
        navigate('/');
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setFileError(err.response?.data?.error || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const validFiles = newFiles.filter(file => {
        if (file.size > 5 * 1024 * 1024) {
          setFileError('One or more files exceed the 5MB limit.');
          return false;
        }
        return true;
      });
      if (validFiles.length > 0) {
        setFileError('');
        setFiles(prev => [...prev, ...validFiles]);
      }
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
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
      
      {fileError && (
        <div className="p-4 mb-6 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl font-medium animate-in fade-in slide-in-from-top-4">
          {fileError}
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
              <input name="dimensions" value={formData.dimensions} onChange={handleChange} onBlur={handleBlur} className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-white transition-all outline-none" placeholder="e.g. 1500 or 50*30" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Budget (₹)</label>
            <div className="relative">
              <IndianRupee className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input type="text" required name="budget" value={formData.budget} onChange={handleChange} onBlur={handleBlur} className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-white transition-all outline-none" placeholder="e.g. 50000 or 25000*2" />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Process (Optional)</label>
            <div className="relative">
              <select 
                name="processId" 
                value={formData.processId} 
                onChange={(e) => setFormData({ ...formData, processId: e.target.value })} 
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-white transition-all outline-none"
              >
                <option value="">-- Select Process --</option>
                {processes.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Material (Optional)</label>
            <div className="relative">
              <select 
                name="materialId" 
                value={formData.materialId} 
                onChange={(e) => setFormData({ ...formData, materialId: e.target.value })} 
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-white transition-all outline-none"
              >
                <option value="">-- Select Material --</option>
                {materials.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="space-y-2 md:col-span-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Project Files (Max 5MB each)</label>
            <div className="relative">
              <input 
                type="file" 
                multiple 
                onChange={handleFileChange}
                className="hidden" 
                id="file-upload" 
              />
              <label htmlFor="file-upload" className="flex items-center justify-center w-full p-4 border-2 border-dashed border-slate-700 rounded-xl hover:border-blue-500 hover:bg-slate-900/50 transition-all cursor-pointer text-slate-400 hover:text-blue-400">
                <FileUp className="w-6 h-6 mr-3" />
                <span className="font-semibold text-sm">Click to upload or drag & drop</span>
              </label>
            </div>
            {files.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg">
                    <div className="flex flex-col truncate pr-2">
                      <span className="text-sm font-semibold text-slate-200 truncate">{file.name}</span>
                      <span className="text-xs text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    <button type="button" onClick={() => removeFile(i)} className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
